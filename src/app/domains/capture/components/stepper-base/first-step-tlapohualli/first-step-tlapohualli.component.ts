import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-first-step-tlapohualli',
  standalone: true,
  imports: [],
  templateUrl: './first-step-tlapohualli.component.html',
  styleUrl: './first-step-tlapohualli.component.css'
})
export class FirstStepTlapohualliComponent {
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();

  constructor() {
    // TODO: Implementar formulario del paso 1
  }

  onSubmit() {
    // TODO: Implementar validación y emisión de datos
  }
}
