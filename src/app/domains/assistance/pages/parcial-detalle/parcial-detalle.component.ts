import { AsuntoResponseParcial } from './../../../interfaces/asuntoPorAtencionResponse.interface';
import { Observable } from 'rxjs';
import { AsuntoPorAtencionParcialRequest } from './../../../interfaces/asuntoPorAtencion.interface';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAsigacionResponseEnTramite, AsuntoPorAsigacionResponseParcial } from '../../../interfaces/asuntoPorAtencionResponse.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../../shared/services/modal.service';
import { FileService } from '../../../services/file.service';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from "../../../components/pdf-viewer/pdf-viewer.component";
import { PlazoPipe } from '../../../shared/components/plazo.pipe';

@Component({
    selector: 'app-parcial-detalle',
    imports: [CommonModule,
        RouterModule,
        FormsModule,
        NgxPaginationModule,
        MatIconModule,
        MatButtonModule,
        PdfViewerComponent,
        PlazoPipe,],
    templateUrl: './parcial-detalle.component.html',
    styleUrls: ['./parcial-detalle.component.css']
})
export class ParcialDetalleComponent implements OnInit {

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseParcial>,
    private modalService: ModalService,
    public dialog: MatDialog,
    private fileService: FileService,
  ) { }

  ngOnInit(): void {
    this.tablePracial()
  }

  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  //#region Request Table (Payload)
  tableparcialRequest: AsuntoPorAtencionParcialRequest = {
    atencion: "PARCIAL",
    documento: "REQUERIMIENTO",
  }
  //#endregion

  //#region Response Table
  allData: AsuntoPorAsigacionResponseParcial[] = [];
  //#endregion

  //#region paginador
  pages: AsuntoPorAsigacionResponseParcial[][] = []
  itemsPerPage: number = 5
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  //#region Buscadores

  searchTextNoOficio: string = "";
  searchPersona_relacionada: string = '';
  searchAutoridad_remitente: string = '';
  searchfolio_interno: string = '';
  searchcarpeta_investigacion: string = '';

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }

  onSearchChange() {
    this.updateSearch();
  }

  updateSearch() {
    this.buscadorService.setSearchTermsMu({
      folio: this.searchfolio_interno,
      carpeta: this.searchcarpeta_investigacion,
      persona: this.searchPersona_relacionada,
      oficio: this.searchTextNoOficio,
      autoridad_remitente: this.searchAutoridad_remitente,
    });
  }

  filterIndicador = (item: AsuntoPorAsigacionResponseParcial, terms: Record<string, string>): boolean => {
    const matchOficio = !terms['oficio'] || item.oficio?.toLowerCase().includes(terms['oficio'].toLowerCase());
    const matchCarpeta = !terms['carpeta'] || item.carpeta_investigacion?.toLowerCase().includes(terms['carpeta'].toLowerCase())
    const matchFolio = !terms['autoridad_remitente'] || item.autoridad_remitente?.toLowerCase().includes(terms['autoridad_remitente'].toLowerCase());
    const matchfolio_interno = !terms['folio'] || item.folio_interno?.toLowerCase().includes(terms['folio'].toLowerCase());
    const matchPersona = !terms['persona'] || item.persona_relacionada?.toLowerCase().includes(terms['persona'].toLowerCase())

    return matchFolio && matchOficio && matchPersona && matchfolio_interno && matchCarpeta;
  };

  filteredDataMul$: Observable<AsuntoPorAsigacionResponseParcial[]> = this.buscadorService.getFilteredDataMul(this.filterIndicador);

  //#endregion

  //#region Table
  tablePracial() {
    this.cards.parcialTableCard(this.tableparcialRequest).subscribe({
      next: (resp: AsuntoResponseParcial[]) => {
        this.allData = resp.map(item => item.asunto.datos);
        this.buscadorService.setDataMul(this.allData);
        this.updateSearch();
        let indexPage = 0;
        let page: AsuntoPorAsigacionResponseParcial[] = [];
        this.pages = []
        this.pageSelected = 1;
        this.allData.forEach((doc) => {
          page.push(doc);
          indexPage += 1;
          if (indexPage === this.itemsPerPage) {
            this.pages.push(page);
            indexPage = 0
            page = []
          }
          if (page.length !== 0) this.pages.push(page);
        })
      }

    })
  }
  //#endregion

  // #region descargar Excel
  descargarExcel() {
    this.cards.descargarExcelParcial(this.tableparcialRequest)
  }
  //#endregion

  //#region  Visulizador

  visualizarPdf: boolean = false;

  openPdfViewer(folio: string, path: string) {
    const fileName = this.getFileName(path)
    if (folio == null) folio = "sinAsignar";
    this.fileService.updatePdfFileBandejaAtencion(folio.toString(), fileName)
  }

  abrirModalPDF(template: TemplateRef<any>): void {
    this.visualizarPdf = true
    this.modalService.openCustomDialogWithTemplate({
      template
    });
  }

  cerrarVisualizadorPdf(): void {
    this.visualizarPdf = false;
    this.dialog.closeAll()
  }

  //#endregion

  descargarPdf(folio: string, path: string): void {
    const fileName = this.getFileName(path);
    if (folio == null) folio = "sinAsignar";
    this.fileService.downloadPdfFileBandejaAtencion(
      folio.toString(),
      fileName,
      fileName
    );
  }

  private getFileName(path: string): string {
    const split: string[] = path.replace('\\\\', '\\').split('\\');
    const name = split.pop()?.replaceAll(' ', '_');
    return name != undefined ? name.replaceAll('#', '') : '';
  }

}
