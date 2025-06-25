import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAtencionTotalRequest } from '../../../../interfaces/asuntoPorAtencion.interface';
import { CardsInfoBandejadeAtencionService } from '../../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAsigacionResponseTotal } from './../../../../interfaces/asuntoPorAtencionResponse.interface';
import { BuscadorService } from '../../../../shared/services/buscador.service';
import { Observable } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-finalizado',
  standalone: true,
  imports: [RouterModule, MatIconModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './finalizado-page.component.html'
})
export class FinalizadoComponent implements OnInit {


  tableRequest: AsuntoPorAtencionTotalRequest = {
    atencion: "TOTAL",
    documento: "REQUERIMIENTO",
  }

  tableResponse: AsuntoPorAsigacionResponseTotal[] = [];


  //#region paginador
  pages: AsuntoPorAsigacionResponseTotal[][] = []
  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion


  constructor(
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseTotal>
  ) { }

  ngOnInit(): void {
    this.tableTotal();
  }

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }

  filterIndicador = (item: AsuntoPorAsigacionResponseTotal, term: string): boolean => {
    return item.folio_interno?.toLocaleLowerCase().includes(term.toLocaleLowerCase())
  }

  asignarIndicador: Observable<AsuntoPorAsigacionResponseTotal[]> = new Observable;
  searchText: string = '';
  filteredData$: Observable<AsuntoPorAsigacionResponseTotal[]> = this.buscadorService.getFilteredData(this.filterIndicador);
  allData: AsuntoPorAsigacionResponseTotal[] = []

  tableTotal() {
    this.cards.totalTableCard(this.tableRequest).subscribe(res => {
      // this.tableResponse=res;
      this.allData = res;
      this.buscadorService.setData(this.allData)

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

    })
  }

  // Obtener elementos para la página actual
  get asuntosPaginados(): AsuntoPorAsigacionResponseTotal[] {
    const inicio = (this.pageSelected - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.allData.slice(inicio, fin);
  }

  // Exportar a Excel
  exportarExcel() {
    this.cards.descargarExcelTotal(this.tableRequest);
  }

}
