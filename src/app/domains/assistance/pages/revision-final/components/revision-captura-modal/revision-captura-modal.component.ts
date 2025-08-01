import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ArchivosAtencionService } from '../../../../../services/archivos-atencion.service';

export interface AsuntoCapturado {
  id: string;
  folio_interno: string; // Folio interno (NO editable)
  
  // ✅ Campos editables según la base de datos
  oficio?: string;
  folio_scanner?: number;
  carpeta_investigacion: string;
  documento_escaneado?: string;
  persona_relacionada?: string;
  descripcion?: string;
  fecha_recepcion?: string;
  fecha_atencion?: string;
  turno_jefatura?: string;
  autoridad_remitente: string;
  plazo_atencion?: number;
  
  // IDs para dropdowns
  id_documento_fk?: number;
  id_atencion_fk?: number;
  id_administracion_fk?: number;
  id_tipo_asunto_fk?: number;
  id_tipo_fk?: number;
  
  // Campos adicionales del JSON
  volante_jefatura?: string;
  folio_jupiter?: string;
  
  // Campos del JSON original
  id_asunto_historico?: number;
  respuesta?: boolean;
  
  // Metadatos de captura
  fecha_captura: string;
  usuario_captura: string;
  estado_revision: 'PENDIENTE' | 'CORREGIDO' | 'APROBADO' | 'RECHAZADO';
  
  // Campos adicionales para la tabla
  tieneDocumentos?: boolean;
  cantidadDocumentos?: number;
  erroresDetectados?: string[];
  
  // Estructura anidada del JSON
  datos?: {
    id_asunto_historico?: number;
    folio_interno?: string;
    carpeta_investigacion?: string;
    folio_scanner?: number;
    oficio?: string;
    documento_escaneado?: string;
    persona_relacionada?: string;
    descripcion?: string;
    fecha_recepcion?: string;
    fecha_atencion?: string;
    turno_jefatura?: string;
    respuesta?: boolean;
    volante_jefatura?: string;
    folio_jupiter?: string;
    autoridad_remitente?: string;
    plazo_atencion?: number;
    fecha_captura?: string;
    id_documento_fk?: number;
    id_atencion_fk?: number;
    id_administracion_fk?: number;
    id_tipo_asunto_fk?: number;
    id_tipo_fk?: number;
  };
}

export interface CorreccionAsunto {
  id: string;
  folio?: string;
  carpeta_investigacion?: string;
  autoridad_solicitante?: string;
  asunto?: string;
  observaciones_correccion?: string;
  documento_corregido?: File;
  accion: 'CORREGIR' | 'APROBAR'; // Eliminado 'RECHAZAR'
}

@Component({
  selector: 'app-revision-captura-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './revision-captura-modal.component.html',
  styleUrls: ['./revision-captura-modal.component.css']
})
export class RevisionCapturaModalComponent implements OnInit, OnChanges {
  
  // ViewChild para el input de archivo
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  // Formulario reactivo
  correccionForm: FormGroup;
  
  // Estados del modal
  cargando = false;
  guardando = false;
  
  // PDF Management
  pdfOriginalUrl: SafeResourceUrl | null = null;
  pdfCorregidoUrl: SafeResourceUrl | null = null;
  mostrarPdfOriginal = true;
  pdfCargando = false;
  pdfError = false;
  archivoSeleccionado: File | null = null;
  
  // Opciones para formulario
  autoridades = [
    'Fiscalía General de la República',
    'Procuraduría General de Justicia del Estado',
    'Tribunal Superior de Justicia',
    'Auditoría Superior de la Federación',
    'Otra autoridad'
  ];
  
  prioridades = [
    { value: 'ALTA', label: 'Alta', color: 'red' },
    { value: 'MEDIA', label: 'Media', color: 'orange' },
    { value: 'BAJA', label: 'Baja', color: 'green' }
  ];

  constructor(
    public dialogRef: MatDialogRef<RevisionCapturaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { asunto: AsuntoCapturado, jsonOriginal?: any },
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private archivosAtencionService: ArchivosAtencionService
  ) {
    this.correccionForm = this.crearFormulario();
  }

