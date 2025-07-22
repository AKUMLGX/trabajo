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

interface SeguimientoArea {
  id: string;
  area: string;
  nombreCompleto: string;
  solicitudEnviada: boolean;
  fechaSolicitud?: string;
  respuestaRecibida: boolean;
  fechaRespuesta?: string;
  tipoRespuesta: 'pendiente' | 'completa' | 'parcial';
  recordatorioEnviado: boolean;
  fechaRecordatorio?: string;
  respuestaRecordatorio: boolean;
  fechaRespuestaRecordatorio?: string;
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
  asuntoId = '';
  origenRechazado = false;
  
  // Para la subida de archivos
  @ViewChild('fileInput') fileInput!: ElementRef;
  archivosSeleccionados: File[] = [];
  cargandoArchivos = false;
  mostrarModalArchivos = false;
  
  // Para manejar archivos adjuntos
  archivosAdjuntos: ArchivoAdjunto[] = [];
  cargandoArchivosAdjuntos = false;
  errorArchivosAdjuntos = '';
  
  // Para detección inteligente de estado sin documentos
  esEstadoPendienteSinDocumentos = false;
  
  // Variables para el modal de visualización de PDF
  mostrarModalPdf = false;
  urlPdfActual = '';
  nombrePdfActual = '';
  pdfBase64 = '';
  cargandoPdf = false;
  errorPdf = '';
  
  // Variables para el checklist de seguimiento de áreas
  seguimientoAreas: SeguimientoArea[] = [
    {
      id: '1',
      area: 'ACOP',
      nombreCompleto: 'Administración Central de Operación de Padrones',
      solicitudEnviada: true,
      fechaSolicitud: '15/01/2025',
      respuestaRecibida: true,
      fechaRespuesta: '22/01/2025',
      tipoRespuesta: 'completa',
      recordatorioEnviado: false,
      respuestaRecordatorio: false
    },
    {
      id: '2',
      area: 'AGR',
      nombreCompleto: 'Administración General de Recaudación',
      solicitudEnviada: true,
      fechaSolicitud: '18/01/2025',
      respuestaRecibida: false,
      tipoRespuesta: 'pendiente',
      recordatorioEnviado: true,
      fechaRecordatorio: '25/01/2025',
      respuestaRecordatorio: false
    }
  ];
  
  // Variables para modales de gestión de áreas
  mostrarModalAgregarArea = false;
  areaSeleccionadaParaAgregar = '';
  
  mostrarModalEditarArea = false;
  areaEnEdicion: SeguimientoArea | null = null;
  fechaSolicitudEdicion = '';
  fechaRespuestaEdicion = '';
  fechaRecordatorioEdicion = '';
  fechaRespuestaRecordatorioEdicion = '';
  
  mostrarModalEliminar = false;
  areaParaEliminar: SeguimientoArea | null = null;
  
  // Áreas SAT disponibles
  areasSAT = [
    { codigo: 'ACOP', nombre: 'Administración Central de Operación de Padrones' },
    { codigo: 'ACSTC', nombre: 'Administración Central de Servicios Tributarios al Contribuyente' },
    { codigo: 'ACATF', nombre: 'Administración Central de Análisis Técnico Fiscal' },
    { codigo: 'ACGSTME', nombre: 'Administración Central de Gestión, Servicios y Trámites con Medios Electrónicos' },
    { codigo: 'AGP', nombre: 'Administración General de Planeación' },
    { codigo: 'AGR', nombre: 'Administración General de Recaudación' },
    { codigo: 'ACOJ', nombre: 'Administración Central de Operación Jurídica' },
    { codigo: 'AGACE', nombre: 'Administración General de Auditoria de Comercio Exterior' },
    { codigo: 'AGGC', nombre: 'Administración General de Grandes Contribuyentes' }
  ];
  
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
      // Campos de Solicitud de Información
      solicitudFolioInterno: ['', Validators.required],
      solicitudFechaAcuse: ['', Validators.required],
      solicitudNumeroOficio: [''],
      solicitudAreaDestino: ['', Validators.required],
      solicitudDescripcion: ['', Validators.required],
      
      // Campos de Respuesta Interna
      respuestaInternaFolioInterno: ['', Validators.required],
      respuestaInternaFecha: ['', Validators.required],
      respuestaInternaNumeroOficio: [''],
      respuestaInternaAreaOrigen: ['', Validators.required],
      respuestaInternaDescripcion: ['', Validators.required],
      
