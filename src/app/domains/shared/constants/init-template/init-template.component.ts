import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip, NgApexchartsModule,  } from 'ng-apexcharts';
import { EstadisticoService  } from '../../../services/estadistico.service';
import { EstadisticosResponse, Estado } from '../../../interfaces/estadisticosResponse.interface';
import { environment } from '../../../../../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-init-template',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgApexchartsModule,
    MatDialogModule,
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
  download_respuesta = "RESPUESTA"
  formato = "xlsx"
  administracion = ""


  selecionarOpcion: string = ''



  estadisticos: EstadisticosResponse['data'] = [];

  requerimiento: Estado  ={
    total:     0,
    parcial:   0,
    recibido:  0,
    en_tramite:0,
    no_aplica: 0
  }  ;
  respuesta: Estado  = {
    total:     0,
    parcial:   0,
    recibido:  0,
    en_tramite:0,
    no_aplica: 0
  };

total_requerimiento: number = 0
enTramite_requerimiento:number=0
parcial_requerimiento:number=0


total_respuesta: number = 0
enTramite_respuesta:number=0
parcial_respuesta:number=0

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
       this.procesarDatos(res)
        this.series_requerimiento = [this.requerimiento.total,
        this.requerimiento.parcial,
        this.requerimiento.en_tramite];
        this.series_respuesta = [this.respuesta.total,
        this.respuesta.parcial,
        this.respuesta.en_tramite];

      this.total_requerimiento = this.requerimiento.total ;
      this.enTramite_requerimiento = this.requerimiento.parcial;
      this.parcial_requerimiento = this.requerimiento.en_tramite;

      this.total_respuesta = this.respuesta.total ;
      this.enTramite_respuesta = this.respuesta.parcial;
      this.parcial_respuesta = this.respuesta.en_tramite;
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
    const respuestaObj = data.find(item => 'RESPUESTA' in item) as { RESPUESTA: Estado };
    if (respuestaObj) {
      this.respuesta = respuestaObj.RESPUESTA;
    }
 }


 getDownloadExcelRequerimientos():void{
this.chartPie.donwnloadExcel(this.fecha_Incial,this.fecha_Final,this.download_requerimiento,this.formato,this.administracion)
 }
 getDownloadExcelRespuesta():void{
this.chartPie.donwnloadExcel(this.fecha_Incial,this.fecha_Final,this.download_respuesta ,this.formato,this.administracion)
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

  public series_requerimiento: ApexNonAxisChartSeries = [this.requerimiento.total , this.requerimiento.parcial, this.requerimiento.en_tramite];
  public series_respuesta: ApexNonAxisChartSeries = [this.respuesta.total, this.respuesta.parcial, this.respuesta.en_tramite];

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
    }
  };

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
