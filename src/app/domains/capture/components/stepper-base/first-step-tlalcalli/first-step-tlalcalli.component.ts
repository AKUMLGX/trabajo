import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { KeyboardNavigationDirective } from '../../../directives/keyboard-navigation.directive';
import { ExpedienteValidators } from '../../../utils/form-validators';
import { ExpedienteAutocompleteService } from '../../../services/expediente-autocomplete.service';
import { ExpedienteTlalcalliService } from '../../../services/expediente-tlalcalli.service';
import { LoggerService } from '../../../services/logger.service';
import { FormHelperService } from '../../../services/form-helper.service';
import { MatDialog } from '@angular/material/dialog';
import { ExpedientesModalComponent, ExpedientesModalData } from '../expedientes-modal/expedientes-modal.component';
import { ConfirmacionModalComponent, ConfirmacionModalData } from '../confirmacion-modal/confirmacion-modal.component';
import { Subject, takeUntil, debounceTime, timer, switchMap, Subscription } from 'rxjs';
import { inject } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CatalogoGeneralesCentralResponse, CatalogoCentralResponse, CatalogoGeneralResponse } from '../../../../interfaces/first-step-catalogos.interface';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-first-step-tlalcalli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomTextareaComponent,
    KeyboardNavigationDirective,
    CustomSelectComponent
  ],
  templateUrl: './first-step-tlalcalli.component.html',
  styleUrl: './first-step-tlalcalli.component.css'
})
export class FirstStepTlalcalliComponent implements OnInit, OnDestroy {
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() validezCambiada = new EventEmitter<boolean>();

  private readonly apiService = inject(ApiService);
  formulario: FormGroup;
  siguienteExpediente: string = '';
  validandoOficio: boolean = false; // Indicador de validación en progreso
  errorOficioDuplicado = false; // Si el oficio ya existe en BD
  idOficioDuplicado: number | null = null; // ID del expediente con oficio duplicado
  buscandoExpedientes: boolean = false; // Indicador de búsqueda en progreso
  modalAbierto: boolean = false; // Indicador si el modal está abierto

  // Detección de caracteres problemáticos en oficio
  caracteresProblematicos: { caracter: string; posicion: number; sugerencia: string }[] = [];
  tieneCaracteresProblematicos: boolean = false;

  private destroy$ = new Subject<void>();

  // Catálogos para autocompletado
  remitentesComunes: string[] = [
    'Dirección General de Auditoría',
    'Subdirección de Revisión Fiscal',
    'Administración Local SAT',
    'Área Jurídica',
    'Área de Fiscalización',
    'Coordinación de Dictámenes',
    'Subdirección de Recursos',
    'Área de Cobranza'
  ];

  // subscripcion
  private expedienteSub ?: Subscription;

  // Obtener opciones de autocompletado combinando comunes e historial
  // get remitentesConHistorial(): string[] {
  //   // const historial = this.formHelper.obtenerHistorial('remitente_area');
  //   // Combinar historial primero (más recientes) y luego comunes
  //   // const todos = [...historial, ...this.remitentesComunes];
  //   // Eliminar duplicados manteniendo el orden
  //   // return Array.from(new Set(todos));
  // }

  get formularioValido(): boolean {
    return this.formulario.valid;
  }

  // Progreso del formulario
  progresoFormulario = 0;
  camposCompletados = 0;
  camposTotales = 0;

  // tipoMedioRecepcionOptions: SelectOption[] = [];
  remitentesGenerales: SelectOption[] = [];
  centralesPorGeneral: Record<string, SelectOption[]> = {};

  tipoMedioRecepcionOptions: SelectOption[] = [
    { value: 'ATENTA_NOTA', label: 'Atenta nota' },
    { value: 'OFICIO', label: 'Oficio' },
    { value: 'REQUERIMIENTO_VERBAL', label: 'Petición interna' },
    { value: 'CORREO_ELECTRONICO', label: 'Correo electrónico' }
  ];

  // remitentesGenerales: SelectOption[] = [
  //   { value: 'AGSC', label: 'AGSC - Administración General de Servicios Centrales' },
  //   { value: 'AGP', label: 'AGP - Administración General de Planeación' },
  //   { value: 'AGR', label: 'AGR - Administración General de Recaudación' },
  //   { value: 'AGGC', label: 'AGGC - Administración General de Grandes Contribuyentes' },
  //   { value: 'AGACE', label: 'AGACE - Administración General de Auditoría de Comercio Exterior' },
  //   { value: 'AGAF', label: 'AGAF - Administración General de Auditoría Fiscal' },
  //   { value: 'AGAJ', label: 'AGAJ - Administración General de Asuntos Jurídicos' },
  //   { value: 'AGH', label: 'AGH - Administración General de Hidrocarburos' },
  //   { value: 'AGSAC', label: 'AGSAC - Administración General de Servicios al Contribuyente' },
  //   { value: 'AGJ', label: 'AGJ - Administración General Jurídica' },
  //   { value: 'AGRS', label: 'AGRS - Administración General de Recursos y Servicios' },
  //   { value: 'AGCTI', label: 'AGCTI - Administración General de Comunicaciones y Tecnologías de la Información' },
  //   { value: 'AGE', label: 'AGE - Administración General de Evaluación' }
  // ];

