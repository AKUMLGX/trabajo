import { AsuntoPorAsigacionResponseTotal } from './../../../../interfaces/asuntoPorAtencionResponse.interface';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { AsuntoPorAtencionTotalRequest } from '../../../../interfaces/asuntoPorAtencion.interface';
import { CardsInfoBandejadeAtencionService } from '../../../../services/cards-info-bandejade-atencion.service';

interface AsuntoFinalizado {
  folio: string;
  tipoRespuesta: string;
  documento: string;
  fechaFinalizacion: string;
  dictaminador: string;
  autoridad: string;
  observaciones: string;
}

@Component({
  selector: 'app-finalizado',
  standalone: true,
  imports: [RouterModule, MatIconModule, CommonModule, FormsModule],
  templateUrl: './finalizado-page.component.html'
})
export class FinalizadoComponent implements OnInit {
  // Datos de la tabla
  asuntos: AsuntoFinalizado[] = [
    {
      folio: 'EUACAPE/01',
      tipoRespuesta: 'Requerimiento',
      documento: 'Documento de Respuesta',
      fechaFinalizacion: '10/04/2024',
      dictaminador: 'María Hernández',
      autoridad: 'Servicio de Administración Tributaria',
      observaciones: 'Finalizado con requerimiento de información adicional'
    },
    {
      folio: 'EUACAPE/02',
      tipoRespuesta: 'Requerimiento',
      documento: 'Solicitud de Documentos',
      fechaFinalizacion: '08/04/2024',
      dictaminador: 'Juan Rodríguez',
      autoridad: 'Secretaría de Finanzas',
      observaciones: 'Pendiente de respuesta del contribuyente'
    },
    {
      folio: 'EUACAPE/03',
      tipoRespuesta: 'Requerimiento',
      documento: 'Notificación',
      fechaFinalizacion: '05/04/2024',
      dictaminador: 'Carlos Sánchez',
      autoridad: 'Procuraduría Fiscal',
      observaciones: 'Finalizado con observaciones'
    },
    {
      folio: 'EUACAPE/04',
      tipoRespuesta: 'Respuesta Completa',
      documento: 'Dictamen',
      fechaFinalizacion: '04/04/2024',
      dictaminador: 'Ana González',
      autoridad: 'Servicio de Administración Tributaria',
      observaciones: 'Finalizado satisfactoriamente'
    },
    {
      folio: 'EUACAPE/05',
      tipoRespuesta: 'Respuesta Parcial',
      documento: 'Dictamen Parcial',
      fechaFinalizacion: '03/04/2024',
      dictaminador: 'Luis Torres',
      autoridad: 'Unidad de Inteligencia Financiera',
      observaciones: 'Pendiente de resolución final'
    },
    {
      folio: 'EUACAPE/06',
      tipoRespuesta: 'Respuesta Completa',
      documento: 'Oficio de Respuesta',
      fechaFinalizacion: '01/04/2024',
      dictaminador: 'María Hernández',
      autoridad: 'Comisión Nacional Bancaria',
      observaciones: 'Finalizado con observaciones menores'
    },
    {
      folio: 'EUACAPE/07',
      tipoRespuesta: 'Desechado',
      documento: 'Notificación de Rechazo',
      fechaFinalizacion: '30/03/2024',
      dictaminador: 'Juan Rodríguez',
      autoridad: 'Secretaría de Hacienda',
      observaciones: 'Desechado por falta de información'
    },
    {
      folio: 'EUACAPE/08',
      tipoRespuesta: 'Respuesta Completa',
      documento: 'Oficio de Resolución',
      fechaFinalizacion: '28/03/2024',
      dictaminador: 'Carlos Sánchez',
      autoridad: 'Instituto Fiscal',
      observaciones: 'Finalizado correctamente'
    }
  ];

  // Lista de dictaminadores para el filtro
  dictaminadores: string[] = [
    'Todos',
    'María Hernández',
    'Juan Rodríguez',
    'Carlos Sánchez',
    'Ana González',
    'Luis Torres'
  ];

  // Asuntos filtrados para mostrar en la tabla
  asuntosFiltrados: AsuntoFinalizado[] = [];

    tableRequest: AsuntoPorAtencionTotalRequest={
      atencion:"TOTAL",
      documento:"REQUERIMIENTO",
    }
    tableResponse: AsuntoPorAsigacionResponseTotal[]=[];

  // Filtros
  filtroFolio: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroDictaminador: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;
  totalPaginas: number = 1;

  constructor(private cards:CardsInfoBandejadeAtencionService) {}

