import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DictaminadorBandejaService } from '../../../../domains/services/dictaminador-bandeja.service';
import { tableAsuntosPorDictaminar } from '../../../../domains/interfaces/porAsignarRequest.interface';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../domains/services/archivos-atencion.service';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  // Campos adicionales que necesitamos
  id_atencion_fk?: number;
  id_documento_fk?: number;
  id_administracion_fk?: number;
  plazo_atencion_original?: number;
  id_asunto?: number;
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
    MatSnackBarModule,
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
  
  // Para acceso desde la plantilla
  environment = environment;
  
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
  
  // Para la subida de archivos
  @ViewChild('fileInput') fileInput!: ElementRef;
  archivosSeleccionados: File[] = [];
  cargandoArchivos = false;
  mostrarModalArchivos = false;
  
  // Para manejar archivos adjuntos
  archivosAdjuntos: ArchivoAdjunto[] = [];
  cargandoArchivosAdjuntos = false;
  errorArchivosAdjuntos = '';
  
  // Variables para el modal de visualización de PDF
  mostrarModalPdf = false;
  urlPdfActual = '';
  nombrePdfActual = '';
  pdfBase64 = '';
  cargandoPdf = false;
  errorPdf = '';
  
  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dictaminadorBandejaService: DictaminadorBandejaService,
    private archivosAtencionService: ArchivosAtencionService,
    private snackBar: MatSnackBar,
    private domSanitizer: DomSanitizer
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
                folioScanner: String(encontrado.folio_scanner || ''),
                autoridadRemitente: encontrado.autoridad_remitente || '',
                tipoDocumento: '', // Puedes mapearlo si lo necesitas
                plazoAtencion: plazoAtencionVisual,
                // Añadimos los campos adicionales
                id_atencion_fk: encontrado.id_atencion_fk,
                id_documento_fk: encontrado.id_documento_fk,
                id_administracion_fk: encontrado.id_administracion_fk,
                plazo_atencion_original: encontrado.plazo_atencion,
                id_asunto: encontrado.id_asunto
              };
              
              // Para debug: mostrar todos los campos disponibles
              console.log('Datos completos del asunto:', encontrado);
              console.log('Datos mapeados:', this.asunto);
              
              // Una vez que tenemos el asunto con su folio, cargamos los archivos adjuntos
              this.cargarArchivosAdjuntos();
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
    const estado = this.getEstadoAtencionText();
    switch (estado) {
      case 'EN TRAMITE': return 'bg-blue-600 text-white';
      case 'PARCIAL': return 'bg-orange-600 text-white';
      case 'TOTAL': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  getStatusIcon(): string {
    const estado = this.getEstadoAtencionText();
    switch (estado) {
      case 'EN TRAMITE': return 'hourglass_empty';
      case 'PARCIAL': return 'hourglass_half';
      case 'TOTAL': return 'check_circle';
      default: return 'help_outline';
    }
  }

  getStatusText(): string {
    const estado = this.getEstadoAtencionText();
    switch (estado) {
      case 'EN TRAMITE': return 'En Trámite';
      case 'PARCIAL': return 'Atención Parcial';
      case 'TOTAL': return 'Atención Total';
      case 'NO APLICA': return 'No Aplica';
      default: return 'Desconocido';
    }
  }

  getStatusColorClass(): string {
    const estado = this.getEstadoAtencionText();
    switch (estado) {
      case 'EN TRAMITE': return 'blue';
      case 'PARCIAL': return 'orange';
      case 'TOTAL': return 'green';
      default: return 'gray';
    }
  }
  
  getProgressColor(): string {
    const estado = this.getEstadoAtencionText();
    switch (estado) {
      case 'EN TRAMITE': return 'bg-blue-600';
      case 'PARCIAL': return 'bg-orange-600';
      case 'TOTAL': return 'bg-green-600';
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

  // Método para obtener el texto del estado de atención basado en el ID
  getEstadoAtencionText(): string {
    if (!this.asunto.id_atencion_fk) return 'Desconocido';
    
    switch(this.asunto.id_atencion_fk) {
      case 1: return 'TOTAL';
      case 2: return 'PARCIAL';
      case 3: return 'EN TRAMITE';
      case 5: return 'NO APLICA';
      default: return 'Desconocido';
    }
  }

  // Método para obtener el texto del tipo de documento basado en el ID
  getDocumentoText(): string {
    if (!this.asunto.id_documento_fk) return 'No especificado';
    
    switch(this.asunto.id_documento_fk) {
      case 1: return 'RESPUESTA';
      case 2: return 'REQUERIMIENTO';
      case 3: return 'REQUERIMIENTO Y RESPUESTA';
      case 4: return 'SOLICITUD INTERNA';
      case 5: return 'RESPUESTA INTERNA';
      case 6: return 'RESPUESTA A FGR';
      case 7: return 'ALCANCE';
      default: return 'No especificado';
    }
  }

  // Método para obtener el texto de la administración basado en el ID
  getAdministracionText(): string {
    if (!this.asunto.id_administracion_fk) return 'No especificada';
    return `Administración ${this.asunto.id_administracion_fk}`;
  }

  // Método para obtener el texto y clase del plazo de atención original
  getPlazoAtencionText(): string {
    if (this.asunto.plazo_atencion_original === 0) {
      return 'Urgente';
    } else if (this.asunto.plazo_atencion_original === null || this.asunto.plazo_atencion_original === undefined) {
      return 'Normal';
    } else {
      return `${this.asunto.plazo_atencion_original} días`;
    }
  }

  getPlazoAtencionClass(): string {
    if (this.asunto.plazo_atencion_original === 0) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-green-600 bg-green-50 border-green-200';
    }
  }

  /**
   * Abre el selector de archivos
   */
  abrirSelectorArchivos(): void {
    this.fileInput.nativeElement.click();
  }
  
  /**
   * Maneja la selección de archivos PDF
   */
  onArchivosSeleccionados(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Filtrar solo archivos PDF
      this.archivosSeleccionados = Array.from(files as FileList).filter(
        (file: File) => file.type === 'application/pdf'
      );
      
      // Si hay archivos no PDF, mostrar advertencia
      if (Array.from(files as FileList).length !== this.archivosSeleccionados.length) {
        this.snackBar.open('Solo se permiten archivos PDF', 'Cerrar', { 
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
      }
      
      // Mostrar modal de confirmación solo si hay archivos válidos
      if (this.archivosSeleccionados.length > 0) {
        this.mostrarModalArchivos = true;
      }
    }
  }
  
  /**
   * Cancela la subida de archivos
   */
  cancelarSubidaArchivos(): void {
    this.archivosSeleccionados = [];
    this.mostrarModalArchivos = false;
    this.fileInput.nativeElement.value = '';
  }
  
  /**
   * Sube los archivos seleccionados al servidor
   */
  subirArchivos(): void {
    if (this.archivosSeleccionados.length === 0) return;
    
    this.cargandoArchivos = true;
    
    // Obtener el folio del asunto actual
    const folio = this.asunto.folio;
    
    this.archivosAtencionService.subirArchivosPdf(folio, this.archivosSeleccionados)
      .subscribe({
        next: (response) => {
          this.cargandoArchivos = false;
          this.mostrarModalArchivos = false;
          this.archivosSeleccionados = [];
          this.fileInput.nativeElement.value = '';
          
          // Mostrar mensaje de éxito
          this.snackBar.open(response, 'Cerrar', { 
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Refrescar la lista de archivos adjuntos
          this.refrescarArchivosAdjuntos();
        },
        error: (error) => {
          this.cargandoArchivos = false;
          console.error('Error al subir archivos:', error);
          
          // Mostrar mensaje de error
          this.snackBar.open(
            error.error || 'Error al subir los archivos. Intente nuevamente.', 
            'Cerrar', { 
              duration: 7000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
  }

  /**
   * Carga la lista de archivos PDF adjuntos al asunto actual
   */
  cargarArchivosAdjuntos(): void {
    if (!this.asunto || !this.asunto.folio) return;
    
    this.cargandoArchivosAdjuntos = true;
    this.errorArchivosAdjuntos = '';
    
    this.archivosAtencionService.listarArchivosPdf(this.asunto.folio)
      .subscribe({
        next: (archivos) => {
          this.archivosAdjuntos = archivos;
          this.cargandoArchivosAdjuntos = false;
        },
        error: (error) => {
          console.error('Error al cargar archivos adjuntos:', error);
          this.errorArchivosAdjuntos = 'No se pudieron cargar los archivos adjuntos.';
          this.cargandoArchivosAdjuntos = false;
          
          // Si el error es 404, no es realmente un error - simplemente no hay archivos
          if (error.status === 404) {
            this.archivosAdjuntos = [];
            this.errorArchivosAdjuntos = '';
          }
        }
      });
  }
  
  /**
   * Formatea el tamaño de archivo en bytes a una representación más legible (KB, MB)
   */
  formatearTamanoArchivo(bytes: number): string {
    if (!bytes && bytes !== 0) {
      return 'Tamaño desconocido';
    }
    
    try {
      if (bytes < 1024) {
        return bytes + ' B';
      } else if (bytes < 1048576) {
        // Convertir a KB con 1 decimal
        const kb = (bytes / 1024).toFixed(1);
        // Si el decimal es .0, mostrar sin decimal
        return kb.endsWith('.0') ? kb.slice(0, -2) + ' KB' : kb + ' KB';
      } else if (bytes < 1073741824) {
        // Convertir a MB con 2 decimales
        const mb = (bytes / 1048576).toFixed(2);
        // Si termina en .00, mostrar sin decimales
        if (mb.endsWith('.00')) {
          return mb.slice(0, -3) + ' MB';
        }
        // Si termina en .x0, mostrar con 1 decimal
        if (mb.endsWith('0')) {
          return mb.slice(0, -1) + ' MB';
        }
        return mb + ' MB';
      } else {
        // Convertir a GB con 2 decimales
        const gb = (bytes / 1073741824).toFixed(2);
        // Si termina en .00, mostrar sin decimales
        if (gb.endsWith('.00')) {
          return gb.slice(0, -3) + ' GB';
        }
        // Si termina en .x0, mostrar con 1 decimal
        if (gb.endsWith('0')) {
          return gb.slice(0, -1) + ' GB';
        }
        return gb + ' GB';
      }
    } catch (error) {
      console.error('Error al formatear tamaño:', error);
      return 'Tamaño desconocido';
    }
  }
  
  /**
   * Formatea la fecha de última modificación a un formato legible
   */
  formatearFechaArchivo(fechaStr: string): string {
    try {
      const fecha = new Date(fechaStr);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Fecha no disponible';
      }
      
      // Obtener fecha actual para comparaciones
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      
      // Si es hoy, mostrar "Hoy, HH:MM"
      if (fecha.getDate() === hoy.getDate() && 
          fecha.getMonth() === hoy.getMonth() && 
          fecha.getFullYear() === hoy.getFullYear()) {
        return `Hoy, ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Si es ayer, mostrar "Ayer, HH:MM"
      if (fecha.getDate() === ayer.getDate() && 
          fecha.getMonth() === ayer.getMonth() && 
          fecha.getFullYear() === ayer.getFullYear()) {
        return `Ayer, ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Si es este año, mostrar "DD MMM, HH:MM"
      if (fecha.getFullYear() === ahora.getFullYear()) {
        return fecha.toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: 'short'
        }) + `, ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Para otros años, mostrar "DD MMM YYYY, HH:MM"
      return fecha.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) + `, ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  }
  
  /**
   * Refresca la lista de archivos después de una nueva subida
   */
  refrescarArchivosAdjuntos(): void {
    this.cargarArchivosAdjuntos();
  }

  /**
   * Abre el PDF en un modal para visualizarlo
   * @param nombreArchivo Nombre del archivo a visualizar
   */
  verArchivoPdf(nombreArchivo: string): void {
    if (!this.asunto || !this.asunto.folio) return;
    
    this.nombrePdfActual = nombreArchivo;
    this.cargandoPdf = true;
    this.errorPdf = '';
    this.mostrarModalPdf = true;
    
    // Obtener el PDF usando el nuevo endpoint
    this.archivosAtencionService.obtenerPdf(this.asunto.folio, nombreArchivo, 'atencion')
      .subscribe({
        next: (base64Data) => {
          // Crear URL para visualizar el PDF
          this.pdfBase64 = base64Data;
          this.urlPdfActual = 'data:application/pdf;base64,' + base64Data;
          this.cargandoPdf = false;
        },
        error: (error) => {
          console.error('Error al obtener el PDF:', error);
          this.errorPdf = 'No se pudo cargar el documento. Intente nuevamente.';
          this.cargandoPdf = false;
        }
      });
  }
  
  /**
   * Cierra el modal de visualización de PDF
   */
  cerrarModalPdf(): void {
    this.mostrarModalPdf = false;
    this.urlPdfActual = '';
    this.nombrePdfActual = '';
    this.pdfBase64 = '';
    this.errorPdf = '';
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Descarga el PDF actual usando el contenido base64
   */
  descargarPdfActual(): void {
    if (!this.pdfBase64 || this.cargandoPdf || this.errorPdf) return;
    
    try {
      // Crear un elemento <a> para la descarga
      const enlace = document.createElement('a');
      enlace.href = this.urlPdfActual;
      enlace.download = this.nombrePdfActual || 'documento.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      
      this.snackBar.open('Descarga iniciada', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      this.snackBar.open('Error al descargar el archivo', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
} 