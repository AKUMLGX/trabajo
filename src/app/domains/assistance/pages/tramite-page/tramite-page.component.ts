import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { MatIconModule } from '@angular/material/icon'; 
import { RouterModule } from '@angular/router';

// Interface para Asuntos En Trámite
interface AsuntoTramite {
  id: number;
  folio: string;
  tipoFolio: string;
  status: string;
  fechaRecepcion: string;
  dictaminador: string;
  autoridad: string;
  observaciones: string;
  fechaLimite: string;
}

@Component({
  selector: 'app-tramite-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './tramite-page.component.html'
})
export class TramitePageComponent implements OnInit {
  // Año actual
  anioActual: number = new Date().getFullYear();
  
  // Filtros
  filtroFolio = '';
  filtroDictaminador = '';
  filtroFechaInicio = '';
  filtroFechaFin = '';
  
  // Datos de asuntos (simulados, se reemplazarían por datos reales de un servicio)
  asuntos: AsuntoTramite[] = [];
  asuntosFiltrados: AsuntoTramite[] = [];
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 0;
  asuntosPaginados: AsuntoTramite[] = [];
  rangoElementosMostrados = '';
  
  constructor() { }
  
  ngOnInit(): void {
    // Inicializar datos de ejemplo
    this.inicializarDatosEjemplo();
    
    // Aplicar filtros iniciales
    this.asuntosFiltrados = [...this.asuntos];
    
    // Calcular paginación inicial
    this.calcularPaginacion();
  }
  
  // Método para inicializar datos de ejemplo
  inicializarDatosEjemplo(): void {
    const dictaminadores = [
      'Ana Torres', 'Carlos Mendoza', 'Elena Juárez', 'Felipe Gutiérrez', 
      'Gabriela Sánchez', 'Héctor Ramírez', 'Isabel García'
    ];
    
    const autoridades = [
      'SAT Central', 'Aduana CDMX', 'Secretaría de Hacienda', 
      'Administración Local', 'Aduana Marítima', 'Auditoría Fiscal'
    ];
    
    const observaciones = [
      'Pendiente de documentación adicional', 
      'En espera de respuesta del contribuyente', 
      'Requiere análisis detallado', 
      'En proceso de revisión por el área técnica',
      'Esperando información de otra administración',
      'Nueva información recibida, en revisión'
    ];
    
    // Generar 50 asuntos de ejemplo
    for (let i = 1; i <= 50; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));
      
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + Math.floor(Math.random() * 15) + 5);
      
      this.asuntos.push({
        id: i,
        folio: `ET-${this.anioActual}-${i.toString().padStart(4, '0')}`,
        tipoFolio: Math.random() > 0.5 ? 'Recurso de Revocación' : 'Juicio de Nulidad',
        status: 'En Trámite',
        fechaRecepcion: fecha.toISOString().split('T')[0],
        dictaminador: dictaminadores[Math.floor(Math.random() * dictaminadores.length)],
        autoridad: autoridades[Math.floor(Math.random() * autoridades.length)],
        observaciones: observaciones[Math.floor(Math.random() * observaciones.length)],
        fechaLimite: fechaLimite.toISOString().split('T')[0]
      });
    }
  }
  
  // Normalizar texto para búsquedas (elimina tildes y convierte a minúsculas)
  normalizarTexto(texto: string): string {
    return texto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  // Aplicar filtros
  aplicarFiltros(): void {
    const folioNormalizado = this.normalizarTexto(this.filtroFolio);
    const dictaminadorNormalizado = this.normalizarTexto(this.filtroDictaminador);
    
    this.asuntosFiltrados = this.asuntos.filter(asunto => {
      // Filtro por folio
      const coincideFolio = folioNormalizado === '' || 
        this.normalizarTexto(asunto.folio).includes(folioNormalizado);
      
      // Filtro por dictaminador
      const coincideDictaminador = dictaminadorNormalizado === '' || 
        this.normalizarTexto(asunto.dictaminador).includes(dictaminadorNormalizado);
      
      // Filtro por fecha de recepción (desde)
      const coincideFechaInicio = this.filtroFechaInicio === '' || 
        asunto.fechaRecepcion >= this.filtroFechaInicio;
      
      // Filtro por fecha de recepción (hasta)
      const coincideFechaFin = this.filtroFechaFin === '' || 
        asunto.fechaRecepcion <= this.filtroFechaFin;
      
      // Aplicar todos los filtros
      return coincideFolio && coincideDictaminador && coincideFechaInicio && coincideFechaFin;
    });
    
    // Resetear a la primera página
    this.paginaActual = 1;
    
    // Recalcular paginación
    this.calcularPaginacion();
  }
  
  // Limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtroFolio = '';
    this.filtroDictaminador = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    
    // Restaurar todos los asuntos
    this.asuntosFiltrados = [...this.asuntos];
    
    // Resetear a la primera página
    this.paginaActual = 1;
    
    // Recalcular paginación
    this.calcularPaginacion();
  }
  
  // Cálculo de la paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asuntosFiltrados.length / +this.elementosPorPagina);
    
    if (this.totalPaginas === 0) {
      this.totalPaginas = 1;
    }
    
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }
    
    const inicio = (this.paginaActual - 1) * +this.elementosPorPagina;
    const fin = Math.min(inicio + +this.elementosPorPagina, this.asuntosFiltrados.length);
    
    this.asuntosPaginados = this.asuntosFiltrados.slice(inicio, fin);
    
    // Actualizar texto de rango mostrado
    if (this.asuntosFiltrados.length === 0) {
      this.rangoElementosMostrados = 'No hay elementos para mostrar';
    } else {
      this.rangoElementosMostrados = `Mostrando ${inicio + 1} a ${fin} de ${this.asuntosFiltrados.length} elementos`;
    }
  }
  
  // Cambiar página
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.calcularPaginacion();
    }
  }
  
  // Obtener las páginas visibles para la paginación
  getPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    const fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    // Ajustar el inicio si no hay suficientes páginas al final
    inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
  
  // Exportar a Excel
  exportarExcel(): void {
    // Preparar los datos para el Excel (solo los filtrados)
    const datosExcel = this.asuntosFiltrados.map(asunto => {
      return {
        Folio: asunto.folio,
        Tipo: asunto.tipoFolio,
        Status: asunto.status,
        'Fecha Recepción': asunto.fechaRecepcion,
        Dictaminador: asunto.dictaminador,
        Autoridad: asunto.autoridad,
        Observaciones: asunto.observaciones,
        'Fecha Límite': asunto.fechaLimite
      };
    });
    
    // Crear libro de Excel
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(libro, hoja, 'Asuntos En Trámite');
    
    // Generar archivo Excel
    const nombreArchivo = `Asuntos_En_Tramite_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(libro, nombreArchivo);
  }
}
