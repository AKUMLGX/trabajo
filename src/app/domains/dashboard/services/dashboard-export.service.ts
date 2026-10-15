import { Injectable } from '@angular/core';

import { DateUtils } from '../../capture/utils/date-utils';
import {
  BUCKETS_ESTATUS,
  ETIQUETAS_BUCKET_ESTATUS,
  bucketEstatus,
} from './dashboard-estatus-negocio.utils';
import {
  etiquetaAdministracionCentral,
  etiquetaAdministracionGeneral,
} from './dashboard-remitente-admin.utils';
import {
  PanelDatos,
  PanelSinAtender,
  etiquetaRango,
  fechaIso,
  filasCriticosServidor,
  filasResumenPeriodo,
  filasTablaPorAdministracionEstatus,
} from './dashboard-panel.utils';
import { MetricasServidor } from './metricas-panel.service';

interface ImagenGrafica {
  titulo: string;
  dataUrl: string;
  ancho: number;
  alto: number;
}

const COLOR_PRIMARIO = '3E0065';
const COLOR_TEXTO = '230142';
const COLOR_GRIS = '7F7D7B';

@Injectable({ providedIn: 'root' })
export class DashboardExportService {
  async exportarExcel(panel: PanelDatos, nombreBase: string): Promise<void> {
    const XLSX = await import('xlsx');
    const per = panel.periodo;
    const libro = XLSX.utils.book_new();

    const resumen: (string | number)[][] = [
      ['Panel Estadístico Tlālcalli'],
      ['Periodo (fecha del documento)', etiquetaRango(per.rango)],
      ['Generado', panel.generado.toLocaleString('es-MX')],
      [],
      ['Indicador', 'Valor'],
      ...filasResumenPeriodo(panel),
      [],
      ['Estatus', 'Solicitudes'],
      ...BUCKETS_ESTATUS.map((b) => [ETIQUETAS_BUCKET_ESTATUS[b], per.porBucketEstatus[b]]),
      [],
      ['Servicio', 'Solicitudes'],
      ...per.porServicio.map((s) => [s.servicio, s.cantidad]),
    ];
    this.agregarHoja(XLSX, libro, 'Resumen', resumen, [46, 22]);

    const catalogo = panel.catalogoRemitente ?? null;
    const detalle: (string | number)[][] = [
      ['Expediente', 'Oficio', 'Servicio', 'Administración General', 'Administración Central', 'Identificador remitente', 'Fecha documento', 'Fecha recepción',
        'Fecha vencimiento', 'Prioridad', 'Estatus', 'Grupo estatus', 'Responsable'],
      ...per.expedientes.map((e) => [
        e.expediente,
        e.oficio || '',
        e.servicio || '',
        etiquetaAdministracionGeneral(e, catalogo),
        etiquetaAdministracionCentral(e, catalogo),
        e.remitente_area || '',
        this.fechaTexto(e.fecha_documento),
        this.fechaTexto(e.fecha_recibido),
        this.fechaTexto(e.fecha_vencimiento),
        e.prioridad || '',
        e.estatus || '',
        ETIQUETAS_BUCKET_ESTATUS[bucketEstatus(e.estatus)],
        e.responsable || '',
      ]),
    ];
    this.agregarHoja(XLSX, libro, 'Solicitudes del periodo', detalle, [18, 28, 26, 36, 36, 24, 14, 14, 14, 14, 28, 16, 32]);

    const admGeneral: (string | number)[][] = [
      ['Administración General', 'Total', ...BUCKETS_ESTATUS.map((b) => ETIQUETAS_BUCKET_ESTATUS[b])],
      ...per.porAdministracionGeneral.map((a) => [a.area, a.total, ...BUCKETS_ESTATUS.map((b) => a.porBucket[b])]),
    ];
    this.agregarHoja(XLSX, libro, 'Por Adm. General', admGeneral, [36, 10, 12, 12, 12, 12, 12, 16]);

    const admCentral: (string | number)[][] = [
      ['Administración Central', 'Total', ...BUCKETS_ESTATUS.map((b) => ETIQUETAS_BUCKET_ESTATUS[b])],
      ...per.porAdministracionCentral.map((a) => [a.area, a.total, ...BUCKETS_ESTATUS.map((b) => a.porBucket[b])]),
    ];
    this.agregarHoja(XLSX, libro, 'Por Adm. Central', admCentral, [36, 10, 12, 12, 12, 12, 12, 16]);

    const sinAtender: (string | number)[][] = [
      ['Expediente', 'Oficio', 'Remitente', 'Servicio', 'Estatus', 'Responsable', 'Fecha documento', 'Días sin atender'],
      ...panel.sinAtender.items.map((s) => [
        s.expediente, s.oficio, s.remitente, s.servicio, s.estatus, s.responsable,
        this.fechaTexto(s.fecha_documento), s.dias,
      ]),
    ];
    this.agregarHoja(XLSX, libro, `Sin atender ${panel.sinAtender.umbralDias}+ días`, sinAtender, [18, 28, 30, 26, 28, 32, 14, 14]);

    const metricas = panel.metricas;
    if (metricas?.vencidos && metricas.criticos.length > 0) {
      const criticos: (string | number)[][] = [
        ['Expediente', 'Oficio', 'Responsable', 'Estatus', 'Horas', 'Antigüedad'],
        ...filasCriticosServidor(metricas),
      ];
      this.agregarHoja(XLSX, libro, 'Críticos (servidor)', criticos, [18, 30, 34, 26, 10, 14]);
    }
    if (metricas && metricas.porResponsable.length > 0) {
      const porResponsable: (string | number)[][] = [
        ['Responsable', 'Total', 'Pendientes', 'Atendidos', 'Otros estatus'],
        ...metricas.porResponsable.map((r) => [r.responsable, r.total, r.pendientes, r.atendidos, r.otros]),
        [],
        ['Prioridad', 'Descripción', 'Expedientes'],
        ...metricas.porPrioridad.map((r) => [r.prioridad, r.descripcion, r.total]),
      ];
      this.agregarHoja(XLSX, libro, 'Responsable y prioridad', porResponsable, [40, 30, 12, 12, 14]);
    }

    XLSX.writeFile(libro, `${nombreBase}.xlsx`);
  }

