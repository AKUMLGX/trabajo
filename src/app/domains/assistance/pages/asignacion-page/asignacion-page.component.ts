import { AsignarAsunto, AsignarAsuntoRequest } from './../../../interfaces/asiganar-AsuntoRequest.interface';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { FormControl, FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { modalItem, porAsignarRequest, tableAsuntosPorDictaminar } from '../../../interfaces/porAsignarRequest.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { usuariosPorAdministracion } from '../../../interfaces/usuarios-Por-administracion.interface';
import { ModalService } from '../../../shared/services/modal.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable,of } from 'rxjs';
@Component({
  selector: 'app-asignacion-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    PdfViewerModule,
    ReactiveFormsModule
  ],
  templateUrl: './asignacion-page.component.html',
  // src\app\domains\assistance\pages\asignacion-page\asignacion-page.component.html
  styles: [`
    :host {
      display: block;
      height: 100%;
      background-color: #F3EAE4;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    ::ng-deep pdf-viewer {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    ::ng-deep .page {
      margin: 10px auto !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
  `]
})
export class AsignacionPageComponent implements OnInit {
  // asuntos: Asunto[] = [];
  tablePorAsignarIndicador: tableAsuntosPorDictaminar[] = []

buscador = new FormControl('');

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10; // Número de elementos por página
  abogadoSeleccionado: string = '';
  // mostrarPDFViewer: boolean = false;
  // pdfSrc: string = '';
  // pdfTitulo: string = '';
  // asuntoParaDescargar: Asunto | null = null;

  asignadosTable: boolean = false
  documento: string = 'REQUERIMIENTO'
  usuariosAsignar: usuariosPorAdministracion[] = []
  itemDeFilaSelecionada: modalItem | null = null
  // itemDeFilaSelecionada: modalItem [] = [];


