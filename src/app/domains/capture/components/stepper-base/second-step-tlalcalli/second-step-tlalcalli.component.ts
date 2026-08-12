import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { LoggerService } from '../../../services/logger.service';
import { FormHelperService } from '../../../services/form-helper.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { HttpResponse } from '@angular/common/http';
import { CatalogoResponsableResponse, CrearResponsableRequest, ActualizarResponsableRequest, MensajeResponsableResponse } from '../../../../interfaces/catalogos.interface';
import { CustomModalComponent2 } from "../../../../responsables/components/atencion-modal/custom-modal/custom-modal/custom-modal.component";
@Component({
    selector: 'app-second-step-tlalcalli',
    imports: [
    ReactiveFormsModule,
    CustomSelectComponent,
    CustomModalComponent2
],
    templateUrl: './second-step-tlalcalli.component.html',
    styleUrl: './second-step-tlalcalli.component.css'
})
export class SecondStepTlalcalliComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);


  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();
  @Output() validezCambiada = new EventEmitter<boolean>();

  formulario: FormGroup;
  private destroy$ = new Subject<void>();

  progresoFormulario = 0;
  camposCompletados = 0;
  camposTotales = 0;

  opcionesResponsables: SelectOption[] = [];
  responsablesData: CatalogoResponsableResponse[] = [];

  modalResponsableVisible = false;

  modalResponsableTipo:
  | 'crear'
  | 'editar'
  | 'eliminar'
  | null = null;

  responsableModalSeleccionado:
  CatalogoResponsableResponse | null = null;


  opcionesEstatus: SelectOption[] = [
    { value: 'ASIGNADO', label: 'Asignado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ATENCION_PARCIAL', label: 'Atención parcial' },
    { value: 'ATENCION_TOTAL', label: 'Atención total' },
    { value: 'REVISION_LEGAL', label: 'Revisión legal' }
  ];




  readonly camposDocumentosPendientes = [
    'tipo_documento',
    'anexos',
    'acuse_fisico_digital',
    'expediente_fisico_digital',
    'comentarios_omega'
  ];

  constructor(
    private fb: FormBuilder,
    private logger: LoggerService,
    private formHelper: FormHelperService
  ) {

    this.formulario = this.fb.group({
      responsable: [null, Validators.required] 
    });
  }


  ngOnInit() {
    this.cargarResponsables();
    this.camposTotales = Object.keys(this.formulario.controls).length;
    this.calcularProgreso();
    this.formulario.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.calcularProgreso();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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


  onSubmit() {
    this.logger.debug('Validando Paso 2 - Formulario válido:', this.formulario.valid);

    if (this.formulario.invalid) {
      this.logger.warn('Paso 2 inválido - Campos con errores');
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
      return;
    }

    this.logger.debug('Paso 2 válido - Continuando');
    const valores = this.formulario.getRawValue();
    this.formularioCompletado.emit({
      ...valores,
      campos_pospuestos: this.camposDocumentosPendientes
    });
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
      const mensaje = `⚠️ PASO 2 - Faltan los siguientes campos:\n\n${camposInvalidos.map(c => `• ${c}`).join('\n')}`;
      alert(mensaje); // TODO: Reemplazar con modal
    }
  }

  goBack() {
    this.pasoAnterior.emit();
  }

get responsableError(): string | null {
  const control = this.formulario.get('responsable');

  if (control?.touched && control.hasError('required')) {
    return 'Debe seleccionar un responsable';
  }

  return null;
}

  reiniciarFormulario(): void {
    this.logger.debug('Reiniciando formulario del paso 2 completamente');

    this.formulario.reset({
      responsable: null
    });

    this.calcularProgreso();

    this.logger.debug('Formulario paso 2 reiniciado completamente');
  }


precargarDatos(
  datos: Partial<{
    responsable: string;
  }>
): void {
  this.formulario.patchValue(
    {
      responsable: datos.responsable ?? ''
    },
    {
      emitEvent: true
    }
  );

  this.calcularProgreso();

  this.logger.debug(
    'Datos precargados en paso 2:',
    datos
  );
}

  private cargarResponsables(): void {
  this.apiService
    .getData<CatalogoResponsableResponse[]>(
      'catalogo/responsables',
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<CatalogoResponsableResponse[]>
      ) => {
        const responsables = response.body ?? [];

        console.log(
          'CATÁLOGO RESPONSABLES:',
          responsables
        );

        this.responsablesData = responsables;

        this.opcionesResponsables = responsables.map(
          (
            responsable: CatalogoResponsableResponse
          ): SelectOption => ({
            value: responsable.id_aplicativo,
            label: responsable.nombre
          })
        );
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al cargar responsables:',
          error
        );

        this.responsablesData = [];
        this.opcionesResponsables = [];
      }
    });
  }

