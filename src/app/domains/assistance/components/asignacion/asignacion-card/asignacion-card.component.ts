import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

interface AsuntoAsignable {
  id: number;
  folio: string;
  autoridad: string;
  fecha: string;
  estado: string;
  tipo: string;
  carpeta: string;
  urgencia: string;
  fechaLimite: string;
}

interface Dictaminador {
  id: number;
  nombre: string;
  carga: number;
  especialidad: string;
}

@Component({
  selector: 'app-asignacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-card.component.html',
  styleUrls: ['./asignacion-card.component.css']
})
export class AsignacionCardComponent implements OnInit {
  // Año actual para el título
  yearActual: number = new Date().getFullYear();

  // Filtros
  filtroFolio: string = '';
  filtroAutoridad: string = '';
  filtroEstado: string = '';
  filtroTipo: string = '';
  filtroUrgencia: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Lista de autoridades
  autoridades: string[] = [
    'Servicio de Administración Tributaria',
    'Secretaría de Hacienda y Crédito Público',
    'Procuraduría Fiscal',
    'Unidad de Inteligencia Financiera',
    'Comisión Nacional Bancaria',
    'Instituto Fiscal'
  ];

  // Lista de tipos de asunto
  tiposAsunto: string[] = [
    'Requerimiento',
    'Consulta',
    'Dictamen',
    'Investigación',
    'Verificación'
  ];

  // Lista de urgencias
  urgencias: string[] = [
    'Alta',
    'Media',
    'Baja'
  ];

  // Lista de dictaminadores
  dictaminadores: Dictaminador[] = [
    { id: 1, nombre: 'María Hernández', carga: 5, especialidad: 'Fiscal' },
    { id: 2, nombre: 'Juan Rodríguez', carga: 3, especialidad: 'Financiero' },
    { id: 3, nombre: 'Carlos Sánchez', carga: 7, especialidad: 'Internacional' },
    { id: 4, nombre: 'Ana González', carga: 2, especialidad: 'Fiscal' },
    { id: 5, nombre: 'Luis Torres', carga: 4, especialidad: 'Financiero' }
  ];

  // Estado del modal
  mostrarModalAsignacion: boolean = false;
  dictaminadorSeleccionado: string = '';
  asuntoSeleccionado: AsuntoAsignable | null = null;
  mostrarDetallePDF: boolean = false;
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  // Datos de ejemplo (130 asuntos)
  asuntos: AsuntoAsignable[] = [];

  // Lista filtrada de asuntos
  asuntosFiltrados: AsuntoAsignable[] = [];

  constructor(private router: Router) {
    this.generarDatosEjemplo();
  }

  ngOnInit(): void {
    this.aplicarFiltros();
    this.calcularPaginacion();
  }

  // Genera datos de ejemplo para la tabla
  generarDatosEjemplo(): void {
    const estados = ['pendiente', 'en_proceso', 'asignado'];
    const tipos = this.tiposAsunto;
    const autoridades = this.autoridades;
    const urgencias = this.urgencias;
    
    for (let i = 1; i <= 130; i++) {
      const randomEstado = estados[Math.floor(Math.random() * estados.length)];
      const randomTipo = tipos[Math.floor(Math.random() * tipos.length)];
      const randomAutoridad = autoridades[Math.floor(Math.random() * autoridades.length)];
      const randomUrgencia = urgencias[Math.floor(Math.random() * urgencias.length)];
      
      // Generar fecha aleatoria entre hace 30 días y hoy
      const hoy = new Date();
      const fechaAleatoria = new Date(hoy);
      fechaAleatoria.setDate(hoy.getDate() - Math.floor(Math.random() * 30));
      const fecha = fechaAleatoria.toISOString().split('T')[0];

      // Generar fecha límite aleatoria entre hoy y 30 días en el futuro
      const fechaLimiteAleatoria = new Date(hoy);
      fechaLimiteAleatoria.setDate(hoy.getDate() + Math.floor(Math.random() * 30) + 1);
      const fechaLimite = fechaLimiteAleatoria.toISOString().split('T')[0];
      
      // Formato para número de folio
      const folioNum = i.toString().padStart(3, '0');
      
      this.asuntos.push({
        id: i,
        folio: `AKAMBA-${this.yearActual}-${folioNum}`,
        autoridad: randomAutoridad,
        fecha: fecha,
        estado: randomEstado,
        tipo: randomTipo,
        carpeta: `CI-${Math.floor(Math.random() * 10000)}/${this.yearActual}`,
        urgencia: randomUrgencia,
        fechaLimite: fechaLimite
      });
    }
  }

