import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexPlotOptions, ApexFill, ApexStroke, ApexDataLabels, ApexLegend, ApexResponsive, ApexTitleSubtitle, ApexGrid, ApexTooltip } from 'ng-apexcharts';
import { interval, Subscription } from 'rxjs';
import { DashboardService, DashboardCompleto, ExpedienteCritico } from '../../services/dashboard.service';
import { FolioCardsComponent } from '../../../responsables/components/folio-cards/folio-cards/folio-cards.component';
import { FolioCard, EstadisticoAtencionResponse } from '../../../interfaces/foliocard.interface';
import { ApiService } from '../../../capture/services/api.service';
import { HttpResponse } from '@angular/common/http';
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
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule,
    NgApexchartsModule,
    FolioCardsComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  @ViewChild('chartEstatus') chartEstatus!: ChartComponent;
  @ViewChild('chartResponsables') chartResponsables!: ChartComponent;
  @ViewChild('chartTendencia') chartTendencia!: ChartComponent;
  @ViewChild('chartSemaforo') chartSemaforo!: ChartComponent;

  dashboard: DashboardCompleto | null = null;
  cargando = true;
  error: string | null = null;
  ultimaActualizacion: Date = new Date();

  // Opciones de los gráficos
  chartEstatusOptions!: Partial<ChartOptions>;
  chartResponsablesOptions!: Partial<ChartOptions>;
  chartTendenciaOptions!: Partial<ChartOptions>;
  chartSemaforoOptions!: Partial<ChartOptions>;
  chartTipoAccionOptions!: Partial<ChartOptions>;

  foliosCards: FolioCard[] = [];

  private refreshSubscription?: Subscription;

  constructor(private dashboardService: DashboardService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarEstadisticosAtencion();
    this.cargarDatos();
    // Auto-refresh cada 60 segundos
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.cargarDatos(true);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  cargarDatos(silencioso = false): void {
    if (!silencioso) {
      this.cargando = true;
    }

    this.dashboardService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.ultimaActualizacion = new Date();
        this.configurarGraficos();
        this.cargando = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.error = 'Error al cargar las estadísticas';
        this.cargando = false;
      }
    });
  }

  private configurarGraficos(): void {
    if (!this.dashboard) return;

    // Gráfico de Estatus (Donut)
    this.chartEstatusOptions = {
      series: this.dashboard.por_estatus.map(e => e.cantidad),
      chart: {
        type: 'donut',
        height: 320,
        fontFamily: 'Montserrat, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
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
      labels: this.dashboard.por_estatus.map(e => this.dashboardService.getLabelEstatus(e.estatus)),
      colors: ['#691C32', '#8B2A44', '#C9A227', '#235B4E', '#10B981', '#6366F1', '#F59E0B'],
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
                color: '#1a1a1a'
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b7280'
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
        markers: {
          width: 12,
          height: 12,
          radius: 4
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
        data: this.dashboard.por_responsable.slice(0, 6).map(r => r.pendientes)
      }, {
        name: 'Atendidos',
        data: this.dashboard.por_responsable.slice(0, 6).map(r => r.atendidos)
      }],
      chart: {
        type: 'bar',
        height: 320,
        stacked: true,
        fontFamily: 'Montserrat, sans-serif',
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
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
      colors: ['#F59E0B', '#10B981'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: this.dashboard.por_responsable.slice(0, 6).map(r => 
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
        borderColor: '#f0f0f0',
        strokeDashArray: 4
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} expedientes`
        }
      }
    };

    // Gráfico de Tendencia (Area)
    const tendenciaData = this.dashboard.tendencia_semanal.reverse();
    this.chartTendenciaOptions = {
      series: [{
        name: 'Creados',
        data: tendenciaData.map(t => t.creados)
      }, {
        name: 'Atendidos',
        data: tendenciaData.map(t => t.atendidos)
      }],
      chart: {
        type: 'area',
        height: 300,
        fontFamily: 'Montserrat, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      colors: ['#691C32', '#10B981'],
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
        borderColor: '#f0f0f0',
        strokeDashArray: 4
      },
      tooltip: {
        x: {
          format: 'Semana'
        }
      }
    };

    // Gráfico de Semáforo (Radial)
    const totalSemaforo = this.dashboard.semaforo.en_tiempo + this.dashboard.semaforo.atencion + 
                          this.dashboard.semaforo.urgente + this.dashboard.semaforo.vencido;
    this.chartSemaforoOptions = {
      series: [
        totalSemaforo > 0 ? Math.round((this.dashboard.semaforo.en_tiempo / totalSemaforo) * 100) : 0,
        totalSemaforo > 0 ? Math.round((this.dashboard.semaforo.atencion / totalSemaforo) * 100) : 0,
        totalSemaforo > 0 ? Math.round((this.dashboard.semaforo.urgente / totalSemaforo) * 100) : 0,
        totalSemaforo > 0 ? Math.round((this.dashboard.semaforo.vencido / totalSemaforo) * 100) : 0
      ],
      chart: {
        type: 'radialBar',
        height: 320,
        fontFamily: 'Montserrat, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
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
      colors: ['#10B981', '#F59E0B', '#EF4444', '#1F2937'],
      labels: ['En Tiempo', 'Atención', 'Urgente', 'Vencido'],
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 500,
        markers: {
          width: 12,
          height: 12,
          radius: 4
        },
        formatter: (seriesName: string, opts: any) => {
          const idx = opts.seriesIndex;
          const valores = [
            this.dashboard?.semaforo.en_tiempo || 0,
            this.dashboard?.semaforo.atencion || 0,
            this.dashboard?.semaforo.urgente || 0,
            this.dashboard?.semaforo.vencido || 0
          ];
          return `${seriesName}: ${valores[idx]}`;
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 280 }
        }
      }]
    };

    // Gráfico de Tipo de Acción (Bar vertical)
    if (this.dashboard.por_tipo_accion.length > 0) {
      this.chartTipoAccionOptions = {
        series: [{
          name: 'Total',
          data: this.dashboard.por_tipo_accion.map(t => t.cantidad)
        }, {
          name: 'Urgentes',
          data: this.dashboard.por_tipo_accion.map(t => t.urgentes)
        }],
        chart: {
          type: 'bar',
          height: 280,
          fontFamily: 'Montserrat, sans-serif',
          toolbar: { show: false },
          animations: {
            enabled: true,
            easing: 'easeinout',
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
        colors: ['#691C32', '#EF4444'],
        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: {
            fontSize: '11px',
            fontWeight: 700,
            colors: ['#1a1a1a']
          }
        },
        xaxis: {
          categories: this.dashboard.por_tipo_accion.map(t => 
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
          borderColor: '#f0f0f0',
          strokeDashArray: 4
        }
      };
    }
  }

  // Helpers para la vista
  getColorEstatus(estatus: string): string {
    const colores: { [key: string]: string } = {
      'ASIGNADO': 'asignado',
      'PENDIENTE': 'pendiente',
      'EN_ATENCION': 'en-atencion',
      'RECHAZADO': 'rechazado',
      'ATENCION_TOTAL': 'atendido',
      'REVISION_LEGAL': 'revision'
    };
    return colores[estatus] || 'default';
  }

  formatearHoras(horas: number): string {
    return this.dashboardService.formatearHoras(horas);
  }

  getLabelEstatus(estatus: string): string {
    return this.dashboardService.getLabelEstatus(estatus);
  }

  refrescar(): void {
    this.cargarDatos();
  }


cargarEstadisticosAtencion(): void {
  this.apiService
    .getEstadisticosAtencion<EstadisticoAtencionResponse[]>()
    .subscribe({
      next: (response: HttpResponse<EstadisticoAtencionResponse[]>) => {
        const data = response.body ?? [];
        this.foliosCards = this.mapearFoliosCards(data);
      },
      error: (error: unknown) => {
        console.error('ERROR ESTADÍSTICOS ATENCIÓN:', error);
        this.foliosCards = [];
      }
    });
}

private mapearFoliosCards(data: EstadisticoAtencionResponse[]): FolioCard[] {
  const mapa = new Map<string, FolioCard>();

  data.forEach(item => {
    const actual = mapa.get(item.acronimo);

    if (!actual) {
      mapa.set(item.acronimo, {
        acronimo: item.acronimo,
        titulo: this.obtenerTituloPorAcronimo(item.acronimo),
        total: item.consecutivo,
        ultimo_folio: item.ultimo_folio,
        descripcion: this.obtenerDescripcionPorAcronimo(item.acronimo),
        icono: this.obtenerIconoPorAcronimo(item.acronimo)
      });

      return;
    }

    if (item.consecutivo > actual.total) {
      actual.total = item.consecutivo;
    }

    if (this.obtenerNumeroFolio(item.ultimo_folio) > this.obtenerNumeroFolio(actual.ultimo_folio || '')) {
      actual.ultimo_folio = item.ultimo_folio;
    }
  });

  return Array.from(mapa.values());
}

private obtenerNumeroFolio(folio: string): number {
  const partes = folio.split('-');
  return Number(partes[2]) || 0;
}

private obtenerTituloPorAcronimo(acronimo: string): string {
  const titulos: Record<string, string> = {
    AI: 'Adquisición de Información',
    RIF: 'Reporte de Investigación Forense',
    DAF: 'Dictamen de Análisis Forense',
    DPA: 'Dictamen Pericial Auxiliar',
    DJN: 'Dictamen Jurídico Normativo',
    DFP: 'Dictamen Forense Pericial',
    RG: 'Reporte General',
    RR: 'Reporte de Recuperación',
    RDD: 'Reporte de Destrucción de Dispositivos'
  };

  return titulos[acronimo] || acronimo;
}

private obtenerDescripcionPorAcronimo(acronimo: string): string {
  const descripciones: Record<string, string> = {
    AI: 'Acta de Hechos, Cadena de Custodia, Memoria Técnica y No Aplica',
    RIF: 'Reporte de Investigación Forense',
    DAF: 'Dictamen de Análisis Forense',
    DPA: 'Dictamen Pericial Auxiliar',
    DJN: 'Dictamen Jurídico Normativo',
    DFP: 'Dictamen Forense Pericial',
    RG: 'Reporte General',
    RR: 'Reporte de Recuperación',
    RDD: 'Reporte de Destrucción de Dispositivos'
  };

  return descripciones[acronimo] || 'Sin descripción';
}

private obtenerIconoPorAcronimo(acronimo: string): string {
  const iconos: Record<string, string> = {
    AI: 'assignment',
    RIF: 'manage_search',
    DAF: 'description',
    DPA: 'fact_check',
    DJN: 'gavel',
    DFP: 'policy',
    RG: 'summarize',
    RR: 'restore_page',
    RDD: 'delete_sweep'
  };

  return iconos[acronimo] || 'confirmation_number';
}



}


