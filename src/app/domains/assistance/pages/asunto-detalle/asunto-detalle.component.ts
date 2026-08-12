import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

interface Documento {
  nombre: string;
  fechaCarga: string;
}

@Component({
    selector: 'app-asunto-detalle',
    imports: [CommonModule, RouterModule, FormsModule, NgxExtendedPdfViewerModule],
    schemas: [NO_ERRORS_SCHEMA],
    templateUrl: './asunto-detalle.component.html',
    styleUrls: ['./asunto-detalle.component.css']
})
export class AsuntoDetalleComponent implements OnInit {
  asuntoId = '';
  
  // Variables para el visor de PDF
  mostrarPDFViewer = false;
  pdfUrl: string | null = null;
  pdfTitulo = '';
  pdfCargando = true;
  zoom = 1.0;
  
  // Información del asunto
  asunto = {
    folioInterno: '',
    carpetaInvestigacion: '',
    oficio: '',
    documentoPrincipal: '',
    fechaRecepcion: '',
    plazoAtencion: '',
    dictaminadorAsignado: 'Dictaminador Asignado',
    observaciones: 'Asunto en proceso de trámite. Datos generados automáticamente.',
    estado: 'En trámite'
  };
  
  // Documentos asociados
  documentos: Documento[] = [];
  
  // Datos de ejemplo de documentos asociados
  documentosEjemplo: Documento[] = [
    { nombre: 'Documento_EUACAPE-3101.pdf', fechaCarga: '2025-04-10' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    // Obtener el ID del asunto de los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.asuntoId = id;
        this.cargarDetallesAsunto(id);
      }
    });
  }
  
  // Método para cargar los detalles del asunto según su ID
  cargarDetallesAsunto(id: string): void {
    // En un caso real, aquí se realizaría una llamada al servicio
    // para obtener los datos del asunto desde el backend
    
    // Por ahora, usamos datos estáticos basados en el ID
    this.asunto = {
      folioInterno: id,
      carpetaInvestigacion: 'CI-' + Math.floor(10000 + Math.random() * 90000),
      oficio: 'OF-' + Math.floor(1000 + Math.random() * 9000),
      documentoPrincipal: `Documento_${id}.pdf`,
      fechaRecepcion: '2025-04-10',
      plazoAtencion: '5',
      dictaminadorAsignado: 'Dictaminador Asignado',
      observaciones: 'Asunto en proceso de trámite. Datos generados automáticamente.',
      estado: 'En trámite'
    };
    
    // Cargar documentos asociados
    this.documentos = this.documentosEjemplo.map(doc => ({
      ...doc,
      nombre: doc.nombre.replace('EUACAPE-3101', id)
    }));
  }
  
  // Método para volver a la vista anterior
  volver(): void {
    // Si el ID comienza con EUACAPE, es un asunto finalizado, regresamos a la lista de finalizados
    if (this.asuntoId.startsWith('EUACAPE')) {
      this.router.navigate(['/layout/finalizado-card']);
    } else {
      // Para otros casos, asumimos que es un asunto en trámite
      this.router.navigate(['/layout/tramite-detalle']);
    }
  }
  
  // Métodos para gestionar documentos
  verDocumento(documento: string): void {
    console.log('Visualizando documento:', documento);
    
    // Para este ejemplo, usamos un PDF de ejemplo disponible públicamente
    this.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    this.pdfTitulo = documento;
    this.mostrarPDFViewer = true;
    this.pdfCargando = true;
    
    // Simular tiempo de carga
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1500);
  }
  
  descargarDocumento(documento: string): void {
    console.log('Descargando documento:', documento);
    
    // Para este ejemplo, usamos un PDF de ejemplo disponible públicamente
    const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    // Crear un elemento <a> temporal para la descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = documento; // Nombre del archivo a descargar
    link.target = '_blank';
    
    // Añadir el elemento al DOM, activarlo y luego eliminarlo
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }
  
  // Métodos para el visor de PDF
  cerrarPDFViewer(): void {
    this.mostrarPDFViewer = false;
    this.pdfUrl = null;
  }
}
