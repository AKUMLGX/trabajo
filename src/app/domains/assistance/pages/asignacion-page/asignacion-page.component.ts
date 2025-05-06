import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { modalItem, porAsignarRequest, tableAsuntosPorDictaminar } from '../../../interfaces/porAsignarRequest.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { usuariosPorAdministracion } from '../../../interfaces/usuarios-Por-administracion.interface';
import { ModalService } from '../../../shared/services/modal.service';

interface Asunto {
  folioInterno: string;
  carpetaInvestigacion: string;
  oficio: string;
  personaRelacionada: string;
  fechaRecepcion: string;
  plazoAtencion: string;
  diasAntiguedad: number;
}

interface Abogado {
  nombre: string;
  cargo: string;
  administracion: number;
}

@Component({
  selector: 'app-asignacion-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    PdfViewerModule
  ],
  templateUrl:'./asignacion-page.component.html',
  // src\app\domains\assistance\pages\asignacion-page\asignacion-page.component.html
  template: `
      <div class="flex items-center mb-6">
        <button (click)="regresar()" class="text-[#691C32] mr-4">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold text-[#691C32]">Asuntos por asignar 2024 ddddddd</h1>
      </div>

      <div class="flex justify-end mb-4">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">
            <mat-icon>search</mat-icon>
          </span>
          <input type="text"
                 [(ngModel)]="searchTerm"
                 placeholder="Buscar..."
                 class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#691C32]">
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-[#691C32] text-white">
              <th class="py-2 px-3 text-left">Ind.</th>
              <th class="py-2 px-3 text-left">Folio Interno</th>
              <th class="py-2 px-3 text-left">Carpeta de Investigación</th>
              <th class="py-2 px-3 text-left">Oficio</th>
              <th class="py-2 px-3 text-left">Persona Relacionada</th>
              <th class="py-2 px-3 text-left">Fecha Recepción</th>
              <th class="py-2 px-3 text-left">Plazo Atención</th>
              <th class="py-2 px-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let asunto of asuntosOrdenados"
                class="border-b hover:bg-gray-50 even:bg-gray-50">
              <td class="py-2 px-3">
                <div [class]="'w-3 h-3 rounded-full ' + getColorSemaforo(asunto)"></div>
              </td>
              <td class="py-2 px-3">{{asunto.folioInterno}}</td>
              <td class="py-2 px-3">{{asunto.carpetaInvestigacion}}</td>
              <td class="py-2 px-3">{{asunto.oficio}}</td>
              <td class="py-2 px-3">{{asunto.personaRelacionada}}</td>
              <td class="py-2 px-3">{{asunto.fechaRecepcion}}</td>
              <td class="py-2 px-3">{{asunto.plazoAtencion}}</td>
              <td class="py-2 px-3 space-x-2">
                <button (click)="verDetalle(asunto)"
                        class="bg-[#691C32] text-white px-3 py-1 rounded text-sm hover:bg-[#8B1D3C]">
                  Detalle
                </button>
                <button (click)="verPDF(asunto)"
                        class="bg-[#691C32] text-white px-3 py-1 rounded text-sm hover:bg-[#8B1D3C]">
                  Ver
                </button>
                <button (click)="abrirModalAsignacion(asunto)"
                        class="bg-[#691C32] text-white px-3 py-1 rounded text-sm hover:bg-[#8B1D3C]">
                  Asignar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-center p-4 bg-gray-50">
          <div class="text-sm text-gray-600">
            Mostrando {{startIndex + 1}} a {{endIndex}} de {{asuntosFiltrados.length}} registros
          </div>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1 border rounded hover:bg-gray-100"
                    [disabled]="currentPage === 1"
                    [class.opacity-50]="currentPage === 1"
                    (click)="irAPagina(1)">
              Primero
            </button>
            <button class="px-3 py-1 border rounded hover:bg-gray-100"
                    [disabled]="currentPage === 1"
                    [class.opacity-50]="currentPage === 1"
                    (click)="irAPagina(currentPage - 1)">
              Anterior
            </button>
            <span class="px-3 py-1 border rounded bg-[#691C32] text-white">
              {{currentPage}} / {{totalPages}}
            </span>
            <button class="px-3 py-1 border rounded hover:bg-gray-100"
                    [disabled]="currentPage === totalPages"
                    [class.opacity-50]="currentPage === totalPages"
                    (click)="irAPagina(currentPage + 1)">
              Siguiente
            </button>
            <button class="px-3 py-1 border rounded hover:bg-gray-100"
                    [disabled]="currentPage === totalPages"
                    [class.opacity-50]="currentPage === totalPages"
                    (click)="irAPagina(totalPages)">
              Último
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-md p-4 inline-block">
        <div class="text-base font-medium text-[#691C32] mb-3">Indicadores de antigüedad:</div>
        <div class="flex items-center space-x-8">
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-green-500 mr-3 shadow-sm"></div>
            <span class="text-sm font-medium">Menor a 4 días</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-yellow-500 mr-3 shadow-sm"></div>
            <span class="text-sm font-medium">Entre 5 y 15 días</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-sm"></div>
            <span class="text-sm font-medium">Mayor a 15 días</span>
          </div>
        </div>
      </div>
    </div> -
    <!-- Modal de Asignación -->


    <!-- Modal de Visualización de PDF -->
    <div *ngIf="mostrarPDFViewer"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white rounded-lg shadow-xl w-[85%] h-[85%] max-h-[90vh] max-w-6xl transform transition-all overflow-hidden flex flex-col my-4 mx-auto">
        <!-- Encabezado del modal -->
        <div class="bg-[#691C32] text-white py-3 px-6 flex items-center justify-between sticky top-0 z-10">
          <h2 class="text-xl font-bold truncate">{{pdfTitulo}}</h2>
          <button (click)="cerrarPDF()" class="text-white hover:text-gray-200 focus:outline-none ml-4 flex-shrink-0">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Cuerpo del modal -->
        <div class="flex-1 overflow-auto bg-gray-100 p-4 relative">
          <pdf-viewer
            [src]="pdfSrc"
            [render-text]="true"
            [original-size]="false"
            [show-all]="true"
            style="display: block; width: 100%; height: 100%;"
          ></pdf-viewer>
        </div>

        <!-- Pie del modal -->
        <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t sticky bottom-0 z-10">
          <button (click)="descargarPDFActual()"
                  class="px-5 py-2 bg-[#691C32] text-white rounded-lg hover:bg-[#8B1D3C] transition-colors shadow-sm font-medium flex items-center">
            <mat-icon class="mr-2">download</mat-icon>
            Descargar
          </button>
          <button (click)="cerrarPDF()"
                  class="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Visualización de Detalle -->
    <div *ngIf="asuntoDetalle"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white rounded-lg shadow-xl w-[600px] transform transition-all overflow-hidden">
        <!-- Encabezado del modal -->
        <div class="bg-[#691C32] text-white py-4 px-6 flex items-center justify-between">
          <h2 class="text-xl font-bold">Detalle del asunto</h2>
          <button (click)="cerrarDetalle()" class="text-white hover:text-gray-200 focus:outline-none">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Cuerpo del modal -->
        <div class="p-6">
          <!-- Información básica del asunto -->
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <div [class]="'w-5 h-5 rounded-full mr-3 ' + getColorSemaforo(asuntoDetalle)"></div>
              <h3 class="text-lg font-bold text-[#691C32]">{{asuntoDetalle.personaRelacionada}}</h3>
            </div>

            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Folio Interno</div>
                <div class="font-medium">{{asuntoDetalle.folioInterno}}</div>
              </div>

              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Carpeta de Investigación</div>
                <div class="font-medium">{{asuntoDetalle.carpetaInvestigacion}}</div>
              </div>

              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Oficio</div>
                <div class="font-medium">{{asuntoDetalle.oficio}}</div>
              </div>

              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Fecha de Recepción</div>
                <div class="font-medium">{{asuntoDetalle.fechaRecepcion}}</div>
              </div>

              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Plazo de Atención</div>
                <div class="font-medium">{{asuntoDetalle.plazoAtencion}}</div>
              </div>

              <div class="flex flex-col">
                <div class="text-sm text-gray-500">Días de Antigüedad</div>
                <div class="font-medium">
                  <span [class]="'inline-block px-2 py-1 rounded-full text-white text-xs ' + getBackgroundColor(asuntoDetalle)">
                    {{asuntoDetalle.diasAntiguedad}} días
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de acciones rápidas -->
          <div class="border-t pt-4 mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Acciones rápidas</h4>
            <div class="flex space-x-3">
              <button (click)="verDocumentoDesdeDetalle(asuntoDetalle)"
                      class="flex items-center justify-center px-4 py-2 bg-[#691C32] text-white rounded-lg hover:bg-[#8B1D3C] transition-colors shadow-sm text-sm">
                <mat-icon class="mr-1">visibility</mat-icon>
                Ver documento
              </button>
              <button (click)="abrirModalAsignacion(asuntoDetalle); cerrarDetalle()"
                      class="flex items-center justify-center px-4 py-2 bg-[#691C32] text-white rounded-lg hover:bg-[#8B1D3C] transition-colors shadow-sm text-sm">
                <mat-icon class="mr-1">assignment_ind</mat-icon>
                Asignar
              </button>
            </div>
          </div>
        </div>

        <!-- Pie del modal -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button (click)="cerrarDetalle()"
                  class="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
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
  asuntos: Asunto[] = [];
  tablePorAsignarIndicador : tableAsuntosPorDictaminar[]= []
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10; // Número de elementos por página
  asuntoSeleccionado: Asunto | null = null;
  asuntoDetalle: Asunto | null = null;
  abogadoSeleccionado: string = '';
  mostrarPDFViewer: boolean = false;
  pdfSrc: string = '';
  pdfTitulo: string = '';
  asuntoParaDescargar: Asunto | null = null;

  asignadosTable:boolean= false
  documento:string='REQUERIMIENTO'
  usuariosAsignar: usuariosPorAdministracion [] =[]
  itemDeFilaSelecionada : modalItem | null = null

    porAsignarDataTable :porAsignarRequest ={
    documento : this.documento,
    asignados: this.asignadosTable
  }
  constructor(private router: Router,
              private cards:CardsInfoBandejadeAtencionService,
              private modalService: ModalService) {}

  ngOnInit() {
    // Datos de ejemplo que reflejan las reglas del semáforo
    this.asuntos = [
      {
        folioInterno: 'EUACAPE-010',
        carpetaInvestigacion: 'CI-55555',
        oficio: 'OF-1111',
        personaRelacionada: 'Juan Pérez González',
        fechaRecepcion: '2024-02-25',
        plazoAtencion: '2 días',
        diasAntiguedad: 2
      },
      {
        folioInterno: 'EUACAPE-011',
        carpetaInvestigacion: 'CI-66666',
        oficio: 'OF-2222',
        personaRelacionada: 'María Rodríguez López',
        fechaRecepcion: '2024-02-22',
        plazoAtencion: '7 días',
        diasAntiguedad: 7
      },
      {
        folioInterno: 'EUACAPE-012',
        carpetaInvestigacion: 'CI-77777',
        oficio: 'OF-3333',
        personaRelacionada: 'Carlos Hernández Martínez',
        fechaRecepcion: '2024-02-18',
        plazoAtencion: '15 días',
        diasAntiguedad: 15
      },
      {
        folioInterno: 'EUACAPE-013',
        carpetaInvestigacion: 'CI-88888',
        oficio: 'OF-4444',
        personaRelacionada: 'Ana García Sánchez',
        fechaRecepcion: '2024-02-17',
        plazoAtencion: '22 días',
        diasAntiguedad: 22
      },
      {
        folioInterno: 'EUACAPE-014',
        carpetaInvestigacion: 'CI-99999',
        oficio: 'OF-5555',
        personaRelacionada: 'Roberto Fernández Díaz',
        fechaRecepcion: '2024-02-15',
        plazoAtencion: '4 días',
        diasAntiguedad: 4
      },
      {
        folioInterno: 'EUACAPE-015',
        carpetaInvestigacion: 'CI-00000',
        oficio: 'OF-6666',
        personaRelacionada: 'Laura Gutiérrez Ramos',
        fechaRecepcion: '2024-02-14',
        plazoAtencion: '9 días',
        diasAntiguedad: 9
      },
      {
        folioInterno: 'EUACAPE-016',
        carpetaInvestigacion: 'CI-11111',
        oficio: 'OF-7777',
        personaRelacionada: 'Pedro Ramírez Castro',
        fechaRecepcion: '2024-02-12',
        plazoAtencion: '17 días',
        diasAntiguedad: 17
      },
      {
        folioInterno: 'EUACAPE-017',
        carpetaInvestigacion: 'CI-22222',
        oficio: 'OF-8888',
        personaRelacionada: 'Sofía Torres Vargas',
        fechaRecepcion: '2024-03-01',
        plazoAtencion: '3 días',
        diasAntiguedad: 3
      },
      {
        folioInterno: 'EUACAPE-018',
        carpetaInvestigacion: 'CI-33333',
        oficio: 'OF-9999',
        personaRelacionada: 'Miguel Flores Mendoza',
        fechaRecepcion: '2024-03-02',
        plazoAtencion: '5 días',
        diasAntiguedad: 5
      },
      {
        folioInterno: 'EUACAPE-019',
        carpetaInvestigacion: 'CI-44444',
        oficio: 'OF-0000',
        personaRelacionada: 'Daniela Vega Ortiz',
        fechaRecepcion: '2024-03-03',
        plazoAtencion: '8 días',
        diasAntiguedad: 8
      },
      {
        folioInterno: 'EUACAPE-020',
        carpetaInvestigacion: 'CI-12345',
        oficio: 'OF-1234',
        personaRelacionada: 'Luis Mendoza Jiménez',
        fechaRecepcion: '2024-03-05',
        plazoAtencion: '10 días',
        diasAntiguedad: 10
      },
      {
        folioInterno: 'EUACAPE-021',
        carpetaInvestigacion: 'CI-56789',
        oficio: 'OF-5678',
        personaRelacionada: 'Carmen Vega Cruz',
        fechaRecepcion: '2024-03-08',
        plazoAtencion: '14 días',
        diasAntiguedad: 12
      }
    ];
    this.tablePorAsignar()


  }

  tablePorAsignar(){
    this.cards.tablePorAsignar(this.porAsignarDataTable).subscribe({
      next: (res)=>{
         this.tablePorAsignarIndicador = res
      }
    });
   }



  get asuntosFiltrados() {
    // Filtrar por persona relacionada si hay término de búsqueda
    return this.asuntos.filter(asunto =>
      this.searchTerm === '' ||
      asunto.personaRelacionada.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get totalPages(): number {
    return Math.ceil(this.asuntosFiltrados.length / this.itemsPerPage);
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
      const prioridadA = this.getPrioridad(a.diasAntiguedad);
      const prioridadB = this.getPrioridad(b.diasAntiguedad);

      if (prioridadA !== prioridadB) {
        return prioridadB - prioridadA;
      }

      // Si tienen la misma prioridad, ordenar por días de antigüedad
      return b.diasAntiguedad - a.diasAntiguedad;
    });

    // Luego tomamos solo los que corresponden a la página actual
    return allOrdered.slice(this.startIndex, this.endIndex);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }

  getPrioridad(dias: number): number {
    if (dias > 15) return 3; // Rojo
    if (dias >= 5 && dias <= 15) return 2; // Amarillo
    return 1; // Verde
  }

  getColorSemaforo(asunto: Asunto): string {
    const dias = asunto.diasAntiguedad;

    if (dias > 15) {
      return 'bg-red-500';
    } else if (dias >= 5 && dias <= 15) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  verPDF(asunto: Asunto) {
    // En producción, aquí obtendrías la URL del archivo PDF del backend
    // Para el ejemplo, usamos un PDF de prueba
    this.pdfSrc = this.obtenerURLPDF(asunto);
    this.pdfTitulo = `Documento de ${asunto.personaRelacionada}`;
    this.asuntoParaDescargar = asunto;
    this.mostrarPDFViewer = true;
  }

  cerrarPDF() {
    this.mostrarPDFViewer = false;
    this.pdfSrc = '';
    this.pdfTitulo = '';
    this.asuntoParaDescargar = null;
  }

  descargarPDFActual() {
    if (this.asuntoParaDescargar) {
      this.descargarPDF(this.asuntoParaDescargar);
    }
  }

  descargarPDF(asunto: Asunto) {
    // Simulación de descarga de PDF usando la API de Blob
    const pdfUrl = this.obtenerURLPDF(asunto);

    // Crear un elemento invisible para descargar
    fetch(pdfUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = asunto.personaRelacionada;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  }

  // Método para simular la obtención de URL de PDF (en producción esto vendría del backend)
  private obtenerURLPDF(asunto: Asunto): string {
    // Para el ejemplo, usamos URLs de PDFs de ejemplo según el tipo de documento
    // En producción, aquí consultarías tu API para obtener el PDF real

    // PDF de ejemplo para pruebas
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }

  usuariosPorAdministracion(){
    this.cards.usuariosPorAdminitracion().subscribe((res:usuariosPorAdministracion[])=>{
      this.usuariosAsignar = res
    })
   }

  abrirModalAsignacion(template: TemplateRef<any>, item :modalItem) {
    this.itemDeFilaSelecionada = item
    this.usuariosPorAdministracion()
    this.modalService.openCustomDialogWithTemplate({
      template
    })


  }

  cancelarAsignacion() {
    this.asuntoSeleccionado = null;
    this.abogadoSeleccionado = '';
  }

  confirmarAsignacion() {
    if (this.asuntoSeleccionado && this.abogadoSeleccionado) {
      console.log('Asignando asunto:', this.asuntoSeleccionado.folioInterno, 'a:', this.abogadoSeleccionado);
      // Aquí implementar la lógica de asignación
      this.asuntoSeleccionado = null;
      this.abogadoSeleccionado = '';
    }
  }

  regresar() {
    this.router.navigate(['/layout/assistance']);
  }

  verDetalle(asunto: Asunto) {
    this.asuntoDetalle = asunto;
  }

  cerrarDetalle() {
    this.asuntoDetalle = null;
  }

  getBackgroundColor(asunto: Asunto): string {
    const dias = asunto.diasAntiguedad;

    if (dias > 15) {
      return 'bg-red-500';
    } else if (dias >= 5 && dias <= 15) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }



  verDocumentoDesdeDetalle(asunto: Asunto) {
    // Cerrar el modal de detalle primero
    this.cerrarDetalle();

    // Luego mostrar el PDF
    setTimeout(() => {
      this.verPDF(asunto);
    }, 100);
  }
}