  // centralesPorGeneral: { [key: string]: SelectOption[] } = {
  //   'AGSC': [
  //     { value: 'ACOP', label: 'ACOP - Administración Central de Operación de Padrones' },
  //     { value: 'ACSTC', label: 'ACSTC - Administración Central de Servicios Tributarios al Contribuyente' },
  //     { value: 'ACATF', label: 'ACATF - Administración Central de Análisis Técnico Fiscal' },
  //     { value: 'ACGSTME', label: 'ACGSTME - Administración Central de Gestión, Servicios y Trámites con Medios Electrónicos' }
  //   ],
  //   'AGP': [
  //     { value: 'ACEAI', label: 'ACEAI - Administración Central de Estudios, Análisis e Información' },
  //     { value: 'ACPVI', label: 'ACPVI - Administración Central de Proyectos y Vinculación Institucional' },
  //     { value: 'ACMII', label: 'ACMII - Administración Central de Modelos de Integración de Información' }
  //   ],
  //   'AGR': [
  //     { value: 'ACDP', label: 'ACDP - Administración Central de Declaraciones y Pagos' },
  //     { value: 'ACPVC', label: 'ACPVC - Administración Central de Promoción y Vigilancia del Cumplimiento' },
  //     { value: 'ACCC', label: 'ACCC - Administración Central de Cobro Coactivo' },
  //     { value: 'ACCPG', label: 'ACCPG - Administración Central de Cobro Persuasivo y Garantías' },
  //     { value: 'ACPEC', label: 'ACPEC - Administración Central de Planeación y Estrategias de Cobro' },
  //     { value: 'ACPOEF', label: 'ACPOEF - Administración Central de Programas Operativos con Entidades Federativas' },
  //     { value: 'ACN', label: 'ACN - Administración Central de Notificación' },
  //     { value: 'ACAJR', label: 'ACAJR - Administración Central de Apoyo Jurídico de Recaudación' }
  //   ],
  //   'AGGC': [
  //     { value: 'ACFSF', label: 'ACFSF - Administración Central de Fiscalización al Sector Financiero' },
  //     { value: 'ACFGS', label: 'ACFGS - Administración Central de Fiscalización a Grupos de Sociedades' },
  //     { value: 'ACPPFGC', label: 'ACPPFGC - Administración Central de Planeación y Programación de Fiscalización a Grandes Contribuyentes' },
  //     { value: 'ACAJNI', label: 'ACAJNI - Administración Central de Apoyo Jurídico y Normatividad Internacional' },
  //     { value: 'ACFGCD', label: 'ACFGCD - Administración Central de Fiscalización a Grandes Contribuyentes Diversos' },
  //     { value: 'ACFPT', label: 'ACFPT - Administración Central de Fiscalización de Precios de Transferencia' },
  //     { value: 'ACAJNGC', label: 'ACAJNGC - Administración Central de Apoyo Jurídico y Normatividad de Grandes Contribuyentes' },
  //     { value: 'ACLCGC', label: 'ACLCGC - Administración Central de lo Contencioso de Grandes Contribuyentes' },
  //     { value: 'ACCEGC', label: 'ACCEGC - Administración Central de Coordinación Estratégica de Grandes Contribuyentes' },
  //     { value: 'ACIII', label: 'ACIII - Administración Central de Intercambio de Información Internacional' },
  //     { value: 'ACDGC', label: 'ACDGC - Administración Central de Devoluciones de Grandes Contribuyentes' }
  //   ],
  //   'AGACE': [
  //     { value: 'ACIACE', label: 'ACIACE - Administración Central de Investigación y Análisis de Comercio Exterior' },
  //     { value: 'ACAOCE', label: 'ACAOCE - Administración Central de Auditoría de Operaciones de Comercio Exterior' },
  //     { value: 'ACPPCE', label: 'ACPPCE - Administración Central de Planeación y Programación de Comercio Exterior' },
  //     { value: 'ACCAAIACE', label: 'ACCAAIACE - Administración Central de Certificación y Asuntos Internacionales de Auditoría de Comercio Exterior' },
  //     { value: 'ACCEACE', label: 'ACCEACE - Administración Central de Coordinación Estratégica de Auditoría de Comercio Exterior' },
  //     { value: 'ACAJACE', label: 'ACAJACE - Administración Central de Apoyo Jurídico de Auditoría de Comercio Exterior' },
  //     { value: 'ACOECE', label: 'ACOECE - Administración Central de Operaciones Especiales de Comercio Exterior' }
  //   ],
  //   'AGAF': [
  //     { value: 'ACOFN', label: 'ACOFN - Administración Central de Operación de la Fiscalización Nacional' },
  //     { value: 'ACAT', label: 'ACAT - Administración Central de Análisis Técnico' },
  //     { value: 'ACPP', label: 'ACPP - Administración Central de Planeación y Programación' },
  //     { value: 'ACVEEF', label: 'ACVEEF - Administración Central de Verificación y Evaluación de Entidades Federativas en Materia de Coordinación Fiscal' },
  //     { value: 'ACFE', label: 'ACFE - Administración Central de Fiscalización Estratégica' },
  //     { value: 'ACAJAF', label: 'ACAJAF - Administración Central de Apoyo Jurídico' },
  //     { value: 'ACDC', label: 'ACDC - Administración Central de Devoluciones y Compensaciones' },
  //     { value: 'ACAAJV', label: 'ACAAJV - Administración Central de Asuntos Jurídicos de Actividades Vulnerables' }
  //   ],
  //   'AGAJ': [
  //     { value: 'ACOJ', label: 'ACOJ - Administración Central de Operación Jurídica' },
  //     { value: 'ACAJ', label: 'ACAJ - Administración Central de Asuntos Jurídicos' }
  //   ],
  //   'AGH': [
  //     { value: 'ACVH', label: 'ACVH - Administración Central de Verificación de Hidrocarburos' },
  //     { value: 'ACFH', label: 'ACFH - Administración Central de Fiscalización de Hidrocarburos' },
  //     { value: 'ACOH', label: 'ACOH - Administración Central de Operación de Hidrocarburos' }
  //   ],
  //   'AGSAC': [
  //     { value: 'ACSTC', label: 'ACSTC - Administración Central de Servicios Tributarios al Contribuyente' },
  //     { value: 'ACAJSC', label: 'ACAJSC - Administración Central de Apoyo Jurídico de Servicios al Contribuyente' },
  //     { value: 'ACGSTME', label: 'ACGSTME - Administración Central de Gestión, Servicios y Trámites con Medios Electrónicos' },
  //     { value: 'ACOP', label: 'ACOP - Administración Central de Operación de Padrones' },
  //     { value: 'ACCI', label: 'ACCI - Administración Central de Comunicación Institucional' },
  //     { value: 'ACPIS', label: 'ACPIS - Administración Central de Programas Interinstitucionales de Servicios' },
  //     { value: 'CNADSC', label: 'CNADSC - Coordinador Nacional de las Administraciones Desconcentradas de Servicios al Contribuyente' }
  //   ],
  //   'AGJ': [
  //     { value: 'ACNII', label: 'ACNII - Administración Central de Normatividad en Impuestos Internos' },
  //     { value: 'ACNCE', label: 'ACNCE - Administración Central de Normatividad en Comercio Exterior' },
  //     { value: 'ACLC', label: 'ACLC - Administración Central de lo Contencioso' },
  //     { value: 'ACAIJ', label: 'ACAIJ - Administración Central de Amparo e Instancias Judiciales' },
  //     { value: 'ACAPE', label: 'ACAPE - Administración Central de Asuntos Penales y Especiales' },
  //     { value: 'ACOJ', label: 'ACOJ - Administración Central de Operación Jurídica' }
  //   ],
  //   'AGRS': [
  //     { value: 'ACRF', label: 'ACRF - Administración Central de Recursos Financieros' },
  //     { value: 'ACCCAP', label: 'ACCCAP - Administración Central del Ciclo de Capital' },
  //     { value: 'ACDB', label: 'ACDB - Administración Central de Destino de Bienes' },
  //     { value: 'ACRM', label: 'ACRM - Administración Central de Recursos Materiales' },
  //     { value: 'ACAJRS', label: 'ACAJRS - Administración Central de Apoyo Jurídico de Recursos y Servicios' },
  //     { value: 'ACORS', label: 'ACORS - Administración Central de Operación de Recursos y Servicios' },
  //     { value: 'ACCSI', label: 'ACCSI - Administración Central de Control y Seguridad Institucional' }
  //   ],
  //   'AGCTI': [
  //     { value: 'ACPPI', label: 'ACPPI - Administración Central de Planeación y Programación Informática' },
  //     { value: 'ACOST', label: 'ACOST - Administración Central de Operación y Servicios Tecnológicos' },
  //     { value: 'ACSN', label: 'ACSN - Administración Central de Soluciones de Negocio' },
  //     { value: 'ACTT', label: 'ACTT - Administración Central de Transformación Tecnológica' },
  //     { value: 'ACDMA', label: 'ACDMA - Administración Central de Desarrollo y Mantenimiento de Aplicaciones' },
  //     { value: 'ACSMYC', label: 'ACSMYC - Administración Central de Seguridad Monitoreo y Control' },
  //     { value: 'ACJCTI', label: 'ACJCTI - Administración Central Jurídica en Comunicaciones y Tecnologías de la Información' },
  //     { value: 'ACPT', label: 'ACPT - Administración Central de Proyectos Tecnológicos' }
  //   ],
  //   'AGE': [
  //     { value: 'ACCE', label: 'ACCE - Administración Central de Coordinación Evaluatoria' },
  //     { value: 'ACAER', label: 'ACAER - Administración Central de Análisis y Evaluación de Riesgos' },
  //     { value: 'ACEC', label: 'ACEC - Administración Central de Evaluación de la Confiabilidad' },
  //     { value: 'ACECE', label: 'ACECE - Administración Central de Evaluación de Comercio Exterior' },
  //     { value: 'ACEII', label: 'ACEII - Administración Central de Evaluación de Impuestos Internos' },
  //     { value: 'ACES', label: 'ACES - Administración Central de Evaluación de Seguimiento' },
  //     { value: 'ACPE', label: 'ACPE - Administración Central de Procedimientos Especiales' },
  //     { value: 'ACEPI', label: 'ACEPI - Administración Central de Evaluación de Procesos e Información' },
  //     { value: 'CECTI', label: 'CECTI - Coordinador de Evaluación de Comunicaciones y Tecnologías de la Información' },
  //     { value: 'CPP', label: 'CPP - Coordinador de Procedimientos Penales' }
  //   ]
  // };

private cargarCatalogos(): void {
  this.cargarGenerales();
  this.cargarCentrales();
  this.cargarGeneralesConCentrales();
}

private cargarGenerales(): void {
  this.apiService.getData<CatalogoGeneralResponse[]>('catalogo/generales').subscribe({
    next: (response: HttpResponse<CatalogoGeneralResponse[]>) => {
      console.log('STATUS generales:', response.status);
      console.log('Generales:', response.body);

      const data = response.body ?? [];

      this.remitentesGenerales = data.map((item) => ({
        value: item.clave,
        label: `${item.clave} - ${item.nombre}`,
      }));
    },
    error: (error: unknown) => {
      this.logger.error('Error al cargar generales:', error);
    },
  });
}

private cargarCentrales(): void {
  this.apiService.getData<CatalogoCentralResponse[]>('catalogo/central').subscribe({
    next: (response: HttpResponse<CatalogoCentralResponse[]>) => {
      console.log('STATUS centrales:', response.status);
      console.log('Centrales:', response.body);

      const data = response.body ?? [];

      this.centralesPorGeneral = data.reduce(
        (acc: Record<string, SelectOption[]>, item: CatalogoCentralResponse) => {
          if (!acc[item.general_clave]) {
            acc[item.general_clave] = [];
          }

          acc[item.general_clave].push({
            value: item.clave,
            label: `${item.clave} - ${item.nombre}`,
          });

          return acc;
        },
        {} as Record<string, SelectOption[]>
      );
    },
    error: (error: unknown) => {
      this.logger.error('Error al cargar centrales:', error);
    },
  });
}

private cargarGeneralesConCentrales(): void {
  this.apiService.getData<CatalogoGeneralesCentralResponse>('catalogo/generales_x_central').subscribe({
    next: (response: HttpResponse<CatalogoGeneralesCentralResponse>) => {
      console.log('STATUS generales_x_central:', response.status);
      console.log('Generales x Central:', response.body);
    },
    error: (error: unknown) => {
      this.logger.error('Error al cargar generales x central:', error);
    },
  });
}


// private cargarTiposMedioRecepcion(): void {
//   this.apiService
//     .getData<TipoMedioRecepcionResponse[]>('catalogos/tipos-medio-recepcion')
//     .subscribe({
//       next: (response: HttpResponse<TipoMedioRecepcionResponse[]>) => {
//         console.log('STATUS tipos:', response.status);

//         const data = response.body ?? [];

//         this.tipoMedioRecepcionOptions = data.map((item) => ({
//           value: item.clave,
//           label: item.descripcion,
//         }));
//       },
//       error: (error: unknown) => {
//         this.logger.error('Error al cargar tipos de medio de recepción:', error);
//       },
//     });
// }

// private cargarRemitentesGenerales(): void {
//   this.apiService
//     .getData<RemitenteGeneralResponse[]>('catalogos/remitentes-generales')
//     .subscribe({
//       next: (response: HttpResponse<RemitenteGeneralResponse[]>) => {
//         console.log('STATUS generales:', response.status);

//         const data = response.body ?? [];

//         this.remitentesGenerales = data.map((item) => ({
//           value: item.clave,
//           label: `${item.clave} - ${item.descripcion}`,
//         }));
//       },
//       error: (error: unknown) => {
//         this.logger.error('Error al cargar remitentes generales:', error);
//       },
//     });
// }

// private cargarRemitentesCentrales(): void {
//   this.apiService
//     .getData<RemitenteCentralResponse[]>('catalogos/remitentes-centrales')
//     .subscribe({
//       next: (response: HttpResponse<RemitenteCentralResponse[]>) => {
//         console.log('STATUS centrales:', response.status);

//         const data = response.body ?? [];

//         this.centralesPorGeneral = data.reduce(
//           (
//             acc: Record<string, SelectOption[]>,
//             item: RemitenteCentralResponse
//           ) => {
//             if (!acc[item.claveGeneral]) {
//               acc[item.claveGeneral] = [];
//             }

//             acc[item.claveGeneral].push({
//               value: item.clave,
//               label: `${item.clave} - ${item.descripcion}`,
//             });

//             return acc;
//           },
//           {} as Record<string, SelectOption[]>
//         );
//       },
//       error: (error: unknown) => {
//         this.logger.error('Error al cargar remitentes centrales:', error);
//       },
//     });
// }

