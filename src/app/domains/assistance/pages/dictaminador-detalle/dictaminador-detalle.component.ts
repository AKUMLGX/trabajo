import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  tipo: string;
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  fecha: Date;
}

interface AsuntoDictaminador {
  id: string;
  folio: string;
  personaRelacionada: string;
  carpetaInvestigacion: string;
  estadoAtencion: string;
  fechaRecepcion: Date;
  diasTranscurridos: number;
  plazoUrgente: boolean;
  documentos: Documento[];
  eventos: Evento[];
  rfc?: string;
  administracion?: string;
  // Propiedades para asuntos rechazados
  esRechazado?: boolean;
  fechaRechazo?: Date;
  motivoRechazo?: string;
  rechazadoPor?: string;
  observacionesRechazo?: string;
}

@Component({
  selector: 'app-dictaminador-detalle',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatProgressBarModule, 
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dictaminador-detalle.component.html',
  styleUrl: './dictaminador-detalle.component.css'
})
export class DictaminadorDetalleComponent implements OnInit {
  asunto: AsuntoDictaminador = {
    id: '12345',
    folio: 'EUCAPE/12345/2024',
    personaRelacionada: 'María González Pérez',
    carpetaInvestigacion: 'CI-2024/56789',
    estadoAtencion: 'Tramite',
    plazoUrgente: true,
    fechaRecepcion: new Date('2024-02-15'),
    diasTranscurridos: 45,
    documentos: [
      { id: '1', nombre: 'Oficio de solicitud.pdf', tipo: 'pdf', fecha: new Date('2024-02-15') },
      { id: '2', nombre: 'Carpeta de investigación.pdf', tipo: 'pdf', fecha: new Date('2024-02-20') },
      { id: '3', nombre: 'Documentación adicional.pdf', tipo: 'pdf', fecha: new Date('2024-03-10') }
    ],
    eventos: [
      { id: '1', titulo: 'Recepción del asunto', descripcion: 'Se recibió el asunto para dictaminación', fecha: new Date('2024-02-15'), tipo: 'evento' },
      { id: '2', titulo: 'Asignación de dictaminador', descripcion: 'El asunto fue asignado al Lic. Juan Pérez', fecha: new Date('2024-02-16'), tipo: 'evento' },
      { id: '3', titulo: 'Carga de documento', descripcion: 'Se cargó la carpeta de investigación', fecha: new Date('2024-02-20'), tipo: 'documento' },
      { id: '4', titulo: 'Solicitud de información adicional', descripcion: 'Se solicitó información complementaria', fecha: new Date('2024-03-05'), tipo: 'evento' },
      { id: '5', titulo: 'Carga de documento', descripcion: 'Se cargó documentación adicional', fecha: new Date('2024-03-10'), tipo: 'documento' }
    ],
    rfc: 'GOPM850623ABC',
    administracion: 'Administración Desconcentrada de Auditoría Fiscal'
  };
  
  // Formulario para el dictamen
  dictamenForm: FormGroup;
  
  // Para el modal de confirmación
  mostrarModalConfirmacion = false;
  
  // Para el modal de revisión
  mostrarModalRevision = false;
  motivoRechazo = '';
  asuntoEnRevision: any = null;
  
  // Para el modal de confirmación de aprobación
  mostrarModalAprobacion = false;
  
  // Para la vista de documentos
  vistaActual = 'dictamen'; // 'dictamen' o 'documentos'
  documentoSeleccionado = 0;
  
  // Para mensajes de estado
  mensajeEstado = '';
  tipoMensajeEstado = ''; // 'success' o 'error'
  mostrarMensajeEstado = false;
  
