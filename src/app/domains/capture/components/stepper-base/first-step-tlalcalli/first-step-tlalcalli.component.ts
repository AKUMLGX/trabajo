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
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { inject } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CatalogoGeneralesCentralResponse, CatalogoCentralResponse, CatalogoGeneralResponse, 
CrearGeneralRequest, ActualizarGeneralRequest,CrearCentralRequest,ActualizarCentralRequest, MensajeCatalogoResponse } from '../../../../interfaces/first-step-catalogos.interface';
import { HttpResponse } from '@angular/common/http';
import { CatalogoPrioridadResponse, CatalogoServicioResponse, CatalogoMesesResponse,ConsecutivoFechaRequest,ConsecutivoFechaResponse } from '../../../../interfaces/catalogos.interface';
import { UsuarioRequerimiento} from '../../../../interfaces/usuarios-expediente.interface';
import { UsuariosRequerimientoComponent } from '../../usuarios-requerimiento/usuarios-requerimiento/usuarios-requerimiento.component';
@Component({
    selector: 'app-first-step-tlalcalli',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CustomFormFieldComponent,
        CustomTextareaComponent,
        KeyboardNavigationDirective,
        CustomSelectComponent,
        UsuariosRequerimientoComponent
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
  validandoOficio: boolean = false;
  errorOficioDuplicado = false; // Si el oficio ya existe en BD
  idOficioDuplicado: number | null = null; // ID del expediente con oficio duplicado
  buscandoExpedientes: boolean = false; // Indicador de búsqueda en progreso
  modalAbierto: boolean = false; // Indicador si el modal está abierto

  caracteresProblematicos: { caracter: string; posicion: number; sugerencia: string }[] = [];
  tieneCaracteresProblematicos: boolean = false;

  generalesData: CatalogoGeneralResponse[] = [];
  centralesData: CatalogoCentralResponse[] = [];

  generalesCreadasPorUsuario: string[] = [];
  centralesCreadasPorUsuario: string[] = [];

  private destroy$ = new Subject<void>();

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

  readonly opcionesModoExpediente: SelectOption[] = [
  {
    value: 'AUTOMATICO',
    label: 'Automático'
  },
  {
    value: 'MANUAL',
    label: 'Manual / histórico'
  }
];

  get formularioValido(): boolean {
    return this.formulario.valid;
  }

  get etiquetaDocumento(): string {
  const tipo =
    this.formulario.get(
      'tipo_medio_recepcion'
    )?.value;

  switch (tipo) {
    case 'ATENTA_NOTA':
      return 'Atenta Nota';

    case 'OFICIO':
      return 'Oficio';

    case 'REQUERIMIENTO_VERBAL':
      return 'Petición Interna';

    default:
      return 'Oficio, Atenta Nota o Petición Interna';
  }
}

get placeholderDocumento(): string {
  const tipo =
    this.formulario.get(
      'tipo_medio_recepcion'
    )?.value;

  switch (tipo) {
    case 'ATENTA_NOTA':
      return 'Ingrese el número de Atenta Nota';

    case 'OFICIO':
      return 'Ingrese el número de Oficio';

    case 'REQUERIMIENTO_VERBAL':
      return 'Ingrese la referencia de la Petición Interna';

    default:
      return 'Ingrese el número o referencia';
  }
}

  progresoFormulario = 0;
  camposCompletados = 0;
  camposTotales = 0;

  remitentesGenerales: SelectOption[] = [];
  centralesPorGeneral: Record<string, SelectOption[]> = {};
  remitenteCentralOptions: SelectOption[] = [];

  tipoMedioRecepcionOptions: SelectOption[] = [
    { value: 'ATENTA_NOTA', label: 'Atenta nota' },
    { value: 'OFICIO', label: 'Oficio' },
    { value: 'REQUERIMIENTO_VERBAL', label: 'Petición interna' }
    // { value: 'CORREO_ELECTRONICO', label: 'Correo electrónico' }
  ];

private cargarCatalogos(): void {
  this.cargarGenerales();
  this.cargarCentrales();
  this.cargarGeneralesConCentrales();
  this.cargarPrioridades();
  this.cargarServicios();
  this.cargarMeses();
}

private cargarGenerales(): void {
  this.apiService.getGenerales<CatalogoGeneralResponse[]>().subscribe({
    next: (response: HttpResponse<CatalogoGeneralResponse[]>) => {
      const data = response.body ?? [];

      this.generalesData = data.filter(item => !item.eliminado);

      this.remitentesGenerales = this.generalesData.map((item) => ({
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
  this.apiService.getCentrales<CatalogoCentralResponse[]>().subscribe({
    next: (response: HttpResponse<CatalogoCentralResponse[]>) => {
      const data = response.body ?? [];

      console.log('CENTRALES FRONT:', data);

      this.centralesData = data.filter(item => !item.eliminado);

      this.centralesPorGeneral = this.centralesData.reduce(
        (acc: Record<string, SelectOption[]>, item: CatalogoCentralResponse) => {
          const generalClave = String(item.general_clave).trim();

          if (!acc[generalClave]) {
            acc[generalClave] = [];
          }

          acc[generalClave].push({
            value: item.clave,
            label: `${item.clave} - ${item.nombre}`,
          });

          return acc;
        },
        {} as Record<string, SelectOption[]>
      );

      this.actualizarOpcionesCentrales();

      console.log('CENTRALES AGRUPADAS:', this.centralesPorGeneral);
      console.log('OPCIONES CENTRAL:', this.remitenteCentralOptions);
    },
    error: (error: unknown) => {
      this.logger.error('Error al cargar centrales:', error);
    },
  });
}

actualizarOpcionesCentrales(): void {
  const generalSeleccionada = this.formulario.get('remitente_general')?.value;

  this.remitenteCentralOptions = generalSeleccionada
    ? this.centralesPorGeneral[generalSeleccionada] || []
    : [];
}

esGeneralPredefinido(): boolean {
  const general = this.obtenerGeneralSeleccionada();
  return !!general && general.id >= 1 && general.id <= 13;
}

esCentralPredefinida(): boolean {
  const central = this.obtenerCentralSeleccionada();
  return !!central && central.id >= 1 && central.id <= 83;
}

private obtenerGeneralSeleccionada(): CatalogoGeneralResponse | null {
  const clave = this.formulario.get('remitente_general')?.value;

  return this.generalesData.find((item) => item.clave === clave) ?? null;
}

private obtenerCentralSeleccionada(): CatalogoCentralResponse | null {
  const clave = this.formulario.get('remitente_central')?.value;
  const generalClave = this.formulario.get('remitente_general')?.value;

  return this.centralesData.find(
    (item) => item.clave === clave && item.general_clave === generalClave
  ) ?? null;
}

puedeEditarGeneral(): boolean {
  const clave = this.formulario.get('remitente_general')?.value;
  return this.generalesCreadasPorUsuario.includes(clave);
}

puedeEditarCentral(): boolean {
  const clave = this.formulario.get('remitente_central')?.value;
  const generalClave = this.formulario.get('remitente_general')?.value;

  return this.centralesCreadasPorUsuario.includes(`${generalClave}|${clave}`);
}

agregarGeneral(): void {
  const clave = prompt('Clave de la Administración General:')?.trim();
  if (!clave) return;

  const nombre = prompt('Nombre de la Administración General:')?.trim();
  if (!nombre) return;

  const body: CrearGeneralRequest = {
    clave,
    nombre
  };

  this.apiService.crearGeneral<MensajeCatalogoResponse>(body).subscribe({
next: () => {
  this.generalesCreadasPorUsuario.push(clave);

  localStorage.setItem(
    'generales_creadas_usuario',
    JSON.stringify(this.generalesCreadasPorUsuario)
  );

  this.apiService.getGenerales<CatalogoGeneralResponse[]>().subscribe({
    next: (response) => {
      const data = response.body ?? [];

      this.generalesData = data;

      this.remitentesGenerales = data.map((item) => ({
        value: item.clave,
        label: `${item.clave} - ${item.nombre}`,
      }));

      this.formulario.patchValue({
        remitente_general: clave,
        remitente_central: ''
      });
    }
  });

  this.mostrarModalError(
    'General creada',
    'La Administración General fue creada correctamente.'
  );
},
error: (error: unknown) => {
  this.logger.error('Error al crear general:', error);
  this.mostrarModalError('Error', 'No se pudo crear la Administración General.');
}
  });
}

editarGeneral(): void {
  const general = this.obtenerGeneralSeleccionada();

  if (!general) return;

  if (this.esGeneralPredefinido()) {
    this.mostrarModalError(
      'Acción no permitida',
      'No puedes editar una Administración General predefinida.'
    );
    return;
  }

  const clave = prompt('Nueva clave:', general.clave)?.trim();
  if (!clave) return;

  const nombre = prompt('Nuevo nombre:', general.nombre)?.trim();
  if (!nombre) return;

  const body: ActualizarGeneralRequest = {
    id_aplicativo: general.id,
    clave,
    nombre
  };

  this.apiService.actualizarGeneral<MensajeCatalogoResponse>(body).subscribe({
    next: () => {
      this.cargarGenerales();
      this.formulario.patchValue({
        remitente_general: clave,
        remitente_central: ''
      });

      this.mostrarModalError(
        'General actualizada',
        'La Administración General fue actualizada correctamente.'
      );
    },
    error: (error) => {
      this.logger.error('Error al actualizar general:', error);
      this.mostrarModalError(
        'Error',
        'No se pudo actualizar la Administración General.'
      );
    }
  });
}

eliminarGeneralCatalogo(): void {
  const general = this.obtenerGeneralSeleccionada();

  if (!general) return;

  if (this.esGeneralPredefinido()) {
    this.mostrarModalError(
      'Acción no permitida',
      'No puedes eliminar una Administración General predefinida.'
    );
    return;
  }

  const confirmar = confirm(`¿Seguro que deseas eliminar ${general.clave}?`);
  if (!confirmar) return;

  this.apiService.eliminarGeneral<MensajeCatalogoResponse>(general.id).subscribe({
    next: () => {
      this.formulario.patchValue({
        remitente_general: '',
        remitente_central: ''
      });

      this.cargarGenerales();
      this.cargarCentrales();

      this.mostrarModalError(
        'General eliminada',
        'La Administración General fue eliminada correctamente.'
      );
    },
    error: (error) => {
      this.logger.error('Error al eliminar general:', error);
      this.mostrarModalError(
        'Error',
        'No se pudo eliminar la Administración General.'
      );
    }
  });
}

agregarCentral(): void {
  const generalClave = this.formulario.get('remitente_general')?.value;

  if (!generalClave) {
    this.mostrarModalError(
      'Campo requerido',
      'Primero selecciona una Administración General.'
    );
    return;
  }

  const clave = prompt('Clave de la Administración Central:')?.trim();
  if (!clave) return;

  const nombre = prompt('Nombre de la Administración Central:')?.trim();
  if (!nombre) return;

  const body: CrearCentralRequest = {
    clave,
    nombre,
    general_clave: generalClave
  };

  this.apiService.crearCentral<MensajeCatalogoResponse>(body).subscribe({
    next: () => {
      this.centralesCreadasPorUsuario.push(`${generalClave}|${clave}`);

      localStorage.setItem(
        'centrales_creadas_usuario',
        JSON.stringify(this.centralesCreadasPorUsuario)
      );

      this.apiService.getCentrales<CatalogoCentralResponse[]>().subscribe({
        next: (response) => {
          const data = response.body ?? [];

          this.centralesData = data.filter(item => !item.eliminado);

          this.centralesPorGeneral = this.centralesData.reduce(
            (acc: Record<string, SelectOption[]>, item: CatalogoCentralResponse) => {
              const generalClaveItem = String(item.general_clave).trim();

              if (!acc[generalClaveItem]) {
                acc[generalClaveItem] = [];
              }

              acc[generalClaveItem].push({
                value: item.clave,
                label: `${item.clave} - ${item.nombre}`,
              });

              return acc;
            },
            {} as Record<string, SelectOption[]>
          );

          this.actualizarOpcionesCentrales();

          this.formulario.patchValue({
            remitente_central: clave
          });

          this.mostrarModalError(
            'Central creada',
            'La Administración Central fue creada correctamente.'
          );
        },
        error: (error: unknown) => {
          this.logger.error('Error al recargar centrales:', error);
        }
      });
    },
    error: (error: unknown) => {
      this.logger.error('Error al crear central:', error);
      this.mostrarModalError(
        'Error',
        'No se pudo crear la Administración Central.'
      );
    }
  });
}

editarCentral(): void {
  const central = this.obtenerCentralSeleccionada();

  if (!central) return;

  if (this.esCentralPredefinida()) {
    this.mostrarModalError(
      'Acción no permitida',
      'No puedes editar una Administración Central predefinida.'
    );
    return;
  }

  const clave = prompt('Nueva clave:', central.clave)?.trim();
  if (!clave) return;

  const nombre = prompt('Nuevo nombre:', central.nombre)?.trim();
  if (!nombre) return;

  const body: ActualizarCentralRequest = {
    id_aplicativo: central.id,
    clave,
    nombre
  };

  this.apiService.actualizarCentral<MensajeCatalogoResponse>(body).subscribe({
    next: () => {
      this.cargarCentrales();

      this.formulario.patchValue({
        remitente_central: clave
      });

      this.mostrarModalError(
        'Central actualizada',
        'La Administración Central fue actualizada correctamente.'
      );
    },
    error: (error) => {
      this.logger.error('Error al actualizar central:', error);
      this.mostrarModalError(
        'Error',
        'No se pudo actualizar la Administración Central.'
      );
    }
  });
}

eliminarCentralCatalogo(): void {
  const central = this.obtenerCentralSeleccionada();

  if (!central) return;

  if (this.esCentralPredefinida()) {
    this.mostrarModalError(
      'Acción no permitida',
      'No puedes eliminar una Administración Central predefinida.'
    );
    return;
  }

  const confirmar = confirm(`¿Seguro que deseas eliminar ${central.clave}?`);
  if (!confirmar) return;

  this.apiService.eliminarCentral<MensajeCatalogoResponse>(central.id).subscribe({
    next: () => {
      this.formulario.patchValue({
        remitente_central: ''
      });

      this.cargarCentrales();

      this.mostrarModalError(
        'Central eliminada',
        'La Administración Central fue eliminada correctamente.'
      );
    },
    error: (error) => {
      this.logger.error('Error al eliminar central:', error);
      this.mostrarModalError(
        'Error',
        'No se pudo eliminar la Administración Central.'
      );
    }
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

actualizarUsuarios(
  usuarios: UsuarioRequerimiento[]
): void {
  const control =
    this.formulario.get('usuarios');

  control?.setValue(
    usuarios,
    {
      emitEvent: true
    }
  );

  control?.markAsTouched();
  control?.markAsDirty();

  control?.updateValueAndValidity({
    emitEvent: true
  });

  this.calcularProgreso();
  this.validezCambiada.emit(
    this.formulario.valid
  );
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
  tipo_medio_recepcion: ['', Validators.required],

  oficio: [
    '',
    [
      Validators.required,
      Validators.maxLength(100)
    ]
  ],

  modo_expediente: [
    'AUTOMATICO',
    Validators.required
  ],

  expediente: [
    {
      value: '',
      disabled: false
    },
    [
      Validators.required,
      Validators.maxLength(50),
      ExpedienteValidators.expedienteFormat()
    ]
  ],

  mes_expediente: [
    String(
      new Date().getMonth() + 1
    ).padStart(2, '0'),
    Validators.required
  ],

  numero_entrada_central: [
    '',
    Validators.maxLength(100)
  ],

  remitente_general: [
    '',
    Validators.required
  ],

  remitente_central: [''],

  remitente_identificador: [''],

  fecha_documento: [
    this.formHelper.getFechaActual(),
    Validators.required
  ],

  fecha_recibido: [
    this.formHelper.getFechaActual(),
    Validators.required
  ],

  fecha_requerimiento: [
    this.formHelper.getFechaActual(),
    Validators.required
  ],

  referencia_asunto: [
    '',
    [
      Validators.required,
      Validators.maxLength(1000)
    ]
  ],

  prioridad: [
    1,
    Validators.required
  ],

  servicio: [
    null,
    Validators.required
  ],

  plazo_vencimiento: [
    null,
    [
      Validators.min(1),
      Validators.max(999)
    ]
  ],

  fecha_vencimiento: [
    {
      value: null,
      disabled: true
    }
  ],

  usuarios:
    this.fb.control<UsuarioRequerimiento[]>(
      [],
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1)
        ]
      }
    )
});
  }

opcionesPrioridad: SelectOption[] = [];
opcionesServicio: SelectOption[] = [];
opcionesMeses: SelectOption[] = [];

ngOnInit(): void {
  this.cargarCatalogos();
  this.formulario
  .get('mes_expediente')
  ?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe((mes: string | null) => {
    const modo =
      this.formulario.get(
        'modo_expediente'
      )?.value;

    if (
      modo === 'AUTOMATICO' &&
      mes
    ) {
      this.obtenerConsecutivoPorMes(
        mes
      );
    }
  });
  
  this.formulario.get('oficio')?.valueChanges
    .pipe(
      debounceTime(600),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe((valor) => {
      this.errorOficioDuplicado = false;
      this.idOficioDuplicado = null;

      const oficio = valor?.trim();
      if (oficio && oficio.length >= 3) {
        this.verificarYActualizarExpedientePorOficio(oficio);
      }
    });

  this.formulario.get('oficio')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((valor) => {
      if (valor && valor.trim()) {
        this.detectarCaracteresProblematicos(valor);
      } else {
        this.caracteresProblematicos = [];
        this.tieneCaracteresProblematicos = false;
      }
    });

this.formulario
  .get('tipo_medio_recepcion')
  ?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe((tipo: string | null) => {
    if (!tipo) {
      return;
    }

    this.aplicarValoresInicialesPorTipo(
      tipo
    );

    const oficioControl =
      this.formulario.get('oficio');

    oficioControl?.enable({
      emitEvent: false
    });

    oficioControl?.setValidators([
      Validators.required,
      Validators.maxLength(100)
    ]);

    oficioControl?.updateValueAndValidity({
      emitEvent: false
    });
  });


  this.formulario.get('remitente_general')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.formulario.patchValue(
        {
          remitente_central: ''
        },
        {
          emitEvent: false
        }
      );
      this.actualizarOpcionesCentrales();
    });

  this.formulario.statusChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.validezCambiada.emit(this.formulario.valid);
    });

  this.validezCambiada.emit(this.formulario.valid);
  this.camposTotales = Object.keys(
    this.formulario.controls
  ).length;

  this.calcularProgreso();

  this.formulario.valueChanges
    .pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.calcularProgreso();
      this.guardarBorrador();
    });

  this.generalesCreadasPorUsuario = JSON.parse(
    localStorage.getItem(
      'generales_creadas_usuario'
    ) || '[]'
  );

  this.centralesCreadasPorUsuario = JSON.parse(
    localStorage.getItem(
      'centrales_creadas_usuario'
    ) || '[]'
  );

  this.formulario
  .get('modo_expediente')
  ?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe((modo: string | null) => {
    this.actualizarModoExpediente(
      modo ?? 'AUTOMATICO'
    );
  });

  this.actualizarModoExpediente(
  this.formulario.get(
    'modo_expediente'
  )?.value ?? 'AUTOMATICO'
);

this.formulario
  .get('fecha_recibido')
  ?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    this.actualizarFechaVencimiento();
  });

