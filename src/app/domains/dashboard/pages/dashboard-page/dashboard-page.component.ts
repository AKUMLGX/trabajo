import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexPlotOptions, ApexFill, ApexStroke, ApexDataLabels, ApexLegend, ApexResponsive, ApexTitleSubtitle, ApexGrid, ApexTooltip } from 'ng-apexcharts';
import { interval, Subscription } from 'rxjs';
import { DashboardPanelFacade } from '../../services/dashboard-panel.facade';
import {
  FuentesPanel,
  PanelDatos,
  RangoFechas,
  AreaPeriodo,
  VistaAdministracionRemitente,
  agrupacionAdministracionPeriodo,
  construirPanel,
  formatearDias,
  soloAdministracionSinDato,
  rangoHoy,
  ServicioDetalle,
} from '../../services/dashboard-panel.utils';
import {
  BUCKETS_ESTATUS,
  COLORES_BUCKET_ESTATUS,
  ETIQUETAS_BUCKET_ESTATUS,
} from '../../services/dashboard-estatus-negocio.utils';
import { DashboardReportesBarComponent } from '../../components/dashboard-reportes-bar/dashboard-reportes-bar.component';
import { DashboardFiltroPeriodoComponent } from '../../components/dashboard-filtro-periodo/dashboard-filtro-periodo.component';
import { DashboardSinAtenderComponent } from '../../components/dashboard-sin-atender/dashboard-sin-atender.component';
import { DashboardMetricasServidorComponent } from '../../components/dashboard-metricas-servidor/dashboard-metricas-servidor.component';
import { EtiquetaEstatusPipe } from '../../../shared/pipes/etiqueta-estatus.pipe';
// Tipos para los gráficos
export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  legend?: ApexLegend;
  responsive?: ApexResponsive[];
  title?: ApexTitleSubtitle;
  grid?: ApexGrid;
  colors?: string[];
  labels?: string[];
  tooltip?: ApexTooltip;
};

