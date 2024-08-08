import { Injectable, signal } from '@angular/core';
import { Asunto } from '../../interfaces/asuntos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchStatusService {

  constructor() { }

  reactiveCoincidencesSearchList = signal<Asunto[]>([]);

  isSearchResultsListEmpty = signal<boolean | undefined>(undefined);

  isNextButtonFromSearchBarComponentEnabled = signal<boolean>(false);

  selectedRow = signal<any>(undefined);

  isRedirectToAperturasForced = signal(false);

  folioInternoFromSelectedRow = signal('');
  carpetaInvestigacionFromSelectedRow = signal('');
  administracionFromSelectedRow = signal('');
  personaRelacionadaFromSelectedRow = signal('');
  tipoAsuntoFromSelectedRow = signal('');

  updateResultsListStatus(status: boolean) {
    this.isSearchResultsListEmpty.set(status);
  }

  updateNextButtonStatus(status: boolean) {
    this.isNextButtonFromSearchBarComponentEnabled.set(status);
  }

  updateSelectedRow(row: any) {
    this.selectedRow.set(row);
    if(this.selectedRow()[0].folio_interno === null) {
      this.folioInternoFromSelectedRow.set('CARLOS');
    } else {
      this.folioInternoFromSelectedRow.set(this.selectedRow()[0].folio_interno);
    }
    if(this.selectedRow()[0].carpeta_investigacion === null) {
      this.carpetaInvestigacionFromSelectedRow.set('CARLOS');
    } else {
      this.carpetaInvestigacionFromSelectedRow.set(this.selectedRow()[0].carpeta_investigacion);
    }
    if(this.selectedRow()[0].administracion === null) {
      this.administracionFromSelectedRow.set('CARLOS');
    } else {
      this.administracionFromSelectedRow.set(this.selectedRow()[0].administracion);
    }
    if(this.selectedRow()[0].persona_relacionada === null) {
      this.personaRelacionadaFromSelectedRow.set('CARLOS');
    } else {
      this.personaRelacionadaFromSelectedRow.set(this.selectedRow()[0].persona_relacionada);
    }
    if(this.selectedRow()[0].tipo_asunto === null) {
      this.tipoAsuntoFromSelectedRow.set('');
    } else {
      this.tipoAsuntoFromSelectedRow.set(this.selectedRow()[0].tipo_asunto);
    }
  }

  manuallyRedirectToAperturas(redirectStatus: boolean) {
    this.isRedirectToAperturasForced.set(redirectStatus);
  }

}