private crearResponsable(
  nombre: string
): void {
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    return;
  }

  const body: CrearResponsableRequest = {
    nombre: nombreLimpio
  };

  this.apiService
    .postData<MensajeResponsableResponse>(
      'catalogo/responsables',
      body,
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<MensajeResponsableResponse>
      ) => {
        this.logger.info(
          response.body?.mensaje ??
          'Responsable creado correctamente'
        );

        this.cerrarModalResponsable();
        this.cargarResponsables();
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al crear responsable:',
          error
        );
      }
    });
}

private actualizarResponsable(
  idAplicativo: number,
  nombre: string
): void {
  const nombreLimpio = nombre.trim();

  if (!idAplicativo || !nombreLimpio) {
    return;
  }

  const body: ActualizarResponsableRequest = {
    id_aplicativo: idAplicativo,
    nombre: nombreLimpio
  };

  this.apiService
    .putDataBody<MensajeResponsableResponse>(
      'catalogo/update_responsables',
      body,
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<MensajeResponsableResponse>
      ) => {
        this.logger.info(
          response.body?.mensaje ??
          'Responsable actualizado correctamente'
        );

        this.cerrarModalResponsable();
        this.cargarResponsables();

        this.formulario.patchValue(
          {
            responsable: idAplicativo
          },
          {
            emitEvent: true
          }
        );
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al actualizar responsable:',
          error
        );
      }
    });
}

private eliminarResponsable(
  idAplicativo: number
): void {
  if (!idAplicativo) {
    return;
  }

  this.apiService
    .putDataBody<MensajeResponsableResponse>(
      `catalogo/responsables/${idAplicativo}`,
      {},
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<MensajeResponsableResponse>
      ) => {
        this.logger.info(
          response.body?.mensaje ??
          'Responsable eliminado correctamente'
        );

        this.formulario.patchValue(
          {
            responsable: null
          },
          {
            emitEvent: true
          }
        );

        this.cerrarModalResponsable();
        this.cargarResponsables();
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al eliminar responsable:',
          error
        );
      }
    });
}

  reactivarResponsable(idAplicativo: number): void {
  if (!idAplicativo) {
    this.logger.warn(
      'El ID del responsable es obligatorio'
    );
    return;
  }

  this.apiService
    .putDataB<MensajeResponsableResponse>(
      `catalogo/act_responsables/${idAplicativo}`,
      {},
      true
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (
        response: HttpResponse<MensajeResponsableResponse>
      ) => {
        this.logger.info(
          response.body?.mensaje ??
          'Responsable reactivado correctamente'
        );

        this.cargarResponsables();
      },
      error: (error: unknown) => {
        this.logger.error(
          'Error al reactivar responsable:',
          error
        );
      }
    });
  }

  private obtenerResponsableSeleccionado():
  CatalogoResponsableResponse | null {
  const idSeleccionado =
    this.formulario.get('responsable')?.value;

  if (!idSeleccionado) {
    return null;
  }

  return this.responsablesData.find(
    (responsable) =>
      responsable.id_aplicativo ===
      Number(idSeleccionado)
  ) ?? null;
  }

  agregarResponsable(): void {
  this.modalResponsableTipo = 'crear';
  this.responsableModalSeleccionado = null;
  this.modalResponsableVisible = true;
  }

  editarResponsableSeleccionado(): void {
  const responsable =
    this.obtenerResponsableSeleccionado();

  if (!responsable) {
    return;
  }

  this.modalResponsableTipo = 'editar';
  this.responsableModalSeleccionado = responsable;
  this.modalResponsableVisible = true;
  }

  eliminarResponsableSeleccionado(): void {
  const responsable =
    this.obtenerResponsableSeleccionado();

  if (!responsable) {
    return;
  }

  this.modalResponsableTipo = 'eliminar';
  this.responsableModalSeleccionado = responsable;
  this.modalResponsableVisible = true;
  }

 cerrarModalResponsable(): void {
  this.modalResponsableVisible = false;
  this.modalResponsableTipo = null;
  this.responsableModalSeleccionado = null;
}

confirmarModalResponsable(
  valor?: string | void
): void {
  if (this.modalResponsableTipo === 'crear') {
    const nombre = String(valor ?? '').trim();

    if (!nombre) {
      return;
    }

    this.crearResponsable(nombre);
    return;
  }

  if (this.modalResponsableTipo === 'editar') {
    const responsable =
      this.responsableModalSeleccionado;

    const nombre = String(valor ?? '').trim();

    if (!responsable || !nombre) {
      return;
    }

    this.actualizarResponsable(
      responsable.id_aplicativo,
      nombre
    );

    return;
  }

  if (this.modalResponsableTipo === 'eliminar') {
    const responsable =
      this.responsableModalSeleccionado;

    if (!responsable) {
      return;
    }

    this.eliminarResponsable(
      responsable.id_aplicativo
    );
  }
}


}
