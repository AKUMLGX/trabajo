import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { RouterModule } from '@angular/router';

// Interface para Asuntos Parciales
interface AsuntoParcial {
  id: number;
  folio: string;
  tipoFolio: string;
  status: string;
  fechaRecepcion: string;
  dictaminador: string;
  autoridad: string;
  observaciones: string;
  porcentajeAvance: number;
  fechaLimite: string;
  personaRelacionada: string;
}

@Component({
  selector: 'app-parcial-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './parcial-page.component.html'
})
export class ParcialPageComponent implements OnInit {
  // Año actual y filtro
  anioActual: number = new Date().getFullYear();
  anioFiltro: string = 'todos';
  Math = Math; // Hacer disponible Math en el template
  
  // Filtros
  filtroFolio: string = '';
  filtroDictaminador: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroPersonaRelacionada: string = '';
  
  // Datos de asuntos (simulados, se reemplazarían por datos reales de un servicio)
  asuntos: AsuntoParcial[] = [];
  asuntosFiltrados: AsuntoParcial[] = [];
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 0;
  asuntosPaginados: AsuntoParcial[] = [];
  rangoElementosMostrados: string = '';
  
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
      'Revisión parcial completada', 
      'Esperando documentación complementaria', 
      'Avance en análisis legal', 
      'Pendiente de información fiscal',
      'Revisión de anexos en proceso',
      'Consulta a otra área en trámite'
    ];
    
    const personasRelacionadas = [
      'Juan Pérez', 'María González', 'Roberto Martínez', 'Laura López', 
      'Carlos Rodríguez', 'Patricia Fernández', 'Miguel Ángel Sánchez',
      'Sofía Torres', 'Ricardo Ramírez', 'Diana Hernández'
    ];
    
    // Generar 45 asuntos de ejemplo
    for (let i = 1; i <= 45; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 45));
      
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + Math.floor(Math.random() * 20) + 10);
      
      this.asuntos.push({
        id: i,
        folio: `AP-${this.anioActual}-${i.toString().padStart(4, '0')}`,
        tipoFolio: Math.random() > 0.5 ? 'Recurso de Revocación' : 'Juicio de Nulidad',
        status: 'Parcial',
        fechaRecepcion: fecha.toISOString().split('T')[0],
        dictaminador: dictaminadores[Math.floor(Math.random() * dictaminadores.length)],
        autoridad: autoridades[Math.floor(Math.random() * autoridades.length)],
        observaciones: observaciones[Math.floor(Math.random() * observaciones.length)],
        porcentajeAvance: Math.floor(Math.random() * 70) + 20, // Entre 20% y 90%
        fechaLimite: fechaLimite.toISOString().split('T')[0],
        personaRelacionada: personasRelacionadas[Math.floor(Math.random() * personasRelacionadas.length)]
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
    const personaRelacionadaNormalizada = this.normalizarTexto(this.filtroPersonaRelacionada);
    
    this.asuntosFiltrados = this.asuntos.filter(asunto => {
      // Filtro por año
      const coincideAnio = this.anioFiltro === 'todos' || 
        asunto.folio.includes(this.anioFiltro);
      
      // Filtro por folio
      const coincideFolio = folioNormalizado === '' || 
        this.normalizarTexto(asunto.folio).includes(folioNormalizado);
      
      // Filtro por dictaminador
      const coincideDictaminador = dictaminadorNormalizado === '' || 
        this.normalizarTexto(asunto.dictaminador).includes(dictaminadorNormalizado);
      
      // Filtro por persona relacionada
      const coincidePersonaRelacionada = personaRelacionadaNormalizada === '' || 
        this.normalizarTexto(asunto.personaRelacionada).includes(personaRelacionadaNormalizada);
      
      // Filtro por fecha de recepción (desde)
      const coincideFechaInicio = this.filtroFechaInicio === '' || 
        asunto.fechaRecepcion >= this.filtroFechaInicio;
      
      // Filtro por fecha de recepción (hasta)
      const coincideFechaFin = this.filtroFechaFin === '' || 
        asunto.fechaRecepcion <= this.filtroFechaFin;
      
      // Aplicar todos los filtros
      return coincideAnio && coincideFolio && coincideDictaminador && 
             coincidePersonaRelacionada && coincideFechaInicio && coincideFechaFin;
    });
    
    // Resetear a la primera página
    this.paginaActual = 1;
    
    // Recalcular paginación
    this.calcularPaginacion();
  }
  
  // Limpiar todos los filtros
  limpiarFiltros(): void {
    this.anioFiltro = 'todos';
    this.filtroFolio = '';
    this.filtroDictaminador = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroPersonaRelacionada = '';
    
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
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    // Ajustar el inicio si no hay suficientes páginas al final
    inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
  
  // Obtener la clase CSS para la barra de progreso según el porcentaje
  getClaseProgreso(porcentaje: number): string {
    if (porcentaje < 40) return 'bg-red-500';
    if (porcentaje < 70) return 'bg-yellow-500';
    return 'bg-green-500';
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
        'Persona Relacionada': asunto.personaRelacionada,
        Autoridad: asunto.autoridad,
        'Porcentaje Avance': `${asunto.porcentajeAvance}%`,
        Observaciones: asunto.observaciones,
        'Fecha Límite': asunto.fechaLimite
      };
    });
    
    // Crear libro de Excel
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(libro, hoja, 'Asuntos Parciales');
    
    // Generar archivo Excel
    const nombreArchivo = `Asuntos_Parciales_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(libro, nombreArchivo);
  }
} 