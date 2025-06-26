import { Observable, of } from 'rxjs';
import { AsuntoPorAtencionParcialRequest } from './../../../interfaces/asuntoPorAtencion.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAsigacionResponseParcial } from '../../../interfaces/asuntoPorAtencionResponse.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-parcial-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule,],
  templateUrl: './parcial-detalle.component.html',
  styleUrls: ['./parcial-detalle.component.css']
})
export class ParcialDetalleComponent implements OnInit {

  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalAsuntos: number = 20;

  tableparcialRequest: AsuntoPorAtencionParcialRequest = {
    atencion: "PARCIAL",
    documento: "REQUERIMIENTO",
  }
  tableParcialResponse: AsuntoPorAsigacionResponseParcial[] = [];

  //#region paginador
  pages: AsuntoPorAsigacionResponseParcial[][] = []
  itemsPerPage: number = 5
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseParcial>) { }

  ngOnInit(): void {
    this.tablePracial()
  }

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }

  filtrarIndicador = (item: AsuntoPorAsigacionResponseParcial, term: string): boolean => {
    return item.folio_interno?.toLowerCase().includes(term.toLocaleLowerCase());
  };


  asignarIndicador: Observable<AsuntoPorAsigacionResponseParcial[]> = new Observable

  searchText: string = '';
  filteredData$: Observable<AsuntoPorAsigacionResponseParcial[]> = this.buscadorService.getFilteredData(this.filtrarIndicador);
  allData: AsuntoPorAsigacionResponseParcial[] = [];

  tablePracial() {
    this.cards.parcialTableCard(this.tableparcialRequest).subscribe(res => {
      // this.tableParcialResponse=res
      this.allData = res;
      this.buscadorService.setData(this.allData)

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
              })
              if (page.length !== 0) this.pages.push(page)
    })
  }

  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  // Métodos para descargar Excel
  descargarExcel() {
    this.cards.descargarExcelParcial(this.tableparcialRequest)
  }
}
