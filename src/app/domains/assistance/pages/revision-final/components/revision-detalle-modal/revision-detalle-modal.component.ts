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
  soloLectura: boolean = false;
  motivoForm: FormGroup;
  tipoAtencion: string = 'total';
  documentoSeleccionado: string | null = null;
  pdfCargando: boolean = false;
  modoComparacion: boolean = false;
  
  // URLs de ejemplo para documentos PDF
  documentosPDF: { [key: string]: string } = {
    'Dictamen_Técnico.pdf': 'assets/pdfs/dictamen_tecnico_ejemplo.pdf',
    'Análisis_Fiscal.pdf': 'assets/pdfs/analisis_fiscal_ejemplo.pdf'
  };
  
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
    private fb: FormBuilder
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
    // En una implementación real, aquí se abriría una vista de comparación de documentos
  }

  setTipoAtencion(tipo: string): void {
    this.tipoAtencion = tipo;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  aprobar(): void {
    this.dialogRef.close({
      accion: 'aprobar',
      asunto: this.asunto,
      tipoAtencion: this.tipoAtencion
    });
  }

  rechazar(): void {
    if (this.motivoForm.valid) {
      this.dialogRef.close({
        accion: 'rechazar',
        asunto: this.asunto,
        motivo: this.motivoForm.value.motivo,
        observaciones: this.motivoForm.value.observaciones,
        tipoAtencion: this.tipoAtencion
      });
    }
  }
} 