  async exportarSinAtenderExcel(sinAtender: PanelSinAtender, nombreBase: string): Promise<void> {
    const XLSX = await import('xlsx');
    const libro = XLSX.utils.book_new();
    const filas: (string | number)[][] = [
      [`Asuntos sin atender con ${sinAtender.umbralDias}+ días`],
      ['Generado', new Date().toLocaleString('es-MX')],
      [],
      ['Expediente', 'Oficio', 'Remitente', 'Servicio', 'Estatus', 'Responsable', 'Fecha documento', 'Días sin atender'],
      ...sinAtender.items.map((s) => [
        s.expediente, s.oficio, s.remitente, s.servicio, s.estatus, s.responsable,
        this.fechaTexto(s.fecha_documento), s.dias,
      ]),
    ];
    this.agregarHoja(XLSX, libro, `Sin atender ${sinAtender.umbralDias}+ días`, filas, [18, 28, 30, 26, 28, 32, 14, 14]);
    XLSX.writeFile(libro, `${nombreBase}.xlsx`);
  }

  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  async exportarCriticosExcel(metricas: MetricasServidor, nombreBase: string): Promise<void> {
    const XLSX = await import('xlsx');
    const libro = XLSX.utils.book_new();
    const filas: (string | number)[][] = [
      ['Expedientes críticos'],
      ['Generado', new Date().toLocaleString('es-MX')],
      [],
      ['Expediente', 'Oficio', 'Responsable', 'Estatus', 'Horas', 'Antigüedad'],
      ...filasCriticosServidor(metricas),
    ];
    this.agregarHoja(XLSX, libro, 'Expedientes críticos', filas, [18, 30, 34, 26, 10, 14]);
    XLSX.writeFile(libro, `${nombreBase}.xlsx`);
  }