  ngOnInit(): void {
    // Inicializar tabla con todos los datos, sin filtros aplicados
    this.asuntosFiltrados = [...this.asuntos];
    this.calcularPaginacion();
    this.tableTotal();
  }

tableTotal(){
  this.cards.totalTableCard(this.tableRequest).subscribe(res=>{
    this.tableResponse=res;
    console.log(this.tableResponse);

  })
}


  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  normalizarTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .normalize('NFD') // Normalización Unicode (descompone los caracteres acentuados)
      .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos, diéresis, etc.)
  }

  // Formatear fecha a YYYY-MM-DD para inputs date
  formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  // Convertir fecha de DD/MM/YYYY a objeto Date
  parsearFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  // Aplicar filtros a la tabla
  aplicarFiltros(): void {
    console.log('Aplicando filtros...');
    console.log('Folio:', this.filtroFolio);
    console.log('Persona relacionada:', this.filtroDictaminador);
    console.log('Fecha inicio:', this.filtroFechaInicio);
    console.log('Fecha fin:', this.filtroFechaFin);

    // Empezar con todos los asuntos
    let resultados = [...this.asuntos];

    // Filtrar por folio (búsqueda parcial, insensible a mayúsculas/minúsculas y acentos)
    if (this.filtroFolio && this.filtroFolio.trim() !== '') {
      const folioNormalizado = this.normalizarTexto(this.filtroFolio);
      console.log('Folio normalizado:', folioNormalizado);

      resultados = resultados.filter(asunto => {
        const asuntoFolioNormalizado = this.normalizarTexto(asunto.folio);
        const incluye = asuntoFolioNormalizado.includes(folioNormalizado);
        console.log(`Asunto ${asunto.folio} => ${asuntoFolioNormalizado} incluye ${folioNormalizado}? ${incluye}`);
        return incluye;
      });
    }

    // Filtrar por persona relacionada (búsqueda parcial, insensible a mayúsculas/minúsculas y acentos)
    if (this.filtroDictaminador && this.filtroDictaminador.trim() !== '') {
      const dictaminadorNormalizado = this.normalizarTexto(this.filtroDictaminador);
      console.log('Dictaminador normalizado:', dictaminadorNormalizado);

      resultados = resultados.filter(asunto => {
        const asuntoDictaminadorNormalizado = this.normalizarTexto(asunto.dictaminador);
        const incluye = asuntoDictaminadorNormalizado.includes(dictaminadorNormalizado);
        console.log(`Asunto ${asunto.folio} dictaminador ${asunto.dictaminador} => ${asuntoDictaminadorNormalizado} incluye ${dictaminadorNormalizado}? ${incluye}`);
        return incluye;
      });
    }

    // Filtrar por rango de fechas (solo si ambas fechas están definidas)
    if (this.filtroFechaInicio && this.filtroFechaFin) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      const fechaFin = new Date(this.filtroFechaFin);

      // Ajustar fecha fin para incluir todo el día
      fechaFin.setHours(23, 59, 59);

      console.log('Fecha inicio:', fechaInicio);
      console.log('Fecha fin:', fechaFin);

      resultados = resultados.filter(asunto => {
        try {
          const fechaAsunto = this.parsearFecha(asunto.fechaFinalizacion);
          const cumpleFecha = fechaAsunto >= fechaInicio && fechaAsunto <= fechaFin;
          console.log(`Asunto ${asunto.folio} fecha ${asunto.fechaFinalizacion} => ${fechaAsunto} está entre ${fechaInicio} y ${fechaFin}? ${cumpleFecha}`);
          return cumpleFecha;
        } catch (error) {
          console.error(`Error al parsear fecha ${asunto.fechaFinalizacion}:`, error);
          return false;
        }
      });
    }

    console.log('Resultados finales:', resultados.length);
    this.asuntosFiltrados = resultados;
    this.calcularPaginacion();
    this.paginaActual = 1; // Resetear a la primera página cuando se filtran resultados
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroFolio = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroDictaminador = '';

    this.asuntosFiltrados = [...this.asuntos];
    this.calcularPaginacion();
    this.paginaActual = 1;
  }

  // Calcular paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asuntosFiltrados.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }
  }

  // Obtener elementos para la página actual
  get asuntosPaginados(): AsuntoFinalizado[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asuntosFiltrados.slice(inicio, fin);
  }

  // Cambiar página
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Exportar a Excel
  exportarExcel() {
   this.cards.descargarExcelTotal(this.tableRequest);
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
