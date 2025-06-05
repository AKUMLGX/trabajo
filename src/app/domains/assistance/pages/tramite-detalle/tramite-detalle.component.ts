import { AsuntoPorAsigacionResponseEnTramite } from './../../../interfaces/asuntoPorAtencionResponse.interface';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAtencionEnTramiteRequest } from '../../../interfaces/asuntoPorAtencion.interface';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable, of } from 'rxjs';

interface Asunto {
  id: string;
  ci: string;
  oficio: string;
  tramite: string;
  fecha: string;
  dias: number;
  dictaminador?: string;
}

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tramite-detalle.component.html',
  styleUrls: ['./tramite-detalle.component.css']
})
export class TramiteDetalleComponent implements OnInit {
  anioActual: number = new Date().getFullYear();
  anioSeleccionado: string = 'Todos los años';
  asuntos: Asunto[] = [];
  asuntosFiltrados: Asunto[] = [];
  asuntoSeleccionado: Asunto | null = null;
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalAsuntos: number = 18;

  // Nuevos filtros
  filtroFolio: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroDictaminador: string = '';

  // Lista de dictaminadores para el filtro
  dictaminadores: string[] = [
    'Todos',
    'María Hernández',
    'Juan Rodríguez',
    'Carlos Sánchez',
    'Ana González',
    'Luis Torres'
  ];

  // Variables para el visor de PDF
  mostrarPDFViewer: boolean = false;
  pdfCargando: boolean = false;
  pdfUrl: string | null = null;
  pdfTitulo: string = '';
  paginaPDF: number = 1;
  zoom: number = 1;

  // Propiedades para usar en el template
  Math = Math;

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
    this.filtrarAsuntos();
     this.tableEnTramite()
     }

  tableEnTramite(){
  this.cards.enTramiteTableCard(this.tableRequest).subscribe(res=>{
    // this.tableResponse = res;
    this.allData=res
    this.buscadorService.setData(this.allData)
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

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  normalizarTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .normalize('NFD') // Normalización Unicode (descompone los caracteres acentuados)
      .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos, diéresis, etc.)
  }

  // Convertir fecha de DD/MM/YYYY a objeto Date
  parsearFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  filtrarPorAnio(anio: string): void {
    this.anioSeleccionado = anio;
    this.filtrarAsuntos();
  }

  filtrarAsuntos(): void {
    // Empezar con todos los asuntos
    let resultados = [...this.asuntos];

    // Filtrar por año si no es "Todos los años"
    if (this.anioSeleccionado !== 'Todos los años') {
      const anio = parseInt(this.anioSeleccionado);
      resultados = resultados.filter(asunto => {
        const fechaPartes = asunto.fecha.split('/');
        const anioAsunto = parseInt(fechaPartes[2]);
        return anioAsunto === anio;
      });
    }

    // Filtrar por folio (búsqueda parcial, insensible a mayúsculas/minúsculas y acentos)
    if (this.filtroFolio && this.filtroFolio.trim() !== '') {
      const folioNormalizado = this.normalizarTexto(this.filtroFolio);

      resultados = resultados.filter(asunto => {
        const asuntoFolioNormalizado = this.normalizarTexto(asunto.id);
        return asuntoFolioNormalizado.includes(folioNormalizado);
      });
    }

    // Filtrar por dictaminador (búsqueda parcial, insensible a mayúsculas/minúsculas y acentos)
    if (this.filtroDictaminador && this.filtroDictaminador.trim() !== '') {
      const dictaminadorNormalizado = this.normalizarTexto(this.filtroDictaminador);

      resultados = resultados.filter(asunto => {
        if (!asunto.dictaminador) return false;

        const asuntoDictaminadorNormalizado = this.normalizarTexto(asunto.dictaminador);
        return asuntoDictaminadorNormalizado.includes(dictaminadorNormalizado);
      });
    }

    // Filtrar por rango de fechas (solo si ambas fechas están definidas)
    if (this.filtroFechaInicio && this.filtroFechaFin) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      const fechaFin = new Date(this.filtroFechaFin);

      // Ajustar fecha fin para incluir todo el día
      fechaFin.setHours(23, 59, 59);

      resultados = resultados.filter(asunto => {
        try {
          const fechaAsunto = this.parsearFecha(asunto.fecha);
          return fechaAsunto >= fechaInicio && fechaAsunto <= fechaFin;
        } catch (error) {
          console.error(`Error al parsear fecha ${asunto.fecha}:`, error);
          return false;
        }
      });
    }

    this.asuntosFiltrados = resultados;
    this.totalAsuntos = this.asuntosFiltrados.length;
    this.paginaActual = 1;
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroFolio = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroDictaminador = '';
    this.anioSeleccionado = 'Todos los años';

    this.asuntosFiltrados = [...this.asuntos];
    this.totalAsuntos = this.asuntosFiltrados.length;
    this.paginaActual = 1;
  }

  // Métodos para la tabla
  seleccionarFila(id: string): void {
    this.asuntoSeleccionado = this.asuntos.find(a => a.id === id) || null;
  }

  revisarAsunto(id: string, event: Event): void {
    event.stopPropagation();
    console.log('Revisar asunto:', id);
    // Navegar a la página de detalle del asunto con el ID como parámetro
    this.router.navigate([`/layout/asunto-detalle/${id}`]);
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

  // Exportar a Excel
  descargarExcel(): void {
    this.cards.descargarExcelEnTramite(this.tableRequest)
  }

  // Obtener el rango de elementos que se están mostrando
  get rangoElementosMostrados(): string {
    if (this.asuntosFiltrados.length === 0) {
      return '0 de 0';
    }

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(inicio + this.itemsPorPagina - 1, this.asuntosFiltrados.length);
    return `${inicio}-${fin} de ${this.asuntosFiltrados.length}`;
  }
}
