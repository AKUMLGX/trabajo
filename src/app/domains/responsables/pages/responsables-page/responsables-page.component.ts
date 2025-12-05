import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsablesTableComponent } from '../../components/responsables-table/responsables-table.component';

@Component({
  selector: 'app-responsables-page',
  standalone: true,
  imports: [
    CommonModule,
    ResponsablesTableComponent
  ],
  templateUrl: './responsables-page.component.html',
  styleUrl: './responsables-page.component.css'
})
export class ResponsablesPageComponent implements OnInit {
  fechaActual: string = '';

  ngOnInit(): void {
    this.actualizarFecha();
    // Actualizar cada minuto
    setInterval(() => this.actualizarFecha(), 60000);
  }

  private actualizarFecha(): void {
    const ahora = new Date();
    this.fechaActual = ahora.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // Capitalizar primera letra
    this.fechaActual = this.fechaActual.charAt(0).toUpperCase() + this.fechaActual.slice(1);
  }
}
