import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DictaminadorBandejaService } from '../../../../domains/services/dictaminador-bandeja.service';
import { tableAsuntosPorDictaminar } from '../../../../domains/interfaces/porAsignarRequest.interface';

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
  prioridad: string;
  prioridadVisual: string;
  oficio: string;
  turnoJefatura: string;
  folioScanner: string;
  autoridadRemitente: string;
  tipoDocumento: string;
  plazoAtencion: string;
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
    id: '',
    folio: '',
    personaRelacionada: '',
    carpetaInvestigacion: '',
    estadoAtencion: 'Tramite',
    plazoUrgente: false,
    fechaRecepcion: new Date(),
    diasTranscurridos: 0,
    documentos: [],
    eventos: [],
    prioridad: '',
    prioridadVisual: '',
    oficio: '',
    turnoJefatura: '',
    folioScanner: '',
    autoridadRemitente: '',
    tipoDocumento: '',
    plazoAtencion: 'Sin plazo de atención'
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
    private router: Router,
    private dictaminadorBandejaService: DictaminadorBandejaService
  ) {
    this.dictamenForm = this.fb.group({
      temaPrincipal: ['', Validators.required],
      observaciones: ['', Validators.required],
      fundamentoLegal: ['', Validators.required],
      conclusion: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Obtener el ID de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.asuntoId = params['id'];
        // Llamar al endpoint general y filtrar por ID
        this.dictaminadorBandejaService.obtenerAsuntosAsignados().subscribe({
          next: (res) => {
            // Buscar el asunto con el ID recibido
            const encontrado = res.find((item: any) => item.id_asunto.toString() === this.asuntoId);
            if (encontrado) {
              // Mapear los campos igual que en la card
              let diasTranscurridos = 0;
              if (encontrado.fecha_recepcion) {
                const fechaRecepcion = new Date(encontrado.fecha_recepcion);
                const fechaActual = new Date();
                const diferencia = fechaActual.getTime() - fechaRecepcion.getTime();
                diasTranscurridos = Math.floor(diferencia / (1000 * 60 * 60 * 24));
              }
              let prioridad = '';
              let prioridadColor = '';
              if (encontrado.plazo_atencion && encontrado.plazo_atencion > 0) {
                prioridad = 'Urgente';
                prioridadColor = 'rojo';
              } else if (diasTranscurridos < 4) {
                prioridad = 'Baja';
                prioridadColor = 'verde';
              } else if (diasTranscurridos >= 4 && diasTranscurridos <= 15) {
                prioridad = 'Media';
                prioridadColor = 'amarillo';
              } else if (diasTranscurridos > 15) {
                prioridad = 'Alta';
                prioridadColor = 'rojo';
              }
              let plazoAtencionVisual = 'Sin plazo de atención';
              if (encontrado.plazo_atencion && encontrado.plazo_atencion > 0) {
                plazoAtencionVisual = encontrado.plazo_atencion + ' días';
              }
              this.asunto = {
                id: encontrado.id_asunto.toString(),
                folio: encontrado.folio_interno,
                personaRelacionada: encontrado.persona_relacionada,
                carpetaInvestigacion: encontrado.carpeta_investigacion,
                estadoAtencion: '', // Puedes mapearlo si lo necesitas
                fechaRecepcion: new Date(encontrado.fecha_recepcion),
                diasTranscurridos: diasTranscurridos,
                plazoUrgente: encontrado.plazo_atencion > 0,
                documentos: [],
                eventos: [],
                prioridad: prioridad,
                prioridadVisual: prioridadColor,
                oficio: encontrado.oficio,
                turnoJefatura: encontrado.turno_jefatura,
                folioScanner: String(encontrado.folio_scanner),
                autoridadRemitente: encontrado.autoridad_remitente || '',
                tipoDocumento: '', // Puedes mapearlo si lo necesitas
                plazoAtencion: plazoAtencionVisual
              };
            }
          },
          error: (err) => {
            console.error('Error al obtener asuntos:', err);
          }
        });
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
  
  // Método para cargar datos del asunto desde el backend
  cargarDatosAsunto(id: string): void {
    console.log(`Cargando datos del asunto con ID: ${id}`);
    this.dictaminadorBandejaService.obtenerAsuntoPorId(id)
      .subscribe({
        next: (response: tableAsuntosPorDictaminar) => {
          console.log('Respuesta del backend:', response);
          
          // Estado de Atención basado en id_atencion_fk
          let estadoAtencion = 'Desconocido';
          if (response.id_atencion_fk === 1) {
            estadoAtencion = 'Tramite';
          } else if (response.id_atencion_fk === 2) {
            estadoAtencion = 'Parcial';
          } else if (response.id_atencion_fk === 3) {
            estadoAtencion = 'Total';
          }
          
          // Calcular días transcurridos
          const diasTranscurridos = this.calcularDiasTranscurridos(response.fecha_recepcion);
          
          // Plazo: null = Normal/no urgente, 0 o mayor = Urgente
          let plazoUrgente = false;
          let plazoAtencionVisual = 'Sin plazo de atención';
          if (response.plazo_atencion === null || response.plazo_atencion === undefined) {
            plazoUrgente = false;
            plazoAtencionVisual = 'Sin plazo de atención';
          } else if (response.plazo_atencion === 0) {
            plazoUrgente = true;
            plazoAtencionVisual = 'Urgente';
          } else if (response.plazo_atencion > 0) {
            plazoUrgente = true;
            plazoAtencionVisual = `${response.plazo_atencion} días`;
          }
          
          // Prioridad visual para el semáforo
          let prioridad = '';
          let prioridadColor = '';
          if (plazoUrgente) {
            prioridad = 'Urgente';
            prioridadColor = 'rojo';
          } else {
            prioridad = 'Normal';
            prioridadColor = 'verde';
          }
          
          this.asunto = {
            id: response.id_asunto.toString(),
            folio: response.folio_interno,
            personaRelacionada: response.persona_relacionada,
            carpetaInvestigacion: response.carpeta_investigacion,
            estadoAtencion: estadoAtencion,
            fechaRecepcion: new Date(response.fecha_recepcion),
            diasTranscurridos: diasTranscurridos,
            plazoUrgente: plazoUrgente,
            documentos: [],
            eventos: [],
            rfc: '',
            administracion: response.autoridad_remitente,
            prioridad: prioridad,
            prioridadVisual: prioridadColor,
            oficio: response.oficio || '',
            turnoJefatura: response.turno_jefatura || '',
            folioScanner: response.folio_scanner ? String(response.folio_scanner) : '',
            autoridadRemitente: response.autoridad_remitente || '',
            tipoDocumento: '',
            plazoAtencion: plazoAtencionVisual
          };
        },
        error: (error: Error) => {
          console.error('Error al cargar el asunto:', error);
        }
      });
  }

  // Método auxiliar para calcular días transcurridos
  calcularDiasTranscurridos(fechaRecepcion: string): number {
    const fecha = new Date(fechaRecepcion);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      default: return 'help_outline';
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