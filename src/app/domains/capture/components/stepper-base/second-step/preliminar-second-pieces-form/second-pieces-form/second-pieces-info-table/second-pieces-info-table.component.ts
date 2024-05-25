import { Component, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CollectSecondPiecesInfoService } from '../../../../../../../shared/services/collect-second-pieces-info.service';
import { FormsObjectService } from '../../../../../../../shared/services/forms-object.service';
import { EuacapeAperturaService } from '../../../../../../../services/euacape-apertura.service';
import { GeneralidadesAperturaService } from '../../../../../../../services/generalidades-apertura.service';
import { RespuestaAperturaService } from '../../../../../../../services/respuesta-apertura.service';

export interface SecondPiecesTableBeforeSubmit {
  name: string;
  answer: string | Date | number | null;
}

@Component({
  selector: 'app-second-pieces-info-table',
  standalone: true,
  imports: [MatDialogModule, MatTableModule],
  templateUrl: './second-pieces-info-table.component.html',
  styleUrl: './second-pieces-info-table.component.css'
})
export class SecondPiecesInfoTableComponent {

  constructor(
    private collectSecondPiecesInfoService: CollectSecondPiecesInfoService,
    private formsObjectService: FormsObjectService,

    private euacapeAperturaService: EuacapeAperturaService,
    private generalidadesAperturaService: GeneralidadesAperturaService,
    private respuestaAperturaService: RespuestaAperturaService,
  ){ }

  ADMINISTRACION = this.collectSecondPiecesInfoService.ADMON;
  FECHARECEPCION = this.collectSecondPiecesInfoService.FECHAREC;
  DOCUMENTOESCANEADO = this.collectSecondPiecesInfoService.DOCSCANNAME;
  DOCUMENTOESCANEADOFILE = this.collectSecondPiecesInfoService.DOCSCANFILE;
  DOCUMENTO = this.collectSecondPiecesInfoService.DOCUMENTO;
  DESCRIPCION = this.collectSecondPiecesInfoService.DESCRIPCION;
  ATENCION = this.collectSecondPiecesInfoService.ATENCION;
  AUTORIDADREMITENTE = this.collectSecondPiecesInfoService.AUTORIDADREMI;
  CARPETAINVESTIGACION = this.collectSecondPiecesInfoService.CARPETAINV;
  PERSONARELACIONADA = this.collectSecondPiecesInfoService.PERSONAREL;
  PLAZOATENCION = this.collectSecondPiecesInfoService.PLAZOATENCION;

  OFICIO = this.collectSecondPiecesInfoService.OFICIO;
  TURNOJEFATURA = this.collectSecondPiecesInfoService.TURNOJEFATURA;
  FOLIOINTERNO = this.collectSecondPiecesInfoService.FOLIOINT;
  FOLIOSCANNER = this.collectSecondPiecesInfoService.FOLIOSCAN;

  VOLANTEJEFATURA = this.collectSecondPiecesInfoService.VOLANTEJEFATURA;
  FOLIOJUPITER = this.collectSecondPiecesInfoService.FOLIOJUPITER;

  TIPOASUNTO = this.collectSecondPiecesInfoService.TIPOASUNTO;

  //de este hay que trabajar el tipado que se va a manejar para segundas piezas
  // secondPiecesFormObject = signal<EuacapeApertura>({
  //   folio_interno:         '',
  //   folio_scanner:         '',
  //   oficio:                '',
  //   documento_escaneado:   '',
  //   persona_relacionada:   '',
  //   descripcion:           '',
  //   fecha_recepcion:       '',
  //   autoridad_remitente:   '',
  //   plazo_atencion:        null,
  //   administracion:        '',
  //   turno_jefatura:        null,
  //   carpeta_investigacion: null,
  // });

  EUACAPE_FIRST_ROUND: SecondPiecesTableBeforeSubmit[] = [
    {name: 'Folio interno', answer: this.FOLIOINTERNO()},
    {name: 'Oficio', answer: this.OFICIO()},
    {name: 'Folio scanner', answer: this.FOLIOSCANNER()},
    {name: 'Carpeta de investigación', answer: (this.CARPETAINVESTIGACION() !== null) ? this.CARPETAINVESTIGACION() : '---'},

    {name: 'Documento escaneado', answer: this.DOCUMENTOESCANEADO()},
    {name: 'Fecha de recepción (yyyy-MM-dd)', answer: this.FECHARECEPCION()},
    {name: 'Autoridad remitente', answer: this.AUTORIDADREMITENTE()},
    {name: 'Persona relacionada', answer: this.PERSONARELACIONADA()},
    {name: 'Turno jefatura', answer: (this.TURNOJEFATURA() !== null) ? this.TURNOJEFATURA() : '---'},
    {name: 'Descripción', answer: this.DESCRIPCION()},
  ];

