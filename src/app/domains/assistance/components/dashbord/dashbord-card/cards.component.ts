import { tableAsuntosPorDictaminar } from './../../../../interfaces/porAsignarRequest.interface';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { environment } from './../../../../../../environments/environment';
import { CardsgraphicComponent } from '../dashbord-graphic/Pie-chart/cardsgraphic.component';
import { GraphicAdministracionComponent } from '../dashbord-graphic/vertical-graph/graphic-administracion.component';
import { TrafficLightsAtencionComponent } from '../TrafficLights/traffic-lights-atencion/traffic-lights-atencion.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';
import { CardsInfoBandejadeAtencionService } from '../../../../services/cards-info-bandejade-atencion.service';
import {  AdministracionResponse, Cards,CardsResponse, } from '../../../../interfaces/datosCards.interface';
import { porAsignarRequest } from '../../../../interfaces/porAsignarRequest.interface';
import { porAsignarResponse } from '../../../../interfaces/porAsignarResponse.interface';
import { usuariosPorAdministracion } from '../../../../interfaces/usuarios-Por-administracion.interface';
import { RechazadosTableComponent, AsuntoRechazado } from '../rechazados-table/rechazados-table.component';
import { RechazadosGestionComponent, Dictaminador } from '../rechazados-gestion/rechazados-gestion.component';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    RouterModule,
    // RouterOutlet,
    CommonModule,
    // CardsgraphicComponent,
    // GraphicAdministracionComponent,
    // TrafficLightsAtencionComponent,
    NgxExtendedPdfViewerModule,
    FormsModule,
    SafePipe,
    RechazadosTableComponent,
    RechazadosGestionComponent
  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-zoomIn {
      animation: zoomIn 0.3s ease-out;
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    .transform {
      transform-origin: center;
    }

    .hover\\:-translate-y-1:hover {
      transform: translateY(-0.25rem);
    }
  `]
})
export class CardsComponent implements OnInit {
  mostrarSemaforo = true

  environment = environment;
  @Output() mostrarSemaforoContenido = new EventEmitter<void>()

  mostrarSemaforoN(): void {
    this.mostrarSemaforoContenido.emit()
  }

  documento:string='REQUERIMIENTO'
  asignados:boolean= true
  porAsignarTotal:number=0

  tablePorDictaminar : tableAsuntosPorDictaminar[]= []
  // tablePorDictaminar : []= []

  porAsignarData :porAsignarRequest ={
    documento : this.documento,
    asignados: this.asignados
  }

  porAsignarDataResponse: porAsignarResponse={
    total: this.porAsignarTotal
  }

    usuariosAsignar: usuariosPorAdministracion[] = []

 constructor(private router:Router, private cards:CardsInfoBandejadeAtencionService){}
// @Output() oucultar = new EventEmitter<void>()

// ocultarPadre():void{
//   this.oucultar.emit()
//   this.router.navigate(['/layout/assistance/tramite-card'])
//   }

  // Propiedades para manejar la notificación
  mostrarNotificacion: boolean = false;
  mensajeNotificacion: string = '';

  // Datos de ejemplo para la tabla
  asuntos: any[] = [
    { folio: 'F001', autoridad: 'Servicio de Administración Tributaria', fecha: '01/04/2024', fechaCaptura: '31/03/2024', dictaminador: 'María Hernández' },
    { folio: 'F002', autoridad: 'Secretaría de Finanzas', fecha: '01/04/2024', fechaCaptura: '31/03/2024', dictaminador: 'Juan Rodríguez' },
    { folio: 'F003', autoridad: 'Procuraduría Fiscal', fecha: '02/04/2024', fechaCaptura: '01/04/2024', dictaminador: 'Carlos Sánchez' },
    { folio: 'F004', autoridad: 'Servicio de Administración Tributaria', fecha: '02/04/2024', fechaCaptura: '01/04/2024', dictaminador: 'Ana González' },
    { folio: 'F005', autoridad: 'Unidad de Inteligencia Financiera', fecha: '03/04/2024', fechaCaptura: '02/04/2024', dictaminador: 'Luis Torres' },
    { folio: 'F006', autoridad: 'Comisión Nacional Bancaria', fecha: '04/04/2024', fechaCaptura: '03/04/2024', dictaminador: 'María Hernández' },
    { folio: 'F007', autoridad: 'Secretaría de Hacienda', fecha: '05/04/2024', fechaCaptura: '04/04/2024', dictaminador: 'Juan Rodríguez' },
    { folio: 'F008', autoridad: 'Instituto Fiscal', fecha: '06/04/2024', fechaCaptura: '05/04/2024', dictaminador: 'Carlos Sánchez' }
  ];

  // Datos filtrados de la tabla
  asuntosFiltrados: any[] = [];
  dictaminadorSeleccionado: string = '';

  // Mapeo de ID de dictaminador a nombre para mostrar mensajes
  dictaminadoresMap: { [key: string]: string } = {
    '1': 'María Hernández',
    '2': 'Juan Rodríguez',
    '3': 'Carlos Sánchez',
    '4': 'Ana González',
    '5': 'Luis Torres'
  };

  // Conteo de asuntos por dictaminador
  conteoAsuntosPorDictaminador: { [key: string]: number } = {};
  totalAsuntos: number = 0;

  // Propiedades para visualizar PDF
  mostrarPDFViewer = false;
  pdfTitulo = '';
  pdfUrl: string = '';
  pdfCargando = true;
  paginaActual = 1;
  escalaZoom = 1.0;

  // Propiedades para el modal de detalles
  mostrarDetalleModal: boolean = false;
  asuntoSeleccionado: any = null;

  // Propiedades para manejar asuntos rechazados
  mostrarTablaRechazadosModal: boolean = false;
  mostrarModalRechazados: boolean = false;
  mostrarConfirmacionReasignacion: boolean = false;
  asuntoRechazado: AsuntoRechazado | null = null;
  
  // Datos de ejemplo para asuntos rechazados
  asuntosRechazados: AsuntoRechazado[] = [
    { folio: 'R001', autoridad: 'Servicio de Administración Tributaria', fechaRechazo: '05/04/2024', dictaminador: 'María Hernández', motivo: 'Información incompleta en el expediente. Se requiere documentación adicional.' },
    { folio: 'R002', autoridad: 'Secretaría de Finanzas', fechaRechazo: '03/04/2024', dictaminador: 'Juan Rodríguez', motivo: 'No corresponde a esta área. Debe ser reasignado a otra administración.' }
  ];

  // Dictaminadores disponibles para reasignación
  dictaminadoresDisponibles: Dictaminador[] = [
    { id: '1', nombre: 'María Hernández' },
    { id: '2', nombre: 'Juan Rodríguez' },
    { id: '3', nombre: 'Carlos Sánchez' },
    { id: '4', nombre: 'Ana González' },
    { id: '5', nombre: 'Luis Torres' }
  ];

  ngOnInit(): void {
    // Al iniciar, mostrar todos los asuntos
    this.asuntosFiltrados = [...this.asuntos];
    this.totalAsuntos = this.asuntos.length;

    // Calcular conteo de asuntos por dictaminador
    this.calcularConteoAsuntos();

    this.mostarCardPorAsignar()
    this.asuntosPorDictaminar()
    this.mostrarCards()
    this.usuariosPorAdministracion()
  }
  mostrarCards(){
    this.cards.cardsInfo().subscribe(res=>{
     //  debugger
      console.log("CARDS",res);
        this.dataCards(res)
        // this.requerimiento.total
        // this.requerimiento.en_tramite
        this.requerimiento.parcial
         this.administracion.Administracion

         console.log("Entramite", this.requerimiento.en_tramite);
          console.log("ADM", this.administracion.Administracion);


    })
  }

 mostarCardPorAsignar(){
  this.cards.cardInfoPorAsignar(this.porAsignarData).subscribe( res=>{
     this.porAsignarDataResponse = res;
    // this.porAsignarDataResponse.total
  }
  )
 }


 asuntosPorDictaminar(){
  this.cards.asutosPorDictaminar(this.porAsignarData).subscribe({
    next:(res) =>{
      this.tablePorDictaminar = res
    }
  })
 }


  requerimiento:Cards={
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento:0,
  }

    administracion: AdministracionResponse={
    Administracion: 0,
    }


  dataCards(data:CardsResponse['data']):void{
    const cardsData = data.find(i=>'REQUERIMIENTO'in i) as {REQUERIMIENTO:Cards};
    if (cardsData) {
      this.requerimiento = cardsData.REQUERIMIENTO
    }
    const administracionObj = data.find(i=>'Administracion' in i) as  { Administracion: AdministracionResponse} ;
if (administracionObj ) {
    this.administracion = administracionObj.Administracion;
    console.log('Administración encontrada:', this.administracion);
  } else {
    console.log('No se encontró la propiedad "Administracion"');
  }
  }

  usuariosPorAdministracion() {
      this.cards.usuariosPorAdminitracion().subscribe((res: usuariosPorAdministracion[]) => {
        this.usuariosAsignar = res
      })
    }

  // Método para calcular conteo de asuntos por dictaminador
  calcularConteoAsuntos(): void {
    // Resetear conteos
    this.conteoAsuntosPorDictaminador = {};

    // Calcular conteos para cada dictaminador
    for (const asunto of this.asuntos) {
      if (!this.conteoAsuntosPorDictaminador[asunto.dictaminador]) {
        this.conteoAsuntosPorDictaminador[asunto.dictaminador] = 0;
      }
      this.conteoAsuntosPorDictaminador[asunto.dictaminador]++;
    }

    console.log('Conteo de asuntos por dictaminador:', this.conteoAsuntosPorDictaminador);
  }

  // Método para filtrar asuntos por texto de búsqueda
  filtrarAsuntos(textoFiltro: string): void {
    textoFiltro = textoFiltro.toLowerCase().trim();

    // Primero aplicar el filtro de dictaminador si existe
    let asuntosFiltradosPorDictaminador = this.asuntos;
    if (this.dictaminadorSeleccionado) {
      const nombreDictaminador = this.dictaminadoresMap[this.dictaminadorSeleccionado];
      asuntosFiltradosPorDictaminador = this.asuntos.filter(asunto =>
        asunto.dictaminador === nombreDictaminador
      );
    }

    // Luego aplicar el filtro de texto si existe
    if (!textoFiltro) {
      this.asuntosFiltrados = [...asuntosFiltradosPorDictaminador];
      return;
    }

    // Filtrar por texto de búsqueda sobre los resultados ya filtrados por dictaminador
    this.asuntosFiltrados = asuntosFiltradosPorDictaminador.filter(asunto =>
      asunto.folio.toLowerCase().includes(textoFiltro) ||
      asunto.autoridad.toLowerCase().includes(textoFiltro)
    );

    this.mostrarMensaje(`Se encontraron ${this.asuntosFiltrados.length} resultados para "${textoFiltro}"`);
  }

  // Método para mostrar detalles según la categoría
  mostrarDetalle(categoria: string): void {
    console.log(`Mostrando detalle para: ${categoria}`);
    if (categoria === 'nuevos') {
      // Redireccionar a la página de trámite detalle
      this.router.navigate(['/layout/tramite-detalle']);
    } else if (categoria === 'pendientes') {
      // Redireccionar a la página de asuntos parciales
      this.router.navigate(['/layout/parcial-detalle']);
    } else if (categoria === 'total') {
      // Redireccionar a la página de asuntos finalizados (tabla)
      this.router.navigate(['/layout/finalizado-card']);
    } else {
      // Para otros casos mantenemos el comportamiento anterior
      let mensaje = '';

      switch(categoria) {
        default:
          mensaje = 'Mostrando detalles de asuntos';
      }

      this.mostrarMensaje(mensaje);
    }
  }

  // Método para cambiar dictaminador
  cambiarDictaminador(idDictaminador: string): void {
    this.dictaminadorSeleccionado = idDictaminador;

    if (idDictaminador) {
      // Obtener el nombre del dictaminador a partir del ID
      const nombreDictaminador = this.dictaminadoresMap[idDictaminador];

      // Filtrar los asuntos según el dictaminador seleccionado
      this.asuntosFiltrados = this.asuntos.filter(asunto =>
        asunto.dictaminador === nombreDictaminador
      );

      // Mostrar un mensaje con el número de asuntos encontrados
      const numeroAsuntos = this.asuntosFiltrados.length;
      this.mostrarMensaje(`Mostrando ${numeroAsuntos} asuntos asignados a ${nombreDictaminador}`);
    } else {
      // Si no hay dictaminador seleccionado (opción "Todos"), mostrar todos
      this.asuntosFiltrados = [...this.asuntos];
      this.mostrarMensaje(`Mostrando todos los ${this.asuntos.length} asuntos`);
    }
  }

  // Método para crear nuevo asunto
  crearNuevo(): void {
    this.mostrarMensaje('Creando nuevo asunto');
  }

  // Método para seleccionar una fila
  seleccionarFila(folio: string): void {
    const asunto = this.asuntos.find(a => a.folio === folio);
    if (asunto) {
      console.log('Asunto seleccionado:', asunto);
      this.mostrarMensaje(`Asunto ${folio} seleccionado`);
    }
  }

  // Método para ver detalle de asunto (evitando propagación del evento)
  verDetalle(folio: string, event: Event): void {
    event.stopPropagation(); // Evita que se active el seleccionarFila
    const asunto = this.asuntos.find(a => a.folio === folio);
    if (asunto) {
      this.asuntoSeleccionado = asunto;
      this.mostrarDetalleModal = true;
      console.log('Mostrando detalle del asunto:', asunto);
    }
  }

  // Método para cerrar el modal de detalles
  cerrarDetalle(): void {
    this.mostrarDetalleModal = false;
    this.asuntoSeleccionado = null;
  }

  // Método para visualizar PDF
  verPDF(folio: string, event: Event): void {
    event.stopPropagation();
    this.pdfTitulo = `Documento ${folio}`;
    // Usar un PDF de ejemplo disponible públicamente
    this.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    this.pdfCargando = true;
    this.mostrarPDFViewer = true;
    this.paginaActual = 1;
    this.escalaZoom = 1.0;

    // Simular tiempo de carga
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1500);
  }

  // Método para descargar PDF desde la tabla
  descargarPDF(folio: string, event: Event): void {
    event.stopPropagation(); // Evita que se active el seleccionarFila

    // En una aplicación real, esto generaría una descarga del archivo PDF
    // Para este ejemplo, solo mostramos un mensaje
    this.mostrarMensaje(`Descargando documento del asunto ${folio}`);

    // Simular descarga después de 1 segundo
    setTimeout(() => {
      // Aquí se iniciaría la descarga real
      console.log(`Descarga iniciada para ${folio}`);
    }, 1000);
  }

  // Método para cerrar el visor de PDF
  cerrarPDF(): void {
    this.mostrarPDFViewer = false;
    this.pdfTitulo = '';
    this.pdfUrl = '';
    this.pdfCargando = true;
  }

  // Métodos para control de páginas
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    // Asumimos un máximo de 10 páginas para este ejemplo
    if (this.paginaActual < 10) {
      this.paginaActual++;
    }
  }

  // Métodos para control de zoom
  aumentarZoom(): void {
    this.escalaZoom += 0.25;
    if (this.escalaZoom > 3) this.escalaZoom = 3;
    this.aplicarZoom();
  }

  disminuirZoom(): void {
    this.escalaZoom -= 0.25;
    if (this.escalaZoom < 0.5) this.escalaZoom = 0.5;
    this.aplicarZoom();
  }

  pantallaCompleta(): void {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframe.requestFullscreen();
      }
    }
  }

  aplicarZoom(): void {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      (iframe as HTMLElement).style.transform = `scale(${this.escalaZoom})`;
      (iframe as HTMLElement).style.transformOrigin = 'center top';
    }
  }

  // Método para descargar el PDF actual
  descargarPDFActual(): void {
    // Crear un enlace temporal y simular clic
    const link = document.createElement('a');
    link.href = this.pdfUrl;
    link.download = `${this.pdfTitulo.replace(/\s+/g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Método para cambiar página
  cambiarPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.mostrarMensaje(`Mostrando página ${pagina}`);
    } else if (pagina === 'anterior') {
      this.mostrarMensaje('Mostrando página anterior');
    } else if (pagina === 'siguiente') {
      this.mostrarMensaje('Mostrando página siguiente');
    }
  }

  /**
   * Muestra un mensaje de notificación al usuario
   * @param mensaje Texto a mostrar
   * @param duracion Duración en milisegundos (por defecto 2000ms)
   */
  mostrarMensaje(mensaje: string, duracion: number = 2000): void {
    // Solo se registra el mensaje en consola sin mostrar la notificación visual
    console.log('Mensaje de sistema:', mensaje);

    // No se activa la notificación visual
    // this.mensajeNotificacion = mensaje;
    // this.mostrarNotificacion = true;
    // setTimeout(() => {
    //   this.mostrarNotificacion = false;
    // }, duracion);
  }

  // Método para ir a la vista de Asuntos por Asignar
  irAAsignacion(): void {
    this.router.navigate(['/layout/asignacion']);
  }

  // Método para visualizar PDF alternativo
  verPDFAlternativo(event: Event): void {
    event.stopPropagation();
    this.pdfTitulo = 'Documento de ejemplo (Mozilla)';
    // Usar un PDF de ejemplo de Mozilla
    this.pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
    this.pdfCargando = true;
    this.mostrarPDFViewer = true;
    this.paginaActual = 1;
    this.escalaZoom = 1.0;

    // Simular tiempo de carga
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1500);
}

  // Métodos para gestionar asuntos rechazados
  mostrarTablaRechazados(): void {
    this.mostrarTablaRechazadosModal = true;
  }

  cerrarTablaRechazados(): void {
    this.mostrarTablaRechazadosModal = false;
  }

  seleccionarAsuntoRechazado(asunto: AsuntoRechazado): void {
    this.asuntoRechazado = asunto;
    this.mostrarTablaRechazadosModal = false;
    this.mostrarModalRechazados = true;
  }

  cerrarModalRechazados(): void {
    this.mostrarModalRechazados = false;
  }

  manejarReasignacion(event: { asunto: any, nuevoDictaminadorId: string, observaciones: string, notificar: boolean }): void {
    // Implementar la lógica para reasignar el asunto rechazado a un nuevo dictaminador
    console.log('Reasignando asunto', event);
    this.mostrarMensaje(`Asunto reasignado a ${this.dictaminadoresMap[event.nuevoDictaminadorId]}`);
    this.cerrarModalRechazados();
  }

  confirmarReasignacion(): void {
    // Aquí se realizaría la llamada al servicio para reasignar el asunto
    setTimeout(() => {
      // Simular respuesta exitosa
      this.mostrarMensaje('Asunto reasignado exitosamente');
      // Actualizar la lista de asuntos rechazados (quitar el asunto reasignado)
      if (this.asuntoRechazado) {
        this.asuntosRechazados = this.asuntosRechazados.filter(a => a.folio !== this.asuntoRechazado?.folio);
      }
      this.mostrarConfirmacionReasignacion = false;
      this.mostrarModalRechazados = false;
      this.asuntoRechazado = null;
    }, 1000);
  }

  cancelarConfirmacionReasignacion(): void {
    this.mostrarConfirmacionReasignacion = false;
  }

  // Método para crear un componente de revisión de dictamen
  revisarDictamen(folio: string, event: Event): void {
    event.stopPropagation();
    // Aquí iría la lógica para abrir el modal de revisión
    this.mostrarMensaje('Abriendo revisión de dictamen: ' + folio);
  }
}
