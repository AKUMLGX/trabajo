import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-third-step-tlapohualli',
  standalone: true,
  imports: [],
  templateUrl: './third-step-tlapohualli.component.html',
  styleUrl: './third-step-tlapohualli.component.css'
})
export class ThirdStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Input() datosPaso2: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() finalizar = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  constructor() {
    // TODO: Implementar formulario del paso 3
  }

  onSubmit() {
    // TODO: Implementar validación y emisión de datos
  }
}