this.formulario
  .get('plazo_vencimiento')
  ?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    this.actualizarFechaVencimiento();
  });
}

private actualizarFechaVencimiento():
  void {
  const fechaRecepcion =
    this.formulario.get(
      'fecha_recibido'
    )?.value;

  const plazo =
    Number(
      this.formulario.get(
        'plazo_vencimiento'
      )?.value
    );

  const controlVencimiento =
    this.formulario.get(
      'fecha_vencimiento'
    );

  if (
    !fechaRecepcion ||
    !Number.isInteger(plazo) ||
    plazo <= 0
  ) {
    controlVencimiento?.setValue(
      null,
      {
        emitEvent: false
      }
    );

    return;
  }

  const fechaCalculada =
    this.sumarDiasHabiles(
      fechaRecepcion,
      plazo
    );

  controlVencimiento?.setValue(
    fechaCalculada,
    {
      emitEvent: false
    }
  );
}

private sumarDiasHabiles(
  fechaInicial: string,
  diasHabiles: number
): string | null {
  const partes =
    fechaInicial.split('-');

  if (partes.length !== 3) {
    return null;
  }

  const anio =
    Number(partes[0]);

  const mes =
    Number(partes[1]);

  const dia =
    Number(partes[2]);

  const fecha =
    new Date(
      anio,
      mes - 1,
      dia
    );

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return null;
  }

  let diasAgregados = 0;

  while (
    diasAgregados < diasHabiles
  ) {
    fecha.setDate(
      fecha.getDate() + 1
    );

    const diaSemana =
      fecha.getDay();

    const esFinDeSemana =
      diaSemana === 0 ||
      diaSemana === 6;

    if (!esFinDeSemana) {
      diasAgregados++;
    }
  }

  const anioResultado =
    fecha.getFullYear();

  const mesResultado =
    String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

  const diaResultado =
    String(
      fecha.getDate()
    ).padStart(2, '0');

  return `${anioResultado}-${mesResultado}-${diaResultado}`;
}

