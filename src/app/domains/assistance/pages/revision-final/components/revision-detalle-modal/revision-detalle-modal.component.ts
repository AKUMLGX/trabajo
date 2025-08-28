import { Component, Inject, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DictaminadorBandejaService } from '../../../../../services/dictaminador-bandeja.service';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../../services/archivos-atencion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Asunto {
  id: string;
  folio: string;
  personaRelacionada: string;
  fechaRecepcion: Date;
  fechaLimite: Date;
  diasTranscurridos: number;
  estadoAtencion: string;
  prioridad: string;
  dictaminador: string;
  carpetaInvestigacion: string;
  estado: string;
  // 🆕 Observaciones/Atención propuesta
  observaciones?: string;
}

interface DialogData {
  asunto: Asunto;
  soloLectura?: boolean;
}

@Component({
  selector: 'app-revision-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatRadioModule,
    NgxExtendedPdfViewerModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './revision-detalle-modal.component.html',
  styleUrls: ['./revision-detalle-modal.component.css']
})
export class RevisionDetalleModalComponent implements OnInit {
  asunto: Asunto;
  soloLectura = false;
  motivoForm: FormGroup;
  tipoAtencion = 'total';
  documentoSeleccionado = '';
  pdfCargando = false;
  resolviendo = false;

  // ==== IMPLEMENTACIÓN DE ENDPOINTS REALES ====
  // Lista de archivos desde el backend
  archivos: ArchivoAdjunto[] = [];
  cargandoArchivos = false;
  errorArchivos = '';
  archivoSeleccionado: ArchivoAdjunto | null = null;
  
  // PDF actual para visualización
  pdfUrl: SafeResourceUrl | null = null;
  pdfError = false;
  
  // Control de origen de archivos (igual que en modal-atencion)
  private origenArchivos: 'raiz' | 'atencion' = 'raiz';

  // Documento para comparación (se mantiene funcionalidad de comparación)
  documentoComparacion = 'Evidencia_Documental.pdf';

  motivosRechazo: string[] = [
    'Información incompleta',
    'Faltan documentos de soporte',
    'Información inconsistente',
    'Error en el análisis',
    'Errores de redacción',
    'Conclusiones no justificadas',
    'Otro'
  ];

