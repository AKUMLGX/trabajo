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
  modoComparacion = false;
  expandido = false;
  resolviendo = false;
  
  // URLs de ejemplo para documentos PDF
  documentosPDF: Record<string, string> = {
    'Dictamen_Técnico.pdf': 'assets/pdfs/dictamen_tecnico_ejemplo.pdf',
    'Análisis_Fiscal.pdf': 'assets/pdfs/analisis_fiscal_ejemplo.pdf',
    'Evidencia_Documental.pdf': 'assets/pdfs/evidencia_documental_ejemplo.pdf'
  };
  
  // Documento para comparación
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
    private dictaminadorBandejaService: DictaminadorBandejaService
  ) {
    this.asunto = data.asunto;
    this.soloLectura = data.soloLectura || false;
    
    this.motivoForm = this.fb.group({
      motivo: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('es-MX') : '';
  }

  getColorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-500 text-white';
      case 'Media': return 'bg-yellow-500 text-white';
      case 'Baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  mostrarDocumento(nombreDocumento: string): void {
    this.documentoSeleccionado = nombreDocumento;
    this.pdfCargando = true;
    
    // Simular carga del PDF
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1000);
    
    console.log(`Mostrando documento: ${nombreDocumento}`);
  }

  obtenerUrlDocumento(): string {
    if (this.documentoSeleccionado && this.documentosPDF[this.documentoSeleccionado]) {
      return this.documentosPDF[this.documentoSeleccionado];
    }
    return 'assets/pdfs/documento_default.pdf';
  }

  descargarDocumento(): void {
    if (this.documentoSeleccionado) {
      // En una implementación real, aquí se manejaría la descarga del documento
      console.log(`Descargando documento: ${this.documentoSeleccionado}`);
      
      // Simulación de descarga - en producción esto sería un servicio real
      const link = document.createElement('a');
      link.href = this.obtenerUrlDocumento();
      link.download = this.documentoSeleccionado;
      link.click();
    }
  }

  toggleComparacion(): void {
    this.modoComparacion = !this.modoComparacion;
    console.log(`Modo comparación: ${this.modoComparacion ? 'Activado' : 'Desactivado'}`);
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
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, true).subscribe({
      next: () => {
        this.resolviendo = false;
        this.dialogRef.close({
          accion: 'aprobar',
          asunto: this.asunto,
          tipoAtencion: this.tipoAtencion,
          resuelto: true
        });
      },
      error: (err) => {
        this.resolviendo = false;
        console.error('[RevisionDetalle] Error al aprobar/resolver asunto:', err);
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
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, false).subscribe({
      next: () => {
        this.resolviendo = false;
        this.dialogRef.close({
          accion: 'rechazar',
          asunto: this.asunto,
          motivo: this.motivoForm.value.motivo,
          observaciones: this.motivoForm.value.observaciones,
          tipoAtencion: this.tipoAtencion,
          resuelto: true
        });
      },
      error: (err) => {
        this.resolviendo = false;
        console.error('[RevisionDetalle] Error al rechazar/resolver asunto:', err);
      }
    });
  }

  // Rechazo rápido desde la tarjeta roja (sin llenar formulario)
  rechazarRapido(): void {
    const idAsunto = parseInt(this.asunto.id, 10);
    if (!idAsunto || Number.isNaN(idAsunto)) { return; }
    this.resolviendo = true;
    this.dictaminadorBandejaService.resolverAsunto(idAsunto, false).subscribe({
      next: () => {
        this.resolviendo = false;
        this.dialogRef.close({ accion: 'rechazar', asunto: this.asunto, resuelto: true });
      },
      error: (err) => { this.resolviendo = false; console.error('[RevisionDetalle] Error rechazar rápido:', err); }
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
   * Alterna el modo de expansión del visualizador de PDF
   */
  toggleExpansion(): void {
    this.expandido = !this.expandido;
  }

  /**
   * Obtiene la URL del documento para comparación
   */
  obtenerUrlDocumentoComparacion(): string {
    return this.documentosPDF[this.documentoComparacion] || 'assets/pdfs/documento_default.pdf';
  }
} 