  // Método para normalizar texto (eliminar acentos y convertir a minúsculas)
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .normalize('NFD') // Normalización Unicode (descompone los caracteres acentuados)
      .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos, diéresis, etc.)
  }

  // Método para aplicar filtros
  aplicarFiltros(): void {
    this.asuntosFiltrados = this.asuntos.filter(asunto => {
      // Filtro por folio (búsqueda parcial, insensible a mayúsculas/minúsculas y acentos)
      const folioMatch = !this.filtroFolio || 
        this.normalizarTexto(asunto.folio).includes(this.normalizarTexto(this.filtroFolio));
      
      // Filtro por autoridad
      const autoridadMatch = !this.filtroAutoridad || 
        asunto.autoridad === this.filtroAutoridad;
      
      // Filtro por estado
      const estadoMatch = !this.filtroEstado || 
        asunto.estado === this.filtroEstado;
        
      // Filtro por tipo
      const tipoMatch = !this.filtroTipo || 
        asunto.tipo === this.filtroTipo;
        
      // Filtro por urgencia
      const urgenciaMatch = !this.filtroUrgencia || 
        asunto.urgencia === this.filtroUrgencia;
        
      // Filtro por rango de fechas
      let fechaMatch = true;
      if (this.filtroFechaDesde && this.filtroFechaHasta) {
        const fechaAsunto = new Date(asunto.fecha);
        const fechaDesde = new Date(this.filtroFechaDesde);
        const fechaHasta = new Date(this.filtroFechaHasta);
        fechaHasta.setHours(23, 59, 59); // Para incluir todo el día final
        
        fechaMatch = fechaAsunto >= fechaDesde && fechaAsunto <= fechaHasta;
      }
      
      return folioMatch && autoridadMatch && estadoMatch && tipoMatch && urgenciaMatch && fechaMatch;
    });
    
    this.calcularPaginacion();
    this.paginaActual = 1; // Resetear a la primera página cuando se filtran resultados
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroFolio = '';
    this.filtroAutoridad = '';
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.filtroUrgencia = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    
    this.aplicarFiltros();
  }
  
  // Calcular paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asuntosFiltrados.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }
  }
  
  // Obtener elementos para la página actual
  get asuntosPaginados(): AsuntoAsignable[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asuntosFiltrados.slice(inicio, fin);
  }
  
  // Cambiar página
  cambiarPagina(accion: string | number): void {
    if (typeof accion === 'number') {
      if (accion >= 1 && accion <= this.totalPaginas) {
        this.paginaActual = accion;
      }
    } else if (accion === 'anterior' && this.paginaActual > 1) {
      this.paginaActual--;
    } else if (accion === 'siguiente' && this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  // Método para obtener la clase CSS según el estado
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'asignado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Método para ver detalle
  verDetalle(folio: string, event: Event): void {
    event.stopPropagation();
    console.log('Ver detalle del asunto:', folio);
    this.mostrarDetallePDF = true;
    setTimeout(() => {
      this.mostrarDetallePDF = false;
    }, 3000);
  }

  // Método para descargar PDF
  descargarPDF(folio: string, event: Event): void {
    event.stopPropagation();
    console.log('Descargar PDF del asunto:', folio);
    
    // Simulación de descarga
    alert(`Descargando PDF para el asunto ${folio}`);
  }

  // Método para abrir modal de asignación
  abrirModalAsignacion(asunto: AsuntoAsignable, event: Event): void {
    event.stopPropagation();
    this.asuntoSeleccionado = asunto;
    this.mostrarModalAsignacion = true;
  }

  // Método para cerrar modal de asignación
  cerrarModalAsignacion(): void {
    this.mostrarModalAsignacion = false;
    this.asuntoSeleccionado = null;
    this.dictaminadorSeleccionado = '';
  }

  // Método para asignar asunto
  asignarAsunto(): void {
    if (this.asuntoSeleccionado && this.dictaminadorSeleccionado) {
      console.log('Asignando asunto:', this.asuntoSeleccionado.folio, 'al dictaminador ID:', this.dictaminadorSeleccionado);
      
      // Encontrar el dictaminador seleccionado
      const dictaminador = this.dictaminadores.find(d => d.id.toString() === this.dictaminadorSeleccionado);
      if (dictaminador) {
        // En un entorno real, aquí iría la llamada al servicio para asignar el asunto
        alert(`Asunto ${this.asuntoSeleccionado.folio} asignado a ${dictaminador.nombre}`);
        
        // Actualizar el estado del asunto en nuestra lista
        const asuntoIndex = this.asuntos.findIndex(a => a.id === this.asuntoSeleccionado?.id);
        if (asuntoIndex !== -1) {
          this.asuntos[asuntoIndex].estado = 'asignado';
          // Incrementar la carga del dictaminador
          dictaminador.carga += 1;
        }
        
        // Aplicar filtros nuevamente para actualizar la vista
        this.aplicarFiltros();
      }
      
      this.cerrarModalAsignacion();
    }
  }
  
  // Exportar a Excel
  exportarExcel(): void {
    try {
      // Obtener datos a exportar (los que estén filtrados actualmente)
      const datosParaExportar = this.asuntosFiltrados.map(asunto => ({
        'ID': asunto.id,
        'Folio': asunto.folio,
        'Autoridad': asunto.autoridad,
        'Fecha Recepción': asunto.fecha,
        'Estado': asunto.estado,
        'Tipo': asunto.tipo,
        'Carpeta': asunto.carpeta,
        'Urgencia': asunto.urgencia,
        'Fecha Límite': asunto.fechaLimite
      }));
      
      // Crear hoja de trabajo (worksheet)
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
      
      // Definir anchos de columnas para mejor presentación
      const wscols = [
        { wch: 5 },     // ID
        { wch: 20 },    // Folio
        { wch: 30 },    // Autoridad
        { wch: 15 },    // Fecha Recepción
        { wch: 10 },    // Estado
        { wch: 15 },    // Tipo
        { wch: 20 },    // Carpeta
        { wch: 10 },    // Urgencia
        { wch: 15 }     // Fecha Límite
      ];
      
      ws['!cols'] = wscols;
      
      // Crear libro de trabajo (workbook)
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Asuntos por Asignar');
      
      // Generar nombre del archivo con fecha actual
      const fechaActual = new Date();
      const fechaStr = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
      const nombreArchivo = `Asuntos_por_Asignar_${fechaStr}.xlsx`;
      
      // Guardar archivo
      XLSX.writeFile(wb, nombreArchivo);
      
      console.log('Excel exportado exitosamente:', nombreArchivo);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Por favor intente nuevamente.');
    }
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

  // Método para volver a la página anterior
  volver(): void {
    this.router.navigate(['/akamba']);
  }

  // Determina si una página debe ser mostrada en la paginación
  mostrarPagina(index: number): boolean {
    // Siempre mostrar la primera y última página
    if (this.totalPaginas <= 5) {
      return true;
    }
    
    // Para paginación con elipsis (páginas 1, 2, 3, ..., n)
    const startPages = [1, 2];
    const endPages = [this.totalPaginas - 1, this.totalPaginas];
    const currentPages = [this.paginaActual - 1, this.paginaActual, this.paginaActual + 1];
    
    // Calcular el número de página real basado en el índice
    const pageNum = this.getPaginaNumero(index - 1);
    
    return startPages.includes(pageNum) || 
           endPages.includes(pageNum) || 
           currentPages.includes(pageNum);
  }
  
  // Obtiene el número de página basado en el índice en el array de páginas
  getPaginaNumero(index: number): number {
    if (this.totalPaginas <= 5) {
      return index + 1;
    }
    
    // Lógica para mostrar un rango de páginas alrededor de la actual
    if (this.paginaActual <= 3) {
      return index + 1;
    } else if (this.paginaActual >= this.totalPaginas - 2) {
      return this.totalPaginas - 4 + index;
    } else {
      return this.paginaActual - 2 + index;
    }
  }
}