  ngOnInit(): void {
    console.log('🔍 Modal abierto con datos:', this.data);
    console.log('🔍 Estructura completa del asunto:', JSON.stringify(this.data.asunto, null, 2));
    console.log('🔍 ¿Tiene datos anidados?', 'datos' in this.data.asunto);
    console.log('🔍 Datos anidados:', this.data.asunto.datos);
    
    this.inicializarFormulario();
    this.cargarPdfAutomatico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.asunto) {
      this.inicializarFormulario();
      this.cargarPdfAutomatico();
    }
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      // ✅ Campos editables según la base de datos
      oficio: ['', [Validators.required]],
      folioScanner: [''],
      carpeta_investigacion: ['', [Validators.required]],
      fechaRecepcion: ['', [Validators.required]],
      fechaAtencion: [''],
      autoridad_solicitante: ['', [Validators.required]],
      personaRelacionada: ['', [Validators.required]],
      turnoJefatura: [''],
      asunto: [''], // Descripción del asunto
      plazoCantidad: ['', [Validators.min(1), Validators.max(365)]],
      
      // Dropdowns según la base de datos
      administracion: ['', [Validators.required]],
      tipoDocumento: [''],
      tipoAtencion: [''],
      atencion: [''],
      
      // Control de flujo
      accion: ['CORREGIR', [Validators.required]],
      observaciones_correccion: ['']
    });
  }

  private inicializarFormulario(): void {
    if (this.data?.asunto) {
      const asunto = this.data.asunto;
      this.correccionForm.patchValue({
        // Campos editables principales
        oficio: asunto.oficio || '',
        folioScanner: asunto.folio_scanner || '',
        carpeta_investigacion: asunto.carpeta_investigacion || '',
        fechaRecepcion: asunto.fecha_recepcion || '',
        fechaAtencion: asunto.fecha_atencion || '',
        autoridad_solicitante: asunto.autoridad_remitente || '',
        personaRelacionada: asunto.persona_relacionada || '',
        turnoJefatura: asunto.turno_jefatura || '',
        asunto: asunto.descripcion || '',
        plazoCantidad: asunto.plazo_atencion || '',
        
        // Dropdowns
        administracion: asunto.id_administracion_fk || '',
        tipoDocumento: asunto.id_tipo_fk || '',
        tipoAtencion: asunto.id_documento_fk || '',
        atencion: asunto.id_atencion_fk || '',
        
        // Control
        accion: 'CORREGIR',
        observaciones_correccion: ''
      });
    }
  }

  cargarPdfOriginal(): void {
    if (this.data?.asunto?.documento_escaneado) {
      this.pdfCargando = true;
      this.pdfError = false;
      
      // Simular carga de PDF original
      setTimeout(() => {
        try {
          // En producción aquí iría la URL real del PDF
          const pdfUrl = `assets/pdfs/${this.data.asunto.documento_escaneado}`;
          this.pdfOriginalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
          this.pdfCargando = false;
        } catch (error) {
          console.error('Error cargando PDF original:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      }, 1000);
    }
  }

  /**
   * Carga automáticamente el PDF usando el servicio de archivos
   */
  cargarPdfAutomatico(): void {
    console.log('🔍 [RevisionCapturaModal] cargarPdfAutomatico iniciado');
    
    const folio = this.data?.asunto?.folio_interno || this.data?.asunto?.datos?.folio_interno;
    const path = this.data?.asunto?.folio_scanner || this.data?.asunto?.datos?.folio_scanner || 1;
    
    if (!folio) {
      console.log('⚠️ [RevisionCapturaModal] No se encontró folio para cargar PDF');
      return;
    }

    console.log('🔍 [RevisionCapturaModal] Cargando PDF para folio:', folio, 'path:', path);
    
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfOriginalUrl = null;

    // Primero intentar listar archivos reales del folio
    this.archivosAtencionService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archivos: any[]) => {
        console.log('🔍 [RevisionCapturaModal] Archivos encontrados:', archivos);

        if (archivos && archivos.length > 0) {
          // Usar el primer archivo PDF encontrado
          const primerArchivo = archivos[0];
          const nombreArchivo = primerArchivo.nombre || primerArchivo.name;

          console.log('✅ [RevisionCapturaModal] Usando archivo real encontrado:', nombreArchivo);
          this.cargarPdfDirecto(folio, nombreArchivo);
        } else {
          console.log('⚠️ [RevisionCapturaModal] No se encontraron archivos, usando lista de nombres posibles');
          this.probarArchivosPorNombre(folio, path);
        }
      },
      error: (error: any) => {
        console.log('⚠️ [RevisionCapturaModal] Error al listar archivos, usando lista de nombres posibles:', error.status);
        this.probarArchivosPorNombre(folio, path);
      }
    });
  }

  private probarArchivosPorNombre(folio: string, path: number): void {
    // Lista de nombres de archivo posibles a probar
    const nombresArchivoPosibles = [
      'acta_compressed.pdf',
      '59680.pdf',
      `${path}.pdf`,
      'documento_compressed.pdf',
      'archivo_compressed.pdf',
      'acta.pdf',
      'documento.pdf',
      'archivo.pdf',
      'documento_escaneado.pdf',
      'archivo_escaneado.pdf',
      'acta_escaneada.pdf',
      `documento_${path}.pdf`,
      `archivo_${path}.pdf`,
      'oficio.pdf',
      'requerimiento.pdf',
      'solicitud.pdf'
    ];

    console.log('🔍 [RevisionCapturaModal] Probando nombres de archivo:', nombresArchivoPosibles);
    this.probarArchivos(folio, nombresArchivoPosibles, 0);
  }

  private cargarPdfDirecto(folio: string, nombreArchivo: string): void {
    console.log(`🔍 [RevisionCapturaModal] Cargando PDF directamente: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [RevisionCapturaModal] Archivo ${nombreArchivo} vacío`);
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }

        console.log(`✅ [RevisionCapturaModal] Archivo ${nombreArchivo} cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfOriginalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [RevisionCapturaModal] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.error(`❌ [RevisionCapturaModal] Error al cargar PDF directo ${nombreArchivo}:`, error);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }

  private probarArchivos(folio: string, nombresArchivos: string[], indice: number): void {
    if (indice >= nombresArchivos.length) {
      console.log('❌ [RevisionCapturaModal] No se pudo cargar ningún archivo PDF');
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    const nombreArchivo = nombresArchivos[indice];
    console.log(`🔍 [RevisionCapturaModal] Probando archivo ${indice + 1}/${nombresArchivos.length}: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [RevisionCapturaModal] Archivo ${nombreArchivo} vacío, probando siguiente...`);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
          return;
        }

        console.log(`✅ [RevisionCapturaModal] Archivo ${nombreArchivo} encontrado y cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfOriginalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [RevisionCapturaModal] Error al procesar el PDF:', error);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
        }
      },
      error: (error: any) => {
        console.log(`⚠️ [RevisionCapturaModal] Error al cargar ${nombreArchivo}, probando siguiente...`);
        this.probarArchivos(folio, nombresArchivos, indice + 1);
      }
    });
  }

  // Manejo de archivos PDF
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      // Verificar tamaño del archivo (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('❌ El archivo es demasiado grande. Máximo 10MB', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      this.archivoSeleccionado = file;
      
      // Crear preview del PDF corregido
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const blob = new Blob([e.target.result], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        this.pdfCorregidoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      };
      reader.readAsArrayBuffer(file);
      
      this.snackBar.open('📄 Archivo PDF seleccionado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } else {
      this.snackBar.open('❌ Por favor selecciona un archivo PDF válido', 'Cerrar', {
        duration: 4000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // Manejar drag over
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Manejar drop de archivos
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        // Simular evento para reutilizar la lógica existente
        const fakeEvent = { target: { files: [file] } };
        this.onFileSelected(fakeEvent);
      } else {
        this.snackBar.open('❌ Solo se permiten archivos PDF', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

  // Formatear tamaño de archivo
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Remover archivo seleccionado
  removeFile(event: Event): void {
    event.stopPropagation();
    this.archivoSeleccionado = null;
    this.pdfCorregidoUrl = null;
    
    // Limpiar el input de archivo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    
    this.snackBar.open('🗑️ Archivo removido', 'Cerrar', {
      duration: 2000,
      panelClass: ['snackbar-info']
    });
  }

  // Cambiar vista de PDF
  cambiarVistaPdf(mostrarOriginal: boolean): void {
    this.mostrarPdfOriginal = mostrarOriginal;
  }

  // Método para abrir el selector de archivos
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Validaciones en tiempo real
  obtenerErrorCampo(campo: string): string {
    const control = this.correccionForm.get(campo);
    
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getNombreCampo(campo)} es obligatorio`;
      }
      if (control.errors['pattern']) {
        return `Formato de ${this.getNombreCampo(campo)} inválido`;
      }
      if (control.errors['minlength']) {
        return `${this.getNombreCampo(campo)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
    }
    
    return '';
  }

  private getNombreCampo(campo: string): string {
    const nombres: Record<string, string> = {
      'folio': 'El folio',
      'carpeta_investigacion': 'La carpeta de investigación',
      'autoridad_solicitante': 'La autoridad solicitante',
      'asunto': 'El asunto'
    };
    return nombres[campo] || campo;
  }

  // Acciones principales
  corregirAsunto(): void {
    if (this.correccionForm.valid) {
      this.guardarCorreccion('CORREGIR');
    } else {
      this.marcarErroresCampos();
    }
  }

  aprobarAsunto(): void {
    this.guardarCorreccion('APROBAR');
  }

  private guardarCorreccion(accion: 'CORREGIR' | 'APROBAR'): void {
    this.guardando = true;
    
    const datosCorreccion: CorreccionAsunto = {
      id: this.data.asunto.id,
      accion: accion,
      ...this.correccionForm.value
    };

    if (this.archivoSeleccionado) {
      datosCorreccion.documento_corregido = this.archivoSeleccionado;
    }

    // Simular llamada API
    setTimeout(() => {
      this.guardando = false;
      
      let mensaje = '';
      let panelClass = '';
      
      switch (accion) {
        case 'CORREGIR':
          mensaje = '✅ Asunto corregido y enviado de vuelta a Akamba 1';
          panelClass = 'snackbar-success';
          break;
        case 'APROBAR':
          mensaje = '✅ Asunto aprobado y enviado a Akamba 3';
          panelClass = 'snackbar-success';
          break;
      }
      
      this.snackBar.open(mensaje, 'Cerrar', {
        duration: 4000,
        panelClass: [panelClass]
      });
      
      this.dialogRef.close({ accion, datos: datosCorreccion });
    }, 2000);
  }

  private marcarErroresCampos(): void {
    Object.keys(this.correccionForm.controls).forEach(key => {
      const control = this.correccionForm.get(key);
      control?.markAsTouched();
    });
    
    this.snackBar.open('❌ Por favor corrige los errores en el formulario', 'Cerrar', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
  }

  // Cerrar modal
  cerrarModal(): void {
    this.dialogRef.close();
  }

  // Helpers
  get formularioValido(): boolean {
    return this.correccionForm.valid;
  }

  get accionSeleccionada(): string {
    return this.correccionForm.get('accion')?.value || '';
  }

  // 🆕 MÉTODOS PARA PROCESAR INFORMACIÓN DEL JSON
  obtenerPersonasRelacionadas(personaRelacionada: string): string[] {
    if (!personaRelacionada) return [];
    
    // Dividir por comas y limpiar espacios
    return personaRelacionada
      .split(',')
      .map(persona => persona.trim())
      .filter(persona => persona.length > 0);
  }

  obtenerNombreArchivo(rutaCompleta: string): string {
    if (!rutaCompleta) return 'No disponible';
    
    // Extraer solo el nombre del archivo de la ruta completa
    const partes = rutaCompleta.split('\\');
    return partes[partes.length - 1] || 'Archivo no identificado';
  }

  // ===== MÉTODOS DE INTERPRETACIÓN DE CAMPOS =====

  interpretarPlazoAtencion(plazo: number | null): string {
    if (plazo === null || plazo === undefined) {
      return 'Sin plazo definido';
    }
    if (plazo === 0) {
      return 'Urgente';
    }
    if (plazo >= 1 && plazo <= 5) {
      return `${plazo} día${plazo > 1 ? 's' : ''}`;
    }
    return `${plazo} días`;
  }

  interpretarIdDocumento(id: number | null): string {
    if (!id) return 'No definido';
    
    const documentos = {
      1: 'RESPUESTA',
      2: 'REQUERIMIENTO',
      3: 'REQUERIMIENTO Y RESPUESTA',
      4: 'SOLICITUD INTERNA',
      5: 'RESPUESTA INTERNA',
      6: 'RESPUESTA A FGR',
      7: 'ALCANCE'
    };
    
    return documentos[id as keyof typeof documentos] || `Documento ${id}`;
  }

  interpretarIdAtencion(id: number | null): string {
    if (!id) return 'No definido';
    
    const atenciones = {
      1: 'TOTAL',
      2: 'PARCIAL',
      3: 'EN TRAMITE',
      5: 'NO APLICA'
    };
    
    return atenciones[id as keyof typeof atenciones] || `Atención ${id}`;
  }

  interpretarIdAdministracion(id: number | null): string {
    if (!id) return 'No definido';
    return `Administración ${id}`;
  }

  // Método simple para abrir tracking en nueva pestaña
  abrirTrackingEnNuevaPestana(): void {
    const asunto = this.data.asunto;
    const oficio = asunto.oficio || asunto.datos?.oficio;
    
    if (!oficio) {
      this.snackBar.open('❌ No se puede identificar el asunto', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    // Construir URL con el oficio como parámetro
    const baseUrl = window.location.origin;
    const trackingUrl = `${baseUrl}/akamba/layout/tracking?oficio=${encodeURIComponent(oficio)}`;
    
    // Abrir en nueva pestaña
    window.open(trackingUrl, '_blank');
    
    this.snackBar.open('✅ Abriendo bandeja de seguimiento en nueva pestaña', 'Cerrar', {
      duration: 2000
    });
  }
} 