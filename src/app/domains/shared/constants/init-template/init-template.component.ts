import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip, NgApexchartsModule, ApexDataLabels } from 'ng-apexcharts';
import { EstadisticoService } from '../../../services/estadistico.service';
import { EstadisticosResponse, Estado } from '../../../interfaces/estadisticosResponse.interface';
import { environment } from '../../../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadisticasDiarias } from '../../../interfaces/estadisticosTableResponse.interface';

@Component({
  selector: 'app-init-template',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgApexchartsModule,
    MatDialogModule,
    NgxPaginationModule,
  ],
  templateUrl: './init-template.component.html',
  styleUrl: './init-template.component.css'
})
export class InitTemplateComponent {

  environment = environment;
  mostrarChart: boolean = false;
  mostrarTable: boolean = false
  fecha_Incial: string = ""
  fecha_Final: string = ""
  download_requerimiento = "REQUERIMIENTO"
  download_respuesta_interna = "RESPUESTA INTERNA"
  download_respuesta_fgr = "RESPUESTA A FGR"
  formato = "xlsx"
  administracion = ""
  selecionarOpcion: string = ''
  pages: EstadisticasDiarias[][] = []
  documents: EstadisticasDiarias[] = [];
  pageSelected: number = 1;
  itemsPerPage: number = 5
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };

  estadisticos: EstadisticosResponse['data'] = [];
  requerimiento: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento:0
  };
  respuesta: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento:0,
  };
  respuesta_FGR: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento:0,
  };

  total_requerimiento: number = 0
  enTramite_requerimiento: number = 0
  parcial_requerimiento: number = 0
  documento_respuesta_requerimiento: number=0


  total_respuesta_FGR: number = 0
  enTramite_respuesta_FGR: number = 0
  parcial_respuesta_FGR: number = 0
  documento_respuesta_FGR: number=0

  total_respuesta_INTERNA: number = 0
  enTramite_respuesta_INTERNA: number = 0
  parcial_respuesta_INTERNA: number = 0
  documento_respuesta_Interna: number=0

  totalDeConteo: number = 0

  constructor(
    private fb: FormBuilder,
    private chartPie: EstadisticoService,
    private tableConteo: EstadisticoService
  ) { }

  public repotByDay: FormGroup = this.fb.group({
    fecha_inicial: [null, [Validators.required]],
    fecha_final: [null, [Validators.required]]
  })

  estadisticosReport(): void {
    if (this.repotByDay.valid === true) {
      this.mostrarChart = true
      let data = this.repotByDay.value
      this.chartPie.getQuerybyDay(data).subscribe(
        res => {
          // console.log("RES", res);
          this.procesarDatos(res)

          //#region  Series REQUERIMIENTO
          this.series_requerimiento = [this.requerimiento.total,
          this.requerimiento.parcial,
          this.requerimiento.en_tramite];
          //#endregion

          //#region  Series RESPUESTA_INTERNA
          this.series_respuesta_interna = [this.respuesta.total,
          this.respuesta.parcial,
          this.respuesta.en_tramite];
          //#endregion

          //#region RESPUESTA_A_FGR
          this.series_respuesta_FGR = [this.respuesta_FGR.total,
          this.respuesta_FGR.parcial,
          this.respuesta_FGR.en_tramite];
          //#endregion

          this.total_requerimiento = this.requerimiento.total;
          this.enTramite_requerimiento = this.requerimiento.parcial;
          this.parcial_requerimiento = this.requerimiento.en_tramite;
          this.documento_respuesta_requerimiento = this.requerimiento.documento

          this.total_respuesta_INTERNA = this.respuesta.total;
          this.enTramite_respuesta_INTERNA = this.respuesta.parcial;
          this.parcial_respuesta_INTERNA = this.respuesta.en_tramite;
          this.documento_respuesta_Interna =  this.respuesta.documento

          this.total_respuesta_FGR = this.respuesta_FGR.total;
          this.enTramite_respuesta_FGR = this.respuesta_FGR.parcial;
          this.parcial_respuesta_FGR = this.respuesta_FGR.en_tramite;
          this.documento_respuesta_FGR = this.respuesta_FGR.documento
        }
      )
      this.obtnerNombre()
      this.selecionarOpcion = ""
    }
  }
  estaditicasPorDia(): void {
    if (this.repotByDay.valid === true) {
      this.mostrarTable=true
      let dataConteo = this.repotByDay.value
      this.tableConteo.getConteoDia(dataConteo).subscribe(
        res => {

          this.documents = res.registros.map(([fecha, totalRequerimineto,total_estatus, parcial_estatus,trmite
             ]) => ({
            fecha_recepcion: fecha,
            total_requerimientos: totalRequerimineto,
            total_estatus:total_estatus,
            parcial_estatus:parcial_estatus,
            en_tramite_estatus:trmite,
          }))

          const totalDeFechas = this.documents.find(i => i.fecha_recepcion === null);
          if (totalDeFechas) {
            this.totalDeConteo = totalDeFechas.total_requerimientos
          }
          this.documents = this.documents.filter(i => i.fecha_recepcion !== null);
          let indexPage = 0;
          let page: EstadisticasDiarias[] = [];
          this.pages = []
          this.pageSelected = 1;
          this.documents.forEach((doc) => {
            page.push(doc);
            indexPage += 1;
            if (indexPage === this.itemsPerPage) {
              this.pages.push(page);
              indexPage = 0
              page = []
            }
          })
          if (page.length !== 0) this.pages.push(page)
        }
      )
      this.obtnerNombre()
      this.selecionarOpcion = ""
    }
  }


  procesarDatos(data: EstadisticosResponse['data']): void {
    const requerimientoObj = data.find(item => 'REQUERIMIENTO' in item) as { REQUERIMIENTO: Estado };
    if (requerimientoObj) {
      this.requerimiento = requerimientoObj.REQUERIMIENTO;
    }

    const respuestaInternaObj = data.find(item => 'RESPUESTA_INTERNA' in item) as { RESPUESTA_INTERNA: Estado }
    if (respuestaInternaObj) {
      this.respuesta = respuestaInternaObj.RESPUESTA_INTERNA;
    }
    const respuestaFrgObj = data.find(item => 'RESPUESTA_A_FGR' in item) as { RESPUESTA_A_FGR: Estado };
    if (respuestaFrgObj) {
      this.respuesta_FGR = respuestaFrgObj.RESPUESTA_A_FGR;
    }
  }

  getDownloadExcelRequerimientos(): void {
    this.chartPie.donwnloadExcel(this.fecha_Incial, this.fecha_Final, this.download_requerimiento, this.administracion)
  }
  getDownloadExcelRespuestaInterna(): void {
    this.chartPie.donwnloadExcel(this.fecha_Incial, this.fecha_Final, this.download_respuesta_interna, this.administracion)
  }
  getDownloadExcelRespuestaFGR(): void {
    this.chartPie.donwnloadExcel(this.fecha_Incial, this.fecha_Final, this.download_respuesta_fgr, this.administracion)
  }

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: "bottom"
        },
      }
    }
  ];

  public series_requerimiento: ApexNonAxisChartSeries = [this.requerimiento.total,
  this.requerimiento.parcial,
  this.requerimiento.en_tramite];

  public series_respuesta_interna: ApexNonAxisChartSeries = [this.respuesta.total,
  this.respuesta.parcial,
  this.respuesta.en_tramite];

  public series_respuesta_FGR: ApexNonAxisChartSeries = [this.respuesta_FGR.total,
  this.respuesta_FGR.parcial,
  this.respuesta_FGR.en_tramite];

  public colors = ["#691C32", "#235B4E", "#BC955C",];
  public labels = ["Total", "Parcial", "En tramite",];
  public chart: ApexChart = {
    height: 350,
    width: 850,
    type: "pie",
    toolbar: {
      show: true,
      offsetX: 0,
      offsetY: 0,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,

        customIcons: []

      },
      export: {
        png: {
          filename: "Grafico"
        }
      }
    },
  };

  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number, opts: any) => {
      const total = opts.w.config.series.reduce((a: number, b: number) => a + b, 0); // Calcular el total
      const value = opts.w.config.series[opts.seriesIndex]; // Obtener el valor específico
      return `${value} (${val.toFixed(1)}%)`;// Mostrar cantidad y porcentaje
    }
  }

  goBack(): void {
    this.mostrarChart = false
    this.repotByDay.reset()
  }

  obtnerNombre() {
    let fechaIncial = this.repotByDay.get("fecha_inicial")?.value;
    let fechaFinal = this.repotByDay.get("fecha_final")?.value;
    this.fecha_Incial = fechaIncial
    this.fecha_Final = fechaFinal
  }

  onSelectedOption(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selecionarOpcion = target.value
  }
}
