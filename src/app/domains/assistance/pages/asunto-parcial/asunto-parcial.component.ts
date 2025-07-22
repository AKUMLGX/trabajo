import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Documento {
  nombre: string;
  fechaCarga: string;
}

@Component({
  selector: 'app-asunto-parcial',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './asunto-parcial.component.html',
  styleUrls: ['./asunto-parcial.component.css']
})
export class AsuntoParcialComponent implements OnInit {
  asuntoId: string = '';
  
  // Variables para el visor de PDF
  mostrarPDFViewer: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfTitulo: string = '';
  
  // Información del asunto
  asunto = {
    folioInterno: '',
    carpetaInvestigacion: '',
    oficio: '',
    documento: '',
    fechaRecepcion: '',
    plazoAtencion: '',
    dictaminadorAsignado: 'María Pérez González',
    observaciones: 'Este asunto requiere información adicional del área fiscal.',
    estado: 'Parcial'
  };
  
  // Documentos asociados
  documentos: Documento[] = [];
  
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
      documento: `Respuesta Parcial ${id.split('-')[1]}.pdf`,
      fechaRecepcion: '2024-03-01',
      plazoAtencion: '12',
      dictaminadorAsignado: 'María Pérez González',
      observaciones: 'Este asunto requiere información adicional del área fiscal.',
      estado: 'Parcial'
    };
    
    // Cargar documentos asociados
    this.documentos = [
      { nombre: `Respuesta Parcial ${id.split('-')[1]}.pdf`, fechaCarga: '2024-03-01' }
    ];
  }
  
  // Método para volver a la vista anterior
  volver(): void {
    this.router.navigate(['/layout/parcial-detalle']);
  }
  
  // Métodos para gestionar documentos
  verDocumento(documento: string): void {
    console.log('Visualizando documento:', documento);
    
    // Para este ejemplo, usamos un PDF de ejemplo disponible públicamente
    const urlPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlPdf);
    this.pdfTitulo = documento;
    this.mostrarPDFViewer = true;
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
