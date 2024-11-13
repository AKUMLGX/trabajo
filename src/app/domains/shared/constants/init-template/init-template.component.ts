import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, NgApexchartsModule } from 'ng-apexcharts';
import { EstadisticoService,  } from '../../../services/estadistico.service';
import { EstadisticosResponse } from '../../../interfaces/estadisticosResponse.interface';

@Component({
  selector: 'app-init-template',
  standalone: true,
  imports: [
    NgApexchartsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './init-template.component.html',
  styleUrl: './init-template.component.css'
})
export class InitTemplateComponent {

  ngOnInit():void{
  // this.btnEdita()
  // this.obtnerNombre()
  }


  mostrarChart:boolean= false;
  fecha_Incial: string = ""
  fecha_Final: string  = ""
  // estadisticosresp: EstadisticosResponse ={
  //     en_tramite: 0,
  //     parcial: 0,
  //     no_aplica: 0,
  //     total: 0,
  //     recibido: 0}

estadisticosRes : EstadisticosResponse ={
  total:0,
  parcial:0,
  no_aplica:0,
  recibido:0,
  en_tramite:0
}

total: number = 0
enTramite:number=0
parcial:number=0

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
        console.log(res);
       this.estadisticosRes = res;
      this.series = [res.total, res.parcial,res.en_tramite]


      this.total = res.total;
      this.enTramite = res.en_tramite;
     this.parcial = res.parcial



      }
    )
    this.obtnerNombre()
  }
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

  public series: ApexNonAxisChartSeries = [this.estadisticosRes.total,this.estadisticosRes.parcial,this.estadisticosRes.en_tramite ];

  public colors = ["#691C32", "#235B4E", "#BC955C", ];

  public labels = ["Total","Parcial","En tramite",];

  public chart: ApexChart = {
    height: 350,
    width: 850,
    type: "pie"
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




  downloadChart():void{

  }


}