      // Campos de Respuesta a FGR
      respuestaFgrFolioInterno: ['', Validators.required],
      respuestaFgrNumeroOficio: ['', Validators.required],
      respuestaFgrFechaAcuse: ['', Validators.required],
      respuestaFgrOficioAtiende: ['', Validators.required],
      respuestaFgrEstadoAtencion: ['', Validators.required]
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
              console.log('🔍 Folio para cargar archivos:', this.asunto.folio);
              
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
    
    // Inicialización del formulario con datos de muestra - COMENTADO TEMPORALMENTE
    // Se comentó porque los campos del formulario han cambiado para el nuevo sistema de expedientes
    /*
    this.dictamenForm.setValue({
      temaPrincipal: 'Análisis de la situación fiscal del contribuyente',
      observaciones: 'El contribuyente presenta inconsistencias en sus declaraciones mensuales de los periodos enero-marzo 2023.',
      fundamentoLegal: 'Artículos 42, fracción II y 48 del Código Fiscal de la Federación, en relación con los artículos 55 y 56 de su reglamento.',
      conclusion: 'Con base en la revisión efectuada, se determina procedente la solicitud de la autoridad.'
    });
    */
    
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
    
    // Actualizar datos del formulario con la observación del rechazo - COMENTADO TEMPORALMENTE
    // Se comentó porque el campo 'observaciones' ya no existe en el nuevo formulario de expedientes
    /*
    this.dictamenForm.patchValue({
      observaciones: `[CORRECCIÓN SOLICITADA] ${this.asunto.observacionesRechazo}\n\n${this.dictamenForm.get('observaciones')?.value}`
    });
    */
    
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
  mostrarMensaje(mensaje: string, tipo = 'success'): void {
    // Configurar el color según el tipo de mensaje
    let panelClass = ['mat-snackbar-success'];
    
    if (tipo === 'error') {
      panelClass = ['mat-snackbar-error'];
    } else if (tipo === 'info') {
      panelClass = ['mat-snackbar-info'];
    }
    
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: panelClass
    });
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
    // Verificar que tenemos el ID del asunto
    if (!this.asunto.id_asunto) {
      this.mostrarMensaje('No se pudo identificar el asunto a finalizar', 'error');
      this.mostrarModalConfirmacion = false;
      return;
    }

    // Mostrar indicador de carga
    this.mostrarMensaje('Enviando asunto a revisión...', 'info');
    
    // Llamar al servicio para finalizar la atención
    this.dictaminadorBandejaService.finalizarAtencion(this.asunto.id_asunto).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta);
        this.mostrarModalConfirmacion = false;
        
        // La respuesta ahora es texto plano
        if (respuesta && respuesta.includes('fue enviado a revisión')) {
          this.mostrarMensaje('Asunto enviado a revisión correctamente', 'success');
        } else {
          this.mostrarMensaje(respuesta || 'Operación completada', 'success');
        }
      },
      error: (error) => {
        console.error('Error al finalizar atención:', error);
    this.mostrarModalConfirmacion = false;
        
        // Mejorar el manejo de errores
        let mensajeError = 'Error al enviar asunto a revisión';
        
        // Intentar extraer mensaje de error
        if (error.error && typeof error.error === 'string') {
          mensajeError += ': ' + error.error;
        } else if (error.message) {
          mensajeError += ': ' + error.message;
        } else if (typeof error === 'string') {
          mensajeError += ': ' + error;
        }
        
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
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
          
          // Mostrar mensaje de éxito mejorado
          let mensajeExito = response;
          if (this.esEstadoPendienteSinDocumentos) {
            mensajeExito += ' 🎉 ¡Asunto cambió a estado EN PROCESO!';
          }
          
          this.snackBar.open(mensajeExito, 'Cerrar', { 
            duration: 6000,
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
    if (!this.asunto || !this.asunto.folio) {
      console.log('❌ No se puede cargar archivos: asunto o folio no disponible', {
        asunto: !!this.asunto,
        folio: this.asunto?.folio
      });
      return;
    }
    
    console.log('🚀 Iniciando carga de archivos para folio:', this.asunto.folio);
    this.cargandoArchivosAdjuntos = true;
    this.errorArchivosAdjuntos = '';
    this.esEstadoPendienteSinDocumentos = false;
    
    this.archivosAtencionService.listarArchivosPdf(this.asunto.folio)
      .subscribe({
        next: (archivos) => {
          this.archivosAdjuntos = archivos;
          this.cargandoArchivosAdjuntos = false;
          
          // Si no hay archivos, pero la consulta fue exitosa, es estado PENDIENTE
          if (archivos.length === 0) {
            this.esEstadoPendienteSinDocumentos = true;
            console.log('📋 Estado PENDIENTE detectado: Asunto sin documentos adjuntos');
          }
        },
        error: (error) => {
          console.error('Error al cargar archivos adjuntos:', error);
          this.cargandoArchivosAdjuntos = false;
          
          // Si el error es 404, es estado PENDIENTE (sin documentos)
          if (error.status === 404) {
            this.archivosAdjuntos = [];
            this.errorArchivosAdjuntos = '';
            this.esEstadoPendienteSinDocumentos = true;
            console.log('📋 Estado PENDIENTE detectado: Error 404 - sin documentos adjuntos');
          } else {
            // Solo mostrar error para errores genuinos (no 404)
            this.errorArchivosAdjuntos = 'No se pudieron cargar los archivos adjuntos.';
            console.error('⚠️ Error genuino al cargar archivos:', error);
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
    console.log('🔄 Refrescando estado de documentos...');
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

  // Métodos para manejo de múltiples personas relacionadas
  isMultiplePersonas(): boolean {
    // Por ahora siempre false, pero extensible para el futuro
    // cuando se implemente soporte para múltiples personas
    return false;
  }

  getPersonasRelacionadas(): string[] {
    // Por ahora retorna array con una persona, pero extensible
    if (this.asunto.personaRelacionada) {
      // En el futuro aquí se podría splitear si viene separado por comas o similar
      return [this.asunto.personaRelacionada];
    }
    return [];
  }

  // ========== MÉTODOS PARA CHECKLIST DE SEGUIMIENTO DE ÁREAS ==========

  // ========== GESTIÓN DE MODAL AGREGAR ÁREA ==========
  
  // Abrir modal para agregar área
  agregarArea(): void {
    const areasDisponibles = this.getAreasDisponibles();
    if (areasDisponibles.length === 0) {
      this.snackBar.open('Todas las áreas ya están en seguimiento', 'Cerrar', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }
    
    this.mostrarModalAgregarArea = true;
    this.areaSeleccionadaParaAgregar = '';
  }
  
  // Cerrar modal agregar área
  cerrarModalAgregarArea(): void {
    this.mostrarModalAgregarArea = false;
    this.areaSeleccionadaParaAgregar = '';
  }
  
  // Confirmar agregar nueva área
  confirmarAgregarArea(): void {
    if (!this.areaSeleccionadaParaAgregar) {
      this.snackBar.open('Debe seleccionar un área', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Verificar que el área no esté ya agregada
    const yaExiste = this.seguimientoAreas.some(area => area.area === this.areaSeleccionadaParaAgregar);
    if (yaExiste) {
      this.snackBar.open('Esta área ya está en seguimiento', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    const areaInfo = this.getAreaPorCodigo(this.areaSeleccionadaParaAgregar);
    if (areaInfo) {
      const nuevaArea: SeguimientoArea = {
        id: Date.now().toString(),
        area: areaInfo.codigo,
        nombreCompleto: areaInfo.nombre,
        solicitudEnviada: false,
        respuestaRecibida: false,
        tipoRespuesta: 'pendiente',
        recordatorioEnviado: false,
        respuestaRecordatorio: false
      };
      
      this.seguimientoAreas.push(nuevaArea);
      this.cerrarModalAgregarArea();
      
      this.snackBar.open(`Área ${areaInfo.codigo} agregada al seguimiento`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }
  
  // Obtener áreas disponibles (que no están ya agregadas)
  getAreasDisponibles() {
    return this.areasSAT.filter(area => 
      !this.seguimientoAreas.some(seguimiento => seguimiento.area === area.codigo)
    );
  }
  
  // Obtener información de área por código
  getAreaPorCodigo(codigo: string) {
    return this.areasSAT.find(area => area.codigo === codigo);
  }

  // Actualizar checkbox de solicitud enviada
  actualizarSolicitudEnviada(areaId: string, checked: boolean): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area) {
      area.solicitudEnviada = checked;
      if (checked && !area.fechaSolicitud) {
        area.fechaSolicitud = new Date().toLocaleDateString('es-ES');
      } else if (!checked) {
        area.fechaSolicitud = undefined;
        // Si desmarcamos solicitud, también desmarcamos respuesta
        area.respuestaRecibida = false;
        area.fechaRespuesta = undefined;
        area.tipoRespuesta = 'pendiente';
        area.recordatorioEnviado = false;
        area.fechaRecordatorio = undefined;
        area.respuestaRecordatorio = false;
        area.fechaRespuestaRecordatorio = undefined;
      }
    }
  }

  // Actualizar checkbox de respuesta recibida
  actualizarRespuestaRecibida(areaId: string, checked: boolean): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area && area.solicitudEnviada) {
      area.respuestaRecibida = checked;
      if (checked && !area.fechaRespuesta) {
        area.fechaRespuesta = new Date().toLocaleDateString('es-ES');
        if (area.tipoRespuesta === 'pendiente') {
          area.tipoRespuesta = 'completa';
        }
      } else if (!checked) {
        area.fechaRespuesta = undefined;
        area.tipoRespuesta = 'pendiente';
      }
    }
  }

  // Actualizar tipo de respuesta
  actualizarTipoRespuesta(areaId: string, tipo: 'pendiente' | 'completa' | 'parcial'): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area) {
      area.tipoRespuesta = tipo;
      // Si cambia a pendiente, desmarcar respuesta recibida
      if (tipo === 'pendiente') {
        area.respuestaRecibida = false;
        area.fechaRespuesta = undefined;
      } else if (!area.respuestaRecibida) {
        // Si marca completa o parcial, marcar respuesta recibida
        area.respuestaRecibida = true;
        area.fechaRespuesta = new Date().toLocaleDateString('es-ES');
      }
    }
  }

  // Actualizar checkbox de recordatorio enviado
  actualizarRecordatorioEnviado(areaId: string, checked: boolean): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area && area.solicitudEnviada) {
      area.recordatorioEnviado = checked;
      if (checked && !area.fechaRecordatorio) {
        area.fechaRecordatorio = new Date().toLocaleDateString('es-ES');
      } else if (!checked) {
        area.fechaRecordatorio = undefined;
        area.respuestaRecordatorio = false;
        area.fechaRespuestaRecordatorio = undefined;
      }
    }
  }

  // Actualizar checkbox de respuesta a recordatorio
  actualizarRespuestaRecordatorio(areaId: string, checked: boolean): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area && area.recordatorioEnviado) {
      area.respuestaRecordatorio = checked;
      if (checked && !area.fechaRespuestaRecordatorio) {
        area.fechaRespuestaRecordatorio = new Date().toLocaleDateString('es-ES');
      } else if (!checked) {
        area.fechaRespuestaRecordatorio = undefined;
      }
    }
  }

  // ========== GESTIÓN DE MODAL ELIMINAR ÁREA ==========
  
  // Abrir modal de confirmación para eliminar área
  eliminarArea(areaId: string): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area) {
      this.areaParaEliminar = area;
      this.mostrarModalEliminar = true;
    }
  }
  
  // Cerrar modal de eliminación
  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.areaParaEliminar = null;
  }
  
  // Confirmar eliminación del área
  confirmarEliminarArea(): void {
    if (this.areaParaEliminar) {
      const index = this.seguimientoAreas.findIndex(a => a.id === this.areaParaEliminar!.id);
      if (index > -1) {
        const areaNombre = this.areaParaEliminar.area;
        this.seguimientoAreas.splice(index, 1);
        this.cerrarModalEliminar();
        
        this.snackBar.open(`Área ${areaNombre} eliminada del seguimiento`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    }
  }

  // ========== GESTIÓN DE MODAL EDITAR ÁREA ==========
  
  // Abrir modal para editar área
  editarArea(areaId: string): void {
    const area = this.seguimientoAreas.find(a => a.id === areaId);
    if (area) {
      this.areaEnEdicion = { ...area }; // Crear copia para edición
      this.mostrarModalEditarArea = true;
      
      // Cargar fechas existentes para la edición
      this.fechaSolicitudEdicion = this.convertirFechaParaInput(area.fechaSolicitud);
      this.fechaRespuestaEdicion = this.convertirFechaParaInput(area.fechaRespuesta);
      this.fechaRecordatorioEdicion = this.convertirFechaParaInput(area.fechaRecordatorio);
      this.fechaRespuestaRecordatorioEdicion = this.convertirFechaParaInput(area.fechaRespuestaRecordatorio);
    }
  }
  
  // Cerrar modal editar área
  cerrarModalEditarArea(): void {
    this.mostrarModalEditarArea = false;
    this.areaEnEdicion = null;
    this.fechaSolicitudEdicion = '';
    this.fechaRespuestaEdicion = '';
    this.fechaRecordatorioEdicion = '';
    this.fechaRespuestaRecordatorioEdicion = '';
  }
  
  // Convertir fecha para input type="date"
  private convertirFechaParaInput(fecha?: string): string {
    if (!fecha) return '';
    
    // Si la fecha está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    const partes = fecha.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    
    return fecha;
  }
  
  // Convertir fecha de input a formato DD/MM/YYYY
  private convertirFechaDeInput(fecha: string): string {
    if (!fecha) return '';
    
    const partes = fecha.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    
    return fecha;
  }
  
  // Eventos de cambio en el modal de edición
  onEditarSolicitudEnviada(): void {
    if (this.areaEnEdicion) {
      if (this.areaEnEdicion.solicitudEnviada) {
        if (!this.fechaSolicitudEdicion) {
          this.fechaSolicitudEdicion = new Date().toISOString().split('T')[0];
        }
      } else {
        // Si se desmarca, resetear todo lo dependiente
        this.areaEnEdicion.respuestaRecibida = false;
        this.areaEnEdicion.tipoRespuesta = 'pendiente';
        this.areaEnEdicion.recordatorioEnviado = false;
        this.areaEnEdicion.respuestaRecordatorio = false;
        this.fechaSolicitudEdicion = '';
        this.fechaRespuestaEdicion = '';
        this.fechaRecordatorioEdicion = '';
        this.fechaRespuestaRecordatorioEdicion = '';
      }
    }
  }
  
  onEditarRespuestaRecibida(): void {
    if (this.areaEnEdicion) {
      if (this.areaEnEdicion.respuestaRecibida) {
        if (!this.fechaRespuestaEdicion) {
          this.fechaRespuestaEdicion = new Date().toISOString().split('T')[0];
        }
        if (this.areaEnEdicion.tipoRespuesta === 'pendiente') {
          this.areaEnEdicion.tipoRespuesta = 'completa';
        }
      } else {
        this.areaEnEdicion.tipoRespuesta = 'pendiente';
        this.fechaRespuestaEdicion = '';
      }
    }
  }
  
  onEditarRecordatorioEnviado(): void {
    if (this.areaEnEdicion) {
      if (this.areaEnEdicion.recordatorioEnviado) {
        if (!this.fechaRecordatorioEdicion) {
          this.fechaRecordatorioEdicion = new Date().toISOString().split('T')[0];
        }
      } else {
        this.areaEnEdicion.respuestaRecordatorio = false;
        this.fechaRecordatorioEdicion = '';
        this.fechaRespuestaRecordatorioEdicion = '';
      }
    }
  }
  
  onEditarRespuestaRecordatorio(): void {
    if (this.areaEnEdicion) {
      if (this.areaEnEdicion.respuestaRecordatorio) {
        if (!this.fechaRespuestaRecordatorioEdicion) {
          this.fechaRespuestaRecordatorioEdicion = new Date().toISOString().split('T')[0];
        }
      } else {
        this.fechaRespuestaRecordatorioEdicion = '';
      }
    }
  }
  
  // Guardar cambios de edición
  guardarEdicionArea(): void {
    if (!this.areaEnEdicion) return;
    
    // Encontrar el área original y actualizar
    const indice = this.seguimientoAreas.findIndex(a => a.id === this.areaEnEdicion!.id);
    if (indice > -1) {
      // Actualizar fechas desde los inputs
      this.areaEnEdicion.fechaSolicitud = this.fechaSolicitudEdicion ? 
        this.convertirFechaDeInput(this.fechaSolicitudEdicion) : undefined;
      this.areaEnEdicion.fechaRespuesta = this.fechaRespuestaEdicion ? 
        this.convertirFechaDeInput(this.fechaRespuestaEdicion) : undefined;
      this.areaEnEdicion.fechaRecordatorio = this.fechaRecordatorioEdicion ? 
        this.convertirFechaDeInput(this.fechaRecordatorioEdicion) : undefined;
      this.areaEnEdicion.fechaRespuestaRecordatorio = this.fechaRespuestaRecordatorioEdicion ? 
        this.convertirFechaDeInput(this.fechaRespuestaRecordatorioEdicion) : undefined;
      
      // Reemplazar el área en el arreglo
      this.seguimientoAreas[indice] = { ...this.areaEnEdicion };
      
      this.cerrarModalEditarArea();
      
      this.snackBar.open(`Seguimiento de ${this.areaEnEdicion.area} actualizado`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  // Obtener estadísticas del seguimiento
  getEstadisticasSeguimiento() {
    const areasContactadas = this.seguimientoAreas.filter(a => a.solicitudEnviada).length;
    const respuestasCompletas = this.seguimientoAreas.filter(a => a.tipoRespuesta === 'completa').length;
    const recordatoriosEnviados = this.seguimientoAreas.filter(a => a.recordatorioEnviado).length;
    const respuestasPendientes = this.seguimientoAreas.filter(a => a.solicitudEnviada && !a.respuestaRecibida).length;
    
    return {
      areasContactadas,
      respuestasCompletas,
      recordatoriosEnviados,
      respuestasPendientes
    };
  }
} 