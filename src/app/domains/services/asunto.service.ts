
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

  documentsUpdated = new EventEmitter<Asunto[]>();

  fileIsOpenUpdated = new EventEmitter<boolean>();

  public fileIsOpen = false;

  public tipoBusqueda = '';
  constructor(private httpClient: HttpClient) { }

  filterDocuments(consultForm: FormGroup): void {
    this.tipoBusqueda = consultForm.get('tipoBusqueda')?.value;
    const folioInterno = consultForm.get('folioInterno')?.value;
    const carpetaInvertigacion = consultForm.get('carpetaInvertigacion')?.value;
    const oficio = consultForm.get('oficio')?.value;
    const autoridadRemitente = consultForm.get('autoridadRemitente')?.value;
    const personaRelacionada = consultForm.get('personaRelacionada')?.value;
    const volante_jefatura = consultForm.get('volante_jefatura')?.value;
    const turno_jefatura = consultForm.get('turno_jefatura')?.value;
    const url = environment.baseUrl + environment.asuntoEndpointC;
    const params = {
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
    const url = environment.baseUrl + environment.asuntoDescargaTablaBusqueda;
    const params = {
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
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Busqueda de Tabla.xlsx`;
      link.click();
    });
  }

  searchBarCoincidencesIlike(consulta: string, campo: string): Observable<string[]> {
    const url = environment.baseUrl + environment.asuntoEndpoint;
    const params = { [campo]: consulta };

    return this.httpClient.get<any[]>(url, { params }).pipe(
      map((data: any[]) => {
        return data.map((item: any) => item[campo]).filter((coincidencia: string) => coincidencia.trim() !== '');
      })
    );
  }
  searchBarCoincidencesIlikeAsunto(consulta: string, campo: string): Observable<Asunto[]> {
    const url = environment.baseUrl + environment.asuntoEndpoint;
    const params = { [campo]: consulta };
    return this.httpClient.get<Asunto[]>(
      url, { params: params });

  }
  searchBarCoincidences(
    searchEntryType: string,
    userInputForm: FormGroup
  ): Observable<Asunto[]> {
    this.tipoBusqueda = searchEntryType;
    const userInput = userInputForm.get('userInput')?.value;
    let carpetaInvestigacion = '';
    let personaRelacionada = '';
    let folioInterno = '';
    let oficio = '';
    const autoridadRemitente = '';
    const volante_jefatura = '';
    let turno_jefatura = '';
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

    const url = environment.baseUrl + environment.asuntoEndpoint;
    const params = {
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
    const userInput = userInputForm.get('carpetaInvestigacion')?.value
    const url = environment.baseUrl + environment.asuntoEndpoint
    const params = {
      carpeta_investigacion: userInput,
    }
    return this.httpClient.get<Asunto[]>(
      url, { params: params }
    )
  }

  checkNameCarpetaInvestigacionUpdate(
    userInputForm: FormGroup): Observable<Asunto[]> {
    const userInput = userInputForm.get('carpeta_investigacion')?.value
    const url = environment.baseUrl + environment.asuntoEndpoint
    const params = {
      carpeta_investigacion: userInput,
    }
    return this.httpClient.get<Asunto[]>(
      url, { params: params }
    )
  }

  generateAcuse(date: string, dateFinal: string, administracion: string | null, formato: string | null): void {
    const url = environment.baseUrl + environment.generateAcuse;
    if (formato === null) formato = 'pdf';
    const params: ParametrosAcuse = {
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


  generateAcuseFolioScan(folio_inicial: number, folio_final: number, administracion: string | null, formato: string | null) {
    const url = environment.baseUrl + environment.generateAcuse;
    if (formato === null) formato = 'pdf';
    const params: ParametrosAcuseFolio = {
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