  // Parámetros de la URL
  asuntoId: string = '';
  origenRechazado: boolean = false;
  
  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.dictamenForm = this.fb.group({
      temaPrincipal: ['', Validators.required],
      observaciones: ['', Validators.required],
      fundamentoLegal: ['', Validators.required],
      conclusion: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.asuntoId = params['id'];
        this.cargarDatosAsunto(this.asuntoId);
      }
    });
    
    // Verificar si viene de asuntos rechazados
    this.route.queryParams.subscribe(params => {
      this.origenRechazado = params['origen'] === 'rechazado';
      
      // Si es un asunto rechazado, cargar datos específicos
      if (this.origenRechazado) {
        this.cargarDatosAsuntoRechazado(this.asuntoId);
      }
      
      // Verificar si se debe mostrar el modal de revisión automáticamente
      if (params['revision'] === 'true') {
        // Pequeño delay para asegurar que los datos estén cargados
        setTimeout(() => {
          this.mostrarRevision();
        }, 300);
      }
    });
    
    // Inicialización del formulario con datos de muestra
    this.dictamenForm.setValue({
      temaPrincipal: 'Análisis de la situación fiscal del contribuyente',
      observaciones: 'El contribuyente presenta inconsistencias en sus declaraciones mensuales de los periodos enero-marzo 2023.',
      fundamentoLegal: 'Artículos 42, fracción II y 48 del Código Fiscal de la Federación, en relación con los artículos 55 y 56 de su reglamento.',
      conclusion: 'Con base en la revisión efectuada, se determina procedente la solicitud de la autoridad.'
    });
    
    // Inicializar datos de revisión
    this.asuntoEnRevision = {
      folio: `EUCAPE/${this.asunto.id}/2024`,
      autoridad: 'Administración Desconcentrada de Auditoría Fiscal',
      fecha: new Date('2024-02-15').toLocaleDateString(),
      dictaminador: 'Lic. Juan Pérez Torres',
      estado: 'En revisión',
      documentos: this.asunto.documentos
    };
  }
  
  // Método para cargar datos del asunto (simulado por ahora)
  cargarDatosAsunto(id: string): void {
    console.log(`Cargando datos del asunto con ID: ${id}`);
    // Aquí iría la llamada al servicio para obtener los datos reales del asunto
    // Por ahora usamos los datos de muestra
    this.asunto.id = id;
    this.asunto.folio = `EUCAPE/${id}/2024`;
  }
  
  // Método para cargar datos específicos de un asunto rechazado
  cargarDatosAsuntoRechazado(id: string): void {
    console.log(`Cargando datos del asunto rechazado con ID: ${id}`);
    
    // Aquí iría la llamada al servicio para obtener los datos reales
    // Por ahora, simulamos los datos de un asunto rechazado
    this.asunto.esRechazado = true;
    this.asunto.fechaRechazo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 días atrás
    this.asunto.motivoRechazo = 'Información incompleta';
    this.asunto.rechazadoPor = 'Ana Martínez - Coordinadora';
    this.asunto.observacionesRechazo = 'El dictamen carece de fundamento jurídico en los artículos 145 y 146 del Código Fiscal. Se requiere completar la información y volver a presentar.';
    
    // Agregar evento de rechazo al historial
    this.asunto.eventos.unshift({
      id: (this.asunto.eventos.length + 1).toString(),
      titulo: 'Dictamen rechazado',
      descripcion: `Motivo: ${this.asunto.motivoRechazo}. ${this.asunto.observacionesRechazo}`,
      fecha: this.asunto.fechaRechazo,
      tipo: 'evento'
    });
    
    // Actualizar datos del formulario con la observación del rechazo
    this.dictamenForm.patchValue({
      observaciones: `[CORRECCIÓN SOLICITADA] ${this.asunto.observacionesRechazo}\n\n${this.dictamenForm.get('observaciones')?.value}`
    });
    
    // Actualizar datos para el modal de revisión
    this.motivoRechazo = this.asunto.observacionesRechazo;
    this.asuntoEnRevision = {
      ...this.asuntoEnRevision,
      estado: 'Rechazado'
    };
  }

  // Métodos para el modal de revisión
  mostrarRevision(): void {
    this.mostrarModalRevision = true;
  }

  cerrarModalRevision(): void {
    this.mostrarModalRevision = false;
  }

  // Método para cambiar entre vista de dictamen y documentos
  cambiarVistaDictamen(vista: string): void {
    this.vistaActual = vista;
  }

  // Método para seleccionar un documento
  seleccionarDocumento(index: number): void {
    this.documentoSeleccionado = index;
  }

  // Métodos para el modal de confirmación de aprobación
  confirmarAprobacion(): void {
    this.mostrarModalAprobacion = true;
  }

  cancelarAprobacion(): void {
    this.mostrarModalAprobacion = false;
  }

  // Método para mostrar mensajes de estado temporales
  mostrarMensaje(mensaje: string, tipo: string = 'success'): void {
    this.mensajeEstado = mensaje;
    this.tipoMensajeEstado = tipo;
    this.mostrarMensajeEstado = true;
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      this.mostrarMensajeEstado = false;
    }, 5000);
  }

  aprobarDictamen(): void {
    // Lógica para aprobar el dictamen
    this.asuntoEnRevision.estado = 'Aprobado';
    setTimeout(() => {
      this.mostrarModalAprobacion = false;
      this.cerrarModalRevision();
      // Mostrar notificación de éxito sin redirección
      this.mostrarMensaje('Documento aprobado y enviado correctamente', 'success');
      // No llamamos a goBack() para permanecer en la misma vista
    }, 1000);
  }

  rechazarDictamen(): void {
    if (!this.motivoRechazo.trim()) {
      // Mostrar error si no hay motivo de rechazo
      this.mostrarMensaje('Por favor, ingrese el motivo del rechazo antes de continuar', 'error');
      return;
    }
    // Lógica para rechazar el dictamen
    this.asuntoEnRevision.estado = 'Rechazado';
    setTimeout(() => {
      this.cerrarModalRevision();
      // Mostrar notificación de rechazo sin redirección
      this.mostrarMensaje('Documento rechazado correctamente', 'error');
      // No llamamos a goBack() para permanecer en la misma vista
    }, 1000);
  }

  guardarDictamen(): void {
    if (this.dictamenForm.valid) {
      console.log('Datos del dictamen guardados:', this.dictamenForm.value);
      // Aquí iría la lógica para guardar los datos
      this.mostrarMensaje('Datos guardados correctamente', 'success');
    } else {
      // Marcar controles como tocados para mostrar errores de validación
      Object.keys(this.dictamenForm.controls).forEach(key => {
        const control = this.dictamenForm.get(key);
        control?.markAsTouched();
      });
      this.mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
    }
  }

  confirmarFinalizacion(): void {
    this.mostrarModalConfirmacion = true;
  }

  cancelarFinalizacion(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarYFinalizar(): void {
    // Aquí iría la lógica para finalizar y enviar a revisión
    console.log('Dictamen finalizado y enviado a revisión');
    this.mostrarModalConfirmacion = false;
    // Mostrar mensaje de éxito sin redirección
    setTimeout(() => {
      this.mostrarMensaje('Documento enviado a revisión correctamente', 'success');
      // No llamamos a goBack() para permanecer en la misma vista
    }, 500);
  }

  goBack(): void {
    this.location.back();
  }

  getPriorityClass(): string {
    return this.asunto.plazoUrgente ? 'bg-red-600 text-white' : 'bg-green-600 text-white';
  }

  getPriorityIcon(): string {
    return this.asunto.plazoUrgente ? 'priority_high' : 'check_circle';
  }

  getPriorityText(): string {
    return this.asunto.plazoUrgente ? 'Urgente' : 'Normal';
  }

  getStatusClass(): string {
    switch (this.asunto.estadoAtencion) {
      case 'Tramite': return 'bg-blue-600 text-white';
      case 'Parcial': return 'bg-orange-600 text-white';
      case 'Total': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  getStatusIcon(): string {
    switch (this.asunto.estadoAtencion) {
      case 'Tramite': return 'hourglass_empty';
      case 'Parcial': return 'hourglass_half';
      case 'Total': return 'check_circle';
      default: return 'help';
    }
  }

  getStatusText(): string {
    switch (this.asunto.estadoAtencion) {
      case 'Tramite': return 'En Trámite';
      case 'Parcial': return 'Atención Parcial';
      case 'Total': return 'Atención Total';
      default: return 'Desconocido';
    }
  }

  getStatusColorClass(): string {
    switch (this.asunto.estadoAtencion) {
      case 'Tramite': return 'blue';
      case 'Parcial': return 'orange';
      case 'Total': return 'green';
      default: return 'gray';
    }
  }
  
  getProgressColor(): string {
    switch (this.asunto.estadoAtencion) {
      case 'Tramite': return 'bg-blue-600';
      case 'Parcial': return 'bg-orange-600';
      case 'Total': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  }

  // Método para calcular el porcentaje de progreso basado en días transcurridos
  getProgressPercentage(): number {
    const maxDays = 30; // Asumimos 30 días como máximo para el plazo
    const percentage = (this.asunto.diasTranscurridos / maxDays) * 100;
    return Math.min(percentage, 100); // No superar el 100%
  }

  // Método para calcular los días restantes
  calculateDaysLeft(): number {
    const maxDays = 30; // Asumimos 30 días como máximo para el plazo
    const daysLeft = maxDays - this.asunto.diasTranscurridos;
    return Math.max(daysLeft, 0); // No mostrar números negativos
  }

  // Método para calcular días pasados desde un evento
  getDaysAgo(fecha: Date): number {
    const eventDate = new Date(fecha);
    const today = new Date();
    const differenceInTime = today.getTime() - eventDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24));
  }

  // Método para obtener el icono según el tipo de documento
  getDocumentIcon(tipo: string): string {
    // Ahora todos los documentos son PDF
    return 'picture_as_pdf';
  }
} 