  async exportarPdf(panel: PanelDatos, nombreBase: string): Promise<void> {
    const [{ jsPDF }, imagenes] = await Promise.all([import('jspdf'), this.capturarGraficas()]);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    const margen = 14;

    doc.setFillColor(`#${COLOR_PRIMARIO}`);
    doc.rect(0, 0, ancho, 30, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(20);
    doc.text('Panel Estadístico Tlālcalli', margen, 19);
    doc.setTextColor(`#${COLOR_TEXTO}`);
    doc.setFontSize(12);
    doc.text(`Periodo (fecha del documento): ${etiquetaRango(panel.periodo.rango)}`, margen, 42);
    doc.setTextColor(`#${COLOR_GRIS}`);
    doc.setFontSize(10);
    doc.text(`Generado: ${panel.generado.toLocaleString('es-MX')}`, margen, 49);

    let y = 62;
    doc.setFontSize(12);
    for (const [indicador, valor] of filasResumenPeriodo(panel)) {
      doc.setTextColor(`#${COLOR_TEXTO}`);
      doc.text(String(indicador), margen, y);
      doc.setTextColor(`#${COLOR_PRIMARIO}`);
      doc.text(String(valor), ancho - margen, y, { align: 'right' });
      y += 9;
    }

    this.agregarPaginaTablaAdministracionEstatus(doc, panel, 'general', margen, ancho, alto);
    this.agregarPaginaTablaAdministracionEstatus(doc, panel, 'central', margen, ancho, alto);

    for (const img of imagenes) {
      doc.addPage();
      doc.setTextColor(`#${COLOR_PRIMARIO}`);
      doc.setFontSize(14);
      doc.text(img.titulo, margen, 16);
      const { w, h } = this.ajustar(img.ancho, img.alto, ancho - margen * 2, alto - 34);
      doc.addImage(img.dataUrl, 'PNG', (ancho - w) / 2, 24, w, h);
    }

    doc.save(`${nombreBase}.pdf`);
  }

  async exportarPresentacion(panel: PanelDatos, nombreBase: string): Promise<void> {
    const [{ default: PptxGenJS }, imagenes] = await Promise.all([import('pptxgenjs'), this.capturarGraficas()]);
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = 'Panel Estadístico Tlālcalli';
    const periodo = etiquetaRango(panel.periodo.rango);

    const portada = pptx.addSlide();
    portada.background = { color: COLOR_PRIMARIO };
    portada.addText('Panel Estadístico Tlālcalli', { x: 0.7, y: 2.4, w: 12, h: 1, fontSize: 40, bold: true, color: 'FFFFFF' });
    portada.addText(`Periodo (fecha del documento): ${periodo}`, { x: 0.7, y: 3.6, w: 12, h: 0.6, fontSize: 20, color: 'D6AE67' });
    portada.addText(`Generado: ${panel.generado.toLocaleString('es-MX')}`, { x: 0.7, y: 4.3, w: 12, h: 0.5, fontSize: 14, color: 'FFFFFF' });

    const kpis = pptx.addSlide();
    kpis.addText('Resumen del periodo', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 26, bold: true, color: COLOR_PRIMARIO });
    kpis.addTable(
      filasResumenPeriodo(panel).map(([indicador, valor]) => [
        { text: String(indicador), options: { color: COLOR_TEXTO } },
        { text: String(valor), options: { bold: true, color: COLOR_PRIMARIO, align: 'right' as const } },
      ]),
      { x: 0.5, y: 1.2, w: 12.3, colW: [9, 3.3], fontSize: 16, border: { type: 'solid', pt: 0.5, color: 'E6E3DC' }, rowH: 0.55 }
    );

    for (const vista of ['general', 'central'] as const) {
      const areaEstatus = filasTablaPorAdministracionEstatus(panel, vista);
      if (areaEstatus.filas.length === 0) {
        continue;
      }
      const slideArea = pptx.addSlide();
      const titulo =
        vista === 'general' ? 'Desglose por Administración General y estatus' : 'Desglose por Administración Central y estatus';
      slideArea.addText(titulo, {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLOR_PRIMARIO,
      });
      slideArea.addText(periodo, { x: 0.5, y: 0.85, w: 12.3, h: 0.35, fontSize: 12, color: COLOR_GRIS });
      const tabla = [
        areaEstatus.encabezados.map((h) => ({ text: h, options: { bold: true, color: COLOR_PRIMARIO } })),
        ...areaEstatus.filas.map((fila) =>
          fila.map((celda, i) => ({
            text: String(celda),
            options: { color: COLOR_TEXTO, align: (i === 0 ? 'left' : 'right') as 'left' | 'right' },
          }))
        ),
      ];
      slideArea.addTable(tabla, {
        x: 0.35,
        y: 1.25,
        w: 12.6,
        fontSize: 11,
        border: { type: 'solid', pt: 0.5, color: 'E6E3DC' },
        rowH: 0.35,
      });
    }

    for (const img of imagenes) {
      const slide = pptx.addSlide();
      slide.addText(img.titulo, { x: 0.5, y: 0.25, w: 12.3, h: 0.6, fontSize: 24, bold: true, color: COLOR_PRIMARIO });
      slide.addText(periodo, { x: 0.5, y: 0.8, w: 12.3, h: 0.35, fontSize: 12, color: COLOR_GRIS });
      const { w, h } = this.ajustar(img.ancho, img.alto, 12.3, 6);
      slide.addImage({ data: img.dataUrl, x: (13.33 - w) / 2, y: 1.3, w, h });
    }

    await pptx.writeFile({ fileName: `${nombreBase}.pptx` });
  }

