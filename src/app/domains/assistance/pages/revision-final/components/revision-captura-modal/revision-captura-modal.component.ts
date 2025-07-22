import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface AsuntoCapturado {
  id: string;
  folio: string;
  carpeta_investigacion: string;
  autoridad_solicitante: string;
  asunto: string;
  fecha_captura: string;
  usuario_captura: string;
  estado_revision: 'PENDIENTE' | 'CORREGIDO' | 'APROBADO' | 'RECHAZADO';
  observaciones_akamba1?: string;
  documento_pdf?: string;
  fecha_limite?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface CorreccionAsunto {
  id: string;
  folio?: string;
  carpeta_investigacion?: string;
  autoridad_solicitante?: string;
  asunto?: string;
  observaciones_correccion?: string;
  documento_corregido?: File;
  accion: 'CORREGIR' | 'APROBAR' | 'RECHAZAR';
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './revision-captura-modal.component.html',
  styleUrls: ['./revision-captura-modal.component.css']
})
export class RevisionCapturaModalComponent implements OnInit, OnChanges {
  
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
    @Inject(MAT_DIALOG_DATA) public data: { asunto: AsuntoCapturado },
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.correccionForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPdfOriginal();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.asunto) {
      this.inicializarFormulario();
      this.cargarPdfOriginal();
    }
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      folio: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-\/]+$/)]],
      carpeta_investigacion: ['', [Validators.required]],
      autoridad_solicitante: ['', [Validators.required]],
      asunto: ['', [Validators.required, Validators.minLength(10)]],
      observaciones_correccion: [''],
      accion: ['CORREGIR', [Validators.required]],
      prioridad: ['MEDIA']
    });
  }

  private inicializarFormulario(): void {
    if (this.data?.asunto) {
      const asunto = this.data.asunto;
      this.correccionForm.patchValue({
        folio: asunto.folio,
        carpeta_investigacion: asunto.carpeta_investigacion,
        autoridad_solicitante: asunto.autoridad_solicitante,
        asunto: asunto.asunto,
        observaciones_correccion: '',
        accion: 'CORREGIR',
        prioridad: asunto.prioridad || 'MEDIA'
      });
    }
  }

  private cargarPdfOriginal(): void {
    if (this.data?.asunto?.documento_pdf) {
      this.pdfCargando = true;
      this.pdfError = false;
      
      // Simular carga de PDF original
      setTimeout(() => {
        try {
          // En producción aquí iría la URL real del PDF
          const pdfUrl = `assets/pdfs/${this.data.asunto.documento_pdf}`;
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

  // Manejo de archivos PDF
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
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

  // Cambiar vista de PDF
  cambiarVistaPdf(mostrarOriginal: boolean): void {
    this.mostrarPdfOriginal = mostrarOriginal;
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

  rechazarAsunto(): void {
    if (this.correccionForm.get('observaciones_correccion')?.value?.trim()) {
      this.guardarCorreccion('RECHAZAR');
    } else {
      this.snackBar.open('❌ Las observaciones son obligatorias para rechazar', 'Cerrar', {
        duration: 4000,
        panelClass: ['snackbar-error']
      });
    }
  }

  private guardarCorreccion(accion: 'CORREGIR' | 'APROBAR' | 'RECHAZAR'): void {
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
        case 'RECHAZAR':
          mensaje = '❌ Asunto rechazado y devuelto a Akamba 1';
          panelClass = 'snackbar-warning';
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
    return this.correccionForm.get('accion')?.value || 'CORREGIR';
  }

  get requiereObservaciones(): boolean {
    return this.accionSeleccionada === 'RECHAZAR';
  }

  // Métodos para obtener clases CSS dinámicas
  getColorPrioridad(prioridad: string): string {
    const colores: Record<string, string> = {
      'ALTA': 'text-red-600',
      'MEDIA': 'text-orange-600', 
      'BAJA': 'text-green-600'
    };
    return colores[prioridad] || 'text-gray-600';
  }

  getBgPrioridad(prioridad: string): string {
    const colores: Record<string, string> = {
      'ALTA': 'bg-red-100',
      'MEDIA': 'bg-orange-100',
      'BAJA': 'bg-green-100'
    };
    return colores[prioridad] || 'bg-gray-100';
  }
} 