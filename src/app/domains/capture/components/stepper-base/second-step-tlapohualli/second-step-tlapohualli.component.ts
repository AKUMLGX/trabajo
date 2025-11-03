import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-second-step-tlapohualli',
  standalone: true,
  imports: [],
  templateUrl: './second-step-tlapohualli.component.html',
  styleUrl: './second-step-tlapohualli.component.css'
})
export class SecondStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  constructor() {
    // TODO: Implementar formulario del paso 2
  }

  onSubmit() {
    // TODO: Implementar validación y emisión de datos
  }
}
