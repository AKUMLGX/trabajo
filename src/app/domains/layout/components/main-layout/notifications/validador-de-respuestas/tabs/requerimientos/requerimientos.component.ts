import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

export interface DataBeforeSubmit {
  name: string;
  position: number;
  answer: string | Date | number | null;
}

@Component({
    selector: 'app-requerimientos',
    imports: [MatDialogModule],
    templateUrl: './requerimientos.component.html',
    styleUrl: './requerimientos.component.css'
})
export class RequerimientosComponent {


  Reaply_DAta: DataBeforeSubmit[] = [

    { position: 1, name: 'Oficio', answer: "Oficio" },
    { position: 2, name: 'Fecha de atencion (yyyy-MM-dd)', answer: "2024-04-02"},
    { position: 3, name: 'Documento escaneado', answer: "Documento escaneado" },
    { position: 4, name: 'Atención', answer: "Respuesta" },
    { position: 5, name: 'Descripción', answer: "Descripción" },
    { position: 6, name: 'Tipo Respuesta', answer:"Tipo Respuesta" },
    { position: 7, name: 'Folio scanner', answer: "Folio scanner" },
    { position: 8, name: 'Folio interno', answer: "Folio interno" },

  ]

}
