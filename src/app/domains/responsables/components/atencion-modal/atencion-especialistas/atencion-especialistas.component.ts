import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CatEspecialista } from '../../../services/atencion.service';
@Component({
  selector: 'app-atencion-especialistas',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './atencion-especialistas.component.html'
})
export class AtencionEspecialistasComponent {
  @Input() externos: CatEspecialista[] = [];
  @Input() internos: CatEspecialista[] = [];
  @Input() seleccionados: string[] = [];
  @Input() max = 3;

  @Output() seleccionadosChange = new EventEmitter<string[]>();

  seleccionado(codigo: string): boolean {
    return this.seleccionados.includes(codigo);
  }

  toggle(codigo: string): void {
    if (this.seleccionado(codigo)) {
      this.seleccionados = this.seleccionados.filter(item => item !== codigo);
      this.seleccionadosChange.emit(this.seleccionados);
      return;
    }

    if (this.seleccionados.length >= this.max) return;

    this.seleccionados = [...this.seleccionados, codigo];
    this.seleccionadosChange.emit(this.seleccionados);
  }
}