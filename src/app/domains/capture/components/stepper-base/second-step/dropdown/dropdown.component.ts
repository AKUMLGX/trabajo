import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {

  isDropdownActive = false;
  isItemActive = false;
  selectedOption: any;

  isSubmenuDeployed: boolean = false;

  asuntos = [
    { name: 'EUACAPE', value: 'option-1' },
    { name: 'Respuesta', value: 'option-2' },
    { name: 'Asunto Penal', value: 'option-3' },
    { name: 'Asunto Civil', value: 'option-4' },
    { name: 'Laboral', value: 'option-5' },
    { name: 'Juicio Amparo', value: 'option-6' },
    { name: 'Concurso Mercantil', value: 'option-7' },
    { name: 'Copia de Conocimiento', value: 'option-8' },
  ];

  @Output() selectionEmitter = new EventEmitter;

  selectedOptionHandler(){
    this.selectionEmitter.emit(this.selectedOption);
  }

  showSubmenuHandler(){
    this.isSubmenuDeployed = !this.isSubmenuDeployed;
  }

}
