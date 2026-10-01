import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexPlotOptions, ApexFill, ApexStroke, ApexDataLabels, ApexLegend, ApexResponsive, ApexTitleSubtitle, ApexGrid, ApexTooltip } from 'ng-apexcharts';
import { interval, Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardPanelFacade } from '../../services/dashboard-panel.facade';
import { PanelDatos, formatearDuracion } from '../../services/dashboard-panel.utils';
import { PermissionsService } from '../../../services/permissions.service';
import { DashboardBandejaCardsComponent } from '../../components/dashboard-bandeja-cards/dashboard-bandeja-cards.component';
import { DashboardCriticosAlertasComponent } from '../../components/dashboard-criticos-alertas/dashboard-criticos-alertas.component';
import { DashboardReportesBarComponent } from '../../components/dashboard-reportes-bar/dashboard-reportes-bar.component';
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
    imports: [
        CommonModule,
        MatTooltipModule,
        RouterLink,
        NgApexchartsModule,
        DashboardBandejaCardsComponent,
        DashboardCriticosAlertasComponent,
        DashboardReportesBarComponent
    ],
    templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  readonly panel = signal<PanelDatos | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly puedeExportar = toSignal(inject(PermissionsService).canAccessBandeja('reportes'), { initialValue: false });

  // Opciones de los gráficos
  chartEstatusOptions!: Partial<ChartOptions>;
  chartResponsablesOptions!: Partial<ChartOptions>;
  chartTendenciaOptions!: Partial<ChartOptions>;
  chartSemaforoOptions!: Partial<ChartOptions>;
  chartTipoAccionOptions?: Partial<ChartOptions>;
  tendenciaConAtendidos = false;

  private refreshSubscription?: Subscription;
  private cargaSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private panelFacade: DashboardPanelFacade
  ) {}

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
    this.cargaSubscription = this.panelFacade.cargarPanel().subscribe({
      next: (datos) => {
        this.configurarGraficos(datos);
        this.panel.set(datos);
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

  private configurarGraficos(p: PanelDatos): void {
    const g = p.graficas;
    const semaforo = p.kpis.semaforo;

    // Gráfico de Estatus (Donut)
    this.chartEstatusOptions = {
      series: g.porEstatus.map(e => e.cantidad),
      chart: {
        type: 'donut',
        height: 360,
        fontFamily: 'Noto Sans, sans-serif',
        animations: {
          enabled: true,
          speed: 800
        },
        dropShadow: {
          enabled: true,
          top: 3,
          left: 0,
          blur: 10,
          opacity: 0.2
        }
      },
      labels: g.porEstatus.map(e => this.dashboardService.getLabelEstatus(e.estatus)),
      colors: ['#3E0065', '#977DAB', '#D6AE67', '#5D337C', '#00B37A', '#8540B9', '#FFA400'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 700,
                color: '#230142'
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 600,
                color: '#7F7D7B'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 500,
        height: 56,
        markers: {
        }
      },
      stroke: {
        width: 2,
        colors: ['#fff']
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 280 },
          legend: { position: 'bottom' }
        }
      }]
    };

    // Gráfico de Responsables (Bar horizontal)
    this.chartResponsablesOptions = {
      series: [{
        name: 'Pendientes',
        data: g.porResponsable.slice(0, 6).map(r => r.pendientes)
      }, {
        name: 'Atendidos',
        data: g.porResponsable.slice(0, 6).map(r => r.atendidos)
      }],
      chart: {
        type: 'bar',
        height: 320,
        stacked: true,
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        animations: {
          enabled: true,
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '60%',
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '12px',
                fontWeight: 700
              }
            }
          }
        }
      },
      colors: ['#FFA400', '#00B37A'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: g.porResponsable.slice(0, 6).map(r => 
          r.responsable.length > 15 ? r.responsable.substring(0, 15) + '...' : r.responsable
        ),
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px'
      },
      grid: {
        borderColor: '#E6E3DC',
        strokeDashArray: 4
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} expedientes`
        }
      }
    };

    // Gráfico de Tendencia (Area)
    const tendenciaData = g.tendencia;
    this.tendenciaConAtendidos = tendenciaData.some(t => t.atendidos > 0);
    const seriesTendencia = [{ name: 'Capturados', data: tendenciaData.map(t => t.creados) }];
    if (this.tendenciaConAtendidos) {
      seriesTendencia.push({ name: 'Atendidos', data: tendenciaData.map(t => t.atendidos) });
    }
    this.chartTendenciaOptions = {
      series: seriesTendencia,
      chart: {
        type: 'area',
        height: 300,
        fontFamily: 'Noto Sans, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          speed: 800
        }
      },
      colors: ['#3E0065', '#00B37A'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: tendenciaData.map(t => `Sem ${t.semana.split('-')[1]}`),
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        decimalsInFloat: 0,
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px'
      },
      grid: {
        borderColor: '#E6E3DC',
        strokeDashArray: 4
      },
      tooltip: {
        x: {
          format: 'Semana'
        }
      }
    };

    // Gráfico de Semáforo (Radial)
    const valoresSemaforo = [semaforo.en_tiempo, semaforo.atencion, semaforo.urgente, semaforo.vencido];
    const totalSemaforo = valoresSemaforo.reduce((acc, v) => acc + v, 0);
    this.chartSemaforoOptions = {
      series: valoresSemaforo.map(v => totalSemaforo > 0 ? Math.round((v / totalSemaforo) * 100) : 0),
      chart: {
        type: 'radialBar',
        height: 320,
        fontFamily: 'Noto Sans, sans-serif',
        animations: {
          enabled: true,
          speed: 800
        }
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent'
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors: ['#00B37A', '#FFA400', '#F41B1D', '#27262C'],
      labels: ['En tiempo (0-24 h)', 'Atención (24-48 h)', 'Urgente (48-72 h)', 'Vencido (+72 h)'],
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 500,
        markers: {
        },
        formatter: (seriesName: string, opts: any) => `${seriesName}: ${valoresSemaforo[opts.seriesIndex] ?? 0}`
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 280 }
        }
      }]
    };

    // Gráfico de Tipo de Acción (Bar vertical)
    this.chartTipoAccionOptions = undefined;
    if (g.porTipoAccion.length > 0) {
      this.chartTipoAccionOptions = {
        series: [{
          name: 'Total',
          data: g.porTipoAccion.map(t => t.cantidad)
        }, {
          name: 'Urgentes',
          data: g.porTipoAccion.map(t => t.urgentes)
        }],
        chart: {
          type: 'bar',
          height: 280,
          fontFamily: 'Noto Sans, sans-serif',
          toolbar: { show: false },
          animations: {
            enabled: true,
            speed: 800
          }
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '60%',
            dataLabels: {
              position: 'top'
            }
          }
        },
        colors: ['#3E0065', '#F41B1D'],
        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: {
            fontSize: '11px',
            fontWeight: 700,
            colors: ['#230142']
          }
        },
        xaxis: {
          categories: g.porTipoAccion.map(t => 
            this.dashboardService.getLabelTipoAccion(t.tipo_accion)
          ),
          labels: {
            style: {
              fontSize: '10px'
            },
            rotate: -45,
            rotateAlways: true
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '11px'
            }
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          fontSize: '12px'
        },
        grid: {
          borderColor: '#E6E3DC',
          strokeDashArray: 4
        }
      };
    }
  }

  formatearHoras(horas: number): string {
    return formatearDuracion(horas);
  }

  getLabelEstatus(estatus: string): string {
    return this.dashboardService.getLabelEstatus(estatus);
  }

  refrescar(): void {
    this.cargarDatos();
  }

  porcentaje(valor: number, total: number): string {
    return total > 0 ? `${Math.round((valor / total) * 100)}%` : '0%';
  }
}