  EUACAPE_SECOND_ROUND: SecondPiecesTableBeforeSubmit[] = [
    {name: 'Administración', answer: this.ADMINISTRACION()},
    {name: 'Plazo de atención', answer: (this.PLAZOATENCION() !== null) ? (this.PLAZOATENCION() === 0) ? 'Urgente' : `${ Math.floor(this.PLAZOATENCION()! /24)} días & ${(this.PLAZOATENCION()! %24)} hrs.`  : '---' },
    {name: 'Documento', answer: this.DOCUMENTO() },    
    {name: 'Atención', answer: this.ATENCION()},
    {name: 'Tipo asunto', answer: this.TIPOASUNTO()}, 
  ];

  EUACAPE_DATA: SecondPiecesTableBeforeSubmit[] = [
    ...this.EUACAPE_FIRST_ROUND,
    ...this.EUACAPE_SECOND_ROUND,
  ];

  GENERALIDADES_AND_RESPUESTA_DATA: SecondPiecesTableBeforeSubmit[] = [
    ...this.EUACAPE_FIRST_ROUND,
    {name: 'Volante jefatura', answer: (this.VOLANTEJEFATURA() !== null) ? this.VOLANTEJEFATURA() : '---'},
    {name: 'Folio Júpiter', answer: (this.FOLIOJUPITER() !== null) ? this.FOLIOJUPITER() : '---'},
    ...this.EUACAPE_SECOND_ROUND,  
  ];

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-answer'];
  dataSource = this.EUACAPE_DATA;

  confirmData(
    folioInterno: string,
    folioScanner: string,
    oficio: string,
    documentoEscaneado: string,
    documentoEscaneadoFile: undefined | File,
    personaRelacionada: string,
    descripcion: string,
    fechaRecepcion: string,
    autoridadRemitente: string,
    plazoAtencion: number | null,
    administracion: string,
    carpetaInvestigacion: string | null,
    turnoJefatura: string | null,
    documento: string,
    atencion: string,
    tipoAsunto: string,
    volanteJefatura: string | null,
    folioJupiter: string | null,
  ) {
    console.log('Carlos Montañas', documentoEscaneadoFile?.type);
    if(this.TIPOASUNTO() === 'EUACAPES') {
      this.formsObjectService.euacapeFormObject.set({
        oficio:                oficio,
        folio_scanner:         folioScanner,
        carpeta_investigacion: carpetaInvestigacion,
        documento_escaneado:   documentoEscaneado,
        fecha_recepcion:       fechaRecepcion,
        autoridad_remitente:   autoridadRemitente,
        persona_relacionada:   personaRelacionada,
        turno_jefatura:        turnoJefatura,
        descripcion:           descripcion,
        administracion:        administracion,
        plazo_atencion:        plazoAtencion,
        documento:             documento,
      });
      console.log("Estamos en Euacape");
      console.log(this.formsObjectService.euacapeFormObject());
      this.euacapeAperturaService.insertEuacapeForm(
        this.formsObjectService.euacapeFormObject()
      );
    } else if (
        this.TIPOASUNTO() === 'Penal' 
        || this.TIPOASUNTO() === 'Civil'
        || this.TIPOASUNTO() === 'Laboral'
        || this.TIPOASUNTO() === 'Juicio de Amparo'
        || this.TIPOASUNTO() === 'Concurso Mercantil'
        || this.TIPOASUNTO() === 'Copia de Conocimiento'
      ) {
      this.formsObjectService.generalidadesFormObject.set({
        oficio:                oficio,
        folio_scanner:         folioScanner,
        carpeta_investigacion: carpetaInvestigacion,
        documento_escaneado:   documentoEscaneado,
        fecha_recepcion:       fechaRecepcion,
        autoridad_remitente:   autoridadRemitente,
        persona_relacionada:   personaRelacionada,
        turno_jefatura:        turnoJefatura,
        descripcion:           descripcion,
        volante_jefatura:      volanteJefatura,
        folio_jupiter:         folioJupiter,
        administracion:        administracion,
        plazo_atencion:        plazoAtencion,
        documento:             documento,
        tipo_asunto:           tipoAsunto,
      });
      console.log("Estamos en Generalidades");
      console.log(this.formsObjectService.generalidadesFormObject());
      this.generalidadesAperturaService.insertGeneralidadesForm(
        this.formsObjectService.generalidadesFormObject()
      );
    } else if (this.TIPOASUNTO() === 'Respuesta') {
      this.formsObjectService.respuestaFormObject.set({
        folio_interno:         folioInterno,
        oficio:                oficio,
        folio_scanner:         folioScanner,
        carpeta_investigacion: carpetaInvestigacion,
        documento_escaneado:   documentoEscaneado,
        fecha_recepcion:       fechaRecepcion,
        autoridad_remitente:   autoridadRemitente,
        persona_relacionada:   personaRelacionada,
        turno_jefatura:        turnoJefatura,
        descripcion:           descripcion,
        volante_jefatura:      volanteJefatura,
        folio_jupiter:         folioJupiter,
        administracion:        administracion,
        plazo_atencion:        plazoAtencion,
        documento:             documento,
        atencion:              atencion,
      });
      console.log("Estamos en Respuesta");
      console.log(this.formsObjectService.respuestaFormObject());
      this.respuestaAperturaService.insertRespuestaForm(
        this.formsObjectService.respuestaFormObject()
      );
    }

  }

}