  /** Captura las tarjetas marcadas con `data-export-chart` tal como se ven en pantalla. */
  private async capturarGraficas(): Promise<ImagenGrafica[]> {
    const { default: html2canvas } = await import('html2canvas');
    const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-export-chart]'));
    const imagenes: ImagenGrafica[] = [];
    for (const el of elementos) {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true, logging: false });
      imagenes.push({
        titulo: el.dataset['exportChart'] || 'Gráfica',
        dataUrl: canvas.toDataURL('image/png'),
        ancho: canvas.width,
        alto: canvas.height,
      });
    }
    return imagenes;
  }

  private agregarPaginaTablaAdministracionEstatus(
    doc: import('jspdf').jsPDF,
    panel: PanelDatos,
    vista: 'general' | 'central',
    margen: number,
    ancho: number,
    alto: number
  ): void {
    const { encabezados, filas } = filasTablaPorAdministracionEstatus(panel, vista);
    if (!filas.length) {
      return;
    }
    doc.addPage();
    doc.setTextColor(`#${COLOR_PRIMARIO}`);
    doc.setFontSize(14);
    const titulo =
      vista === 'general'
        ? 'Desglose por Administración General y estatus'
        : 'Desglose por Administración Central y estatus';
    doc.text(titulo, margen, 16);
    doc.setTextColor(`#${COLOR_GRIS}`);
    doc.setFontSize(10);
    doc.text(`Periodo: ${etiquetaRango(panel.periodo.rango)}`, margen, 23);

    const cols = encabezados.length;
    const anchoUtil = ancho - margen * 2;
    const anchoCol = anchoUtil / cols;
    let y = 32;
    doc.setFontSize(8);

    const pintarFila = (valores: string[], negrita = false) => {
      if (y > alto - 14) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', negrita ? 'bold' : 'normal');
      valores.forEach((texto, i) => {
        const x = margen + i * anchoCol + (i === 0 ? 0 : 2);
        const truncado = texto.length > 28 ? `${texto.slice(0, 27)}…` : texto;
        doc.text(truncado, x, y, { align: i === 0 ? 'left' : 'right', maxWidth: anchoCol - 4 });
      });
      y += 5;
    };

    pintarFila(encabezados, true);
    for (const fila of filas) {
      pintarFila(fila.map(String));
    }
  }

  private ajustar(ancho: number, alto: number, maxAncho: number, maxAlto: number): { w: number; h: number } {
    const escala = Math.min(maxAncho / ancho, maxAlto / alto);
    return { w: ancho * escala, h: alto * escala };
  }

  private agregarHoja(
    XLSX: typeof import('xlsx'),
    libro: import('xlsx').WorkBook,
    nombre: string,
    filas: (string | number)[][],
    anchos: number[]
  ): void {
    const hoja = XLSX.utils.aoa_to_sheet(filas);
    hoja['!cols'] = anchos.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(libro, hoja, nombre.slice(0, 31));
  }

  private fechaTexto(valor: string | Date | null | undefined): string {
    const fecha = DateUtils.parseFechaLocal(valor ?? null);
    return fecha ? fechaIso(fecha) : '';
  }
}
