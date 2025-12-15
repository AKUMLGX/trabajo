import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FirstStepTlapohualliComponent } from '../first-step-tlapohualli/first-step-tlapohualli.component';
import { SecondStepTlapohualliComponent } from '../second-step-tlapohualli/second-step-tlapohualli.component';
import { ExpedienteTlapohualliService } from '../../../services/expediente-tlapohualli.service';
import { PdfGeneratorService } from '../../../services/pdf-generator.service';
import { LoggerService } from '../../../services/logger.service';
import {
  FormularioPaso1,
  FormularioPaso2,
  FormularioPaso3,
  ExpedienteTlapohualli
} from '../../../interfaces/expediente-tlapohualli.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stepper-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FirstStepTlapohualliComponent,
    SecondStepTlapohualliComponent
  ],
  templateUrl: './stepper-tlapohualli.component.html',
  styleUrls: ['./stepper-tlapohualli.component.css', './stepper-tlapohualli-global.css']
})
export class StepperTlapohualliComponent implements OnInit, AfterViewInit {
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(FirstStepTlapohualliComponent) paso1Component!: FirstStepTlapohualliComponent;
  @ViewChild(SecondStepTlapohualliComponent) paso2Component!: SecondStepTlapohualliComponent;

  datosPaso1: FormularioPaso1 | null = null;
  datosPaso2: FormularioPaso2 | null = null;
  documentoPasoFinal: FormularioPaso3 | null = null;

  pasoActual = 0;
  expedienteGuardado = false;
  expedienteId: number | null = null;
  guardando = false;
  isTransitioning = false;
  paso1Valido = false;

  constructor(
    private expedienteService: ExpedienteTlapohualliService,
    private pdfService: PdfGeneratorService,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Prevenir acceso a pasos sin completar
    if (this.stepper) {
      this.stepper.selectionChange.subscribe((event) => {
        // Si intenta ir al paso 2 (índice 1) sin completar el paso 1
        if (event.selectedIndex === 1 && (!this.paso1Valido || !this.datosPaso1)) {
          this.mostrarMensaje('Debe completar todos los campos del paso 1 antes de continuar', 'warning');
          // Forzar volver al paso 1
          setTimeout(() => {
            this.stepper.selectedIndex = 0;
            this.pasoActual = 0;
          }, 100);
        }
        // Si intenta ir al paso 3 (índice 2) sin haber guardado
        else if (event.selectedIndex === 2 && !this.expedienteGuardado) {
          this.mostrarMensaje('Debe completar y guardar el paso 2 antes de ver el resumen', 'warning');
          // Forzar volver al paso 2
          setTimeout(() => {
            this.stepper.selectedIndex = 1;
            this.pasoActual = 1;
          }, 100);
        }
      });
    }
  }

  // Paso 1
  onPaso1ValidezCambiada(valido: boolean) {
    this.paso1Valido = valido;
  }

  onPaso1Completado(datos: FormularioPaso1) {
    this.datosPaso1 = datos;
    this.transicionarPaso(1);
    this.mostrarMensaje('Paso 1 completado correctamente', 'success');
  }

  onPaso1Siguiente() {
    if (this.paso1Component) {
      this.paso1Component.onSubmit();
    }
  }

  // Paso 2 (seguimiento + documento)
  onPaso2Completado(datos: any) {
    if (!datos) {
      this.mostrarMensaje('No se recibieron datos del paso 2', 'error');
      return;
    }

    const { documento_pdf, campos_pospuestos, ...seguimiento } = datos;
    this.datosPaso2 = seguimiento as FormularioPaso2;
    this.documentoPasoFinal = {
      documento_pdf: documento_pdf as File,
      documento_pdf_nombre: documento_pdf ? documento_pdf.name : undefined,
      campos_pospuestos: campos_pospuestos || []
    };

    this.finalizarExpediente();
  }

  onPaso2Siguiente() {
    if (this.paso2Component) {
      this.paso2Component.onSubmit();
    }
  }

  onPaso2Anterior() {
    this.transicionarPaso(0);
  }