private actualizarModoExpediente(
  modo: string
): void {
  const expedienteControl =
    this.formulario.get('expediente');

  const mesControl =
    this.formulario.get('mes_expediente');

  if (modo === 'MANUAL') {
    expedienteControl?.enable({
      emitEvent: false
    });

    mesControl?.disable({
      emitEvent: false
    });

    return;
  }

  mesControl?.enable({
    emitEvent: false
  });

  expedienteControl?.disable({
    emitEvent: false
  });

  const mes =
    mesControl?.value;

  if (mes) {
    this.obtenerConsecutivoPorMes(
      String(mes)
    );
  }
}

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

  private guardarBorrador(): void {}

  cargarYAplicarSiguienteExpediente() {
    const oficioActual = this.formulario.get('oficio')?.value;

    this.autocompleteService.obtenerSiguienteExpediente(oficioActual).subscribe({
      next: (siguiente) => {
        this.siguienteExpediente = siguiente;
        this.formulario.patchValue({
          expediente: siguiente
        });
        this.formulario.get('expediente')?.disable();
        this.formulario.get('fecha_documento')?.disable();
        this.logger.debug('Expediente auto-cargado y bloqueado:', siguiente);

        if (oficioActual && oficioActual.trim()) {
          this.logger.info('Expediente asignado al oficio:', oficioActual, '->', siguiente);
        }
      },
      error: (err) => {
        this.logger.error('Error al obtener siguiente expediente:', err);
        this.formulario.get('expediente')?.enable();
      }
    });
  }

  verificarYActualizarExpedientePorOficio(oficio: string): void {
    this.autocompleteService.obtenerExpedientePorOficio(oficio).subscribe({
      next: (expedienteExistente) => {
        this.logger.info('Oficio ya tiene expediente asignado:', oficio, '->', expedienteExistente);
        this.siguienteExpediente = expedienteExistente;
        this.formulario.patchValue({
          expediente: expedienteExistente
        });
        this.formulario.get('expediente')?.disable();
        this.formulario.get('fecha_documento')?.disable();
      },
      error: (err) => {
        this.logger.debug('Oficio nuevo, se generará expediente nuevo al guardar');
      }
    });
  }

  recargarExpediente() {
    this.cargarYAplicarSiguienteExpediente();
  }

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

    if (this.modalAbierto || this.buscandoExpedientes) {
      this.logger.debug('Búsqueda ya en progreso o modal abierto');
      return;
    }

    this.buscandoExpedientes = true;
    this.logger.debug('Llamando al servicio para buscar expedientes por oficio:', oficio);

    this.expedienteService.buscarExpedientesPorOficio(oficio).subscribe({
      next: (response) => {
        this.buscandoExpedientes = false;
        this.logger.debug('Respuesta del servicio - Total expedientes:', response.total);

        if (response.success) {
          this.abrirModalExpedientes(oficio, response.data || [], response.total || 0);
        } else {
          this.logger.warn('Respuesta no exitosa, abriendo modal vacío');
          this.abrirModalExpedientes(oficio, [], 0);
        }
      },
      error: (error) => {
        this.buscandoExpedientes = false;
        this.logger.error('Error al buscar expedientes por oficio:', error);

        this.mostrarModalError(
          'Error en la búsqueda',
          'No se pudo buscar expedientes',
          error.message || 'Error desconocido. Por favor, intenta nuevamente.'
        );
        this.abrirModalExpedientes(oficio, [], 0);
      }
    });
  }

  private abrirModalExpedientes(oficio: string, expedientes: any[], total: number) {
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

    dialogRef.afterClosed().subscribe((expedienteSeleccionado: any) => {
      this.modalAbierto = false;

      if (expedienteSeleccionado) {
        this.logger.debug('Expediente seleccionado:', expedienteSeleccionado.id_expediente);
        this.precargarDatosExpediente(expedienteSeleccionado);
      } else {
        this.logger.debug('Modal cerrado sin seleccionar expediente - Continuando con nuevo expediente');
      }
    });
  }

  private precargarDatosExpediente(expediente: any) {
    this.logger.debug('Pre-cargando datos del expediente:', expediente.id_expediente);
    const formatearFechaParaInput = (fecha: string | null | undefined): string | null => {
      if (!fecha) return null;
      try {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return null;
      }
    };

    const datosPrecargados: any = {
      oficio: this.formulario.get('oficio')?.value || expediente.oficio,
      remitente_area: expediente.remitente_area || this.formulario.get('remitente_area')?.value || '',
      referencia_asunto: expediente.referencia_asunto || this.formulario.get('referencia_asunto')?.value || '',
      numero_entrada_central: expediente.numero_entrada_central || this.formulario.get('numero_entrada_central')?.value || '',
      fecha_documento: formatearFechaParaInput(expediente.fecha_documento) || this.formulario.get('fecha_documento')?.value || '',
      fecha_recibido: formatearFechaParaInput(expediente.fecha_recibido) || this.formulario.get('fecha_recibido')?.value || '',
    };

        this.formulario.patchValue(datosPrecargados, { emitEvent: false });
        this.logger.debug('Datos pre-cargados en el formulario');
        this.mostrarModalConfirmacion(expediente.id_expediente);
  }

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

