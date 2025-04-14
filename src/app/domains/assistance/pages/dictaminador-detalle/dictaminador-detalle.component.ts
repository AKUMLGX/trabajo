import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Evento {
  id: number;
  fecha: Date;
  titulo: string;
  descripcion: string;
  tipo: 'documento' | 'evento';
}

interface Documento {
  id: number;
  nombre: string;
  fecha: Date;
  tipo: string;
  url: string;
}

interface AsuntoDictaminador {
  folio: string;
  carpetaInvestigacion: string;
  personaRelacionada: string;
  fechaRecepcion: Date;
  diasTranscurridos: number;
  plazoUrgente: boolean;
  prioridad: 'alta' | 'media' | 'baja';
  estadoAtencion: 'Tramite' | 'Parcial' | 'Total';
  progreso: number;
  eventos: Evento[];
  documentos: Documento[];
}

@Component({
  selector: 'app-dictaminador-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './dictaminador-detalle.component.html',
  styleUrls: ['./dictaminador-detalle.component.css']
})
export class DictaminadorDetalleComponent implements OnInit {
  asunto: AsuntoDictaminador = {
    folio: 'DIC-2024-001',
    carpetaInvestigacion: 'CI-2024-123456',
    personaRelacionada: 'Juan Pérez González',
    fechaRecepcion: new Date('2024-03-01'),
    diasTranscurridos: 15,
    plazoUrgente: true,
    prioridad: 'alta',
    estadoAtencion: 'Tramite',
    progreso: 35,
    eventos: [
      {
        id: 1,
        fecha: new Date('2024-03-01'),
        titulo: 'Recepción del caso',
        descripcion: 'Se recibió el caso para dictaminación',
        tipo: 'evento'
      },
      {
        id: 2,
        fecha: new Date('2024-03-05'),
        titulo: 'Documento adjuntado',
        descripcion: 'Se adjuntó el documento de análisis inicial',
        tipo: 'documento'
      }
    ],
    documentos: [
      {
        id: 1,
        nombre: 'Análisis inicial.pdf',
        fecha: new Date('2024-03-05'),
        tipo: 'PDF',
        url: '/documentos/analisis.pdf'
      },
      {
        id: 2,
        nombre: 'Evidencia fotográfica.zip',
        fecha: new Date('2024-03-07'),
        tipo: 'ZIP',
        url: '/documentos/evidencia.zip'
      }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí se cargarían los datos reales del asunto
  }

  goBack(): void {
    this.router.navigate(['/layout/dictaminador']);
  }

  getPriorityClass(): string {
    const classes = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800'
    };
    return `priority-badge ${classes[this.asunto.prioridad]}`;
  }

  getPriorityIcon(): string {
    const icons = {
      alta: 'priority_high',
      media: 'warning',
      baja: 'info'
    };
    return icons[this.asunto.prioridad];
  }

  getPriorityText(): string {
    const texts = {
      alta: 'Prioridad Alta',
      media: 'Prioridad Media',
      baja: 'Prioridad Baja'
    };
    return texts[this.asunto.prioridad];
  }

  getStatusClass(): string {
    const classes = {
      Tramite: 'bg-blue-100 text-blue-800',
      Parcial: 'bg-orange-100 text-orange-800',
      Total: 'bg-green-100 text-green-800'
    };
    return `status-badge ${classes[this.asunto.estadoAtencion]}`;
  }

  getStatusIcon(): string {
    const icons = {
      Tramite: 'hourglass_empty',
      Parcial: 'pending',
      Total: 'check_circle'
    };
    return icons[this.asunto.estadoAtencion];
  }

  getStatusText(): string {
    const texts = {
      Tramite: 'En Trámite',
      Parcial: 'Atención Parcial',
      Total: 'Atención Total'
    };
    return texts[this.asunto.estadoAtencion];
  }

  getProgressColor(): string {
    if (this.asunto.progreso >= 75) return 'primary';
    if (this.asunto.progreso >= 50) return 'accent';
    return 'warn';
  }
} 