  // Finalizar expediente
  async finalizarExpediente() {
    if (!this.datosPaso1 || !this.datosPaso2 || !this.documentoPasoFinal) {
      this.mostrarMensaje('Faltan datos en el formulario', 'error');
      return;
    }

    // PDF ya no es requerido

    this.guardando = true;

    try {
      const expediente = await this.expedienteService
        .crearExpedienteDesdePasos(
          this.datosPaso1,
          this.datosPaso2,
          this.documentoPasoFinal
        )
        .toPromise();

      this.expedienteId = expediente?.id_expediente || null;
      this.expedienteGuardado = true;
      this.transicionarPaso(2);
      this.mostrarMensaje('Expediente guardado exitosamente', 'success');

      this.pdfService.generarPDFExpediente(
        this.datosPaso1,
        this.datosPaso2,
        this.documentoPasoFinal,
        this.expedienteId || undefined
      );

      this.mostrarResumenExpediente(expediente);
    } catch (error: any) {
      this.manejarError(error);
    } finally {
      this.guardando = false;
    }
  }

  private manejarError(error: any) {
    this.logger.error('Error al guardar expediente:', error);

    let mensajeError = 'Error al guardar el expediente';
    let tipo: 'success' | 'error' | 'info' | 'warning' = 'error';

    if (error?.status === 409) {
      tipo = 'warning';
      const detalle = (error?.error?.message || error?.error || '').toLowerCase();
      if (detalle.includes('oficio')) {
        mensajeError = '⚠️ OFICIO DUPLICADO\n\nEste número de oficio ya existe en el sistema.';
      } else if (detalle.includes('expediente')) {
        mensajeError = '⚠️ EXPEDIENTE DUPLICADO\n\nEste número de expediente ya existe.';
      } else {
        mensajeError = '⚠️ REGISTRO DUPLICADO\n\nVerifica la información indicada.';
      }
    } else if (error?.status === 400) {
      tipo = 'warning';
      mensajeError = '⚠️ DATOS INVÁLIDOS\n\n' + (error?.error?.message || 'Revisa los campos del formulario.');
    } else if (error?.status === 500) {
      mensajeError = '❌ ERROR DEL SERVIDOR\n\nNo se pudo procesar la solicitud.';
    } else if (error?.status === 0) {
      mensajeError = '❌ SIN CONEXIÓN\n\nVerifica tu conexión a internet.';
    }

    this.mostrarMensaje(mensajeError, tipo, 8000);
    // Mostrar modal para errores importantes
    if (tipo === 'warning' || tipo === 'error') {
      // TODO: Reemplazar con modal de confirmación
      // Por ahora mantener alert para errores críticos
      if (tipo === 'warning') {
        alert(mensajeError);
      }
    }
  }

  // Utilidades
  mostrarResumenExpediente(expediente: ExpedienteTlapohualli | undefined) {
    if (!expediente) return;

    const resumen = `
      Expediente: ${expediente.expediente}
      Oficio: ${expediente.oficio || 'N/A'}
      Remitente: ${expediente.remitente_area || 'N/A'}
      Estatus: ${expediente.estatus || 'N/A'}
      Fecha de creación: ${expediente.fecha_creacion ? new Date(expediente.fecha_creacion).toLocaleDateString() : 'N/A'}
    `;

    this.snackBar.open(resumen, 'Cerrar', {
      duration: 10000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning', duracion: number = 5000) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`${tipo}-snackbar`]
    });
  }

  get puedeAvanzarPaso1(): boolean {
    return this.paso1Valido;
  }

  get estaCompletado(): boolean {
    return this.expedienteGuardado;
  }

  obtenerResumenCompleto() {
    return {
      paso1: this.datosPaso1,
      paso2: this.datosPaso2,
      documento: this.documentoPasoFinal,
      expedienteId: this.expedienteId,
      fechaCreacion: new Date().toISOString()
    };
  }

  private transicionarPaso(nuevoPaso: number) {
    this.isTransitioning = true;
    setTimeout(() => {
      this.pasoActual = nuevoPaso;
      this.isTransitioning = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  regenerarPDF() {
    if (this.datosPaso1 && this.datosPaso2 && this.documentoPasoFinal) {
      this.pdfService.generarPDFExpediente(
        this.datosPaso1,
        this.datosPaso2,
        this.documentoPasoFinal,
        this.expedienteId || undefined
      );
      this.mostrarMensaje('PDF generado nuevamente', 'success', 3000);
    } else {
      this.mostrarMensaje('⚠️ No hay datos para generar el PDF', 'warning', 3000);
    }
  }

  reiniciarFormulario() {
    this.isTransitioning = true;
    setTimeout(() => {
      this.datosPaso1 = null;
      this.datosPaso2 = null;
      this.documentoPasoFinal = null;
      this.pasoActual = 0;
      this.expedienteGuardado = false;
      this.expedienteId = null;
      this.isTransitioning = false;
      this.mostrarMensaje('Formulario reiniciado', 'info');
    }, 300);
  }

  crearNuevoExpediente() {
    this.reiniciarFormulario();
  }
}
