import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FirstStepTlalcalliComponent } from '../first-step-tlalcalli/first-step-tlalcalli.component';
import { SecondStepTlalcalliComponent } from '../second-step-tlalcalli/second-step-tlalcalli.component';
import { PreConfirmacionModalComponent, CampoResumen, SeccionResumen } from '../pre-confirmacion-modal/pre-confirmacion-modal.component';
import { ExpedienteTlalcalliService } from '../../../services/expediente-tlalcalli.service';
import { PdfGeneratorService } from '../../../services/pdf-generator.service';
import { LoggerService } from '../../../services/logger.service';
import {
  FormularioPaso1,
  FormularioPaso2,
  FormularioPaso3,
  ExpedienteTlalcalli
} from '../../../interfaces/expediente-tlalcalli.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-stepper-tlalcalli',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    FirstStepTlalcalliComponent,
    SecondStepTlalcalliComponent
  ],
  templateUrl: './stepper-tlalcalli.component.html',
  styleUrls: ['./stepper-tlalcalli.component.css', './stepper-tlalcalli-global.css']
})
export class StepperTlalcalliComponent implements OnInit, AfterViewInit {
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(FirstStepTlalcalliComponent) paso1Component!: FirstStepTlalcalliComponent;
  @ViewChild(SecondStepTlalcalliComponent) paso2Component!: SecondStepTlalcalliComponent;

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
    private expedienteService: ExpedienteTlalcalliService,
    private pdfService: PdfGeneratorService,
    private snackBar: MatSnackBar,
    private logger: LoggerService,
    private dialog: MatDialog
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

