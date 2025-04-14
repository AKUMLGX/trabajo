import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import * as XLSX from 'xlsx';

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
  imports: [CommonModule, RouterModule, FormsModule, SafePipe],
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar datos de ejemplo para la tabla
    this.cargarDatosEjemplo();
    this.filtrarAsuntos();
  }

  cargarDatosEjemplo(): void {
    this.asuntos = [
      { id: 'EUACAPE-3021', ci: 'CI-78945', oficio: 'OF-1234', tramite: 'Trámite 1.pdf', fecha: '01/03/2024', dias: 12, dictaminador: 'María Hernández' },
      { id: 'EUACAPE-3032', ci: 'CI-89056', oficio: 'OF-2345', tramite: 'Trámite 2.pdf', fecha: '15/02/2024', dias: 8, dictaminador: 'Juan Rodríguez' },
      { id: 'EUACAPE-3043', ci: 'CI-90167', oficio: 'OF-3456', tramite: 'Trámite 3.pdf', fecha: '20/01/2024', dias: 15, dictaminador: 'Carlos Sánchez' },
      { id: 'EUACAPE-3101', ci: 'CI-12345', oficio: 'OF-7711', tramite: 'Trámite 11.pdf', fecha: '12/03/2024', dias: 5, dictaminador: 'Ana González' },
      { id: 'EUACAPE-3102', ci: 'CI-12346', oficio: 'OF-7722', tramite: 'Trámite 12.pdf', fecha: '10/03/2024', dias: 7, dictaminador: 'Luis Torres' },
      { id: 'EUACAPE-3103', ci: 'CI-12347', oficio: 'OF-7733', tramite: 'Trámite 13.pdf', fecha: '28/02/2024', dias: 9, dictaminador: 'María Hernández' },
      { id: 'EUACAPE-3104', ci: 'CI-12348', oficio: 'OF-7744', tramite: 'Trámite 14.pdf', fecha: '20/02/2024', dias: 11, dictaminador: 'Juan Rodríguez' },
      { id: 'EUACAPE-3105', ci: 'CI-12349', oficio: 'OF-7755', tramite: 'Trámite 15.pdf', fecha: '15/01/2024', dias: 14, dictaminador: 'Carlos Sánchez' },
      { id: 'EUACAPE-3106', ci: 'CI-12350', oficio: 'OF-7766', tramite: 'Trámite 16.pdf', fecha: '10/01/2024', dias: 18, dictaminador: 'Ana González' },
      { id: 'EUACAPE-3107', ci: 'CI-12351', oficio: 'OF-7777', tramite: 'Trámite 17.pdf', fecha: '05/01/2024', dias: 22, dictaminador: 'Luis Torres' },
      { id: 'EUACAPE-3108', ci: 'CI-12352', oficio: 'OF-7788', tramite: 'Trámite 18.pdf', fecha: '01/01/2024', dias: 25, dictaminador: 'María Hernández' },
      { id: 'EUACAPE-3109', ci: 'CI-12353', oficio: 'OF-7799', tramite: 'Trámite 19.pdf', fecha: '28/12/2023', dias: 30, dictaminador: 'Juan Rodríguez' },
      { id: 'EUACAPE-3110', ci: 'CI-12354', oficio: 'OF-7800', tramite: 'Trámite 20.pdf', fecha: '20/12/2023', dias: 35, dictaminador: 'Carlos Sánchez' },
      { id: 'EUACAPE-3111', ci: 'CI-12355', oficio: 'OF-7811', tramite: 'Trámite 21.pdf', fecha: '15/12/2023', dias: 40, dictaminador: 'Ana González' },
      { id: 'EUACAPE-3112', ci: 'CI-12356', oficio: 'OF-7822', tramite: 'Trámite 22.pdf', fecha: '10/12/2023', dias: 45, dictaminador: 'Luis Torres' },
      { id: 'EUACAPE-3113', ci: 'CI-12357', oficio: 'OF-7833', tramite: 'Trámite 23.pdf', fecha: '05/12/2023', dias: 50, dictaminador: 'María Hernández' },
      { id: 'EUACAPE-3114', ci: 'CI-12358', oficio: 'OF-7844', tramite: 'Trámite 24.pdf', fecha: '01/12/2023', dias: 55, dictaminador: 'Juan Rodríguez' },
      { id: 'EUACAPE-3115', ci: 'CI-12359', oficio: 'OF-7855', tramite: 'Trámite 25.pdf', fecha: '25/11/2023', dias: 60, dictaminador: 'Carlos Sánchez' }
    ];
  }

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
    try {
      // Obtener datos a exportar (los que estén filtrados actualmente)
      const datosParaExportar = this.asuntosFiltrados.map(asunto => ({
        'Folio': asunto.id,
        'Carpeta de Investigación': asunto.ci,
        'Oficio': asunto.oficio,
        'Trámite': asunto.tramite,
        'Fecha Recepción': asunto.fecha,
        'Días': asunto.dias,
        'Dictaminador': asunto.dictaminador || ''
      }));
      
      // Crear hoja de trabajo (worksheet)
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
      
      // Definir anchos de columnas para mejor presentación
      const wscols = [
        { wch: 15 }, // Folio
        { wch: 20 }, // Carpeta de Investigación
        { wch: 15 }, // Oficio
        { wch: 20 }, // Trámite
        { wch: 15 }, // Fecha Recepción
        { wch: 8 },  // Días
        { wch: 20 }  // Dictaminador
      ];
      
      ws['!cols'] = wscols;
      
      // Crear libro de trabajo (workbook)
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Asuntos en Trámite');
      
      // Generar nombre del archivo con fecha actual
      const fechaActual = new Date();
      const fechaStr = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
      const nombreArchivo = `Asuntos_en_Tramite_${fechaStr}.xlsx`;
      
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
}
