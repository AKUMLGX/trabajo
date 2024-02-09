import { Component, Input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';

export interface EuacapeTableBeforeSubmit {
  name: string;
  position: number;
  answer: string | null;
}


@Component({
  selector: 'app-info-table',
  standalone: true,
  imports: [MatDialogModule, MatTableModule],
  templateUrl: './info-table.component.html',
  styleUrl: './info-table.component.css'
})
export class InfoTableComponent {

  @Input({required: true}) OFICIO!: string;

  oficio = this.OFICIO;

  constructor(){
    
    console.log(this.OFICIO);

  }

  ELEMENT_DATA: EuacapeTableBeforeSubmit[] = [
    {position: 1, name: 'Oficio', answer: this.OFICIO},
    {position: 2, name: 'Administración', answer: ''},
    {position: 3, name: 'Fecha de recepción', answer: ''},
    {position: 4, name: 'Documentos escaneados', answer: ''},
    {position: 5, name: 'Atención', answer: ''},
    {position: 6, name: 'Descripción', answer: ''},
    {position: 7, name: 'Tipo de respuesta', answer: ''},
    {position: 8, name: 'Autoridad solicitante', answer: ''},
    {position: 9, name: 'Turno jefatura', answer: ''},
    {position: 10, name: 'Respuesta', answer: ''},
    {position: 11, name: ' Acuse', answer: ''},
    {position: 12, name: 'Folio interno', answer: ''},
    {position: 13, name: 'Carpeta de investigación', answer: ''},
    {position: 14, name: 'Persona relacionada', answer: ''},
    {position: 15, name: 'Folio scanner', answer: ''},
    {position: 16, name: 'Tipo asunto', answer: ''},
    {position: 17, name: 'Plazo de atención', answer: ''},
  ];

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-answer'];
  dataSource = this.ELEMENT_DATA;

}
