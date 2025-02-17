
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ParametrosAcuse, ParametrosAcuseFolio } from '../interfaces/acuses';


@Injectable({
  providedIn: 'root',
})
export class AsuntoService {
  public documentList: Asunto[] = [];

  documentsUpdated: EventEmitter<Asunto[]> = new EventEmitter();

  fileIsOpenUpdated: EventEmitter<boolean> = new EventEmitter();

  public fileIsOpen: boolean = false;

  public tipoBusqueda = '';
  constructor(private httpClient: HttpClient) { }

  filterDocuments(consultForm: FormGroup): void {
    this.tipoBusqueda = consultForm.get('tipoBusqueda')?.value;
    let folioInterno = consultForm.get('folioInterno')?.value;
    let carpetaInvertigacion = consultForm.get('carpetaInvertigacion')?.value;
    let oficio = consultForm.get('oficio')?.value;
    let autoridadRemitente = consultForm.get('autoridadRemitente')?.value;
    let personaRelacionada = consultForm.get('personaRelacionada')?.value;
    let volante_jefatura = consultForm.get('volante_jefatura')?.value;
    let turno_jefatura = consultForm.get('turno_jefatura')?.value;
    let url = environment.baseUrl + environment.asuntoEndpointC;
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvertigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      persona_relacionada: personaRelacionada,
      volante_jefatura: volante_jefatura,
      turno_jefatura: turno_jefatura,
    };
    this.httpClient.get<Asunto[]>(url, { params: params }).subscribe((data) => {
      this.documentList = data;
      this.documentsUpdated.emit(this.documentList);
    });
  }

  downloadExcelTable(
    folio_interno: string,
    carpeta_investigacion: string,
    oficio: string,
    autoridad_remitente: string,
    persona_relacionada: string,
    volante_jefatura: string,
    turno_jefatura: string,
  ) {
    let url = environment.baseUrl + environment.asuntoDescargaTablaBusqueda;
    let params = {
      folio_interno: folio_interno,
      carpeta_investigacion: carpeta_investigacion,
      oficio: oficio,
      autoridad_remitente: autoridad_remitente,
      persona_relacionada: persona_relacionada,
      volante_jefatura: volante_jefatura,
      turno_jefatura: turno_jefatura
    }
    this.httpClient.get(url, { params: params, responseType: "text" }).subscribe((data) => {
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Busqueda de Tabla.xlsx`;
      link.click();
    });
  }

  searchBarCoincidencesIlike(consulta: string, campo: string): Observable<string[]> {
    let url = environment.baseUrl + environment.asuntoEndpoint;
    let params = { [campo]: consulta };

    return this.httpClient.get<any[]>(url, { params }).pipe(
      map((data: any[]) => {
        return data.map((item: any) => item[campo]).filter((coincidencia: string) => coincidencia.trim() !== '');
      })
    );
  }
  searchBarCoincidencesIlikeAsunto(consulta: string, campo: string): Observable<Asunto[]> {
    let url = environment.baseUrl + environment.asuntoEndpoint;
    let params = { [campo]: consulta };
    return this.httpClient.get<Asunto[]>(
      url, { params: params });

  }
  searchBarCoincidences(
    searchEntryType: string,
    userInputForm: FormGroup
  ): Observable<Asunto[]> {
    this.tipoBusqueda = searchEntryType;
    let userInput = userInputForm.get('userInput')?.value;
    let carpetaInvestigacion: string = '';
    let personaRelacionada: string = '';
    let folioInterno: string = '';
    let oficio: string = '';
    let autoridadRemitente: string = '';
    let volante_jefatura: string = '';
    let turno_jefatura: string = '';
    switch (this.tipoBusqueda) {
      case "CARPETA DE INVESTIGACIÓN": {
        carpetaInvestigacion = userInput;
        break;
      }
      case "PERSONA RELACIONADA": {
        personaRelacionada = userInput;
        break;
      }
      case "FOLIO INTERNO": {
        folioInterno = userInput;
        break;
      }
      case "OFICIO": {
        oficio = userInput;
        break;
      }
      case "TURNO JEFATURA  ": {
        turno_jefatura = userInput
        break;
      }
    }

    let url = environment.baseUrl + environment.asuntoEndpoint;
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvestigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      persona_relacionada: personaRelacionada,
      volante_jefatura: volante_jefatura,
      turno_jefatura: turno_jefatura
    };

    return this.httpClient.get<Asunto[]>(
      url, { params: params });

  }

  checkNameCarpetaInvestigacion(
    userInputForm: FormGroup): Observable<Asunto[]> {
    let userInput = userInputForm.get('carpetaInvestigacion')?.value
    let url = environment.baseUrl + environment.asuntoEndpoint
    let params = {
      carpeta_investigacion: userInput,
    }
    return this.httpClient.get<Asunto[]>(
      url, { params: params }
    )
  }

  checkNameCarpetaInvestigacionUpdate(
    userInputForm: FormGroup): Observable<Asunto[]> {
    let userInput = userInputForm.get('carpeta_investigacion')?.value
    let url = environment.baseUrl + environment.asuntoEndpoint
    let params = {
      carpeta_investigacion: userInput,
    }
    return this.httpClient.get<Asunto[]>(
      url, { params: params }
    )
  }

  generateAcuse(date: string, dateFinal: string, administracion: string | null, formato: string | null): void {
    let url = environment.baseUrl + environment.generateAcuse;
    if (formato === null) formato = 'pdf';
    let params: ParametrosAcuse = {
      fecha_inicial: date,
      administracion: administracion,
      formato: formato,
      fecha_final: dateFinal,
    };
    this.httpClient.post(url, params, { responseType: "text" }).subscribe((acuse) => {
      const byteCharacters = atob(acuse);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type;
      if (formato === 'csv') {
        type = 'text/csv';
      } else if (formato === 'pdf') {
        type = 'application/pdf';
      } else {
        type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Acuse.${formato}`;
      link.click();
    });
  }


  generateAcuseFolioScan(folio_inicial: string, folio_final: string, administracion: string | null, formato: string | null) {
    let url = environment.baseUrl + environment.generateAcuse;
    if (formato === null) formato = 'pdf';
    let params: ParametrosAcuseFolio = {
      folio_inicial: folio_inicial,
      folio_final: folio_final,
      administracion: administracion,
      formato: formato
    }
    this.httpClient.post(url, params, { responseType: "text" }).subscribe((acuse) => {
      const byteCharacters = atob(acuse);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type;
      if (formato === 'csv') {
        type = 'text/csv';
      } else if (formato === 'pdf') {
        type = 'application/pdf';
      } else {
        type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Acuse.${formato}`;
      link.click();
    });
  }

  openPdf(): void {
    this.fileIsOpen = true;
    this.fileIsOpenUpdated.emit(true);
  }

  closePdf(): void {
    this.fileIsOpen = false;
    this.fileIsOpenUpdated.emit(false);
  }

  openMsg(): void {
    this.fileIsOpen = true;
    this.fileIsOpenUpdated.emit(true);
  }

  closeMsg(): void {
    this.fileIsOpen = false;
    this.fileIsOpenUpdated.emit(false);
  }
}
