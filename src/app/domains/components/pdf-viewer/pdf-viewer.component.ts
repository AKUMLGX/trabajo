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
    this.fileService.pdfUpdated.subscribe((file) => {
      const byteCharacters = atob(file);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      var blobURL = URL.createObjectURL(blob);
      this.pdfUrl = blobURL;
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
