import { Component, EventEmitter, Output } from '@angular/core';
import { FileService } from '../../services/file.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AsuntoService } from '../../services/asunto.service';


@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [PdfViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css',
})
export class PdfViewerComponent {
  pdfUrl: string = '';

  @Output() showTablePDF = new EventEmitter<void>()
  mostrarTablaPDF: boolean = true

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    console.log('🔍 [PdfViewerComponent] ngOnInit iniciado');
    console.log('🔍 [PdfViewerComponent] Suscribiéndose a pdfUpdated');
    
    this.fileService.pdfUpdated.subscribe((file) => {
      console.log('🔍 [PdfViewerComponent] pdfUpdated evento recibido');
      console.log('🔍 [PdfViewerComponent] Archivo recibido tipo:', typeof file);
      console.log('🔍 [PdfViewerComponent] Archivo longitud:', file?.length || 0);
      console.log('🔍 [PdfViewerComponent] Primeros 50 caracteres:', file?.substring(0, 50));
      
      if (!file || file.trim() === '') {
        console.error('❌ [PdfViewerComponent] Archivo vacío o nulo');
        return;
      }
      
      try {
      const byteCharacters = atob(file);
        console.log('🔍 [PdfViewerComponent] Base64 decodificado, longitud:', byteCharacters.length);
        
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
        console.log('🔍 [PdfViewerComponent] ByteArray creado, longitud:', byteArray.length);
        
      const blob = new Blob([byteArray], { type: 'application/pdf' });
        console.log('🔍 [PdfViewerComponent] Blob creado, tamaño:', blob.size);
        
      var blobURL = URL.createObjectURL(blob);
        console.log('🔍 [PdfViewerComponent] BlobURL creado:', blobURL);
        
      this.pdfUrl = blobURL;
        console.log('✅ [PdfViewerComponent] PDF cargado exitosamente');
      } catch (error) {
        console.error('❌ [PdfViewerComponent] Error al procesar archivo:', error);
      }
    });
  }
  showAgain() {
    this.showTablePDF.emit()
    this.mostrarTablaPDF = false
  }
}
