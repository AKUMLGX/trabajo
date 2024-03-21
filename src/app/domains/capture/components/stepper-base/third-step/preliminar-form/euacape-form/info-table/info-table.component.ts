import { Component, Input, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CollectEuacapeInfoService } from '../../../../../../../shared/services/collect-euacape-info.service';
import { EuacapeApertura } from '../../../../../../../interfaces/euacape-apertura';
import { EuacapeAperturaService } from '../../../../../../../services/euacape-apertura.service';

export interface EuacapeTableBeforeSubmit {
  name: string;
  position: number;
  answer: string | Date | number | null;
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
    private collectEuacapeInfoService: CollectEuacapeInfoService,
    private euacapeAperturaService: EuacapeAperturaService,
  ){ }

  @Input() dropdownChoice: string = '';

  ADMINISTRACION = this.collectEuacapeInfoService.ADMON;
  FECHARECEPCION = this.collectEuacapeInfoService.FECHAREC;
  DOCUMENTOESCANEADO = this.collectEuacapeInfoService.DOCSCAN;
  ATENCION = this.collectEuacapeInfoService.ATENCION;
  DESCRIPCION = this.collectEuacapeInfoService.DESCRIPCION;
  TIPORESPUESTA = this.collectEuacapeInfoService.TIPORES;
  AUTORIDADSOLICITANTE = this.collectEuacapeInfoService.AUTORIDADSOLIC;
  CARPETAINVESTIGACION = this.collectEuacapeInfoService.CARPETAINV;
  PERSONARELACIONADA = this.collectEuacapeInfoService.PERSONAREL;
  PLAZOATENCION = this.collectEuacapeInfoService.PLAZOATENCION;

  OFICIO = this.collectEuacapeInfoService.OFICIO;
  TURNOJEFATURA = this.collectEuacapeInfoService.TURNOJEFATURA;
  FOLIOINTERNO = this.collectEuacapeInfoService.FOLIOINT;
  FOLIOSCANNER = this.collectEuacapeInfoService.FOLIOSCAN;

  AUTORIDADADMINISTRATIVA = this.collectEuacapeInfoService.AUTORIDADADMINISTRATIVA;
  FOLIOJUPITER = this.collectEuacapeInfoService.FOLIOJUPITER;

  TIPOASUNTO = this.collectEuacapeInfoService.TIPOASUNTO;

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

  EUACAPE_DATA: EuacapeTableBeforeSubmit[] = [
    {position: 1, name: 'Oficio', answer: this.OFICIO()},
    {position: 2, name: 'Administración', answer: this.ADMINISTRACION()},
    {position: 3, name: 'Fecha de recepción (yyyy-MM-dd)', answer: this.FECHARECEPCION()},
    {position: 4, name: 'Documento escaneado', answer: this.DOCUMENTOESCANEADO()},
    {position: 5, name: 'Atención', answer: this.ATENCION()},
    {position: 6, name: 'Descripción', answer: this.DESCRIPCION()},
    {position: 7, name: 'Tipo de respuesta', answer: this.TIPORESPUESTA()},
    {position: 8, name: 'Autoridad solicitante', answer: this.AUTORIDADSOLICITANTE()},
    {position: 9, name: 'Turno jefatura', answer: (this.TURNOJEFATURA() !== null) ? this.TURNOJEFATURA() : '---'},
    {position: 10, name: 'Folio interno', answer: this.FOLIOINTERNO()},
    {position: 11, name: 'Carpeta de investigación', answer: (this.CARPETAINVESTIGACION() !== null) ? this.CARPETAINVESTIGACION() : '---'},
    {position: 12, name: 'Persona relacionada', answer: this.PERSONARELACIONADA()},
    {position: 13, name: 'Folio scanner', answer: this.FOLIOSCANNER()},
    {position: 14, name: 'Tipo asunto', answer: this.TIPOASUNTO()},
    {position: 15, name: 'Plazo de atención', answer: ( this.PLAZOATENCION() !== null ) ? this.PLAZOATENCION() : '---'},
  ];

  CONCURSO_DATA = [
    ...this.EUACAPE_DATA,
    {position: 16, name: 'Folio Júpiter', answer: (this.FOLIOJUPITER() !== null) ? this.FOLIOJUPITER() : '---'},
  ]

  CIVIL_OR_PENAL_OR_GENERALIDADES_DATA = [
    ...this.EUACAPE_DATA,
    {position: 16, name: 'Autoridad administrativa', answer: (this.AUTORIDADADMINISTRATIVA() !== null) ? this.AUTORIDADADMINISTRATIVA() : '---'},
    {position: 17, name: 'Folio Júpiter', answer: (this.FOLIOJUPITER() !== null) ? this.FOLIOJUPITER() : '---'}
  ];

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-answer'];
  dataSource = this.EUACAPE_DATA;

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