  // Obtener las Centrales según la General seleccionada
  get remitenteCentralOptions(): SelectOption[] {
    const generalSeleccionada = this.formulario.get('remitente_general')?.value;
    if (generalSeleccionada && this.centralesPorGeneral[generalSeleccionada]) {
      return this.centralesPorGeneral[generalSeleccionada];
    }
    return [];
  }

  constructor(
    private fb: FormBuilder,
    private autocompleteService: ExpedienteAutocompleteService,
    private expedienteService: ExpedienteTlalcalliService,
    private dialog: MatDialog,
    private logger: LoggerService,
    private formHelper: FormHelperService
  ) {
    this.formulario = this.fb.group({
      // TIPO DE MEDIO DE RECEPCIÓN: Campo obligatorio para clasificar el requerimiento
      tipo_medio_recepcion: ['', [Validators.required]],
      // OFICIO: Campo más importante (clave única)
      // Validación de duplicados se hace al hacer submit
      // Sin validación de formato - acepta cualquier string
      oficio: ['',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      // EXPEDIENTE: Auto-rellenado y no editable
      expediente: [{ value: '', disabled: false }, [
        Validators.required,
        Validators.maxLength(50),
        ExpedienteValidators.expedienteFormat()
      ]],
      numero_entrada_central: ['', [
        Validators.maxLength(100)
      ]],
      // Remitente: estructura jerárquica General -> Central -> Identificador
      remitente_general: ['', [Validators.required]], // Área General (obligatorio)
      remitente_central: [''], // Área Central (opcional, depende de la General)
      remitente_identificador: ['', [
        Validators.maxLength(15)
      ]], // Identificador adicional (máximo 15 caracteres, opcional)
      fecha_documento: [this.formHelper.getFechaActual(), [
        Validators.required,
        // ExpedienteValidators.noFutureDate()
      ]],
      fecha_recibido: [this.formHelper.getFechaActual(), [
        Validators.required,
        // ExpedienteValidators.noFutureDate(),
        // ExpedienteValidators.fechaRecibidoValida()
      ]],
      fecha_requerimiento: [this.formHelper.getFechaActual(), [
        Validators.required,
        // ExpedienteValidators.noFutureDate()
      ]],
      referencia_asunto: ['', [
        Validators.required,
        Validators.maxLength(1000)
      ]],
      fecha_vencimiento: [null, [
        // ExpedienteValidators.noFutureDate()
      ]],
      // Nivel de Prioridad (movido del Step 2)
      prioridad: ['MEDIA', Validators.required]
    });
  }

  // Opciones para prioridad del expediente
  opcionesPrioridad: SelectOption[] = [
    { value: 'URGENTE', label: '🔴 Urgente - Requiere atención inmediata' },
    { value: 'ALTA', label: '🟠 Alta - Prioridad elevada' },
    { value: 'MEDIA', label: '🔵 Media - Prioridad normal' },
    { value: 'BAJA', label: '🟢 Baja - Sin urgencia' }
  ];

  ngOnInit() {

    // !FUNCIONALIDAD PARA ACTUALIZAR EL EXPEDIENTE
    this.expedienteSub = timer(0, 10000)
    .pipe(
      switchMap( () => this.autocompleteService.obtenerSiguienteExpediente())
    )
    .subscribe( {
        next : (respuesta) => {
            this.formulario.patchValue({
              expediente: respuesta
            });
        },
        error : (error) => {
            console.error('Error al consultar el endpoint:', error);
        }
      }
  );

    this.cargarCatalogos();
    // Deshabilitar fecha_documento (campo automático)
    this.formulario.get('fecha_documento')?.disable();

    // Revalidar fecha_recibido cuando cambia fecha_documento
    // this.formulario.get('fecha_documento')?.valueChanges.subscribe(() => {
    //   this.formulario.get('fecha_recibido')?.updateValueAndValidity();
    // });


    // Limpiar error de duplicado cuando el usuario modifica el oficio
    // Y verificar si el oficio ya tiene un expediente asignado
    this.formulario.get('oficio')?.valueChanges.subscribe((valor) => {
      this.errorOficioDuplicado = false;
      this.idOficioDuplicado = null;

      // Si hay un oficio, verificar si ya tiene expediente y cargarlo
      if (valor && valor.trim()) {
        this.verificarYActualizarExpedientePorOficio(valor.trim());
      }
    });

    // Detectar y normalizar caracteres problemáticos en el oficio
    this.formulario.get('oficio')?.valueChanges.subscribe((valor) => {
      if (valor && valor.trim()) {
        this.detectarCaracteresProblematicos(valor);
      } else {
        this.caracteresProblematicos = [];
        this.tieneCaracteresProblematicos = false;
      }
    });

    // Pre-llenar valores cuando cambia el tipo de medio de recepción
    // Y deshabilitar/habilitar el campo oficio según el tipo
    this.formulario.get('tipo_medio_recepcion')?.valueChanges.subscribe((tipo) => {
      if (tipo) {
        this.aplicarValoresInicialesPorTipo(tipo);

        // Si es "Petición interna", deshabilitar el campo oficio
        const oficioControl = this.formulario.get('oficio');
        if (tipo === 'REQUERIMIENTO_VERBAL') {
          // Deshabilitar y limpiar el campo oficio
          oficioControl?.disable();
          oficioControl?.setValue('');
          // Remover validación requerida
          oficioControl?.clearValidators();
          oficioControl?.updateValueAndValidity({ emitEvent: false });
          this.logger.debug('Campo oficio deshabilitado por Petición interna');
        } else {
          // Habilitar el campo oficio para otros tipos
          oficioControl?.enable();
          // Restaurar validación requerida
          oficioControl?.setValidators([Validators.required]);
          oficioControl?.updateValueAndValidity({ emitEvent: false });
          this.logger.debug('Campo oficio habilitado');
        }
      }
    });

    // Validar que al menos uno de los campos de remitente esté lleno
    // Limpiar remitente_central cuando cambia remitente_general
    this.formulario.get('remitente_general')?.valueChanges.subscribe((general) => {
      if (general) {
        // Limpiar la central cuando cambia la general
        this.formulario.patchValue({ remitente_central: '' }, { emitEvent: false });
      }
    });

    // Emitir validez del formulario cuando cambia
    this.formulario.statusChanges.subscribe(() => {
      this.validezCambiada.emit(this.formulario.valid);
    });

    // Emitir validez inicial
    this.validezCambiada.emit(this.formulario.valid);

    // Calcular campos totales
    this.camposTotales = Object.keys(this.formulario.controls).length;

    // Calcular progreso inicial
    this.calcularProgreso();

    // Suscribirse a cambios para actualizar progreso
    this.formulario.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.calcularProgreso();
        // Guardar borrador automáticamente
        this.guardarBorrador();
      });