onSubmit(): void {
  if (this.formulario.invalid) {
    this.marcarCamposInvalidos();
    this.mostrarCamposInvalidos();
    return;
  }

  this.continuarConFormulario();
}

private continuarConFormulario(): void {
  const remitenteGeneral = this.formulario.get('remitente_general')?.value || '';
  const remitenteCentral = this.formulario.get('remitente_central')?.value || '';
  const remitenteIdentificador = this.formulario.get('remitente_identificador')?.value || '';

  if (!remitenteGeneral) {
    this.mostrarModalError(
      'Campo incompleto',
      'Remitente (Área) es obligatorio',
      'Debe seleccionar una opción en "Generales"'
    );
    return;
  }

  let remitenteCompleto = remitenteIdentificador?.trim() || '';

  if (remitenteCompleto.length > 50) {
    remitenteCompleto =
      remitenteCompleto.substring(0, 50);
  }

  const valoresFormulario = this.formulario.getRawValue();

  const usuariosPayload:
    Array<{
      tipo_usuario:
        UsuarioRequerimiento['tipo_usuario'];
      nombre: string;
      rfc: string;
    }> = valoresFormulario.usuarios.map(
      (usuario: UsuarioRequerimiento) => ({
        tipo_usuario: usuario.tipo_usuario,
        nombre: usuario.nombre,
        rfc: usuario.rfc
      })
    );

  const datosFormulario = {
    ...valoresFormulario,

    usuarios: usuariosPayload,

    remitente_area:
      remitenteCompleto,

    plazo_vencimiento_prioridad:
      this.construirPlazo()
  };

  this.logger.debug(
    'Datos Paso 1 preparados para envío',
    {
      remitente_general:
        remitenteGeneral,

      remitente_central:
        remitenteCentral,

      remitente_identificador:
        remitenteIdentificador,

      remitente_area_final:
        remitenteCompleto,

      usuarios:
        usuariosPayload
    }
  );

  this.formularioCompletado.emit(
    datosFormulario
  );
}

