import { Component, Input, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import { PreliminarEuacapeService } from '../../../../../../../shared/services/preliminar-euacape.service';
import { EuacapeApertura } from '../../../../../../../interfaces/euacape-apertura';
import { EuacapeAperturaService } from '../../../../../../../services/euacape-apertura.service';

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

  constructor(
    private preliminarEuacapeService: PreliminarEuacapeService,
    private euacapeAperturaService: EuacapeAperturaService,
  ){ }

  @Input({required: true}) ADMON!: string;
  @Input({required: true}) FECHAREC!: Date | null;
  @Input({required: true}) DOCSCAN!: string;
  @Input({required: true}) ATENCION!: string;
  @Input({required: true}) DESCRIPCION!: string;
  @Input({required: true}) TIPORES!: string;
  @Input({required: true}) AUTORIDADSOLIC!: string;
  @Input({required: true}) CARPETAINV!: string | null;
  @Input({required: true}) PERSONAREL!: string;
  @Input({required: true}) PLAZOATENCION!: number | null;

  OFICIO = this.preliminarEuacapeService.OFICIO;
  TURNOJEFATURA = this.preliminarEuacapeService.TURNOJEFATURA;
  FOLIOINTERNO = this.preliminarEuacapeService.FOLIOINT;
  FOLIOSCANNER = this.preliminarEuacapeService.FOLIOSCAN;

  euacapeFormObject = signal<EuacapeApertura>({
    folio_interno:         '',
    folio_scanner:         '',
    oficio:                '',
    documento_escaneado:   '',
    persona_relacionada:   '',
    descripcion:           '',
    fecha_recepcion:       '',
    autoridad_solicitante: '',
    plazo_atencion:        null,
    administracion:        '',
    turno_jefatura:        null,
    carpeta_investigacion: null,
  });

  ELEMENT_DATA: EuacapeTableBeforeSubmit[] = [
    {position: 1, name: 'Oficio', answer: ''},
    {position: 2, name: 'Administración', answer: ''},
    {position: 3, name: 'Fecha de recepción', answer: ''},
    {position: 4, name: 'Documento escaneado', answer: ''},
    {position: 5, name: 'Atención', answer: ''},
    {position: 6, name: 'Descripción', answer: ''},
    {position: 7, name: 'Tipo de respuesta', answer: ''},
    {position: 8, name: 'Autoridad solicitante', answer: ''},
    {position: 9, name: 'Turno jefatura', answer: ''},
    {position: 10, name: 'Folio interno', answer: ''},
    {position: 11, name: 'Carpeta de investigación', answer: ''},
    {position: 12, name: 'Persona relacionada', answer: ''},
    {position: 13, name: 'Folio scanner', answer: ''},
    {position: 14, name: 'Tipo asunto', answer: ''},
    {position: 15, name: 'Plazo de atención', answer: ''},
  ];

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-answer'];
  dataSource = this.ELEMENT_DATA;

  confirmData(
    folioInterno: string,
    folioScanner: string,
    oficio: string,
    documentoEscaneado: string,
    personaRelacionada: string,
    descripcion: string,
    fechaRecepcion: string,
    autoridadSolicitante: string,
    plazoAtencion: number | null,
    administracion: string,
    carpetaInvestigacion: string | null,
    turnoJefatura: string | null,
  ) {
    this.euacapeFormObject.set({
        folio_interno: folioInterno,
        folio_scanner: folioScanner,
        oficio: oficio,
        documento_escaneado: documentoEscaneado,
        persona_relacionada: personaRelacionada,
        descripcion: descripcion,
        fecha_recepcion: fechaRecepcion,
        autoridad_solicitante: autoridadSolicitante,
        plazo_atencion: plazoAtencion,
        administracion: administracion,
        carpeta_investigacion: carpetaInvestigacion,
        turno_jefatura: turnoJefatura,
  });
    //const euacapeFormObject = {...this.euacapeForm};
    console.log(this.euacapeFormObject());
    //this.euacapeAperturaService.insertEuacapeForm(
    //  this.euacapeFormObject()
    //);
  }

}
