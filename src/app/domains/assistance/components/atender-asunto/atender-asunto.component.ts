import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Asunto {
  id: string;
  folio: string;
  carpetaInvestigacion: string;
  personaRelacionada: string;
  estado: 'Pendiente' | 'En Trámite' | 'Parcial' | 'Total';
  porcentajeAvance: number;
  observaciones: string;
}

@Component({
  selector: 'app-atender-asunto',
  templateUrl: './atender-asunto.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule
  ]
})
export class AtenderAsuntoComponent implements OnChanges {
  @Input() visible = false;
  @Input() asunto: Asunto | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  formulario: FormGroup;
  archivosSeleccionados: File[] = [];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      estado: ['', Validators.required],
      porcentajeAvance: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      observaciones: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.asunto && this.visible) {
      this.formulario.patchValue({
        estado: this.asunto.estado,
        porcentajeAvance: this.asunto.porcentajeAvance,
        observaciones: this.asunto.observaciones
      });
    }
  }

  cerrarModal() {
    this.visible = false;
    this.cerrar.emit();
    this.archivosSeleccionados = [];
    this.formulario.reset();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.archivosSeleccionados = [...this.archivosSeleccionados, ...files];
    }
  }

  eliminarArchivo(archivo: File) {
    this.archivosSeleccionados = this.archivosSeleccionados.filter(f => f !== archivo);
  }

  guardarCambios() {
    if (this.formulario.valid) {
      const datosActualizados = {
        ...this.formulario.value,
        archivos: this.archivosSeleccionados,
        id: this.asunto?.id
      };
      this.guardar.emit(datosActualizados);
      this.cerrarModal();
    }
  }
} 