    // Cargar borrador si existe
    // this.cargarBorrador();

    // Obtener y AUTO-CARGAR el siguiente expediente
    const expedienteActual = this.formulario.get('expediente')?.value;

    if (!expedienteActual) {
      this.cargarYAplicarSiguienteExpediente();
    }}

  /**
   * Calcular progreso del formulario
   */
  calcularProgreso(): void {
    let completados = 0;
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control && control.value !== null && control.value !== '' && control.value !== false) {
        completados++;
      }
    });
    this.camposCompletados = completados;
    this.progresoFormulario = Math.round((completados / this.camposTotales) * 100);
  }

  /**
   * Guardar borrador automáticamente
   */
  private guardarBorrador(): void {
    // const datos = this.formulario.getRawValue();
    // this.formHelper.guardarBorrador(1, datos);
  }

  /**
   * Cargar borrador si existe
   */
  // private cargarBorrador(): void {
  //   const borrador = this.formHelper.obtenerBorrador(1);
  //   if (borrador) {
  //     // No sobreescribir campos críticos que ya tienen valor
  //     const datosCargar: any = {};
  //     Object.keys(borrador).forEach(key => {
  //       const control = this.formulario.get(key);
  //       if (control && (!control.value || control.value === '')) {
  //         datosCargar[key] = borrador[key];
  //       }
  //     });

  //     if (Object.keys(datosCargar).length > 0) {
  //       this.formulario.patchValue(datosCargar, { emitEvent: false });
  //       this.logger.debug('Borrador cargado:', Object.keys(datosCargar).length, 'campos');
  //     }
  //   }
  // }


  // Cargar y APLICAR AUTOMÁTICAMENTE el siguiente expediente
  // Si hay un oficio, verifica si ya tiene expediente asignado
  cargarYAplicarSiguienteExpediente() {
    const oficioActual = this.formulario.get('oficio')?.value;

    this.autocompleteService.obtenerSiguienteExpediente(oficioActual).subscribe({
      next: (siguiente) => {
        this.siguienteExpediente = siguiente;
        // AUTO-APLICAR el expediente y BLOQUEAR el campo
        this.formulario.patchValue({
          expediente: siguiente
        });
        this.formulario.get('expediente')?.disable();

        // Asegurar que fecha_documento también esté deshabilitada
        this.formulario.get('fecha_documento')?.disable();

        this.logger.debug('Expediente auto-cargado y bloqueado:', siguiente);

        // Si el oficio ya tenía expediente, mostrar mensaje informativo
        if (oficioActual && oficioActual.trim()) {
          this.logger.info('Expediente asignado al oficio:', oficioActual, '->', siguiente);
        }
      },
      error: (err) => {
        this.logger.error('Error al obtener siguiente expediente:', err);
        // Si falla, dejar el campo editable
        this.formulario.get('expediente')?.enable();
      }
    });
  }

  /**
   * Verificar si el oficio ya tiene un expediente asignado y actualizarlo
   */
  verificarYActualizarExpedientePorOficio(oficio: string): void {
    this.autocompleteService.obtenerExpedientePorOficio(oficio).subscribe({
      next: (expedienteExistente) => {
        this.logger.info('Oficio ya tiene expediente asignado:', oficio, '->', expedienteExistente);
        this.siguienteExpediente = expedienteExistente;
        this.formulario.patchValue({
          expediente: expedienteExistente
        });
        this.formulario.get('expediente')?.disable();
        // Asegurar que fecha_documento también esté deshabilitada
        this.formulario.get('fecha_documento')?.disable();
      },
      error: (err) => {
        // Si no existe, no hacer nada (se generará uno nuevo al guardar)
        this.logger.debug('Oficio nuevo, se generará expediente nuevo al guardar');
      }
    });
  }

  // Recargar expediente (por si el usuario necesita uno nuevo)
  recargarExpediente() {
    this.cargarYAplicarSiguienteExpediente();
  }

  /**
   * Abrir modal de búsqueda de expedientes
   * Método público que se llama desde el botón de búsqueda
   */
  abrirModalBusqueda() {
    const oficio = this.formulario.get('oficio')?.value?.trim();

    this.logger.debug('Iniciando búsqueda de oficio:', oficio);

    if (!oficio || oficio.length < 3) {
      this.mostrarModalError(
        'Oficio inválido',
        'Por favor, ingresa un número de oficio válido',
        'El oficio debe tener al menos 3 caracteres para realizar la búsqueda.'
      );
      return;
    }

    // Evitar abrir múltiples modales
    if (this.modalAbierto || this.buscandoExpedientes) {
      this.logger.debug('Búsqueda ya en progreso o modal abierto');
      return;
    }

    this.buscandoExpedientes = true;
    this.logger.debug('Llamando al servicio para buscar expedientes por oficio:', oficio);

    // Buscar expedientes por oficio
    this.expedienteService.buscarExpedientesPorOficio(oficio).subscribe({
      next: (response) => {
        this.buscandoExpedientes = false;
        this.logger.debug('Respuesta del servicio - Total expedientes:', response.total);

        if (response.success) {
          // Siempre abrir el modal, incluso si no hay expedientes
          this.abrirModalExpedientes(oficio, response.data || [], response.total || 0);
        } else {
          this.logger.warn('Respuesta no exitosa, abriendo modal vacío');
          // Abrir modal con lista vacía si hay error
          this.abrirModalExpedientes(oficio, [], 0);
        }
      },
      error: (error) => {
        this.buscandoExpedientes = false;
        this.logger.error('Error al buscar expedientes por oficio:', error);

        // Mostrar error al usuario con modal
        this.mostrarModalError(
          'Error en la búsqueda',
          'No se pudo buscar expedientes',
          error.message || 'Error desconocido. Por favor, intenta nuevamente.'
        );

        // Abrir modal con lista vacía en caso de error
        this.abrirModalExpedientes(oficio, [], 0);
      }
    });
  }

  /**
   * Abrir modal con los expedientes encontrados
   */
  private abrirModalExpedientes(oficio: string, expedientes: any[], total: number) {
    // Evitar abrir múltiples modales
    if (this.modalAbierto) {
      return;
    }

    this.modalAbierto = true;
    const modalData: ExpedientesModalData = {
      oficio: oficio,
      expedientes: expedientes || [],
      total: total
    };

    const dialogRef = this.dialog.open(ExpedientesModalComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: modalData,
      disableClose: false,
      panelClass: 'expedientes-modal-container'
    });

    // Cuando el usuario selecciona un expediente
    dialogRef.afterClosed().subscribe((expedienteSeleccionado: any) => {
      this.modalAbierto = false;

      if (expedienteSeleccionado) {
        this.logger.debug('Expediente seleccionado:', expedienteSeleccionado.id_expediente);
        this.precargarDatosExpediente(expedienteSeleccionado);
      } else {
        this.logger.debug('Modal cerrado sin seleccionar expediente - Continuando con nuevo expediente');
        // El usuario decidió crear un nuevo expediente, no hacer nada
      }
    });
  }

  /**
   * Pre-cargar datos del expediente seleccionado en el formulario
   */
  private precargarDatosExpediente(expediente: any) {
    this.logger.debug('Pre-cargando datos del expediente:', expediente.id_expediente);

    // Función auxiliar para formatear fechas a formato YYYY-MM-DD para inputs de tipo date
    const formatearFechaParaInput = (fecha: string | null | undefined): string | null => {
      if (!fecha) return null;
      try {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return null;
        // Formatear a YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return null;
      }
    };

    // Pre-cargar campos del formulario con los datos del expediente
    const datosPrecargados: any = {
      // Mantener el oficio que el usuario escribió
      oficio: this.formulario.get('oficio')?.value || expediente.oficio,

      // Pre-cargar campos del expediente (solo si están disponibles)
      remitente_area: expediente.remitente_area || this.formulario.get('remitente_area')?.value || '',
      referencia_asunto: expediente.referencia_asunto || this.formulario.get('referencia_asunto')?.value || '',
      numero_entrada_central: expediente.numero_entrada_central || this.formulario.get('numero_entrada_central')?.value || '',

      // Fechas (formateadas para inputs de tipo date)
      fecha_documento: formatearFechaParaInput(expediente.fecha_documento) || this.formulario.get('fecha_documento')?.value || '',
      fecha_recibido: formatearFechaParaInput(expediente.fecha_recibido) || this.formulario.get('fecha_recibido')?.value || '',

      // Campos de plazo eliminados
    };

    // Aplicar los datos pre-cargados al formulario
    this.formulario.patchValue(datosPrecargados, { emitEvent: false });

        // Mantener el expediente auto-generado (no usar el del expediente seleccionado)
        // El expediente siempre será nuevo, pero podemos usar los datos del expediente seleccionado

        this.logger.debug('Datos pre-cargados en el formulario');

        // Mostrar modal de confirmación en lugar de alert
        this.mostrarModalConfirmacion(expediente.id_expediente);
  }

  /**
   * Mostrar modal de confirmación cuando se precargan datos
   */
  private mostrarModalConfirmacion(idExpediente: number) {
    const modalData: ConfirmacionModalData = {
      titulo: 'Datos pre-cargados',
      mensaje: `Se han cargado los datos del expediente #${idExpediente}.`,
      detalle: 'Puedes modificar cualquier campo antes de continuar.',
      tipo: 'success',
      botonTexto: 'Aceptar'
    };

    const dialogRef = this.dialog.open(ConfirmacionModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: modalData,
      disableClose: false,
      panelClass: 'confirmacion-modal-container'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.logger.debug('Modal de confirmación cerrado');
    });
  }

  /**
   * Mostrar modal de error
   */
  private mostrarModalError(titulo: string, mensaje: string, detalle?: string) {
    const modalData: ConfirmacionModalData = {
      titulo: titulo,
      mensaje: mensaje,
      detalle: detalle,
      tipo: 'error',
      botonTexto: 'Entendido'
    };

    this.dialog.open(ConfirmacionModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: modalData,
      disableClose: false,
      panelClass: 'confirmacion-modal-container'
    });
  }

  /**
   * Limpiar suscripciones al destruir el componente
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.expedienteSub?.unsubscribe();
  }

  onSubmit() {
    // Si el tipo es REQUERIMIENTO_VERBAL, habilitar temporalmente el campo oficio para obtener su valor (vacío)
    const tipoMedio = this.formulario.get('tipo_medio_recepcion')?.value;
    const oficioControl = this.formulario.get('oficio');

    if (tipoMedio === 'REQUERIMIENTO_VERBAL') {
      // Habilitar temporalmente para obtener el valor (será vacío)
      oficioControl?.enable({ emitEvent: false });
    }

    // Validación del paso 1
    if (!this.formulario.valid) {
      // Si es REQUERIMIENTO_VERBAL, deshabilitar nuevamente después de la validación
      if (tipoMedio === 'REQUERIMIENTO_VERBAL') {
        oficioControl?.disable({ emitEvent: false });
      }
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
      return;
    }

    // Si es REQUERIMIENTO_VERBAL, deshabilitar nuevamente antes de continuar
    if (tipoMedio === 'REQUERIMIENTO_VERBAL') {
      oficioControl?.disable({ emitEvent: false });
    }

    // ⚠️ VALIDACIÓN DE OFICIO TEMPORALMENTE DESHABILITADA
    // TODO: Arreglar problema de conexión con endpoint de validación

    // Validación de oficio deshabilitada temporalmente (el backend validará al guardar)

    // Continuar directamente sin validar
    this.continuarConFormulario();

    /*
    // CÓDIGO DE VALIDACIÓN (DESHABILITADO)
    const oficioValue = this.formulario.get('oficio')?.value?.trim();

    if (!oficioValue) {
      alert('⚠️ El campo Oficio es obligatorio');
      return;
    }

    // Código comentado - validación de oficio deshabilitada
    // this.validandoOficio = true;
    // this.errorOficioDuplicado = false;
    // ... resto del código comentado
    */
  }

  /**
   * Continuar con el envío del formulario después de validar oficio
   */
  private continuarConFormulario() {

    // Obtener valor del expediente (aunque esté deshabilitado)
    // const expedienteUsado = this.formulario.get('expediente')?.value || this.siguienteExpediente;
    // if (expedienteUsado) {
    //   this.autocompleteService.guardarUltimoExpediente(expedienteUsado);
    // }

    // Construir remitente_area combinando los tres campos: General + Central + Identificador
    const remitenteGeneral = this.formulario.get('remitente_general')?.value || '';
    const remitenteCentral = this.formulario.get('remitente_central')?.value || '';
    const remitenteIdentificador = this.formulario.get('remitente_identificador')?.value || '';

    // Validar que la General esté seleccionada (obligatorio)
    if (!remitenteGeneral) {
      this.mostrarModalError(
        'Campo incompleto',
        'Remitente (Área) es obligatorio',
        'Debe seleccionar una opción en "Generales"'
      );
      return;
    }

    // Combinar: General + Central + Identificador
    // Orden: primero General, luego Central (si existe), luego Identificador (si existe)
    const partes: string[] = [];
    if (remitenteGeneral) partes.push(remitenteGeneral);
    if (remitenteCentral) partes.push(remitenteCentral);
    if (remitenteIdentificador && remitenteIdentificador.trim()) {
      const identificadorLimpio = remitenteIdentificador.trim().substring(0, 10);
      partes.push(identificadorLimpio);
    }

    let remitenteCompleto = partes.join('');

    // El campo remitente_area en BD tiene límite, asegurar que no exceda
    if (remitenteCompleto.length > 50) {
      remitenteCompleto = remitenteCompleto.substring(0, 50);
    }

    // Construir objeto completo incluyendo campos deshabilitados
    const datosFormulario = {
      ...this.formulario.getRawValue(), // getRawValue incluye campos deshabilitados
      remitente_area: remitenteCompleto, // Reemplazar con el valor combinado
      plazo_vencimiento_prioridad: this.construirPlazo()
    };

    this.logger.debug('Datos Paso 1 preparados para envío', {
      remitente_general: remitenteGeneral,
      remitente_central: remitenteCentral,
      remitente_identificador: remitenteIdentificador,
      remitente_area_final: remitenteCompleto
    });

    // Guardar valores en historial para autocompletado futuro
    if (remitenteCompleto) {
      // this.formHelper.guardarEnHistorial('remitente_area', remitenteCompleto);
    }

    // Limpiar borrador al completar
    // this.formHelper.limpiarBorrador(1);

    // Solo emitir formularioCompletado, el stepper se encargará de avanzar
    this.formularioCompletado.emit(datosFormulario);
  }

  // Construir objeto de plazo con toda la información
  private construirPlazo() {
    // Ya no se usa plazo de atención por petición de negocio
    // Enviar valores por defecto válidos (1 día) que se guardarán como NULL en BD
    return {
      valor: 1, // Valor mínimo válido (la BD lo convertirá a NULL si es necesario)
      unidad: 'dias', // Valor por defecto
      es_urgente: false
    };
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  private mostrarCamposInvalidos() {
    const camposInvalidos: string[] = [];
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.invalid) {
        this.logger.debug(`Campo inválido: ${key}`, {
          errors: control.errors
        });
        camposInvalidos.push(key);
      }
    });

    if (camposInvalidos.length > 0) {
      this.mostrarModalError(
        'Formulario incompleto',
        'Faltan campos obligatorios',
        `Los siguientes campos son requeridos:\n\n${camposInvalidos.map(c => `• ${c}`).join('\n')}`
      );
    }
  }

  /**
   * Aplicar valores iniciales según el tipo de medio de recepción seleccionado
   */
  private aplicarValoresInicialesPorTipo(tipo: string): void {
    const valores: any = {};

    switch (tipo) {
      case 'ATENTA_NOTA':
        // Valores sugeridos para atenta nota - no pre-llenar remitente
        break;

      case 'OFICIO':
        // Valores para oficio formal - no necesita pre-llenado especial
        break;

      case 'REQUERIMIENTO_VERBAL':
        // Valores para petición interna - no pre-llenar
        break;

      case 'CORREO_ELECTRONICO':
        // Valores para correo electrónico - no pre-llenar
        break;
    }

    // Aplicar valores solo si los campos están vacíos
    Object.keys(valores).forEach(key => {
      const control = this.formulario.get(key);
      if (control && (!control.value || control.value === '')) {
        control.patchValue(valores[key], { emitEvent: false });
      }
    });

    this.logger.debug('Valores iniciales aplicados para tipo de medio:', tipo, valores);
  }

  /**
   * Detectar caracteres problemáticos en el oficio
   * Detecta: l, I, O, o, 1, 0 (todos pueden causar confusión)
   */
  private detectarCaracteresProblematicos(valor: string): void {
    this.caracteresProblematicos = [];
    const problemas: { [key: string]: string } = {
      'l': '1, I', // ele minúscula → puede confundirse con 1 o I
      'I': '1, l', // i mayúscula → puede confundirse con 1 o l
      'O': '0, o', // o mayúscula → puede confundirse con 0 o o
      'o': '0, O', // o minúscula → puede confundirse con 0 o O
      '1': 'l, I', // uno → puede confundirse con l o I
      '0': 'O, o', // cero → puede confundirse con O o o
    };

    for (let i = 0; i < valor.length; i++) {
      const char = valor[i];
      if (problemas[char]) {
        this.caracteresProblematicos.push({
          caracter: char,
          posicion: i + 1,
          sugerencia: problemas[char]
        });
      }
    }

    this.tieneCaracteresProblematicos = this.caracteresProblematicos.length > 0;
  }

  /**
   * Normalizar caracteres problemáticos (opcional, se puede activar)
   */
  normalizarOficio(valor: string): string {
    return valor
      .replace(/l/g, '1')  // ele minúscula → uno
      .replace(/I/g, '1')  // i mayúscula → uno
      .replace(/O/g, '0')  // o mayúscula → cero
      .replace(/o/g, '0'); // o minúscula → cero
  }

  // Getters para mensajes de error
  get tipoMedioRecepcionError(): string | null {
    const control = this.formulario.get('tipo_medio_recepcion');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
    }
    return null;
  }

  get oficioError(): string | null {
    const control = this.formulario.get('oficio');

    // Si hay error de duplicado (desde onSubmit)
    if (this.errorOficioDuplicado) {
      const mensaje = this.idOficioDuplicado
        ? `⚠️ Este oficio ya está registrado (ID: ${this.idOficioDuplicado})`
        : '⚠️ Este oficio ya está registrado';
      return mensaje;
    }

    // Errores de validación del formulario
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo clave única obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }

    // Sin errores
    return null;
  }

  get expedienteError(): string | null {
    const control = this.formulario.get('expediente');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
      if (control.errors['expedienteFormat']) return control.errors['expedienteFormat'].message;
    }
    return null;
  }

  get numeroEntradaError(): string | null {
    const control = this.formulario.get('numero_entrada_central');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }

  get remitenteGeneralError(): string | null {
    const control = this.formulario.get('remitente_general');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
    }
    return null;
  }

  get remitenteCentralError(): string | null {
    // Validación se hace al enviar, no hay error individual
    return null;
  }

  get remitenteIdentificadorError(): string | null {
    const control = this.formulario.get('remitente_identificador');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 15 caracteres';
    }
    return null;
  }

  get fechaDocumentoError(): string | null {
    const control = this.formulario.get('fecha_documento');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
    }
    return null;
  }

  get fechaRecibidoError(): string | null {
    const control = this.formulario.get('fecha_recibido');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
      if (control.errors['fechaRecibidoInvalida']) return control.errors['fechaRecibidoInvalida'].message;
    }
    return null;
  }

  get fechaRequerimientoError(): string | null {
    const control = this.formulario.get('fecha_requerimiento');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
    }
    return null;
  }

  get fechaVencimientoError(): string | null {
    const control = this.formulario.get('fecha_vencimiento');
    if (control?.touched && control?.errors) {
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
    }
    return null;
  }

  get referenciaError(): string | null {
    const control = this.formulario.get('referencia_asunto');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 1000 caracteres';
    }
    return null;
  }


  get prioridadError(): string | null {
    const control = this.formulario.get('prioridad');
    if (control && control.invalid && control.touched) {
      if (control.hasError('required')) return 'Debe seleccionar un nivel de prioridad';
    }
    return null;
  }

  // Verificar si el formulario puede continuar
  get puedeAvanzar(): boolean {
    return this.formulario.valid;
  }

  /**
   * Reiniciar el formulario completamente - limpia todos los campos
   * Se llama desde el stepper cuando el usuario quiere empezar en blanco
   */
  reiniciarFormulario(): void {
    this.logger.debug('Reiniciando formulario del paso 1 completamente');

    // Reset del formulario a valores iniciales
    this.formulario.reset({
      tipo_medio_recepcion: '',
      oficio: '',
      expediente: '',
      numero_entrada_central: '',
      remitente_general: '',
      remitente_central: '',
      remitente_identificador: '',
      fecha_documento: this.formHelper.getFechaActual(),
      fecha_recibido: this.formHelper.getFechaActual(),
      fecha_requerimiento: this.formHelper.getFechaActual(),
      referencia_asunto: '',
      fecha_vencimiento: null,
      prioridad: 'MEDIA'
    });

    // Limpiar estados
    this.errorOficioDuplicado = false;
    this.idOficioDuplicado = null;
    this.caracteresProblematicos = [];
    this.tieneCaracteresProblematicos = false;

    // Deshabilitar fecha_documento (es automático)
    this.formulario.get('fecha_documento')?.disable();

    // Recargar siguiente expediente
    this.cargarYAplicarSiguienteExpediente();

    // Limpiar borrador
    // this.formHelper.limpiarBorrador(1);

    // Recalcular progreso
    this.calcularProgreso();

    this.logger.debug('Formulario reiniciado completamente');
  }

  /**
   * Precargar datos parciales - mantiene algunos valores del formulario anterior
   * Se llama desde el stepper para "nuevo similar"
   */
