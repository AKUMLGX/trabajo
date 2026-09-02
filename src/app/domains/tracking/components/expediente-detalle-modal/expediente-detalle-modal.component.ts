import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { ExpedienteTlalcalli } from '../../../../domains/capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import {
  ExpedienteDetalleCaptura,
  OficioAdjuntoExpediente,
  TabDocumentosDetalle,
} from '../../interfaces/expediente-detalle-captura.interface';
import { FileService } from '../../../../domains/services/file.service';

type DocumentoActivo = 'inicial' | number | null;

@Component({
  selector: 'app-expediente-detalle-modal',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, PdfViewerModule],
  templateUrl: './expediente-detalle-modal.component.html',
  styleUrl: './expediente-detalle-modal.component.css',
})
export class ExpedienteDetalleModalComponent implements OnInit, OnDestroy {
  detalle: ExpedienteDetalleCaptura | null = null;
  cargando = true;
  errorCarga = false;

  tabDocs: TabDocumentosDetalle = 'inicial';

  oficiosAdjuntos: OficioAdjuntoExpediente[] = [];
  mostrarFormularioOficio = false;
  guardandoOficio = false;
  mensajeOficioApi = '';

  documentoActivo: DocumentoActivo = null;
  mostrarPdf = false;
  cargandoPdf = false;
  pdfUrl = '';

  nuevoOficio: OficioAdjuntoExpediente = this.crearOficioVacio();
  private archivosLocalesAdjuntos = new Map<string, File>();
  private pdfSub?: { unsubscribe: () => void };

  constructor(
    public dialogRef: MatDialogRef<ExpedienteDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlalcalli },
    private expedienteService: ExpedienteTlalcalliService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.configurarPdfWorker();
    this.expedienteService.obtenerDetalleCaptura(this.data.expediente).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        this.cargando = false;
        if (detalle.tiene_pdf) {
          this.seleccionarDocumentoInicial();
        }
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.pdfSub?.unsubscribe();
    this.liberarPdfUrl();
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  cambiarTabDocs(tab: TabDocumentosDetalle): void {
    this.tabDocs = tab;
    if (tab === 'inicial' && this.detalle?.tiene_pdf) {
      this.seleccionarDocumentoInicial();
      return;
    }
    if (tab === 'adjuntos' && this.oficiosAdjuntos.length > 0) {
      this.seleccionarOficioAdjunto(0);
    } else {
      this.limpiarVisor();
    }
  }

  toggleFormularioOficio(): void {
    this.mostrarFormularioOficio = !this.mostrarFormularioOficio;
    if (this.mostrarFormularioOficio) {
      this.mensajeOficioApi =
        'El guardado en servidor estará disponible cuando Max exponga POST expedientes_rework/{id}/oficios.';
    }
  }

  cancelarFormularioOficio(): void {
    this.mostrarFormularioOficio = false;
    this.nuevoOficio = this.crearOficioVacio();
    this.mensajeOficioApi = '';
  }

  onArchivoOficioSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.nuevoOficio.nombre_archivo = archivo?.name ?? '';
    if (archivo) {
      this.archivosLocalesAdjuntos.set(archivo.name, archivo);
    }
  }

  guardarOficioAdjunto(): void {
    const archivo = this.archivosLocalesAdjuntos.get(this.nuevoOficio.nombre_archivo) ?? null;
    if (!this.nuevoOficio.num_oficio.trim() || !this.nuevoOficio.fecha_documento || !archivo) {
      this.mensajeOficioApi = 'Complete número de oficio, fecha y archivo PDF.';
      return;
    }

    this.guardandoOficio = true;
    this.mensajeOficioApi =
      'Endpoint de guardado pendiente en back. El oficio se agregó solo en vista previa local.';

    const oficioLocal: OficioAdjuntoExpediente = {
      ...this.nuevoOficio,
      fecha_registro: new Date().toISOString(),
    };

    this.oficiosAdjuntos = [oficioLocal, ...this.oficiosAdjuntos];
    this.tabDocs = 'adjuntos';
    this.mostrarFormularioOficio = false;
    this.guardandoOficio = false;
    this.nuevoOficio = this.crearOficioVacio();
    this.seleccionarOficioAdjunto(0, oficioLocal);
  }

  seleccionarDocumentoInicial(): void {
    if (!this.detalle) {
      return;
    }

    this.documentoActivo = 'inicial';

    if (this.detalle.origen === 'rework' && this.detalle.id_archivo_pdf) {
      this.cargarPdfRework(this.detalle.id_archivo_pdf);
      return;
    }

    if (!this.detalle.tiene_pdf || !this.detalle.documento_pdf_nombre) {
      return;
    }

    this.cargarPdfRemoto(this.detalle.documento_pdf_nombre);
  }

  seleccionarOficioAdjunto(index: number, oficio?: OficioAdjuntoExpediente): void {
    const item = oficio ?? this.oficiosAdjuntos[index];
    if (!item) {
      return;
    }

    this.documentoActivo = index;
    const archivoLocal = this.archivosLocalesAdjuntos.get(item.nombre_archivo);
    if (archivoLocal) {
      this.cargarPdfLocal(archivoLocal);
      return;
    }

    this.limpiarVisor();
    this.mostrarPdf = false;
  }

  descargarDocumentoActivo(): void {
    if (!this.detalle) {
      return;
    }

    if (this.documentoActivo === 'inicial' && this.detalle.tiene_pdf) {
      if (this.detalle.origen === 'rework' && this.detalle.id_archivo_pdf) {
        this.expedienteService
          .descargarPdfReworkArchivo(this.detalle.id_archivo_pdf)
          .subscribe({
            next: (blob) => this.descargarBlob(blob, this.detalle!.documento_pdf_nombre || 'documento.pdf'),
            error: () => undefined,
          });
        return;
      }

      if (this.detalle.documento_pdf_nombre) {
        const oficio = this.obtenerFolioPdf();
        if (!oficio) {
          return;
        }
        this.fileService.downloadPdfFileBandejaAtencion(
          oficio,
          this.detalle.documento_pdf_nombre,
          this.detalle.documento_pdf_nombre
        );
      }
      return;
    }

    if (typeof this.documentoActivo === 'number') {
      const oficio = this.oficiosAdjuntos[this.documentoActivo];
      const archivo = oficio ? this.archivosLocalesAdjuntos.get(oficio.nombre_archivo) : null;
      if (archivo) {
        const url = URL.createObjectURL(archivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = archivo.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  etiquetaTipoOficio(tipo: string): string {
    const mapa: Record<string, string> = {
      SOLICITUD_INFO: 'Solicitud de información',
      COMISION_APOYO: 'Comisión de apoyo',
      OTRO: 'Otro',
    };
    return mapa[tipo] ?? tipo;
  }

  private crearOficioVacio(): OficioAdjuntoExpediente {
    return {
      tipo: 'SOLICITUD_INFO',
      num_oficio: '',
      fecha_documento: '',
      descripcion: '',
      nombre_archivo: '',
    };
  }

  private obtenerFolioPdf(): string | null {
    if (!this.detalle) {
      return null;
    }
    const oficio = this.detalle.oficio !== 'N/A' ? this.detalle.oficio : this.data.expediente.oficio;
    return oficio ?? null;
  }

  private cargarPdfRemoto(nombreArchivo: string): void {
    const oficio = this.obtenerFolioPdf();
    if (!oficio) {
      return;
    }

    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = true;

    this.pdfSub?.unsubscribe();
    this.pdfSub = this.fileService.pdfUpdated.subscribe((pdfBase64: string) => {
      try {
        this.pdfUrl = this.base64ToObjectUrl(pdfBase64);
        this.mostrarPdf = true;
        this.cargandoPdf = false;
        this.pdfSub?.unsubscribe();
      } catch {
        this.cargandoPdf = false;
        this.mostrarPdf = false;
      }
    });

    this.fileService.updatePdfFile(oficio, nombreArchivo);
  }

  private cargarPdfRework(idArchivo: number): void {
    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = true;

    this.expedienteService.descargarPdfReworkArchivo(idArchivo).subscribe({
      next: (blob) => {
        this.pdfUrl = URL.createObjectURL(blob);
        this.mostrarPdf = true;
        this.cargandoPdf = false;
      },
      error: () => {
        this.cargandoPdf = false;
        this.mostrarPdf = false;
      },
    });
  }

  private descargarBlob(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  }

  private cargarPdfLocal(archivo: File): void {
    this.liberarPdfUrl();
    this.cargandoPdf = true;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const blob = new Blob([buffer], { type: 'application/pdf' });
      this.pdfUrl = URL.createObjectURL(blob);
      this.mostrarPdf = true;
      this.cargandoPdf = false;
    };
    reader.onerror = () => {
      this.cargandoPdf = false;
      this.mostrarPdf = false;
    };
    reader.readAsArrayBuffer(archivo);
  }

  private base64ToObjectUrl(pdfBase64: string): string {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' }));
  }

  private limpiarVisor(): void {
    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = false;
  }

  private liberarPdfUrl(): void {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }
  }

  private configurarPdfWorker(): void {
    try {
      const workerPath = '/akamba/assets/pdfjs/pdf.worker.min.js';
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc = workerPath;
    } catch {
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc =
        'https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.js';
    }
  }
}
