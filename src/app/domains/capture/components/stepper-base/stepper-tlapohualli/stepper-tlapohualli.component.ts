import { Component, OnInit } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FirstStepTlapohualliComponent } from '../first-step-tlapohualli/first-step-tlapohualli.component';
import { SecondStepTlapohualliComponent } from '../second-step-tlapohualli/second-step-tlapohualli.component';
import { ThirdStepTlapohualliComponent } from '../third-step-tlapohualli/third-step-tlapohualli.component';
// DocumentUploadComponent eliminado - no se necesita subida de archivos
import { ExpedienteTlapohualliService } from '../../../services/expediente-tlapohualli.service';
import { 
  FormularioPaso1, 
  FormularioPaso2, 
  FormularioPaso3, 
  ExpedienteTlapohualli 
} from '../../../interfaces/expediente-tlapohualli.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule,
    FirstStepTlapohualliComponent,
    SecondStepTlapohualliComponent,
    ThirdStepTlapohualliComponent
  ],
  templateUrl: './stepper-tlapohualli.component.html',
  styleUrls: ['./stepper-tlapohualli.component.css', './stepper-tlapohualli-global.css']
})
export class StepperTlapohualliComponent implements OnInit {
  // Datos de los formularios
  datosPaso1: FormularioPaso1 | null = null;
  datosPaso2: FormularioPaso2 | null = null;
  datosPaso3: FormularioPaso3 | null = null;
  
  // Estado del stepper
  pasoActual = 0;
  expedienteGuardado = false;
  expedienteId: number | null = null;

  // Estado de carga
  guardando = false;

  // Estado de transición
  isTransitioning = false;

  constructor(
    private expedienteService: ExpedienteTlapohualliService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Inicializar datos si es necesario
  }

  // Eventos del Paso 1
  onPaso1Completado(datos: FormularioPaso1) {
    this.datosPaso1 = datos;
    this.transicionarPaso(1);
    this.mostrarMensaje('Paso 1 completado correctamente', 'success');
  }

  onPaso1Siguiente() {
    // Si no hay datos del paso 1, intentar obtenerlos del componente
    if (!this.datosPaso1) {
      // Emitir evento para que el componente del paso 1 complete sus datos
      this.mostrarMensaje('Por favor, complete los campos obligatorios del paso 1', 'warning');
      return;
    }
    this.transicionarPaso(1);
  }

  // Eventos del Paso 2
  onPaso2Completado(datos: FormularioPaso2) {
    this.datosPaso2 = datos;
    this.transicionarPaso(2);
    this.mostrarMensaje('Paso 2 completado correctamente', 'success');
  }

  onPaso2Siguiente() {
    this.transicionarPaso(2);
  }

  onPaso2Anterior() {
    this.transicionarPaso(0);
  }

  // Eventos del Paso 3
  onPaso3Completado(datos: FormularioPaso3) {
    this.datosPaso3 = datos;
    this.finalizarExpediente();
  }

  onPaso3Finalizar() {
    this.finalizarExpediente();
  }

  onPaso3Anterior() {
    this.transicionarPaso(1);
  }

  // Finalizar expediente
  async finalizarExpediente() {
    if (!this.datosPaso1 || !this.datosPaso2 || !this.datosPaso3) {
      this.mostrarMensaje('Faltan datos en algunos pasos', 'error');
      return;
    }

    this.guardando = true;

    try {
      const expediente = await this.expedienteService.crearExpedienteDesdePasos(
        this.datosPaso1,
        this.datosPaso2,
        this.datosPaso3
      ).toPromise();

      this.expedienteId = expediente?.id_expediente || null;
      this.expedienteGuardado = true;
      this.pasoActual = 3;

      this.mostrarMensaje('Expediente guardado exitosamente', 'success');
      
      // Mostrar resumen del expediente creado
      this.mostrarResumenExpediente(expediente);

    } catch (error) {
      console.error('Error al guardar expediente:', error);
      this.mostrarMensaje('Error al guardar el expediente', 'error');
    } finally {
      this.guardando = false;
    }
  }

  // Mostrar resumen del expediente
  mostrarResumenExpediente(expediente: ExpedienteTlapohualli | undefined) {
    if (!expediente) return;

    const resumen = `
      Expediente: ${expediente.expediente}
      Oficio: ${expediente.oficio || 'N/A'}
      Remitente: ${expediente.remitente_area || 'N/A'}
      Estatus: ${expediente.estatus || 'N/A'}
      Fecha de Creación: ${expediente.fecha_creacion ? new Date(expediente.fecha_creacion).toLocaleDateString() : 'N/A'}
    `;

    this.snackBar.open(resumen, 'Cerrar', {
      duration: 10000,
      panelClass: ['success-snackbar']
    });
  }


  // Mostrar mensaje
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [`${tipo}-snackbar`]
    });
  }

  // Getters para el estado del stepper
  get puedeAvanzarPaso1(): boolean {
    // Permitir avanzar libremente para pruebas
    return true;
  }

  get puedeAvanzarPaso2(): boolean {
    // Permitir avanzar libremente como en el paso 1
    return true;
  }

  get puedeFinalizar(): boolean {
    // Permitir finalizar libremente para pruebas
    return true;
  }

  get estaCompletado(): boolean {
    return this.expedienteGuardado;
  }

  // Método para obtener el resumen completo
  obtenerResumenCompleto() {
    return {
      paso1: this.datosPaso1,
      paso2: this.datosPaso2,
      paso3: this.datosPaso3,
      expedienteId: this.expedienteId,
      fechaCreacion: new Date().toISOString()
    };
  }


  // Método para transiciones suaves entre pasos
  private transicionarPaso(nuevoPaso: number) {
    this.isTransitioning = true;
    
    // Pequeño delay para mostrar la transición
    setTimeout(() => {
      this.pasoActual = nuevoPaso;
      this.isTransitioning = false;
      
      // Efecto de scroll suave hacia arriba
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 200);
  }

  // Método mejorado para reiniciar formulario
  reiniciarFormulario() {
    this.isTransitioning = true;
    
    setTimeout(() => {
      this.datosPaso1 = null;
      this.datosPaso2 = null;
      this.datosPaso3 = null;
      this.pasoActual = 0;
      this.expedienteGuardado = false;
      this.expedienteId = null;
      this.isTransitioning = false;
      this.mostrarMensaje('Formulario reiniciado', 'info');
    }, 300);
  }

  // Método mejorado para crear nuevo expediente
  crearNuevoExpediente() {
    this.reiniciarFormulario();
  }
}