    // Mostrar modal de confirmación antes de guardar
    this.mostrarModalConfirmacion();
  }

  // Modal de pre-confirmación con resumen de datos organizados en secciones
  private mostrarModalConfirmacion() {
    const secciones: SeccionResumen[] = this.construirSeccionesResumen();

    const dialogRef = this.dialog.open(PreConfirmacionModalComponent, {
      width: '650px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'pre-confirmacion-dialog',
      data: {
        titulo: '¿Confirmar registro?',
        subtitulo: 'Verifique que todos los datos sean correctos',
        expediente: this.datosPaso1?.expediente,
        secciones: secciones,
        botonConfirmar: 'Guardar expediente',
        botonCancelar: 'Revisar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.finalizarExpediente();
      } else {
        this.mostrarMensaje('Puede revisar y modificar los datos antes de guardar', 'info', 3000);
      }
    });
  }

  // Construir secciones organizadas para el modal
  private construirSeccionesResumen(): SeccionResumen[] {
    const secciones: SeccionResumen[] = [];

    // Sección 1: Información del Requerimiento
    if (this.datosPaso1) {
      const camposRequerimiento: CampoResumen[] = [];

      camposRequerimiento.push({
        etiqueta: 'Tipo',
        valor: this.formatearTipoMedio(this.datosPaso1.tipo_medio_recepcion),
        icono: 'description'
      });

      if (this.datosPaso1.oficio) {
        camposRequerimiento.push({
          etiqueta: 'Número/Oficio',
          valor: this.datosPaso1.oficio,
          icono: 'tag',
          tipo: 'destacado'
        });
      }

      if (this.datosPaso1.remitente_area) {
        camposRequerimiento.push({
          etiqueta: 'Remitente',
          valor: this.datosPaso1.remitente_area,
          icono: 'business'
        });
      }

      if (this.datosPaso1.referencia_asunto) {
        const asunto = this.datosPaso1.referencia_asunto;
        camposRequerimiento.push({
          etiqueta: 'Asunto',
          valor: asunto.length > 80 ? asunto.substring(0, 80) + '...' : asunto,
          icono: 'subject'
        });
      }

      secciones.push({
        titulo: 'Información del Requerimiento',
        icono: 'assignment',
        campos: camposRequerimiento
      });

      // Sección 2: Fechas y Prioridad
      const camposFechas: CampoResumen[] = [];

      if (this.datosPaso1.fecha_recibido) {
        camposFechas.push({
          etiqueta: 'Fecha de Acuse',
          valor: this.formatearFecha(this.datosPaso1.fecha_recibido),
          icono: 'event',
          tipo: 'fecha'
        });
      }

      if (this.datosPaso1.fecha_vencimiento) {
        camposFechas.push({
          etiqueta: 'Fecha Vencimiento',
          valor: this.formatearFecha(this.datosPaso1.fecha_vencimiento),
          icono: 'event_busy',
          tipo: 'fecha'
        });
      }

      if (this.datosPaso1.prioridad) {
        camposFechas.push({
          etiqueta: 'Prioridad',
          valor: this.datosPaso1.prioridad,
          icono: 'priority_high',
          tipo: 'prioridad',
          prioridadColor: this.obtenerColorPrioridad(this.datosPaso1.prioridad)
        });
      }

      if (camposFechas.length > 0) {
        secciones.push({
          titulo: 'Fechas y Prioridad',
          icono: 'schedule',
          campos: camposFechas
        });
      }
    }

    // Sección 3: Asignación
    if (this.datosPaso2) {
      const camposAsignacion: CampoResumen[] = [];

      if (this.datosPaso2.responsable_fecha_asignacion) {
        camposAsignacion.push({
          etiqueta: 'Responsable',
          valor: this.datosPaso2.responsable_fecha_asignacion,
          icono: 'person',
          tipo: 'responsable'
        });
      }

      if (camposAsignacion.length > 0) {
        secciones.push({
          titulo: 'Asignación',
          icono: 'person_pin',
          campos: camposAsignacion
        });
      }
    }

    return secciones;
  }

  private formatearTipoMedio(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ATENTA_NOTA': 'Atenta nota',
      'OFICIO': 'Oficio',
      'REQUERIMIENTO_VERBAL': 'Petición interna',
      'CORREO_ELECTRONICO': 'Correo electrónico'
    };
    return tipos[tipo] || tipo;
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'N/A';
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private obtenerColorPrioridad(prioridad: string): string {
    const colores: { [key: string]: string } = {
      'URGENTE': 'red',
      'ALTA': 'orange',
      'MEDIA': 'yellow',
      'BAJA': 'green'
    };
    return colores[prioridad] || 'yellow';
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
  mostrarResumenExpediente(expediente: ExpedienteTlalcalli | undefined) {
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

  /**
   * Reiniciar completamente el formulario - todo en blanco
   * Limpia todos los datos y vuelve al paso 1
   */
  reiniciarFormulario() {
    this.isTransitioning = true;
    setTimeout(() => {
      // Limpiar todos los datos
      this.datosPaso1 = null;
      this.datosPaso2 = null;
      this.documentoPasoFinal = null;
      this.pasoActual = 0;
      this.expedienteGuardado = false;
      this.expedienteId = null;
      this.paso1Valido = false;
      this.isTransitioning = false;

      // Reiniciar componentes hijos si existen
      if (this.paso1Component) {
        this.paso1Component.reiniciarFormulario?.();
      }
      if (this.paso2Component) {
        this.paso2Component.reiniciarFormulario?.();
      }

      this.mostrarMensaje('Formulario reiniciado completamente', 'info');
    }, 300);
  }

  /**
   * Crear nuevo registro con datos precargados
   * Mantiene algunos datos del formulario anterior (remitente, tipo, etc.)
   * pero genera un nuevo número de expediente
   */
  crearNuevoRegistro() {
    this.isTransitioning = true;

    // Guardar datos que queremos precargar
    const datosPrecargar = {
      tipo_medio_recepcion: this.datosPaso1?.tipo_medio_recepcion,
      remitente_general: (this.datosPaso1 as any)?.remitente_general,
      remitente_central: (this.datosPaso1 as any)?.remitente_central,
      prioridad: this.datosPaso1?.prioridad,
      responsable: this.datosPaso2?.responsable_fecha_asignacion
    };

    setTimeout(() => {
      // Limpiar estado pero mantener referencia a datos precargados
      this.datosPaso1 = null;
      this.datosPaso2 = null;
      this.documentoPasoFinal = null;
      this.pasoActual = 0;
      this.expedienteGuardado = false;
      this.expedienteId = null;
      this.paso1Valido = false;
      this.isTransitioning = false;

      // Precargar datos en el paso 1
      if (this.paso1Component && datosPrecargar) {
        this.paso1Component.precargarDatos?.(datosPrecargar);
      }

      this.mostrarMensaje('Nuevo registro - algunos datos fueron precargados', 'success');
    }, 300);
  }
}