private construirPlazo(): {
  valor: number | null;
  unidad: 'dias_habiles';
  es_urgente: boolean;
} {
  const plazo =
    Number(
      this.formulario.get(
        'plazo_vencimiento'
      )?.value
    );

  const prioridad =
    Number(
      this.formulario.get(
        'prioridad'
      )?.value
    );

  return {
    valor:
      Number.isInteger(plazo) &&
      plazo > 0
        ? plazo
        : null,

    unidad:
      'dias_habiles',

    es_urgente:
      prioridad === 2 ||
      prioridad === 3
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

  private aplicarValoresInicialesPorTipo(tipo: string): void {
    const valores: any = {};

    switch (tipo) {
      case 'ATENTA_NOTA':
        break;

      case 'OFICIO':
        break;

      case 'REQUERIMIENTO_VERBAL':
        break;

      case 'CORREO_ELECTRONICO':
        break;
    }

    Object.keys(valores).forEach(key => {
      const control = this.formulario.get(key);
      if (control && (!control.value || control.value === '')) {
        control.patchValue(valores[key], { emitEvent: false });
      }
    });

    this.logger.debug('Valores iniciales aplicados para tipo de medio:', tipo, valores);
  }

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

  normalizarOficio(valor: string): string {
    return valor
      .replace(/l/g, '1')  // ele minúscula → uno
      .replace(/I/g, '1')  // i mayúscula → uno
      .replace(/O/g, '0')  // o mayúscula → cero
      .replace(/o/g, '0'); // o minúscula → cero
  }

  get tipoMedioRecepcionError(): string | null {
    const control = this.formulario.get('tipo_medio_recepcion');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
    }
    return null;
  }

  get servicioError(): string | null {
  const control = this.formulario.get('servicio');

  if (control?.touched && control.errors) {
    if (control.hasError('required')) {
      return 'Debe seleccionar un servicio';
    }
  }
  return null;
}

  get oficioError(): string | null {
    const control = this.formulario.get('oficio');

    if (this.errorOficioDuplicado) {
      const mensaje = this.idOficioDuplicado
        ? `⚠️ Este oficio ya está registrado (ID: ${this.idOficioDuplicado})`
        : '⚠️ Este oficio ya está registrado';
      return mensaje;
    }

    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo clave única obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
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

  get puedeAvanzar(): boolean {
    return this.formulario.valid;
  }

  reiniciarFormulario(): void {
    this.logger.debug('Reiniciando formulario del paso 1 completamente');
    this.formulario.reset({
    tipo_medio_recepcion: '',
    modo_expediente: 'AUTOMATICO',
    servicio: null,
    usuarios: [],
    oficio: '',
    expediente: '',
    mes_expediente:
    String(
      new Date().getMonth() + 1
    ).padStart(2, '0'),

    numero_entrada_central: '',
    remitente_general: '',
    remitente_central: '',
    remitente_identificador: '',
    fecha_documento: this.formHelper.getFechaActual(),
    fecha_recibido: this.formHelper.getFechaActual(),
    fecha_requerimiento: this.formHelper.getFechaActual(),
    referencia_asunto: '',
    prioridad: 1,
    plazo_vencimiento: null,
    fecha_vencimiento: null
  });

    this.errorOficioDuplicado = false;
    this.idOficioDuplicado = null;
    this.caracteresProblematicos = [];
    this.tieneCaracteresProblematicos = false;
    this.formulario.get('fecha_documento')?.disable();
    this.cargarYAplicarSiguienteExpediente();
    this.calcularProgreso();
    this.logger.debug('Formulario reiniciado completamente');
    this.actualizarModoExpediente('AUTOMATICO');
  }

precargarDatos(datos: any): void {
  this.logger.debug(
    'Precargando datos temporales en paso 1:',
    datos
  );

  if (datos.expediente) {
    this.siguienteExpediente =
      datos.expediente;
  }

  const remitenteParseado = {
    general:
      datos.remitente_general || '',

    central:
      datos.remitente_central || '',

    identificador:
      datos.remitente_area || ''
  };

  const usuariosPrecargados:
    UsuarioRequerimiento[] =
      Array.isArray(datos.usuarios)
        ? datos.usuarios.map(
            (
              usuario:
                Partial<UsuarioRequerimiento>
            ): UsuarioRequerimiento => ({
              id_temporal:
                usuario.id_temporal ||
                `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 10)}`,

              tipo_usuario:
                usuario.tipo_usuario ??
                'SERVIDOR_PUBLICO',

              nombre:
                usuario.nombre ?? '',

              rfc:
                usuario.rfc ?? ''
            })
          )
        : [];

  this.formulario
    .get('expediente')
    ?.enable({
      emitEvent: false
    });

  this.formulario
    .get('fecha_documento')
    ?.enable({
      emitEvent: false
    });

  this.formulario.patchValue(
    {
      tipo_medio_recepcion:
        datos.tipo_medio_recepcion || '',

      servicio:
        datos.servicio ??
        datos.id_servicio ??
        null,

      usuarios:
        usuariosPrecargados,

      oficio:
        datos.oficio || '',

      expediente:
        datos.expediente || '',

      mes_expediente:
        datos.mes_expediente ||
        this.extraerMesExpediente(
          datos.expediente
        ) ||
        String(
          new Date().getMonth() + 1
        ).padStart(2, '0'),

      numero_entrada_central:
        datos.numero_entrada_central || '',

      remitente_general:
        remitenteParseado.general,

      remitente_central:
        '',

      remitente_identificador:
        remitenteParseado.identificador,

      fecha_documento:
        datos.fecha_documento || null,

      fecha_recibido:
        datos.fecha_recibido || null,

      fecha_requerimiento:
        datos.fecha_requerimiento || null,

      fecha_vencimiento:
        datos.fecha_vencimiento || null,

      referencia_asunto:
        datos.referencia_asunto || '',

      prioridad:
        datos.prioridad ??
        datos.id_prioridad ??
        1,
      modo_expediente:
      datos.modo_expediente ??
      'AUTOMATICO',

      plazo_vencimiento:
      datos.plazo_vencimiento ??
      datos.plazo_vencimiento_prioridad?.valor ??
      null,
    },
    {
      emitEvent: true
    }
  );

  this.actualizarModoExpediente(
  datos.modo_expediente ??
  'AUTOMATICO');

  this.actualizarFechaVencimiento();

  this.actualizarOpcionesCentrales();

  setTimeout(() => {
    this.formulario.patchValue(
      {
        remitente_central:
          remitenteParseado.central
      },
      {
        emitEvent: false
      }
    );

    this.validezCambiada.emit(
      this.formulario.valid
    );
  }, 100);

  this.formulario
    .get('expediente')
    ?.disable({
      emitEvent: false
    });

  this.formulario
    .get('fecha_documento')
    ?.disable({
      emitEvent: false
    });

  this.calcularProgreso();

  this.validezCambiada.emit(
    this.formulario.valid
  );
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

private extraerMesExpediente(
  expediente: string | null | undefined
): string | null {
  if (!expediente) {
    return null;
  }

  const coincidencia = expediente.match(
    /^EXP-\d{2}(\d{2})-\d{4}$/i
  );

  return coincidencia?.[1] ?? null;
}

private cargarPrioridades(): void {
  this.apiService
    .getData<CatalogoPrioridadResponse[]>(
      'catalogo/prioridad',
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<CatalogoPrioridadResponse[]>
      ) => {
        const prioridades = response.body ?? [];

        console.log(
          'CATÁLOGO PRIORIDADES:',
          prioridades
        );

        this.opcionesPrioridad = prioridades.map(
          (
            prioridad: CatalogoPrioridadResponse
          ): SelectOption => ({
            value: prioridad.id_prioridad,
            label: prioridad.nombre
          })
        );

        const prioridadActual =
          this.formulario.get('prioridad')?.value;

        if (
          !prioridadActual &&
          prioridades.some(
            (prioridad) =>
              prioridad.id_prioridad === 1
          )
        ) {
          this.formulario.patchValue(
            {
              prioridad: 1
            },
            {
              emitEvent: false
            }
          );
        }
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al cargar el catálogo de prioridades:',
          error
        );

        this.opcionesPrioridad = [];
      }
    });
  }

  private cargarServicios(): void {
  this.apiService
    .getData<CatalogoServicioResponse[]>(
      'catalogo/servicio',
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<CatalogoServicioResponse[]>
      ) => {
        const servicios = response.body ?? [];

        console.log(
          'CATÁLOGO SERVICIOS:',
          servicios
        );

        this.opcionesServicio = servicios.map(
          (
            servicio: CatalogoServicioResponse
          ): SelectOption => ({
            value: servicio.id_servicio,
            label: servicio.nombre
          })
        );
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al cargar el catálogo de servicios:',
          error
        );

        this.opcionesServicio = [];
      }
    });
  }

  private actualizarExpedientePorMes(mes: string): void {
  const expedienteActual =
    this.formulario.get('expediente')?.value ||
    this.siguienteExpediente;

  if (!expedienteActual) {
    return;
  }

  const mesFormateado = String(mes).padStart(2, '0');
  const anioActual = String(
    new Date().getFullYear()
  ).slice(-2);

  const coincidencia = expedienteActual.match(
    /^EXP-\d{4}-(\d{4})$/i
  );

  if (!coincidencia) {
    this.logger.warn(
      'No se pudo actualizar el mes porque el expediente no tiene el formato esperado:',
      expedienteActual
    );
    return;
  }

  const consecutivo = coincidencia[1];

  const expedienteActualizado =
    `EXP-${anioActual}${mesFormateado}-${consecutivo}`;

  this.siguienteExpediente = expedienteActualizado;

  this.formulario.patchValue(
    {
      expediente: expedienteActualizado
    },
    {
      emitEvent: false
    }
  );

  this.logger.debug(
    'Expediente actualizado por mes:',
    expedienteActualizado
  );
}

