import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip, NgApexchartsModule,ApexDataLabels } from 'ng-apexcharts';
import { EstadisticoService  } from '../../../services/estadistico.service';
import { EstadisticosResponse, Estado } from '../../../interfaces/estadisticosResponse.interface';
import { environment } from '../../../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadisticasDiarias } from '../../../interfaces/estadisticosTableResponse.interface';

interface Dias{
  dias_contado : Date;
  valor_dias:   number;
}


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

  public environment =  environment;

  mostrarChart:boolean= false;
  fecha_Incial: string = ""
  fecha_Final: string  = ""

  download_requerimiento = "REQUERIMIENTO"
  download_respuesta_interna = "RESPUESTA INTERNA"
  download_respuesta_fgr = "RESPUESTA A FGR"
  formato = "xlsx"
  administracion = ""


  selecionarOpcion: string = ''


  pages : EstadisticasDiarias [][]=[]
  public documents: EstadisticasDiarias[] = [];
 pageSelected: number = 1;

 itemsPerPage: number = 5

   labelsPaginator = {
  previousLabel: 'Anterior',
  nextLabel: 'Siguiente',
};

dias =  [
  { fecha: '2025-01-16', valor: 45 },
  { fecha: '2025-01-17', valor: 89 },
  { fecha: '2025-01-18', valor: 23 },
  { fecha: '2025-01-19', valor: 77 },
  { fecha: '2025-01-20', valor: 12 }
]


estadisticos: EstadisticosResponse['data'] = [];

  requerimiento: Estado  ={
    total:     0,
    parcial:   0,
    recibido:  0,
    en_tramite:0,
    no_aplica: 0
  };
  respuesta: Estado  = {
    total:     0,
    parcial:   0,
    recibido:  0,
    en_tramite:0,
    no_aplica: 0
  };
  respuesta_FGR: Estado  = {
    total:     0,
    parcial:   0,
    recibido:  0,
    en_tramite:0,
    no_aplica: 0
  };

total_requerimiento: number = 0
enTramite_requerimiento:number=0
parcial_requerimiento:number=0


total_respuesta_FGR: number = 0
enTramite_respuesta_FGR:number=0
parcial_respuesta_FGR:number=0

total_respuesta_INTERNA: number = 0
enTramite_respuesta_INTERNA:number=0
parcial_respuesta_INTERNA:number=0

constructor(
 private fb: FormBuilder,
 private chartPie : EstadisticoService,
){}

public repotByDay: FormGroup = this.fb.group({
  fecha_inicial:[null,[Validators.required]],
  fecha_final:[null,[Validators.required]]
})

estadisticosReport():void{
  if (this.repotByDay.valid === true) {
    this.mostrarChart = true
    let data = this.repotByDay.value
    this.chartPie.getQuerybyDay(data).subscribe(
      res=>{
        console.log("RES",res);
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

      this.total_requerimiento = this.requerimiento.total ;
      this.enTramite_requerimiento = this.requerimiento.parcial;
      this.parcial_requerimiento = this.requerimiento.en_tramite;

      this.total_respuesta_INTERNA = this.respuesta.total ;
      this.enTramite_respuesta_INTERNA = this.respuesta.parcial;
      this.parcial_respuesta_INTERNA = this.respuesta.en_tramite;

      this.total_respuesta_FGR = this.respuesta_FGR.total ;
      this.enTramite_respuesta_FGR = this.respuesta_FGR.parcial;
      this.parcial_respuesta_FGR = this.respuesta_FGR.en_tramite;
      }
    )
    this.obtnerNombre()
    this.selecionarOpcion= ""
  }
 }

 estaditicasPorDia():void{
  if (this.repotByDay.valid === true) {
    this.mostrarChart = true
    let data = this.repotByDay.value
    this.chartPie.getConteoDia(data).subscribe(
      res=>{
        this.documents = res
        console.log(res);
      }
    )
     this.obtnerNombre()
     this.selecionarOpcion= ""
  }
 }

  procesarDatos(data: EstadisticosResponse['data']): void {
  const requerimientoObj = data.find(item => 'REQUERIMIENTO' in item) as { REQUERIMIENTO: Estado };
    if (requerimientoObj) {
      this.requerimiento = requerimientoObj.REQUERIMIENTO;
    }

    const respuestaInternaObj =  data.find(item => 'RESPUESTA_INTERNA' in item) as { RESPUESTA_INTERNA : Estado}
    if (respuestaInternaObj) {
      this.respuesta = respuestaInternaObj.RESPUESTA_INTERNA;
    }
    const respuestaFrgObj = data.find(item => 'RESPUESTA_A_FGR' in item) as { RESPUESTA_A_FGR: Estado };
    if (respuestaFrgObj) {
      this.respuesta_FGR = respuestaFrgObj.RESPUESTA_A_FGR;
    }
 }


 getDownloadExcelRequerimientos():void{
this.chartPie.donwnloadExcel(this.fecha_Incial,this.fecha_Final,this.download_requerimiento,this.administracion)
 }
 getDownloadExcelRespuestaInterna():void{
this.chartPie.donwnloadExcel(this.fecha_Incial,this.fecha_Final,this.download_respuesta_interna ,this.administracion)
 }
 getDownloadExcelRespuestaFGR():void{
this.chartPie.donwnloadExcel(this.fecha_Incial,this.fecha_Final,this.download_respuesta_fgr ,this.administracion)
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

  public series_requerimiento: ApexNonAxisChartSeries = [this.requerimiento.total ,
                                                        this.requerimiento.parcial,
                                                         this.requerimiento.en_tramite];

  public series_respuesta_interna: ApexNonAxisChartSeries = [this.respuesta.total,
                                                             this.respuesta.parcial,
                                                              this.respuesta.en_tramite];

  public series_respuesta_FGR: ApexNonAxisChartSeries = [this.respuesta_FGR.total,
                                                         this.respuesta_FGR.parcial,
                                                          this.respuesta_FGR.en_tramite];

  public colors = ["#691C32", "#235B4E", "#BC955C", ];
  public labels = ["Total","Parcial","En tramite",];
  public chart: ApexChart = {
    height: 350,
    width: 850,
    type: "pie",
    toolbar:{
      show:true,
      offsetX: 0,
      offsetY: 0,
      tools:{
        download: true,
        selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,

          customIcons: []

      },
      export:{
      png:{
        filename: "Grafico"
      }
      }
    },
  };

  dataLabels: ApexDataLabels= {
    enabled:true,
    formatter: (val: number, opts: any) => {
      const total = opts.w.config.series.reduce((a: number, b: number) => a + b, 0); // Calcular el total
      const value = opts.w.config.series[opts.seriesIndex]; // Obtener el valor específico
      return `${value} (${val.toFixed(1)}%)`;// Mostrar cantidad y porcentaje
    }
  }

  goBack():void{
    this.mostrarChart = false
    this.repotByDay.reset()
  }

  obtnerNombre(){
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
