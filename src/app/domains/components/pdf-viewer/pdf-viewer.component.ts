import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class PdfViewerComponent implements OnInit {
  pdfUrl = '';

  @Output() showTablePDF = new EventEmitter<void>()

    @Input() mostrarBotonCerrar = true;

  @Output() cerrado = new EventEmitter<void>()

  mostrarTablaPDF: boolean = true
  mostrarBtnclose: boolean = true

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    console.log('📄 [PdfViewerComponent] Componente inicializado, suscribiéndose a pdfUpdated');
    
    // Configurar el worker de PDF.js usando el archivo local en assets
    // ng2-pdf-viewer usa pdfjs-dist internamente, pero necesitamos configurar el worker
    try {
      // Usar el worker desde assets (local, no requiere internet)
      // Nota: El archivo es .mjs pero lo copiamos como .js para compatibilidad
      const workerPath = '/akamba/assets/pdfjs/pdf.worker.min.js';
      
      // Configurar para ng2-pdf-viewer
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc = workerPath;
      (window as any).pdfjsWorker = workerPath;
      
      console.log('✅ [PdfViewerComponent] Worker de PDF.js configurado localmente:', workerPath);
    } catch (error) {
      console.warn('⚠️ [PdfViewerComponent] No se pudo configurar el worker:', error);
      // Fallback a CDN si el local falla
      const pdfjsVersion = '4.8.69';
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/legacy/build/pdf.worker.min.js`;
      console.log('⚠️ [PdfViewerComponent] Usando CDN como fallback');
    }
    
    // Limpiar URL anterior si existe
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }
    
    this.fileService.pdfUpdated.subscribe((file) => {
      console.log('✅ [PdfViewerComponent] PDF recibido, procesando...');
      console.log('   - Tamaño del base64:', file.length, 'caracteres');
      try {
        // Limpiar URL anterior si existe
        if (this.pdfUrl) {
          URL.revokeObjectURL(this.pdfUrl);
        }
        
        const byteCharacters = atob(file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        var blobURL = URL.createObjectURL(blob);
        this.pdfUrl = blobURL;
        this.mostrarTablaPDF = true; // Asegurar que se muestre el PDF
        console.log('✅ [PdfViewerComponent] PDF procesado correctamente');
        console.log('   - pdfUrl:', this.pdfUrl);
        console.log('   - blob size:', blob.size, 'bytes');
        console.log('   - mostrarTablaPDF:', this.mostrarTablaPDF);
      } catch (error) {
        console.error('❌ [PdfViewerComponent] Error al procesar PDF:', error);
      }
    });
  }
  showAgain() {
    this.showTablePDF.emit()
    this.mostrarTablaPDF = false
  }

  showButton() {
this.showTablePDF.emit();
  }
}
