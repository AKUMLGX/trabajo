import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileService } from '../../services/file.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AsuntoService } from '../../services/asunto.service';
import {
  diagnosticoPdfWorker,
  prepararPdfWorker,
} from '../../capture/utils/pdf-worker.utils';
import {
  normalizarTextoAPdfBlob,
  registrarErrorPdf,
} from '../../capture/utils/pdf-bytes.utils';


@Component({
    selector: 'app-pdf-viewer',
    imports: [PdfViewerModule],
    templateUrl: './pdf-viewer.component.html',
    styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent implements OnInit {
  pdfUrl = '';

  @Output() showTablePDF = new EventEmitter<void>()

    @Input() mostrarBotonCerrar = true;

  @Output() cerrado = new EventEmitter<void>()

  mostrarTablaPDF: boolean = true
  mostrarBtnclose: boolean = true
  errorVisor: string | null = null

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    console.log('📄 [PdfViewerComponent] Componente inicializado, suscribiéndose a pdfUpdated');
    
    // Configurar el worker de PDF.js usando el archivo local en assets
    // ng2-pdf-viewer usa pdfjs-dist internamente, pero necesitamos configurar el worker
    void prepararPdfWorker().then(() => {
      console.log(
        '✅ [PdfViewerComponent] Worker de PDF.js listo:',
        diagnosticoPdfWorker()
      );
    });


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

        const blob = normalizarTextoAPdfBlob(file);
        this.pdfUrl = URL.createObjectURL(blob);
        this.errorVisor = null;
        this.mostrarTablaPDF = true; // Asegurar que se muestre el PDF
        console.log('✅ [PdfViewerComponent] PDF procesado correctamente');
        console.log('   - pdfUrl:', this.pdfUrl);
        console.log('   - blob size:', blob.size, 'bytes');
        console.log('   - mostrarTablaPDF:', this.mostrarTablaPDF);
      } catch (error) {
        registrarErrorPdf('PdfViewerComponent no pudo decodificar el PDF', error);
        this.errorVisor =
          error instanceof Error ? error.message : 'Respuesta de PDF no reconocida';
        this.pdfUrl = '';
      }
    });
  }
  /** Expone el error real de PDF.js en vez de dejar el visor en blanco. */
  onErrorVisor(error: unknown): void {
    const detalle = error instanceof Error ? error.message : String(error);
    this.errorVisor = detalle;
    console.error(
      '❌ [PdfViewerComponent] Error del visor PDF:',
      detalle,
      diagnosticoPdfWorker()
    );
  }

  showAgain() {
    this.showTablePDF.emit()
    this.mostrarTablaPDF = false
  }

  showButton() {
this.showTablePDF.emit();
  }
}
