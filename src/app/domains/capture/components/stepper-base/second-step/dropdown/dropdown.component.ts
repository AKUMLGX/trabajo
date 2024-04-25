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
    { name: 'Civil', value: 'option-1' },
    { name: 'Penal', value: 'option-2' },
    { name: 'Concurso mercantil', value: 'option-3' },
    { name: 'EUACAPE', value: 'option-4' },
    { name: 'Generalidades', value: 'option-5' },
  ];

  @Output() selectionEmitter = new EventEmitter;

  selectedOptionHandler(){
    this.selectionEmitter.emit(this.selectedOption);
  }

  showSubmenuHandler(){
    this.isSubmenuDeployed = !this.isSubmenuDeployed;
  }

}
