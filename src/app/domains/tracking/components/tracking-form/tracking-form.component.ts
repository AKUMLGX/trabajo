import { trigger, style, transition, animate, } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { dynamicHeight } from '../../../shared/animacion/dynamicHeight.trigger';
import { AsuntoService } from '../../../services/asunto.service';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { SharedDataFormService } from '../../../shared/services/shared-data-form.service';

@Component({
    selector: 'app-tracking-form',
    imports: [ReactiveFormsModule, MatIcon, MatListModule, CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatDialogModule],
    templateUrl: './tracking-form.component.html',
    styleUrl: './tracking-form.component.css',
    animations: [
        dynamicHeight,
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.35)' }),
                animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.35)' })),
            ]),
        ]),
    ]
})
export class TrackingFormComponent implements OnInit, AfterViewInit {
  // Formulario adaptado para campos de Tlalcalli - Solo campos principales de captura
  public consultForm: FormGroup = this.fb.group({
    oficio: new FormControl(''),
    expediente: new FormControl(''),
    tipo_medio_recepcion: new FormControl(''),
    remitente_area: new FormControl(''),
    numero_entrada_central: new FormControl(''),
    responsable: new FormControl(''),
    prioridad: new FormControl(''),
    fecha_creacion_desde: new FormControl(''),
    fecha_creacion_hasta: new FormControl(''),
    tipoBusqueda: new FormControl('Nuevos'),
  });

  public fecha_inicial = new FormControl('');
  public administracion = new FormControl('');
  public formato = new FormControl('xlsx');
  public fecha_final = new FormControl('');

  public fechaActual = '2018-11-11';

  input_one = 0
  input_two = 0


  selecionarOpcion = ''