@Component({
    selector: 'app-dashboard-page',
    imports: [EtiquetaEstatusPipe, 
        CommonModule,
        MatTooltipModule,
        RouterLink,
        NgApexchartsModule,
        DashboardReportesBarComponent,
        DashboardFiltroPeriodoComponent,
        DashboardSinAtenderComponent,
        DashboardMetricasServidorComponent
    ],
    templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  readonly panel = signal<PanelDatos | null>(null);
  readonly cargando = signal(true);
  readonly recalculandoPeriodo = signal(false);
  readonly error = signal<string | null>(null);
  readonly rango = signal<RangoFechas>(rangoHoy());

  readonly bucketsEstatus = BUCKETS_ESTATUS;
  readonly etiquetasBucketEstatus = ETIQUETAS_BUCKET_ESTATUS;
  readonly maxAreasGrafica = 12;

  // Opciones de los gráficos
  chartEstatusOptions!: Partial<ChartOptions>;
  chartServicioOptions!: Partial<ChartOptions>;
  chartAdminGeneralOptions!: Partial<ChartOptions>;
  chartAdminCentralOptions!: Partial<ChartOptions>;
  readonly vistaAdministracionRemitente = signal<VistaAdministracionRemitente>('general');

  private fuentes: FuentesPanel | null = null;
  private refreshSubscription?: Subscription;
  private cargaSubscription?: Subscription;

  constructor(private panelFacade: DashboardPanelFacade) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.cargarDatos(true);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.cargaSubscription?.unsubscribe();
  }

  cargarDatos(silencioso = false): void {
    if (!silencioso) {
      this.cargando.set(true);
    }

    this.cargaSubscription?.unsubscribe();
    this.cargaSubscription = this.panelFacade.cargarFuentes().subscribe({
      next: (fuentes) => {
        this.fuentes = fuentes;
        this.recalcular();
        this.error.set(null);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando panel estadístico:', err);
        this.error.set('Error al cargar las estadísticas');
        this.cargando.set(false);
      }
    });
  }

  /** Cambiar el periodo no vuelve a consultar el back: recalcula con las fuentes ya cargadas. */
  cambiarRango(rango: RangoFechas): void {
    this.recalculandoPeriodo.set(true);
    this.rango.set(rango);
    const inicio = Date.now();
    this.recalcular();
    const restante = Math.max(0, 200 - (Date.now() - inicio));
    setTimeout(() => this.recalculandoPeriodo.set(false), restante);
  }

  private recalcular(): void {
    if (!this.fuentes) {
      return;
    }
    const datos = construirPanel(
      this.fuentes,
      new Date(),
      this.rango(),
      this.panelFacade.getCatalogoRemitente()
    );
    this.configurarGraficos(datos);
    this.panel.set(datos);
  }

  private configurarGraficos(p: PanelDatos): void {
    const per = p.periodo;

    const estatusDonut = this.seriesDonut(BUCKETS_ESTATUS.map((b) => ({ clave: b, valor: per.porBucketEstatus[b], etiqueta: ETIQUETAS_BUCKET_ESTATUS[b], color: COLORES_BUCKET_ESTATUS[b] })));

    this.chartEstatusOptions = this.construirDonut(estatusDonut);
    this.chartServicioOptions = this.construirChartServicio(per.porServicio, per.capturadas);

    this.chartAdminGeneralOptions = this.construirChartAdministracion(
      per.porAdministracionGeneral.slice(0, this.maxAreasGrafica)
    );
    this.chartAdminCentralOptions = this.construirChartAdministracion(
      per.porAdministracionCentral.slice(0, this.maxAreasGrafica)
    );
  }

  /** Donut con total al centro y porcentaje sobre cada segmento; misma altura para ambas gráficas. */
  private construirDonut(datos: { valores: number[]; etiquetas: string[]; colores: string[] }): Partial<ChartOptions> {
    return {
      series: datos.valores,
      chart: {
        type: 'donut',
        height: 360,
        fontFamily: 'Noto Sans, sans-serif',
        animations: { enabled: true, speed: 700 },
      },
      labels: datos.etiquetas,
      colors: datos.colores,
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '62%',
            labels: {
              show: true,
              name: { show: true, fontSize: '13px', fontWeight: 600, color: '#7F7D7B' },
              value: { show: true, fontSize: '30px', fontWeight: 800, color: '#230142' },
              total: { show: true, label: 'Solicitudes', fontSize: '13px', fontWeight: 600, color: '#7F7D7B' },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val >= 4 ? `${Math.round(val)}%` : ''),
        style: { fontSize: '12px', fontWeight: 700 },
        dropShadow: { enabled: false },
      },
      legend: {
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 500,
        itemMargin: { horizontal: 10, vertical: 4 },
        formatter: (nombre: string, opts: { seriesIndex: number }) =>
          `${nombre}: ${datos.valores[opts.seriesIndex] ?? 0}`,
      },
      stroke: { width: 3, colors: ['#fff'] },
      tooltip: { y: { formatter: (val: number) => `${val} solicitud(es)` } },
    };
  }

  /** Una barra por servicio del catálogo; los que no tienen solicitudes se muestran en 0 y en gris. */
  private construirChartServicio(servicios: ServicioDetalle[], total: number): Partial<ChartOptions> {
    return {
      series: [{ name: 'Solicitudes', data: servicios.map((s) => s.cantidad) }],
      chart: {
        type: 'bar',
        height: Math.max(300, servicios.length * 34 + 60),
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 700 },
      },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 5, barHeight: '68%', distributed: true, dataLabels: { position: 'top' } },
      },
      colors: servicios.map((s) => (s.cantidad > 0 ? '#3E0065' : '#D9D4E3')),
      dataLabels: {
        enabled: true,
        offsetX: 30,
        formatter: (val: number) => (val > 0 ? `${val} · ${this.porcentaje(val, total)}` : '0'),
        style: { fontSize: '12px', fontWeight: 700, colors: ['#230142'] },
      },
      stroke: { width: 0 },
      xaxis: {
        categories: servicios.map((s) => s.servicio),
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        max: Math.max(...servicios.map((s) => s.cantidad), 1) * 1.25,
      },
      yaxis: { labels: { style: { fontSize: '12px', fontWeight: 500, colors: ['#230142'] }, maxWidth: 200 } },
      legend: { show: false },
      grid: { show: false, padding: { left: 4, right: 16 } },
      tooltip: { y: { formatter: (val: number) => `${val} solicitud(es)` } },
    };
  }

  cambiarVistaAdministracion(vista: VistaAdministracionRemitente): void {
    this.vistaAdministracionRemitente.set(vista);
  }

  agrupacionActiva(per: PanelDatos['periodo']): AreaPeriodo[] {
    return agrupacionAdministracionPeriodo(per, this.vistaAdministracionRemitente());
  }

  private construirChartAdministracion(areas: AreaPeriodo[]): Partial<ChartOptions> {
    const etiquetaCorta = (nombre: string) => (nombre.length > 32 ? `${nombre.substring(0, 32)}…` : nombre);
    return {
      series: [{
        name: 'Solicitudes',
        data: areas.map((a) => a.total),
      }],
      chart: {
        type: 'bar',
        height: Math.max(280, areas.length * 42 + 100),
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '70%',
          distributed: true,
        },
      },
      colors: ['#3E0065', '#5A1A7A', '#7A3D9A', '#9B5FBA', '#B88AD0', '#D4B8E8', '#3E0065', '#5A1A7A', '#7A3D9A', '#9B5FBA', '#B88AD0', '#D4B8E8'],
      dataLabels: {
        enabled: true,
        offsetX: 24,
        style: { fontSize: '12px', fontWeight: 700, colors: ['#230142'] },
      },
      stroke: { width: 0 },
      xaxis: {
        categories: areas.map((a) => etiquetaCorta(a.area)),
        labels: { style: { fontSize: '11px' } },
        tickAmount: undefined,
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px', fontWeight: 500, colors: ['#230142'] },
          maxWidth: 240,
        },
      },
      legend: { show: false },
      grid: { borderColor: '#E6E3DC', strokeDashArray: 4, padding: { left: 8, right: 24 } },
      tooltip: {
        y: { formatter: (val: number) => `${val} solicitud(es)` },
        x: { formatter: (_: number, opts: { dataPointIndex: number }) => areas[opts.dataPointIndex]?.area ?? '' },
      },
    };
  }

  todoSinDatoAdministracion(per: PanelDatos['periodo']): boolean {
    return soloAdministracionSinDato(per, this.vistaAdministracionRemitente());
  }

  private seriesDonut(
    puntos: { clave: string; valor: number; etiqueta: string; color: string }[]
  ): { valores: number[]; etiquetas: string[]; colores: string[] } {
    const activos = puntos.filter((p) => p.valor > 0);
    const lista = activos.length ? activos : puntos;
    return {
      valores: lista.map((p) => p.valor),
      etiquetas: lista.map((p) => p.etiqueta),
      colores: lista.map((p) => p.color),
    };
  }

  /** Etiqueta corta para chips y leyendas de administración. */
  etiquetaAdministracion(area: string): string {
    const texto = (area || '').trim();
    return texto.length > 40 ? `${texto.substring(0, 40)}…` : texto;
  }

  formatearDias(dias: number | null): string {
    return formatearDias(dias);
  }

  refrescar(): void {
    this.cargarDatos();
  }

  porcentaje(valor: number, total: number): string {
    return `${this.porcentajeNumero(valor, total)}%`;
  }

  porcentajeNumero(valor: number, total: number): number {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  }

  irASinAtender(): void {
    document.getElementById('sin-atender')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


