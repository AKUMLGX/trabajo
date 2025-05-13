import { AsuntoPorAtencionParcialRequest } from './../../../interfaces/asuntoPorAtencion.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAsigacionResponseParcial } from '../../../interfaces/asuntoPorAtencionResponse.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';

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

  constructor(private router: Router, private cards:CardsInfoBandejadeAtencionService) {}

  ngOnInit(): void {
    // Cargar datos de ejemplo para la tabla
    this.cargarDatosEjemplo();
    this.filtrarAsuntos();
    this.tablePracial()
  }

  tablePracial(){
    this.cards.parcialTableCard(this.tableparcialRequest).subscribe(res=>{
      this.tableParcialResponse=res
    })
  }

  cargarDatosEjemplo(): void {
    const personasRelacionadas = [
      'Juan Pérez García', 'María González López', 'Roberto Martínez Sánchez',
      'Laura Rodríguez Díaz', 'Carlos Hernández Cruz', 'Patricia Flores Torres',
      'Miguel Ángel Ramírez', 'Sofía ', 'Ricardo Torres Vega',
      'Diana Fernández Castro', 'Fernando Ríos Vargas', 'Ana Castillo Morales',
      'José Luis Mendoza', 'Carmen Ortega Blanco', 'Eduardo Silva Gómez',
      'Isabel Jiménez Rosas', 'David Vargas Nava', 'Mónica Cruz Soto',
      'Alejandro Medina Ruiz', 'Verónica Navarro Ochoa'
    ];



    this.asuntos = [
      { id: 'EUACAPE-0021', ci: 'CI-78945', oficio: 'OF-1234', documento: 'Respuesta Parcial 1.pdf', fecha: '01/03/2024', dias: 12, personaRelacionada: personasRelacionadas[0] },
      { id: 'EUACAPE-0032', ci: 'CI-89056', oficio: 'OF-2345', documento: 'Respuesta Parcial 2.pdf', fecha: '15/02/2024', dias: 8, personaRelacionada: personasRelacionadas[1] },
      { id: 'EUACAPE-0043', ci: 'CI-90167', oficio: 'OF-3456', documento: 'Respuesta Parcial 3.pdf', fecha: '20/01/2024', dias: 15, personaRelacionada: personasRelacionadas[2] },
      { id: 'EUACAPE-0101', ci: 'CI-12345', oficio: 'OF-7711', documento: 'Respuesta Parcial 11.pdf', fecha: '12/03/2024', dias: 5, personaRelacionada: personasRelacionadas[3] },
      { id: 'EUACAPE-0102', ci: 'CI-12346', oficio: 'OF-7722', documento: 'Respuesta Parcial 12.pdf', fecha: '10/03/2024', dias: 7, personaRelacionada: personasRelacionadas[4] },
      { id: 'EUACAPE-0103', ci: 'CI-12347', oficio: 'OF-7733', documento: 'Respuesta Parcial 13.pdf', fecha: '28/02/2024', dias: 9, personaRelacionada: personasRelacionadas[5] },
      { id: 'EUACAPE-0104', ci: 'CI-12348', oficio: 'OF-7744', documento: 'Respuesta Parcial 14.pdf', fecha: '20/02/2024', dias: 11, personaRelacionada: personasRelacionadas[6] },
      { id: 'EUACAPE-0105', ci: 'CI-12349', oficio: 'OF-7755', documento: 'Respuesta Parcial 15.pdf', fecha: '15/01/2024', dias: 14, personaRelacionada: personasRelacionadas[7] },
      { id: 'EUACAPE-0106', ci: 'CI-12350', oficio: 'OF-7766', documento: 'Respuesta Parcial 16.pdf', fecha: '10/01/2024', dias: 18, personaRelacionada: personasRelacionadas[8] },
      { id: 'EUACAPE-0107', ci: 'CI-12351', oficio: 'OF-7777', documento: 'Respuesta Parcial 17.pdf', fecha: '05/01/2024', dias: 22, personaRelacionada: personasRelacionadas[9] },
      { id: 'EUACAPE-0108', ci: 'CI-12352', oficio: 'OF-7788', documento: 'Respuesta Parcial 18.pdf', fecha: '01/01/2024', dias: 25, personaRelacionada: personasRelacionadas[10] },
      { id: 'EUACAPE-0109', ci: 'CI-12353', oficio: 'OF-7799', documento: 'Respuesta Parcial 19.pdf', fecha: '28/12/2023', dias: 30, personaRelacionada: personasRelacionadas[11] },
      { id: 'EUACAPE-0110', ci: 'CI-12354', oficio: 'OF-7800', documento: 'Respuesta Parcial 20.pdf', fecha: '20/12/2023', dias: 35, personaRelacionada: personasRelacionadas[12] },
      { id: 'EUACAPE-0111', ci: 'CI-12355', oficio: 'OF-7811', documento: 'Respuesta Parcial 21.pdf', fecha: '15/12/2023', dias: 40, personaRelacionada: personasRelacionadas[13] },
      { id: 'EUACAPE-0112', ci: 'CI-12356', oficio: 'OF-7822', documento: 'Respuesta Parcial 22.pdf', fecha: '10/12/2023', dias: 45, personaRelacionada: personasRelacionadas[14] },
      { id: 'EUACAPE-0113', ci: 'CI-12357', oficio: 'OF-7833', documento: 'Respuesta Parcial 23.pdf', fecha: '05/12/2023', dias: 50, personaRelacionada: personasRelacionadas[15] },
      { id: 'EUACAPE-0114', ci: 'CI-12358', oficio: 'OF-7844', documento: 'Respuesta Parcial 24.pdf', fecha: '01/12/2023', dias: 55, personaRelacionada: personasRelacionadas[16] },
      { id: 'EUACAPE-0115', ci: 'CI-12359', oficio: 'OF-7855', documento: 'Respuesta Parcial 25.pdf', fecha: '25/11/2023', dias: 60, personaRelacionada: personasRelacionadas[17] },
      { id: 'EUACAPE-0116', ci: 'CI-12360', oficio: 'OF-7866', documento: 'Respuesta Parcial 26.pdf', fecha: '20/11/2023', dias: 65, personaRelacionada: personasRelacionadas[18] },
      { id: 'EUACAPE-0117', ci: 'CI-12361', oficio: 'OF-7877', documento: 'Respuesta Parcial 27.pdf', fecha: '15/11/2023', dias: 70, personaRelacionada: personasRelacionadas[19] }
    ];
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