  constructor(
    private dialogRef: MatDialogRef<RevisionDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private dictaminadorBandejaService: DictaminadorBandejaService,
    private archivosService: ArchivosAtencionService,
    private domSanitizer: DomSanitizer
  ) {
    this.asunto = data.asunto;
    this.soloLectura = data.soloLectura || false;

    this.motivoForm = this.fb.group({
      motivo: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar archivos automáticamente al abrir el modal
    this.cargarArchivos();
  }

  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('es-MX') : '';
  }

  /**
   * Formatea la fecha de un documento
   */
  formatDocumentDate(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  getColorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-500 text-white';
      case 'Media': return 'bg-yellow-500 text-white';
      case 'Baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  // ==== MÉTODOS DE GESTIÓN DE ARCHIVOS (IMPLEMENTACIÓN REAL) ====
  
  /**
   * Carga la lista de archivos PDF usando los endpoints reales
   * Usa la misma lógica que dictaminador-atencion-modal con fallback
   */
  cargarArchivos(): void {
    const folio = this.obtenerFolio();
    if (!folio) {
      console.warn('[RevisionDetalle] No hay folio disponible para cargar archivos');
      return;
    }

    console.log('🔍 [RevisionDetalle] Cargando archivos para folio:', folio);
    this.cargandoArchivos = true;
    this.archivos = [];
    this.errorArchivos = '';

    // Intento 1: endpoint de carpeta raíz (modal guinda) - IGUAL QUE EN MODAL-ATENCION
    this.archivosService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archs) => {
        if (archs && archs.length > 0) {
          this.archivos = archs;
          this.origenArchivos = 'raiz';
          this.cargandoArchivos = false;
          console.log('✅ [RevisionDetalle] Archivos cargados desde raíz:', archs.length);
        } else {
          // Fallback: carpeta 'atencion' - IGUAL QUE EN MODAL-ATENCION
          this.archivosService.listarArchivosPdf(folio).subscribe({
            next: (archs2) => {
              this.archivos = archs2 || [];
              this.origenArchivos = this.archivos.length > 0 ? 'atencion' : 'raiz';
              this.cargandoArchivos = false;
              console.log('✅ [RevisionDetalle] Archivos cargados desde atencion:', archs2?.length || 0);
            },
            error: (err) => {
              this.cargandoArchivos = false;
              this.errorArchivos = 'Error al cargar archivos desde atencion';
              console.error('❌ [RevisionDetalle] Error cargando desde atencion:', err);
            }
          });
        }
      },
      error: (err) => {
        console.warn('⚠️ [RevisionDetalle] Error en raíz, intentando fallback:', err);
        // Si falla raíz, probar 'atencion' - IGUAL QUE EN MODAL-ATENCION
        this.archivosService.listarArchivosPdf(folio).subscribe({
          next: (archs2) => {
            this.archivos = archs2 || [];
            this.origenArchivos = this.archivos.length > 0 ? 'atencion' : 'raiz';
            this.cargandoArchivos = false;
            console.log('✅ [RevisionDetalle] Archivos cargados desde atencion (fallback):', archs2?.length || 0);
          },
          error: (err2) => {
            this.cargandoArchivos = false;
            this.errorArchivos = 'Error al cargar archivos';
            console.error('❌ [RevisionDetalle] Error en ambos endpoints:', err2);
          }
        });
      }
    });
  }

  /**
   * Selecciona y carga un archivo PDF para visualización
   * Usa la misma lógica que dictaminador-atencion-modal
   */
  seleccionarArchivo(archivo: ArchivoAdjunto): void {
    const folio = this.obtenerFolio();
    if (!folio) return;

    console.log('📄 [RevisionDetalle] Seleccionando archivo:', archivo.nombre);
    this.archivoSeleccionado = archivo;
    this.documentoSeleccionado = archivo.nombre;
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;

    // Normalizar nombres tipo nombre_1234567890.pdf o nombre.pdf-123 - IGUAL QUE EN MODAL-ATENCION
    let nombre = archivo.nombre;
    const matchUnderscore = nombre.match(/^(.+)_\d{10}(\.[^.]+)$/);
    if (matchUnderscore) { nombre = matchUnderscore[1] + matchUnderscore[2]; }
    const matchDashAfterExt = nombre.match(/(.+\.pdf)-\d+$/);
    if (matchDashAfterExt && matchDashAfterExt[1]) { nombre = matchDashAfterExt[1]; }

    // Seleccionar endpoint según el origen - IGUAL QUE EN MODAL-ATENCION
    const obs = this.origenArchivos === 'atencion'
      ? this.archivosService.obtenerPdf(folio, nombre, 'atencion')
      : this.archivosService.obtenerPdf(folio, nombre);

    obs.subscribe({
      next: (data: string) => {
        try {
          const src = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(src);
          this.pdfCargando = false;
          console.log('✅ [RevisionDetalle] PDF cargado exitosamente');
        } catch (error) {
          this.pdfError = true;
          this.pdfCargando = false;
          console.error('❌ [RevisionDetalle] Error procesando PDF:', error);
        }
      },
      error: (error) => {
        this.pdfError = true;
        this.pdfCargando = false;
        console.error('❌ [RevisionDetalle] Error obteniendo PDF:', error);
      }
    });
  }

  /**
   * Recarga la lista de archivos
   */
  recargarArchivos(): void {
    this.cargarArchivos();
  }

  /**
   * Obtiene el folio del asunto actual
   */
  private obtenerFolio(): string | null {
    return this.asunto?.folio || null;
  }

  // ==== MÉTODOS COMPATIBILIDAD CON FUNCIONALIDAD EXISTENTE ====
  
  /**
   * Muestra un documento (mantiene compatibilidad con template existente)
   * Ahora busca el archivo en la lista real y lo selecciona
   */
  mostrarDocumento(nombreDocumento: string): void {
    // Buscar el archivo en la lista cargada
    const archivo = this.archivos.find(a => a.nombre === nombreDocumento);
    if (archivo) {
      this.seleccionarArchivo(archivo);
    } else {
      console.warn('[RevisionDetalle] Documento no encontrado en la lista:', nombreDocumento);
      // Fallback: intentar cargar con el nombre proporcionado
      this.documentoSeleccionado = nombreDocumento;
      this.pdfCargando = true;
      setTimeout(() => {
        this.pdfCargando = false;
        console.log(`[RevisionDetalle] Documento no encontrado: ${nombreDocumento}`);
      }, 1000);
    }
  }

  /**
   * Obtiene la URL del documento actual
   * Ahora usa la URL real del PDF cargado
   */
  obtenerUrlDocumento(): string {
    if (this.pdfUrl) {
      // Convertir SafeResourceUrl a string para ngx-extended-pdf-viewer
      return (this.pdfUrl as any).changingThisBreaksApplicationSecurity || '';
    }
    return '';
  }



  setTipoAtencion(tipo: string): void {
    this.tipoAtencion = tipo;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  aprobar(): void {
    const idAsunto = parseInt(this.asunto.id, 10);
    if (!idAsunto || Number.isNaN(idAsunto)) {
      console.error('[RevisionDetalle] id_asunto inválido para resolver');
      return;
    }

    this.resolviendo = true;
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, true, this.motivoForm.value.observaciones).subscribe({
      next: () => {
        this.resolviendo = false;
        console.log('✅ [RevisionDetalle] Asunto aprobado exitosamente');
        this.dialogRef.close({
          accion: 'aprobar',
          asunto: this.asunto,
          tipoAtencion: this.tipoAtencion,
          resuelto: true,
          mensaje: 'Asunto aprobado exitosamente'
        });
      },
      error: (err) => {
        this.resolviendo = false;
        console.error('[RevisionDetalle] Error al aprobar/resolver asunto:', err);
        alert('Error al aprobar el asunto. Por favor, intente nuevamente.');
      }
    });
  }

  rechazar(): void {
    if (!this.motivoForm.valid) { return; }

    const idAsunto = parseInt(this.asunto.id, 10);
    if (!idAsunto || Number.isNaN(idAsunto)) {
      console.error('[RevisionDetalle] id_asunto inválido para resolver (rechazar)');
      return;
    }

    this.resolviendo = true;
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, false,"").subscribe({
      next: () => {
        this.resolviendo = false;
        console.log('✅ [RevisionDetalle] Asunto rechazado exitosamente');
        this.dialogRef.close({
          accion: 'rechazar',
          asunto: this.asunto,
          motivo: this.motivoForm.value.motivo,
          observaciones: this.motivoForm.value.observaciones,
          tipoAtencion: this.tipoAtencion,
          resuelto: true,
          mensaje: 'Asunto rechazado exitosamente'
        });
      },
      error: (err) => {
        this.resolviendo = false;
        console.error('[RevisionDetalle] Error al rechazar/resolver asunto:', err);
        alert('Error al rechazar el asunto. Por favor, intente nuevamente.');
      }
    });
  }

  // Rechazo rápido desde la tarjeta roja (sin llenar formulario)
  rechazarRapido(): void {
    const idAsunto = parseInt(this.asunto.id, 10);
    if (!idAsunto || Number.isNaN(idAsunto)) { return; }
    this.resolviendo = true;
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, false, this.motivoForm.value.observaciones).subscribe({
      next: () => {
        this.resolviendo = false;
        console.log('✅ [RevisionDetalle] Asunto rechazado rápidamente');
        this.dialogRef.close({ 
          accion: 'rechazar', 
          asunto: this.asunto, 
          resuelto: true,
          mensaje: 'Asunto rechazado exitosamente'
        });
      },
      error: (err) => { 
        this.resolviendo = false; 
        console.error('[RevisionDetalle] Error rechazar rápido:', err);
        alert('Error al rechazar el asunto. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Verifica si una fecha está próxima a vencer (menos de 3 días)
   * @param fecha Fecha a verificar
   * @returns true si está próxima a vencer
   */
  esFechaProxima(fecha: Date): boolean {
    if (!fecha) return false;

    const fechaLimite = new Date(fecha);
    const hoy = new Date();

    // Calcular diferencia en días
    const diffTime = fechaLimite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 3 && diffDays >= 0;
  }

  /**
   * Calcula el porcentaje de progreso entre la fecha de recepción y la fecha límite
   * @param fechaRecepcion Fecha de recepción del asunto
   * @param fechaLimite Fecha límite del asunto
   * @returns Porcentaje de tiempo transcurrido (0-100)
   */
  calcularProgreso(fechaRecepcion: Date, fechaLimite: Date): number {
    if (!fechaRecepcion || !fechaLimite) return 0;

    const fechaInicio = new Date(fechaRecepcion).getTime();
    const fechaFin = new Date(fechaLimite).getTime();
    const hoy = new Date().getTime();

    // Si ya pasó la fecha límite, retornar 100%
    if (hoy > fechaFin) return 100;

    // Si la fecha de inicio es mayor a hoy (caso inusual), retornar 0%
    if (fechaInicio > hoy) return 0;

    // Calcular el porcentaje de tiempo transcurrido
    const tiempoTotal = fechaFin - fechaInicio;
    const tiempoTranscurrido = hoy - fechaInicio;

    return Math.min(Math.round((tiempoTranscurrido / tiempoTotal) * 100), 100);
  }



  /**
   * Obtiene la URL del documento para comparación
   */
  obtenerUrlDocumentoComparacion(): string {
    // Usar el primer archivo disponible para comparación
    if (this.archivos.length > 1) {
      const archivoComparacion = this.archivos.find(a => a.nombre !== this.documentoSeleccionado);
      if (archivoComparacion && this.pdfUrl) {
        return this.pdfUrl as string;
      }
    }
    return 'assets/pdfs/documento_default.pdf';
  }
}
