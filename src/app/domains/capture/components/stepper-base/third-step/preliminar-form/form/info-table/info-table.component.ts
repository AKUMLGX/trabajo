import { Component, Input, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CollectFormInfoService } from '../../../../../../../shared/services/collect-form-info.service';
import { EuacapeApertura } from '../../../../../../../interfaces/euacape-apertura';
import { EuacapeAperturaService } from '../../../../../../../services/euacape-apertura.service';
import { FormsObjectService } from '../../../../../../../shared/services/forms-object.service';

export interface DataBeforeSubmit {
  name: string;
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
    private collectFormInfoService: CollectFormInfoService,
    private euacapeAperturaService: EuacapeAperturaService,
    private formsObjectService: FormsObjectService,
  ){ }

  @Input() dropdownChoice: string = '';

  ADMINISTRACION = this.collectFormInfoService.ADMON;
  FECHARECEPCION = this.collectFormInfoService.FECHAREC;
  DOCUMENTOESCANEADO = this.collectFormInfoService.DOCSCAN;
  DOCUMENTOEUACAPE = this.collectFormInfoService.DOCUMENTOEUACAPE;
  DOCUMENTOOTROS = this.collectFormInfoService.DOCUMENTOOTROS;
  DESCRIPCION = this.collectFormInfoService.DESCRIPCION;
  ATENCION = this.collectFormInfoService.ATENCION;
  AUTORIDADREMITENTE = this.collectFormInfoService.AUTORIDADREMI;
  CARPETAINVESTIGACION = this.collectFormInfoService.CARPETAINV;
  PERSONARELACIONADA = this.collectFormInfoService.PERSONAREL;
  PLAZOATENCION = this.collectFormInfoService.PLAZOATENCION;

  OFICIO = this.collectFormInfoService.OFICIO;
  TURNOJEFATURA = this.collectFormInfoService.TURNOJEFATURA;
  FOLIOINTERNO = this.collectFormInfoService.FOLIOINT;
  FOLIOSCANNER = this.collectFormInfoService.FOLIOSCAN;

  VOLANTEJEFATURA = this.collectFormInfoService.VOLANTEJEFATURA;
  FOLIOJUPITER = this.collectFormInfoService.FOLIOJUPITER;

  TIPOASUNTO = this.collectFormInfoService.TIPOASUNTO;

  // euacapeFormObject = signal<EuacapeApertura>({
  //   folio_interno:         '',
  //   folio_scanner:         '',
  //   oficio:                '',
  //   documento_escaneado:   '',
  //   persona_relacionada:   '',
  //   descripcion:           '',
  //   fecha_recepcion:       '',
  //   autoridad_solicitante: '',
  //   plazo_atencion:        null,
  //   administracion:        '',
  //   turno_jefatura:        null,
  //   carpeta_investigacion: null,
  // });

  EUACAPE_DATA: DataBeforeSubmit[] = [
    {name: 'Oficio', answer: this.OFICIO()},
    {name: 'Administración', answer: this.ADMINISTRACION()},
    {name: 'Fecha de recepción (yyyy-MM-dd)', answer: this.FECHARECEPCION()},
    {name: 'Documento escaneado', answer: this.DOCUMENTOESCANEADO()},
    {name: 'Documento', answer: (this.TIPOASUNTO() === 'EUACAPE') ? this.DOCUMENTOEUACAPE() : this.DOCUMENTOOTROS() },
    {name: 'Descripción', answer: this.DESCRIPCION()},
    {name: 'Atención', answer: this.ATENCION()},
    {name: 'Autoridad remitente', answer: this.AUTORIDADREMITENTE()},
    {name: 'Turno jefatura', answer: (this.TURNOJEFATURA() !== null) ? this.TURNOJEFATURA() : '---'},
    {name: 'Carpeta de investigación', answer: (this.CARPETAINVESTIGACION() !== null) ? this.CARPETAINVESTIGACION() : '---'},
    {name: 'Persona relacionada', answer: this.PERSONARELACIONADA()},
    {name: 'Folio scanner', answer: this.FOLIOSCANNER()},
    {name: 'Tipo asunto', answer: this.TIPOASUNTO()},
    {name: 'Plazo de atención', answer: (this.PLAZOATENCION() !== null) ? (this.PLAZOATENCION() === 0) ? 'Urgente' : `${ Math.floor(this.PLAZOATENCION()! /24)} días & ${(this.PLAZOATENCION()! %24)} hrs.`  : '---' },
  ];

  GENERALIDADES_DATA: DataBeforeSubmit[] = [
    ...this.EUACAPE_DATA,
    {name: 'Volante jefatura', answer: (this.VOLANTEJEFATURA() !== null) ? this.VOLANTEJEFATURA() : '---'},
    {name: 'Folio Júpiter', answer: (this.FOLIOJUPITER() !== null) ? this.FOLIOJUPITER() : '---'}
  ];

  //Este vato si incluye el folio interno

  RESPUESTA_DATA: DataBeforeSubmit[] = [
    ...this.GENERALIDADES_DATA,
    {name: 'Folio interno', answer: this.FOLIOINTERNO()},
  ]

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
    autoridadRemitente: string,
    plazoAtencion: number | null,
    administracion: string,
    carpetaInvestigacion: string | null,
    turnoJefatura: string | null,
    volanteJefatura: string | null,
    folioJupiter: string | null,
  ) {
    switch (this.dropdownChoice) {

      //La realidad es que hoy 26/04/24 comente esto pero se va a borrar. 
      //Nadamas para tener la referencia para cuando haga los cases 
      //propios para cada una de las generalidades

      // case "Civil":
      //   this.formsObjectService.civilFormObject.set({
      //     folio_interno: folioInterno,
      //     folio_scanner: folioScanner,
      //     oficio: oficio, and Info Table 
      //     documento_escaneado: documentoEscaneado,
      //     persona_relacionada: personaRelacionada,
      //     descripcion: descripcion,
      //     fecha_recepcion: fechaRecepcion,
      //     autoridad_remitente: autoridadRemitente,
      //     plazo_atencion: plazoAtencion,
      //     administracion: administracion,
      //     carpeta_investigacion: carpetaInvestigacion,
      //     turno_jefatura: turnoJefatura,
      //     autoridad_administrativa: autoridadAdministrativa,
      //     folio_jupiter: folioJupiter,
      //   });
      //   console.log("Estamos en Civil");
      //   console.log(this.formsObjectService.civilFormObject());
      //   this.civilAperturaService.insertCivilForm(
      //     this.formsObjectService.civilFormObject()
      //   );
      //   break;
      
      // case "Penal":
      //   this.formsObjectService.penalFormObject.set({
      //     folio_interno: folioInterno,
      //     folio_scanner: folioScanner,
      //     oficio: oficio,
      //     documento_escaneado: documentoEscaneado,
      //     persona_relacionada: personaRelacionada,
      //     descripcion: descripcion,
      //     fecha_recepcion: fechaRecepcion,
      //     autoridad_remitente: autoridadRemitente,
      //     plazo_atencion: plazoAtencion,
      //     administracion: administracion,
      //     carpeta_investigacion: carpetaInvestigacion,
      //     turno_jefatura: turnoJefatura,
      //     autoridad_administrativa: autoridadAdministrativa,
      //     folio_jupiter: folioJupiter,
      //   });
      //   console.log("Estamos en Penal");
      //   console.log(this.formsObjectService.penalFormObject());
      //   this.penalAperturaService.insertPenalForm(
      //     this.formsObjectService.penalFormObject()
      //   );
      //   break;

      // case "Concurso mercantil":
      //   this.formsObjectService.concursoMercantilFormObject.set({
      //     folio_interno: folioInterno,
      //     folio_scanner: folioScanner,
      //     oficio: oficio,
      //     documento_escaneado: documentoEscaneado,
      //     persona_relacionada: personaRelacionada,
      //     descripcion: descripcion,
      //     fecha_recepcion: fechaRecepcion,
      //     autoridad_remitente: autoridadRemitente,
      //     plazo_atencion: plazoAtencion,
      //     administracion: administracion,
      //     carpeta_investigacion: carpetaInvestigacion,
      //     turno_jefatura: turnoJefatura,
      //     folio_jupiter: folioJupiter,
      //   });
      //   console.log("Estamos en Concurso");
      //   console.log(this.formsObjectService.concursoMercantilFormObject());
      //   this.concursoMercantilAperturaService.insertConcursoMercantilForm(
      //     this.formsObjectService.concursoMercantilFormObject()
      //   );
      //   break;

      case "EUACAPE":
        this.formsObjectService.euacapeFormObject.set({
          folio_interno: folioInterno,
          folio_scanner: folioScanner,
          oficio: oficio,
          documento_escaneado: documentoEscaneado,
          persona_relacionada: personaRelacionada,
          descripcion: descripcion,
          fecha_recepcion: fechaRecepcion,
          autoridad_remitente: autoridadRemitente,
          plazo_atencion: plazoAtencion,
          administracion: administracion,
          carpeta_investigacion: carpetaInvestigacion,
          turno_jefatura: turnoJefatura,
        });
        console.log("Estamos en Euacape");
        console.log(this.formsObjectService.euacapeFormObject());
        this.euacapeAperturaService.insertEuacapeForm(
          this.formsObjectService.euacapeFormObject()
        );
        break;
      // case "Generalidades":
      //   this.formsObjectService.generalidadesFormObject.set({
      //     folio_interno: folioInterno,
      //     folio_scanner: folioScanner,
      //     oficio: oficio,
      //     documento_escaneado: documentoEscaneado,
      //     persona_relacionada: personaRelacionada,
      //     descripcion: descripcion,
      //     fecha_recepcion: fechaRecepcion,
      //     autoridad_remitente: autoridadRemitente,
      //     plazo_atencion: plazoAtencion,
      //     administracion: administracion,
      //     carpeta_investigacion: carpetaInvestigacion,
      //     turno_jefatura: turnoJefatura,
      //     autoridad_administrativa: autoridadAdministrativa,
      //     folio_jupiter: folioJupiter,
      //   });
      //   console.log("Estamos en Generalidades");
      //   console.log(this.formsObjectService.generalidadesFormObject());
      //   this.generalidadesAperturaService.insertGeneralidadesForm(
      //     this.formsObjectService.generalidadesFormObject()
      //   );
      //   break;
    }

  }

}
