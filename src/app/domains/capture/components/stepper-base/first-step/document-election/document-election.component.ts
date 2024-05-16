import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-document-election',
  standalone: true,
  imports: [],
  templateUrl: './document-election.component.html',
  styleUrl: './document-election.component.css'
})
export class DocumentElectionComponent {

  selectedOption: any;

  documentos = [
    { name: 'CARPETA DE INVESTIGACIÓN', value: 'option-1' },
    { name: 'PERSONA RELACIONADA',      value: 'option-2' },
    { name: 'FOLIO INTERNO',            value: 'option-3' },
    { name: 'OFICIO',                   value: 'option-4' },
  ];

  @Output() selectionEmitter = new EventEmitter;

  selectedOptionHandler(){
    this.selectionEmitter.emit(this.selectedOption);
  }





}