  porAsignarDataTable: porAsignarRequest = {
    documento: this.documento,
    asignados: this.asignadosTable
  }

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private modalService: ModalService,
   private buscadorService:BuscadorService<tableAsuntosPorDictaminar>) { }

  ngOnInit() {
    this.tablePorAsignar()
  }

  tablePorAsignar() {
    this.cards.tablePorAsignar(this.porAsignarDataTable).subscribe({
      next: (res) => {
        // this.tablePorAsignarIndicador = res
        this.allData = res
        this.buscadorService.setData(this.allData)
      },
    });

  }

  onDearchChange(value:string){
    this.buscadorService.setSearchTerm(value)
  }


  filtrarIndicador = (item: tableAsuntosPorDictaminar, term: string): boolean => {
  return item.persona_relacionada?.toLowerCase().includes(term.toLocaleLowerCase());
  };

  asignarIndicador : Observable<tableAsuntosPorDictaminar[]>= new Observable


 searchText: string = '';
  results$: Observable<string[]> = of([]);
 filteredData$: Observable<tableAsuntosPorDictaminar[]> = this.buscadorService.getFilteredData(this.filtrarIndicador);
 allData: tableAsuntosPorDictaminar[] = [];

  usuariosPorAdministracion() {
    this.cards.usuariosPorAdminitracion().subscribe((res: usuariosPorAdministracion[]) => {
      this.usuariosAsignar = res
    })
  }

  itemJson : AsignarAsunto ={
    folio_interno: '',
            folio_scanner: 0,
            carpeta_investigacion: '',
            oficio: '',
            persona_relacionada: '',
            fecha_recepcion: '',
            id_administracion_fk: 0,
            id_documento_fk: 0,
            id_atencion_fk: 0,
            turno_jefatura: '',
            autoridad_remitente: '',
            id_asunto: 0,
            es_historico: true,
            plazo_atencion: 0
  }
  itemRFC: string =''

  AsisgnarJSON=  {}

  asignarAsunto() {
    this.usuariosAsignar.forEach((item) => {
      debugger
       this.itemRFC =  item.rfc
    });
    this.allData.forEach((item) => {
       this.itemJson = {
            folio_interno: item.folio_interno,
            folio_scanner: item.folio_scanner,
            carpeta_investigacion: item.carpeta_investigacion,
            oficio: item.oficio,
            persona_relacionada: item.persona_relacionada,
            fecha_recepcion: item.fecha_recepcion,
            id_administracion_fk: item.id_administracion_fk,
            id_documento_fk: item.id_documento_fk,
            id_atencion_fk: item.id_atencion_fk,
            turno_jefatura: item.turno_jefatura,
            autoridad_remitente: item.autoridad_remitente,
            id_asunto: item.id_asunto,
            es_historico: item.es_historico,
            plazo_atencion: item.plazo_atencion
      };
    });
    const jsonRequest : AsignarAsuntoRequest = {
      asunto: this.itemJson,
      rfc_asignado:this.itemRFC
    }

    this.cards.asignarAsunto(jsonRequest).subscribe({
      next: () => {
        window.location.reload()
      }
    })
  }

  abrirModalAsignacion(template: TemplateRef<any>, item: modalItem) {
    this.itemDeFilaSelecionada = item
    console.log(item);
    this.usuariosPorAdministracion()
    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

  get asuntosFiltrados() {
    // Filtrar por persona relacionada si hay término de búsqueda
    return this.tablePorAsignarIndicador.filter(asunto =>
      asunto.persona_relacionada.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }



  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const calculatedEnd = this.startIndex + this.itemsPerPage;
    return Math.min(calculatedEnd, this.asuntosFiltrados.length);
  }

  get asuntosOrdenados() {
    // Primero ordenamos todos los asuntos filtrados
    const allOrdered = this.asuntosFiltrados.sort((a, b) => {
      // Primero ordenar por prioridad (rojo > amarillo > verde)
      const prioridadA = this.getPrioridad(a.plazo_atencion);
      const prioridadB = this.getPrioridad(b.plazo_atencion);

      if (prioridadA !== prioridadB) {
        return prioridadB - prioridadA;
      }

      // Si tienen la misma prioridad, ordenar por días de antigüedad
      return b.plazo_atencion - a.plazo_atencion;
    });

    // Luego tomamos solo los que corresponden a la página actual
    return allOrdered.slice(this.startIndex, this.endIndex);
  }


  getPrioridad(dias: number): number {
    if (dias > 15 )  return 3; // Rojo
    if (dias >= 5 && dias <= 15) return 2; // Amarillo
    return 1; // Verde
  }

  getColorSemaforo(asunto:tableAsuntosPorDictaminar ): string {
    const dias = asunto.plazo_atencion;
    if (dias > 15) {
      return 'bg-red-500';
    } else if (dias >= 5 && dias <= 15) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  // verPDF(asunto: Asunto) {
  //   // En producción, aquí obtendrías la URL del archivo PDF del backend
  //   // Para el ejemplo, usamos un PDF de prueba
  //   this.pdfSrc = this.obtenerURLPDF(asunto);
  //   this.pdfTitulo = `Documento de ${asunto.personaRelacionada}`;
  //   this.asuntoParaDescargar = asunto;
  //   this.mostrarPDFViewer = true;
  // }

  // cerrarPDF() {
  //   this.mostrarPDFViewer = false;
  //   this.pdfSrc = '';
  //   this.pdfTitulo = '';
  //   this.asuntoParaDescargar = null;
  // }

  // descargarPDFActual() {
  //   if (this.asuntoParaDescargar) {
  //     this.descargarPDF(this.asuntoParaDescargar);
  //   }
  // }

  // descargarPDF(asunto: Asunto) {
  //   // Simulación de descarga de PDF usando la API de Blob
  //   const pdfUrl = this.obtenerURLPDF(asunto);

  //   // Crear un elemento invisible para descargar
  //   fetch(pdfUrl)
  //     .then(response => response.blob())
  //     .then(blob => {
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = asunto.personaRelacionada;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url);
  //     });
  // }

  // // Método para simular la obtención de URL de PDF (en producción esto vendría del backend)
  // private obtenerURLPDF(asunto: Asunto): string {
  //   // Para el ejemplo, usamos URLs de PDFs de ejemplo según el tipo de documento
  //   // En producción, aquí consultarías tu API para obtener el PDF real

  //   // PDF de ejemplo para pruebas
  //   return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  // }

  // cancelarAsignacion() {
  //   this.asuntoSeleccionado = null;
  //   this.abogadoSeleccionado = '';
  // }

  // confirmarAsignacion() {
  //   if (this.asuntoSeleccionado && this.abogadoSeleccionado) {
  //     console.log('Asignando asunto:', this.asuntoSeleccionado.folioInterno, 'a:', this.abogadoSeleccionado);
  //     // Aquí implementar la lógica de asignación
  //     this.asuntoSeleccionado = null;
  //     this.abogadoSeleccionado = '';
  //   }
  // }

  regresar() {
    this.router.navigate(['/layout/assistance']);
  }

  // verDetalle(asunto: Asunto) {
  //   this.asuntoDetalle = asunto;
  // }

  // cerrarDetalle() {
  //   this.asuntoDetalle = null;
  // }

  // getBackgroundColor(asunto: Asunto): string {
  //   const dias = asunto.diasAntiguedad;

  //   if (dias > 15) {
  //     return 'bg-red-500';
  //   } else if (dias >= 5 && dias <= 15) {
  //     return 'bg-yellow-500';
  //   } else {
  //     return 'bg-green-500';
  //   }
  // }



  // verDocumentoDesdeDetalle(asunto: Asunto) {
  //   // Cerrar el modal de detalle primero
  //   this.cerrarDetalle();

  //   // Luego mostrar el PDF
  //   setTimeout(() => {
  //     this.verPDF(asunto);
  //   }, 100);
  // }
}