precargarDatos(datos: any): void {
  this.logger.debug('Precargando datos temporales en paso 1:', datos);

  if (datos.expediente) {
    this.siguienteExpediente = datos.expediente;
  }

  const remitenteParseado = this.separarRemitenteArea(datos.remitente_area);

  this.formulario.get('expediente')?.enable({ emitEvent: false });
  this.formulario.get('fecha_documento')?.enable({ emitEvent: false });

  this.formulario.patchValue(
    {
      tipo_medio_recepcion: datos.tipo_medio_recepcion || '',
      oficio: datos.oficio || '',
      expediente: datos.expediente || '',
      numero_entrada_central: datos.numero_entrada_central || '',

      remitente_general: remitenteParseado.general,
      remitente_central: remitenteParseado.central,
      remitente_identificador: remitenteParseado.identificador,

      fecha_documento: datos.fecha_documento || null,
      fecha_recibido: datos.fecha_recibido || null,
      fecha_requerimiento: datos.fecha_requerimiento || null,
      fecha_vencimiento: datos.fecha_vencimiento || null,

      referencia_asunto: datos.referencia_asunto || '',
      prioridad: datos.prioridad || 'MEDIA'
    },
    { emitEvent: true }
  );

  this.formulario.get('expediente')?.disable({ emitEvent: false });
  this.formulario.get('fecha_documento')?.disable({ emitEvent: false });

  this.calcularProgreso();
  // this.guardarBorrador();

  this.validezCambiada.emit(this.formulario.valid);
  }

  private separarRemitenteArea(remitenteArea: string | null | undefined): {
  general: string;
  central: string;
  identificador: string;
} {
  if (!remitenteArea) {
    return {
      general: '',
      central: '',
      identificador: ''
    };
  }

  const generales = this.remitentesGenerales.map(item => String(item.value));

  const general = generales.find(clave => remitenteArea.startsWith(clave)) || '';
  const resto = general ? remitenteArea.replace(general, '') : remitenteArea;

  const centrales = this.centralesPorGeneral[general] || [];
  const central = centrales
    .map(item => String(item.value))
    .find(clave => resto.startsWith(clave)) || '';

  const identificador = central ? resto.replace(central, '') : resto;

  return {
    general,
    central,
    identificador
  };
}








}
