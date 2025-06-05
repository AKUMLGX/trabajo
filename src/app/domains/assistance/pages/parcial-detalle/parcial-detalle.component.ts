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

interface Asunto {
  id: string;
  ci: string;
  oficio: string;
  documento: string;
  fecha: string;
  dias: number;
  personaRelacionada: string;
}

@Component({
  selector: 'app-parcial-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './parcial-detalle.component.html',
  styleUrls: ['./parcial-detalle.component.css']
})
export class ParcialDetalleComponent implements OnInit {
  anioActual: number = new Date().getFullYear();
  anioSeleccionado: string = 'Todos los años';
  asuntos: Asunto[] = [];
  asuntosFiltrados: Asunto[] = [];
  asuntoSeleccionado: Asunto | null = null;
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalAsuntos: number = 20;

  tableparcialRequest: AsuntoPorAtencionParcialRequest={
     atencion:"PARCIAL",
    documento:"REQUERIMIENTO",
  }
  tableParcialResponse: AsuntoPorAsigacionResponseParcial[]=[];


  // Nuevos filtros
  filtroFolio: string = '';
  filtroCarpeta: string = '';
  filtroOficio: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  // Propiedades para usar en el template
  Math = Math;

  constructor(private router: Router,
     private cards:CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseParcial>) {}

  ngOnInit(): void {
    this.tablePracial()
  }

  onDearchChange(value:string){
    this.buscadorService.setSearchTerm(value)
  }

  filtrarIndicador = (item:AsuntoPorAsigacionResponseParcial, term: string): boolean => {
    return item.folio_interno?.toLowerCase().includes(term.toLocaleLowerCase());
    };


   asignarIndicador : Observable<AsuntoPorAsigacionResponseParcial[]>= new Observable

 searchText: string = '';
  // results$: Observable<string[]> = of([]);
 filteredData$: Observable<AsuntoPorAsigacionResponseParcial[]> = this.buscadorService.getFilteredData(this.filtrarIndicador);
 allData: AsuntoPorAsigacionResponseParcial[] = [];

  tablePracial(){
    this.cards.parcialTableCard(this.tableparcialRequest).subscribe(res=>{
      // this.tableParcialResponse=res
      this.allData = res;
      this.buscadorService.setData(this.allData)
    })
  }


  filtrarPorAnio(anio: string): void {
    this.anioSeleccionado = anio;
    this.filtrarAsuntos();
  }

  limpiarFiltros(): void {
    this.anioSeleccionado = 'Todos los años';
    this.filtroFolio = '';
    this.filtroCarpeta = '';
    this.filtroOficio = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtrarAsuntos();
  }

  // Normalizar texto para búsquedas (quita acentos y convierte a minúsculas)
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  filtrarAsuntos(): void {
    // Normalizar términos de búsqueda
    const folioNormalizado = this.normalizarTexto(this.filtroFolio);
    const carpetaNormalizada = this.normalizarTexto(this.filtroCarpeta);
    const oficioNormalizado = this.normalizarTexto(this.filtroOficio);

    // Convertir fechas a formato comparable si existen
    let fechaInicio = this.filtroFechaInicio ? this.convertirFechaParaComparar(this.filtroFechaInicio) : null;
    let fechaFin = this.filtroFechaFin ? this.convertirFechaParaComparar(this.filtroFechaFin) : null;

    this.asuntosFiltrados = this.asuntos.filter(asunto => {
      // Filtro por año seleccionado
      let coincideAnio = true;
      if (this.anioSeleccionado !== 'Todos los años') {
        const fechaPartes = asunto.fecha.split('/');
        const anioAsunto = parseInt(fechaPartes[2]);
        coincideAnio = anioAsunto === parseInt(this.anioSeleccionado);
      }

      // Filtro por folio interno
      const coincideFolio = folioNormalizado === '' ||
                           this.normalizarTexto(asunto.id).includes(folioNormalizado);

      // Filtro por carpeta de investigación
      const coincideCarpeta = carpetaNormalizada === '' ||
                             this.normalizarTexto(asunto.ci).includes(carpetaNormalizada);

      // Filtro por oficio
      const coincideOficio = oficioNormalizado === '' ||
                            this.normalizarTexto(asunto.oficio).includes(oficioNormalizado);

      // Filtro por fecha
      let coincideFecha = true;
      if (fechaInicio || fechaFin) {
        const fechaAsunto = this.convertirFechaParaComparar(asunto.fecha);
        if (fechaInicio && fechaFin) {
          coincideFecha = fechaAsunto >= fechaInicio && fechaAsunto <= fechaFin;
        } else if (fechaInicio) {
          coincideFecha = fechaAsunto >= fechaInicio;
        } else if (fechaFin) {
          coincideFecha = fechaAsunto <= fechaFin;
        }
      }

      // Aplicar todos los filtros en conjunto
      return coincideAnio && coincideFolio && coincideCarpeta && coincideOficio && coincideFecha;
    });

    this.totalAsuntos = this.asuntosFiltrados.length;
    this.paginaActual = 1;
  }

  // Convierte una fecha en formato dd/mm/yyyy a un objeto Date para comparar
  convertirFechaParaComparar(fecha: string): Date {
    // Si el formato es dd/mm/yyyy
    if (fecha.includes('/')) {
      const partes = fecha.split('/');
      return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    }
    // Si el formato es yyyy-mm-dd (desde input type="date")
    else if (fecha.includes('-')) {
      return new Date(fecha);
    }
    return new Date();
  }

  // Métodos para la tabla
  seleccionarFila(id: string): void {
    this.asuntoSeleccionado = this.asuntos.find(a => a.id === id) || null;
  }

  revisarAsunto(id: string, event: Event): void {
    event.stopPropagation();
    console.log('Revisar asunto parcial:', id);
    // Navegar a la página de detalle del asunto parcial con el ID como parámetro
    this.router.navigate([`/layout/asunto-parcial/${id}`]);
  }

  // Navegación
  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  // Métodos para la paginación
  cambiarPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.paginaActual = pagina;
    } else if (pagina === 'anterior' && this.paginaActual > 1) {
      this.paginaActual--;
    } else if (pagina === 'siguiente' && this.paginaActual < Math.ceil(this.totalAsuntos / this.itemsPorPagina)) {
      this.paginaActual++;
    }
  }

  // Métodos para descargar Excel
  descargarExcel() {
    this.cards.descargarExcelParcial(this.tableparcialRequest)
  }
}
