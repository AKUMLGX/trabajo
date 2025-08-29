import { ModalService } from './../../../shared/services/modal.service';
import { AsuntoPorAsigacionResponseEnTramite, AsuntoReponseEnTramite, AsuntoResponseParcial } from './../../../interfaces/asuntoPorAtencionResponse.interface';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAtencionEnTramiteRequest } from '../../../interfaces/asuntoPorAtencion.interface';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../../services/file.service';
import { MatDialog, } from '@angular/material/dialog';
import { PlazoPipe } from '../../../shared/components/plazo.pipe';

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule,
    PdfViewerComponent,
    MatIconModule,
    PlazoPipe,
  ],
  templateUrl: './tramite-detalle.component.html',
  styleUrls: ['./tramite-detalle.component.css']
})
export class TramiteDetalleComponent implements OnInit {




  tableResponse: AsuntoPorAsigacionResponseEnTramite[] = [];

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseEnTramite>,
    private ModalService: ModalService,
    private fileService: FileService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.tableEnTramite()
  }

  //#region Request Table (Payload)
  tableRequest: AsuntoPorAtencionEnTramiteRequest = {
    atencion: "EN TRAMITE",
    documento: "REQUERIMIENTO",
  }
  //#endregion

  //#region Response Table
  allData: AsuntoPorAsigacionResponseEnTramite[] = []
  //#endregion

  //#region paginador
  pages: AsuntoPorAsigacionResponseEnTramite[][] = []
  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  //#region Table
  tableEnTramite() {
    this.cards.enTramiteTableCard(this.tableRequest).subscribe({
      next: (res: AsuntoResponseParcial[]) => {
        this.allData = res.map(item => item.asunto.datos);
        this.buscadorService.setDataMul(this.allData);
        this.updateSearch();

        let indexPage = 0;
        let page: AsuntoPorAsigacionResponseEnTramite[] = [];
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

  //#region  buscador
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

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }

  filterIndicador = (item: AsuntoPorAsigacionResponseEnTramite, terms: Record<string, string>): boolean => {
    const matchOficio = !terms['oficio'] || item.oficio?.toLowerCase().includes(terms['oficio'].toLowerCase());
    const matchCarpeta = !terms['carpeta'] || item.carpeta_investigacion?.toLowerCase().includes(terms['carpeta'].toLowerCase())
    const matchFolio = !terms['autoridad_remitente'] || item.autoridad_remitente?.toLowerCase().includes(terms['autoridad_remitente'].toLowerCase());
    const matchfolio_interno = !terms['folio'] || item.folio_interno?.toLowerCase().includes(terms['folio'].toLowerCase());
    const matchPersona = !terms['persona'] || item.persona_relacionada?.toLowerCase().includes(terms['persona'].toLowerCase())

    return matchFolio && matchOficio && matchPersona && matchfolio_interno && matchCarpeta;
  };

  filteredDataMul$: Observable<AsuntoPorAsigacionResponseEnTramite[]> = this.buscadorService.getFilteredDataMul(this.filterIndicador);


  //#endregion

  //#region Navegación
  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }
  //#endregion

  //#region descargar  Excel
  descargarExcel(): void {
    this.cards.descargarExcelEnTramite(this.tableRequest)
  }
  //#endregion


  //#region Visualizador PDF

  visualizarPdf: boolean = false;


  abrirModalPDF(template: TemplateRef<any>) {
    this.visualizarPdf = true
    this.ModalService.openCustomDialogWithTemplate({
      template
    })
  }

  openPdfViewer(folio: string, path: string) {
    const fileName = this.getFileName(path);
    if (folio == null) folio = "sinAsignar";
    this.fileService.updatePdfFileBandejaAtencion(folio.toString(), fileName)

  }

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

  cerrarVisualizadorPdf(): void {
    this.visualizarPdf = false;
    this.dialog.closeAll()

  }
  //#endregion
}
