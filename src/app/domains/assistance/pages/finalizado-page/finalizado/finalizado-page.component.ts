import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAtencionTotalRequest } from '../../../../interfaces/asuntoPorAtencion.interface';
import { CardsInfoBandejadeAtencionService } from '../../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAsigacionResponseTotal, AsuntoResponseTotal } from './../../../../interfaces/asuntoPorAtencionResponse.interface';
import { BuscadorService } from '../../../../shared/services/buscador.service';
import { Observable } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../../../shared/services/modal.service';
import { FileService } from '../../../../services/file.service';
import { PdfViewerComponent } from './../../../../components/pdf-viewer/pdf-viewer.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-finalizado',
    imports: [RouterModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        MatButtonModule,
        PdfViewerComponent,],
    templateUrl: './finalizado-page.component.html'
})
export class FinalizadoComponent implements OnInit {

  constructor(
    private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseTotal>,
    private modalService: ModalService,
    public dialog: MatDialog,
    private fileService: FileService,
  ) { }

  ngOnInit(): void {
    this.tableTotal();
  }


  //#region Request Table (Payload)
  tableRequest: AsuntoPorAtencionTotalRequest = {
    atencion: "TOTAL",
    documento: "REQUERIMIENTO",
  }
  //#endregion

  //#region Response Table
  allData: AsuntoPorAsigacionResponseTotal[] = []
  //#endregion

  //#region paginador
  pages: AsuntoPorAsigacionResponseTotal[][] = []
  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  //#region Table
  tableTotal() {
    this.cards.totalTableCard(this.tableRequest).subscribe({
      next: (resp: AsuntoResponseTotal[]) => {
        this.allData = resp.map(item => item.asunto.datos)
        this.buscadorService.setDataMul(this.allData)
        this.updateSearch();
        let indexPage = 0;
        let page: AsuntoPorAsigacionResponseTotal[] = [];
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
        })
        if (page.length !== 0) this.pages.push(page)

      }
    })
  }
  //#endregion

  //#region Buscadores

  searchTextNoOficio: string = "";
  searchPersona_relacionada: string = '';
  searchAutoridad_remitente: string = '';
  searchfolio_interno: string = '';
  searchcarpeta_investigacion: string = '';

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

  filterIndicador = (item: AsuntoPorAsigacionResponseTotal, terms: Record<string, string>): boolean => {
    const matchOficio = !terms['oficio'] || item.oficio?.toLowerCase().includes(terms['oficio'].toLowerCase());
    const matchCarpeta = !terms['carpeta'] || item.carpeta_investigacion?.toLowerCase().includes(terms['carpeta'].toLowerCase())
    const matchFolio = !terms['autoridad_remitente'] || item.autoridad_remitente?.toLowerCase().includes(terms['autoridad_remitente'].toLowerCase());
    const matchfolio_interno = !terms['folio'] || item.folio_interno?.toLowerCase().includes(terms['folio'].toLowerCase());
    const matchPersona = !terms['persona'] || item.persona_relacionada?.toLowerCase().includes(terms['persona'].toLowerCase())

    return matchFolio && matchOficio && matchPersona && matchfolio_interno && matchCarpeta;
  };

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }


  filteredDataMul$: Observable<AsuntoPorAsigacionResponseTotal[]> = this.buscadorService.getFilteredDataMul(this.filterIndicador);

  //#endregion

  //#region descargar  Excel
  descargarExcel() {
    this.cards.descargarExcelTotal(this.tableRequest);
  }
  //#endregion

  //#region Visualizador PDF
  visualizarPdf: boolean = false;

  openPdfViewer(folio: string, path: string) {
    const fileName = this.getFileName(path)
    if (folio == null) folio = "sinAsignar";
    this.fileService.updatePdfFileBandejaAtencion(folio.toString(), fileName)
  }

  abrirModalPDF(template: TemplateRef<any>) {
    this.visualizarPdf = true
    this.modalService.openCustomDialogWithTemplate({
      template
    })
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

  //#region Navegación
  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }
  //#endregion

}
