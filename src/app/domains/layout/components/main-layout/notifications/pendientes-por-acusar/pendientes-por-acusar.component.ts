import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule  } from '@angular/material/icon';

interface PendientesAcusar {
  tipoAsusnto: string;
  fechadeRecepcion: string;
  folioInterno: number
   oficio: string;
   carpetadeinvestigacion: string;
   personaRelacionada: string;
   autoridadSolicitante: string;
   folioJupiter: number;
   administracion: string;
   documentoEscaneado: string;
   plazodeAtencion: number;
   descripcion: string;
   turnoJefatura: string;
}

@Component({
  selector: 'app-pendientes-por-acusar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './pendientes-por-acusar.component.html',
  styleUrl: './pendientes-por-acusar.component.css'
})
export class PendientesPorAcusarComponent {

  datosPorAcusar: PendientesAcusar[] = [
    {
      tipoAsusnto:"Nuevo",
      fechadeRecepcion:"15/02/2024",
      folioInterno: 56,
       oficio:"89_SD",
       carpetadeinvestigacion:"GHP",
       personaRelacionada:"Juan Perez",
       autoridadSolicitante:"Federal",
       folioJupiter:589,
       administracion:"GTY",
       documentoEscaneado:"RTY",
       plazodeAtencion:48,
       descripcion:"Nueva Descripción",
       turnoJefatura:"Nuevo"
    },
  ]

}
