import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip, NgApexchartsModule, ApexDataLabels, ApexAxisChartSeries } from 'ng-apexcharts';
import { EstadisticoService } from '../../../services/estadistico.service';
import { EstadisticosResponse, Estado } from '../../../interfaces/estadisticosResponse.interface';
import { environment } from '../../../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadisticasDiarias } from '../../../interfaces/estadisticosTableResponse.interface';
import { EstadisticosRequest } from '../../../interfaces/estadisticosRequest.interface';

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

  pages: EstadisticasDiarias[][]=[];
  pagesAperturas: EstadisticasDiarias[][]=[];
  documents: EstadisticasDiarias[]=[];
  documentsApertura: EstadisticasDiarias[]=[];

   pagesSegundaPieza: EstadisticasDiarias[][]=[];
  documentsSegundaPieza: EstadisticasDiarias[]=[];

  environment = environment;
  mostrarChart = false;
  mostrarTable = false
  selecionarOpcion = ''
  selecionarOpcion2 = ''
  fecha_Incial = ""
  fecha_Final = ""
  administracion = ""

  download_requerimiento = "REQUERIMIENTO"
  download_respuesta_interna = "RESPUESTA INTERNA"
  download_respuesta_fgr = "RESPUESTA A FGR"
  download_apertura = 'APERTURA'
  download_segunda_pieza = 'SEGUNDA PIEZA'

  formato = "xlsx"
  itemsPerPage = 5
  pageSelected = 1;
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
    documento: 0
  };
  respuesta: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento: 0,
  };
  respuesta_FGR: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento: 0,
  };

  apertura: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento: 0,
  }

  segunda_pieza: Estado = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento: 0,
  }

  total_requerimiento = 0
  enTramite_requerimiento = 0
  parcial_requerimiento = 0
  documento_respuesta_requerimiento = 0


  total_respuesta_FGR = 0
  enTramite_respuesta_FGR = 0
  parcial_respuesta_FGR = 0
  documento_respuesta_FGR = 0

  total_respuesta_INTERNA = 0
  enTramite_respuesta_INTERNA = 0
  parcial_respuesta_INTERNA = 0
  documento_respuesta_Interna = 0

  total_apertura = 0
  parcial_apertura = 0
  documento_apertura = 0
  entramite_apertura = 0


  total_segundda_pieza = 0
  parcial_segunda_pieza = 0
  documento_segunda_pieza = 0
  entramite_segunda_pieza = 0


  totalDeConteo = 0
  totalDeConteoAperturas = 0
  totalDeConteoSegundaPieza = 0

  constructor(
    private fb: FormBuilder,
    private chartPie: EstadisticoService,
    private tableConteo: EstadisticoService
  ) { }

  public repotByDay: FormGroup = this.fb.group({
    fecha_inicial: [null, [Validators.required]],
    fecha_final: [null, [Validators.required]],
    tipo: [""]
  })

  estadisticosReport(): void {
    if (this.repotByDay.valid === true) {
      this.mostrarChart = true
      const data = this.repotByDay.value
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

          //#region APERTURA
          this.series_aperturas = [this.apertura.total,
          this.apertura.parcial,
          this.apertura.en_tramite];
          //#region

          //#region SEGUNDA_PIEZA
          this.series_segundapieza = [this.segunda_pieza.total,
          this.segunda_pieza.parcial,
          this.segunda_pieza.en_tramite
          ]
          //#endregion

          this.total_requerimiento = this.requerimiento.total;
          this.enTramite_requerimiento = this.requerimiento.parcial;
          this.parcial_requerimiento = this.requerimiento.en_tramite;
          this.documento_respuesta_requerimiento = this.requerimiento.documento

          this.total_respuesta_INTERNA = this.respuesta.total;
          this.enTramite_respuesta_INTERNA = this.respuesta.parcial;
          this.parcial_respuesta_INTERNA = this.respuesta.en_tramite;
          this.documento_respuesta_Interna = this.respuesta.documento

          this.total_respuesta_FGR = this.respuesta_FGR.total;
          this.enTramite_respuesta_FGR = this.respuesta_FGR.parcial;
          this.parcial_respuesta_FGR = this.respuesta_FGR.en_tramite;
          this.documento_respuesta_FGR = this.respuesta_FGR.documento

          this.total_apertura = this.apertura.total;
          this.entramite_apertura = this.apertura.en_tramite;
          this.parcial_apertura = this.apertura.parcial;
          this.documento_apertura = this.apertura.documento

          this.total_segundda_pieza = this.segunda_pieza.total;
          this.entramite_segunda_pieza = this.segunda_pieza.en_tramite;
          this.parcial_segunda_pieza = this.segunda_pieza.parcial;
          this.documento_segunda_pieza = this.segunda_pieza.documento
        }
      )
      this.obtnerNombre()
      this.selecionarOpcion = ""
    }
  }
  estaditicasPorDia(): void {
    if (this.repotByDay.valid === true) {
      this.mostrarTable = true
      const dataConteo = this.repotByDay.value
      this.tableConteo.getConteoDia(dataConteo).subscribe(
        res => {
          this.documents = res.registros.map(([fecha, totalRequerimineto, total_estatus, parcial_estatus, trmite
          ]) => ({
            fecha_recepcion: fecha,
            total_requerimientos: totalRequerimineto,
            total_estatus: total_estatus,
            parcial_estatus: parcial_estatus,
            en_tramite_estatus: trmite,
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

  tableApertura() {
    if (this.repotByDay.valid === true) {
      const fechaIncial = this.repotByDay.get("fecha_inicial")?.value;
      const fechaFinal = this.repotByDay.get("fecha_final")?.value;

      const data: EstadisticosRequest = {
        fecha_final: fechaFinal,
        fecha_inicial: fechaIncial,
        tipo: "APERTURA"
      }
      this.tableConteo.getConteoDiasAperturaSegundas(data).subscribe(
        res => {
          console.log("RES-APT", res);
          this.documentsApertura = res.registros.map(([fecha, totalRequerimineto, total_estatus, parcial_estatus, trmite
          ]) => ({
            fecha_recepcion: fecha,
            total_requerimientos: totalRequerimineto,
            total_estatus: total_estatus,
            parcial_estatus: parcial_estatus,
            en_tramite_estatus: trmite,
          }))
          const totalDeFechas = this.documentsApertura.find(i => i.fecha_recepcion === null);
          if (totalDeFechas) {
            this.totalDeConteoAperturas = totalDeFechas.total_requerimientos
          }
          this.documentsApertura = this.documentsApertura.filter(i => i.fecha_recepcion !== null);
          let indexPage = 0;
          let pageApertura: EstadisticasDiarias[] = [];
          this.pagesAperturas = []
          this.pageSelected = 1;
          this.documentsApertura.forEach((doc) => {
            pageApertura.push(doc);
            indexPage += 1;
            if (indexPage === this.itemsPerPage) {
              this.pagesAperturas.push(pageApertura);
              indexPage = 0
              pageApertura = []
            }
          })
          if (pageApertura.length !== 0) this.pagesAperturas.push(pageApertura)
        }
      )
            this.obtnerNombre()
      this.selecionarOpcion = ""
    }
  }

  tableSecondPices(): void {
    if (this.repotByDay.valid === true) {
      const fechaFinal = this.repotByDay.get("fecha_final")?.value;
      const fechaIncial = this.repotByDay.get("fecha_inicial")?.value;

      const data: EstadisticosRequest = {
        fecha_final: fechaFinal,
        fecha_inicial: fechaIncial,
        tipo: "SEGUNDA PIEZA"
      }
      this.tableConteo.getConteoDiasAperturaSegundas(data).subscribe(
        res => {
          console.log("RES-SECPI", res);
          this.documentsSegundaPieza = res.registros.map(([fecha, totalRequerimineto, total_estatus, parcial_estatus, trmite
          ]) => ({
            fecha_recepcion: fecha,
            total_requerimientos: totalRequerimineto,
            total_estatus: total_estatus,
            parcial_estatus: parcial_estatus,
            en_tramite_estatus: trmite,
          }))
          const totalDeFechas = this.documentsSegundaPieza.find(i => i.fecha_recepcion === null);
          if (totalDeFechas) {
            this.totalDeConteoSegundaPieza = totalDeFechas.total_requerimientos
          }
          this.documentsSegundaPieza = this.documentsSegundaPieza.filter(i => i.fecha_recepcion !== null);
          let indexPage = 0;
          let pageSegundaPieza: EstadisticasDiarias[] = [];
          this.pagesSegundaPieza = []
          this.pageSelected = 1;
          this.documentsSegundaPieza.forEach((doc) => {
            pageSegundaPieza.push(doc);
            indexPage += 1;
            if (indexPage === this.itemsPerPage) {
              this.pagesSegundaPieza.push(pageSegundaPieza);
              indexPage = 0
              pageSegundaPieza = []
            }
          })
          if (pageSegundaPieza.length !== 0) this.pagesSegundaPieza.push(pageSegundaPieza)
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
    const aperturaObj = data.find(item => 'APERTURA' in item) as { APERTURA: Estado };
    if (aperturaObj) {
      this.apertura = aperturaObj.APERTURA;
    }
    const segundaPiezaObj = data.find(item => 'SEGUNDA_PIEZA' in item) as { SEGUNDA_PIEZA: Estado };
    this.segunda_pieza = segundaPiezaObj.SEGUNDA_PIEZA;
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
  getDownloadExcelApertura(): void {
    this.chartPie.donwnloadExcelAS(this.fecha_Incial, this.fecha_Final, this.download_apertura, this.download_requerimiento, this.administracion)
  }
  getDownloadExcelSegundaPieza(): void {
    this.chartPie.donwnloadExcelAS(this.fecha_Incial, this.fecha_Final, this.download_segunda_pieza, this.download_requerimiento, this.administracion)
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

  public series_aperturas: ApexNonAxisChartSeries = [this.apertura.total,
  this.apertura.parcial,
  this.apertura.en_tramite];

  public series_segundapieza: ApexNonAxisChartSeries = [this.segunda_pieza.total,
  this.segunda_pieza.parcial,
  this.enTramite_requerimiento
  ];

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
    const fechaIncial = this.repotByDay.get("fecha_inicial")?.value;
    const fechaFinal = this.repotByDay.get("fecha_final")?.value;
    this.fecha_Incial = fechaIncial
    this.fecha_Final = fechaFinal
  }

  onSelectedOption(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selecionarOpcion = target.value
    this.selecionarOpcion2 = ""
  }
  onSelectedOptionSe(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selecionarOpcion2 = target.value
  }
}
