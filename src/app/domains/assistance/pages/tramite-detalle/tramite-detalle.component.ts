import { AsuntoPorAsigacionResponseEnTramite } from './../../../interfaces/asuntoPorAtencionResponse.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAtencionEnTramiteRequest } from '../../../interfaces/asuntoPorAtencion.interface';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable, of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,NgxPaginationModule,],
  templateUrl: './tramite-detalle.component.html',
  styleUrls: ['./tramite-detalle.component.css']
})
export class TramiteDetalleComponent implements OnInit {

  //#region paginador
   pages: AsuntoPorAsigacionResponseEnTramite[][] = []
  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  tableRequest: AsuntoPorAtencionEnTramiteRequest={
    atencion:"EN TRAMITE",
    documento:"REQUERIMIENTO",
  }
  tableResponse: AsuntoPorAsigacionResponseEnTramite[]=[];

  constructor(private router: Router,
     private cards:CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseEnTramite>
   ) {}

  ngOnInit(): void {
     this.tableEnTramite()
     }

  tableEnTramite(){
  this.cards.enTramiteTableCard(this.tableRequest).subscribe(res=>{
    // this.tableResponse = res;
    this.allData=res
    this.buscadorService.setData(this.allData)

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
    })
  }
  onDearchChange(value:string){
    this.buscadorService.setSearchTerm(value)
  }

  filterIndicador=(item:AsuntoPorAsigacionResponseEnTramite, term:string):boolean=>{
    return item.folio_interno?.toLocaleLowerCase().includes(term.toLocaleLowerCase())
  }

  asignarIndicador : Observable<AsuntoPorAsigacionResponseEnTramite[]>= new Observable;

  searchText:string='';
  // result$: Observable<string[]> = of ([]);
  filteredData$: Observable<AsuntoPorAsigacionResponseEnTramite[]> = this.buscadorService.getFilteredData(this.filterIndicador) ;
  allData: AsuntoPorAsigacionResponseEnTramite[]=[]

  // Navegación
  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  // Exportar a Excel
  descargarExcel(): void {
    this.cards.descargarExcelEnTramite(this.tableRequest)
  }
}