private cargarMeses(): void {
  this.apiService
    .getData<CatalogoMesesResponse>(
      'catalogo/meses',
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<CatalogoMesesResponse>
      ) => {
        const meses = response.body?.data ?? [];

        console.log('CATÁLOGO MESES:', meses);

        this.opcionesMeses = meses.map(
          (mes): SelectOption => ({
            value: mes.clave,
            label: mes.descripcion
          })
        );

        const mesActual =
          this.formulario.get('mes_expediente')?.value;

        if (!mesActual) {
          const mesDelSistema = String(
            new Date().getMonth() + 1
          ).padStart(2, '0');

          const existeMesActual = meses.some(
            (mes) => mes.clave === mesDelSistema
          );

          if (existeMesActual) {
            this.formulario.patchValue(
              {
                mes_expediente: mesDelSistema
              },
              {
                emitEvent: false
              }
            );
          }
        }
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al cargar el catálogo de meses:',
          error
        );

        this.opcionesMeses = [];
      }
    });
    const mesSeleccionado =
  this.formulario.get('mes_expediente')?.value;

if (mesSeleccionado) {
  this.obtenerConsecutivoPorMes(mesSeleccionado);
}
  }

private obtenerConsecutivoPorMes(  claveMes: string | number): void {
  const modo = this.formulario.get('modo_expediente')?.value;

  if (modo !== 'AUTOMATICO') {
    return;
  }
  const claveFormateada = String(claveMes).padStart(2, '0');

  const body: ConsecutivoFechaRequest = {
    clave: claveFormateada
  };

  console.log('BODY CONSECUTIVO FECHA:', body);

  this.apiService
    .putDataBody<ConsecutivoFechaResponse>(
      'expediente/consecutivo_fecha',
      body,
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<ConsecutivoFechaResponse>
      ) => {
        const consecutivo = response.body?.data;

        if (
          consecutivo === null ||
          consecutivo === undefined
        ) {
          this.logger.error(
            'El endpoint no devolvió un consecutivo válido'
          );
          return;
        }

        const anio = String(
          new Date().getFullYear()
        ).slice(-2);

        const consecutivoFormateado = String(
          consecutivo
        ).padStart(4, '0');

        const expediente =
          `EXP-${anio}${claveFormateada}-${consecutivoFormateado}`;

        this.siguienteExpediente = expediente;

        this.formulario.patchValue(
          {
            expediente
          },
          {
            emitEvent: false
          }
        );

        this.formulario
          .get('expediente')
          ?.disable({ emitEvent: false });

        this.logger.debug(
          'Expediente actualizado:',
          expediente
        );
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al obtener el consecutivo por mes:',
          error
        );
      }
    });
  }
}
