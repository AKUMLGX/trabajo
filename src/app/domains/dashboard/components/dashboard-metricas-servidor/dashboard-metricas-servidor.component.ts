import { Component, Input, OnChanges, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { avisoMetricasServidor, formatearHoras } from '../../services/dashboard-panel.utils';
import { COLORES_BUCKET_ESTATUS } from '../../services/dashboard-estatus-negocio.utils';
import {
  MetricaPrioridad,
  MetricaResponsable,
  MetricasPanelService,
  MetricasServidor,
} from '../../services/metricas-panel.service';
import { firstValueFrom } from 'rxjs';
import { DashboardExportService } from '../../services/dashboard-export.service';
import { TablaPaginadorComponent } from '../../../shared/components/tabla-paginador/tabla-paginador.component';
import { EtiquetaEstatusPipe } from '../../../shared/pipes/etiqueta-estatus.pipe';
import { DashboardRemitentesServidorComponent } from '../dashboard-remitentes-servidor/dashboard-remitentes-servidor.component';

interface OpcionesBarra {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  stroke: ApexStroke;
  grid: ApexGrid;
  tooltip: ApexTooltip;
}

@Component({
  selector: 'app-dashboard-metricas-servidor',
  imports: [
    EtiquetaEstatusPipe,
    NgClass,
    RouterLink,
    MatSnackBarModule,
    MatTooltipModule,
    NgApexchartsModule,
    TablaPaginadorComponent,
    DashboardRemitentesServidorComponent,
  ],
  templateUrl: './dashboard-metricas-servidor.component.html',
})
export class DashboardMetricasServidorComponent implements OnChanges {
  @Input({ required: true }) metricas!: MetricasServidor | null;

  readonly tamanoPagina = 10;
  readonly maxResponsablesGrafica = 12;
  paginaCriticos = 1;
  descargandoCriticos = false;

  private readonly exportService = inject(DashboardExportService);
  private readonly metricasService = inject(MetricasPanelService);
  private readonly snackBar = inject(MatSnackBar);

  aviso: string | null = null;
  chartResponsable: OpcionesBarra | null = null;
  chartPrioridad: OpcionesBarra | null = null;

  ngOnChanges(): void {
    this.aviso = avisoMetricasServidor(this.metricas);
    this.paginaCriticos = 1;
    const m = this.metricas;
    this.chartResponsable = m?.porResponsable.length
      ? this.construirChartResponsable(m.porResponsable.slice(0, this.maxResponsablesGrafica))
      : null;
    this.chartPrioridad = m?.porPrioridad.length ? this.construirChartPrioridad(m.porPrioridad) : null;
  }

  async descargarCriticos(): Promise<void> {
    if (!this.metricas || this.descargandoCriticos) return;
    this.descargandoCriticos = true;
    try {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
      const nombre = `expedientes_criticos_${fecha}`;
      const resultado = await firstValueFrom(this.metricasService.descargarCriticosExcelServidor());
      if (resultado.tipo === 'archivo') {
        this.exportService.descargarArchivo(resultado.blob, `${nombre}.xlsx`);
        this.snackBar.open('Reporte descargado (generado en el servidor).', 'Cerrar', { duration: 4000 });
        return;
      }
      if (resultado.tipo === 'sin_datos') {
        this.snackBar.open(resultado.mensaje, 'Cerrar', { duration: 5000 });
        return;
      }
      if (this.metricas.criticos.length > 0) {
        await this.exportService.exportarCriticosExcel(this.metricas, nombre);
        this.snackBar.open('El servidor no devolvió archivo; se generó un Excel local con la tabla visible.', 'Cerrar', {
          duration: 5000,
        });
        return;
      }
      this.snackBar.open('No hay expedientes críticos para exportar.', 'Cerrar', { duration: 4000 });
    } finally {
      this.descargandoCriticos = false;
    }
  }

  get criticosVisibles() {
    const inicio = (this.paginaCriticos - 1) * this.tamanoPagina;
    return (this.metricas?.criticos ?? []).slice(inicio, inicio + this.tamanoPagina);
  }

  formatearHoras(horas: number | null | undefined): string {
    return formatearHoras(horas);
  }

  /** Más de 30 días se marca como el caso más grave. */
  esExtremo(horas: number): boolean {
    return horas >= 24 * 30;
  }

  private construirChartResponsable(filas: MetricaResponsable[]): OpcionesBarra {
    const etiqueta = (nombre: string) => (nombre.length > 34 ? `${nombre.substring(0, 34)}…` : nombre);
    return {
      series: [
        { name: 'Pendientes', data: filas.map((f) => f.pendientes) },
        { name: 'Atendidos', data: filas.map((f) => f.atendidos) },
        { name: 'Otros estatus', data: filas.map((f) => f.otros) },
      ],
      chart: {
        type: 'bar',
        stacked: true,
        height: Math.max(260, filas.length * 40 + 90),
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 700 },
      },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '64%' } },
      colors: [COLORES_BUCKET_ESTATUS.PENDIENTE, COLORES_BUCKET_ESTATUS.ATENDIDA, '#B8AFC6'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val > 0 ? String(val) : ''),
        style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      },
      stroke: { width: 1, colors: ['#fff'] },
      xaxis: { categories: filas.map((f) => etiqueta(f.responsable)), labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { style: { fontSize: '12px', fontWeight: 500, colors: ['#230142'] }, maxWidth: 240 } },
      legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px' },
      grid: { borderColor: '#E6E3DC', strokeDashArray: 4, padding: { left: 8, right: 16 } },
      tooltip: {
        shared: true,
        intersect: false,
        x: { formatter: (_: number, opts: { dataPointIndex: number }) => filas[opts.dataPointIndex]?.responsable ?? '' },
        y: { formatter: (val: number) => `${val} expediente(s)` },
      },
    };
  }

  private construirChartPrioridad(filas: MetricaPrioridad[]): OpcionesBarra {
    return {
      series: [{ name: 'Expedientes', data: filas.map((f) => f.total) }],
      chart: {
        type: 'bar',
        height: Math.max(220, filas.length * 48 + 70),
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 700 },
      },
      plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '62%', distributed: true, dataLabels: { position: 'top' } } },
      colors: filas.map((f) => this.colorPrioridad(f.prioridad)),
      dataLabels: {
        enabled: true,
        offsetX: 24,
        style: { fontSize: '12px', fontWeight: 700, colors: ['#230142'] },
      },
      stroke: { width: 0 },
      xaxis: {
        categories: filas.map((f) => f.prioridad),
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        max: Math.max(...filas.map((f) => f.total), 1) * 1.2,
      },
      yaxis: { labels: { style: { fontSize: '12px', fontWeight: 600, colors: ['#230142'] }, maxWidth: 180 } },
      legend: { show: false },
      grid: { show: false, padding: { left: 4, right: 16 } },
      tooltip: {
        x: { formatter: (_: number, opts: { dataPointIndex: number }) => filas[opts.dataPointIndex]?.descripcion ?? '' },
        y: { formatter: (val: number) => `${val} expediente(s)` },
      },
    };
  }

  private colorPrioridad(prioridad: string): string {
    const p = prioridad.toUpperCase();
    if (p.includes('EXTRA')) return '#C8102E';
    if (p.includes('URGENTE')) return COLORES_BUCKET_ESTATUS.PENDIENTE;
    return '#3E0065';
  }
}