  @ViewChild('InputFormulario') InputFormulario!: ElementRef<HTMLButtonElement>;
  showCoincidencias: Record<string, boolean> = {};
  campoValor: Record<string, any> = {};
  // Campos adaptados para Tlalcalli - Solo campos principales de captura
  campos: string[] = ["oficio", "expediente", "remitente_area", "responsable", "prioridad"]
  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService,
    private expedienteService: ExpedienteTlalcalliService,
    private shareData: SharedDataFormService,
    private route: ActivatedRoute
  ) {
    // Campos adaptados para Tlalcalli - Solo campos principales de captura
    this.campoValor = {
      oficio: '',
      expediente: '',
      tipo_medio_recepcion: '',
      remitente_area: '',
      numero_entrada_central: '',
      responsable: '',
      prioridad: '',
      fecha_creacion_desde: '',
      fecha_creacion_hasta: '',
    };

    const date = new Date();
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    this.fechaActual = `${year}-${month}-${day}`;
    this.fecha_inicial.setValue(this.fechaActual);
    this.fecha_final.setValue(this.fechaActual)
  }
  coincidencias: string[] = [];
  nombre_campo_input = "";
  mostrar_coincidencias?: boolean;


  public downloadByFolioScan: FormGroup = this.fb.group({
    input_one: [null, [Validators.required]],
    input_two: [null, [Validators.required]]
  })


  DetectInput(entering: boolean, campo: string): void {
    this.showCoincidencias[campo] = entering;
    if (!entering) {
      this.cleanCoincidencias();
    }
  }
  cleanCoincidencias(): void {
    this.coincidencias = [];
  }
  onSave(): void {
    console.log('🔍 [TrackingForm] onSave ejecutado');
    console.log('🔍 [TrackingForm] Formulario actual:', this.consultForm.value);
    // Usar el servicio de expedientes Tlalcalli en lugar de AsuntoService
    this.expedienteService.consultarExpedientes(this.consultForm.value).subscribe({
      next: (expedientes) => {
        console.log('✅ Expedientes encontrados:', expedientes);
        // Emitir los resultados para que la tabla los muestre
        this.expedienteService.expedientesConsultados.emit(expedientes);
      },
      error: (error) => {
        console.error('❌ Error al consultar expedientes:', error);
      }
    });
  }

  // Datos adaptados para Tlalcalli - Solo campos principales de captura
  formData = {
    oficio: "",
    expediente: "",
    tipo_medio_recepcion: "",
    remitente_area: "",
    numero_entrada_central: "",
    responsable: "",
    prioridad: "",
    fecha_creacion_desde: "",
    fecha_creacion_hasta: ""
  }

  sendDatos():void{
    this.shareData.updateFormData(this.formData)
  }


  getValueInput(): void {
    this.coincidencias = [];
    this.nombre_campo_input = document.activeElement?.getAttribute('formControlName') ?? '';
    if (!this.nombre_campo_input || !this.consultForm.contains(this.nombre_campo_input)) {
      return;
    }
    const fomulario_control = this.consultForm.get(this.nombre_campo_input);
    if (!fomulario_control || fomulario_control.value === undefined) {
      return;
    }
    const valor_input = fomulario_control.value;
    // Mapear nombres de campos de formulario a nombres de BD
    if (this.nombre_campo_input === "tipoMedioRecepcion") {
      this.nombre_campo_input = "tipo_medio_recepcion";
    } else if (this.nombre_campo_input === "remitenteArea") {
      this.nombre_campo_input = "remitente_area";
    } else if (this.nombre_campo_input === "numeroEntradaCentral") {
      this.nombre_campo_input = "numero_entrada_central";
    }
    // Usar el servicio de expedientes Tlalcalli para autocompletado
    this.expedienteService.autocompletadoCampo(valor_input, this.nombre_campo_input.replace(/([A-Z])/g, '_$1').toLowerCase()).subscribe((coincidencias: string[]) => {
      this.coincidencias = coincidencias.slice(0, 5);
    });
  }

  descargarAcuse(): void {
    if (this.fecha_inicial.value && this.fecha_final.value)
      this.asuntoService.generateAcuse(this.fecha_inicial.value, this.fecha_final.value, this.administracion.value, this.formato.value);
  }

  descargarAcuseFolio(): void {
    const folioOne = this.downloadByFolioScan.get("input_one")?.value;
    const folioTwo = this.downloadByFolioScan.get("input_two")?.value;
    this.input_one = folioOne
    this.input_two = folioTwo
    if (this.input_one && this.input_two) {

      this.asuntoService.generateAcuseFolioScan(this.input_one,
        this.input_two, this.administracion.value, this.formato.value)
    }
  }

  selectCoincidencia(coincidencia: string): void {
    const formControl = this.consultForm.get(this.nombre_campo_input);
    if (formControl) {
      formControl.setValue(coincidencia);
    } else {
      console.error(`Error: No se pudo encontrar el control del formulario para '${this.nombre_campo_input}'.`);
    }
    this.cleanCoincidencias();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  onSelectedOption(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selecionarOpcion = target.value
  }

  ngOnInit(): void {
    console.log('🔍 [TrackingForm] ngOnInit ejecutado');
    
    // Verificar si hay parámetro oficio en la URL
    this.route.queryParams.subscribe(params => {
      console.log('🔍 [TrackingForm] QueryParams recibidos:', params);
      const oficio = params['oficio'];
      const folio = params['folio'] || params['folio_interno'] || params['folioInterno'];
      
      if (oficio) {
        console.log('🔍 [TrackingForm] Oficio detectado en URL:', oficio);
        
        // Llenar el campo oficio
        this.consultForm.patchValue({
          oficio: oficio
        });
        
        console.log('🔍 [TrackingForm] Campo oficio llenado:', this.consultForm.get('oficio')?.value);

        // Ejecutar la búsqueda automáticamente después de un delay más largo
        setTimeout(() => {
          console.log('🔍 [TrackingForm] Ejecutando búsqueda automática...');
          this.onSave();
        }, 2000); // Aumentar el tiempo para asegurar que el formulario esté listo
      } else {
        console.log('🔍 [TrackingForm] No se encontró parámetro oficio en la URL');
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('🔍 [TrackingForm] ngAfterViewInit ejecutado');
    
    // Verificar si hay parámetro oficio en la URL después de que el DOM esté listo
    this.route.queryParams.subscribe(params => {
      const oficio = params['oficio'];
      // Buscar por expediente si viene en la URL
      const expediente = params['expediente'];
      
      if (expediente) {
        console.log('🔍 [TrackingForm] ngAfterViewInit - Expediente detectado:', expediente);
        setTimeout(() => {
          this.consultForm.patchValue({ expediente: expediente });
          this.formData.expediente = expediente;
          setTimeout(() => {
            console.log('🔍 [TrackingForm] ngAfterViewInit - Ejecutando búsqueda por expediente...');
            this.onSave();
          }, 600);
        }, 300);
      } else if (oficio) {
        console.log('🔍 [TrackingForm] ngAfterViewInit - Oficio detectado:', oficio);
        
        // Llenar el campo oficio usando setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
          this.consultForm.patchValue({
            oficio: oficio
          });
          
          console.log('🔍 [TrackingForm] ngAfterViewInit - Campo oficio llenado:', this.consultForm.get('oficio')?.value);
          
          // Ejecutar la búsqueda automáticamente
          setTimeout(() => {
            console.log('🔍 [TrackingForm] ngAfterViewInit - Ejecutando búsqueda...');
            this.onSave();
          }, 1000);
        }, 500);
      }
    });
  }
}
