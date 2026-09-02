import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { LoggerService } from '../../../services/logger.service';
import { FormHelperService } from '../../../services/form-helper.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { HttpResponse } from '@angular/common/http';
import { CatalogoResponsableResponse, CrearResponsableRequest, ActualizarResponsableRequest, MensajeResponsableResponse } from '../../../../interfaces/catalogos.interface';
import { Aplicativo } from '../../../interfaces/aplicativo.interface';
import { CatalogoReworkItem } from '../../../interfaces/expediente-rework.interface';
import { CustomModalComponent2 } from "../../../../responsables/components/atencion-modal/custom-modal/custom-modal/custom-modal.component";
@Component({
    selector: 'app-second-step-tlalcalli',
    imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
    CustomTextareaComponent,
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
  opcionesAplicativos: SelectOption[] = [];
  opcionesEstatus: SelectOption[] = [];
  catalogoEstatus: CatalogoReworkItem[] = [];

  modalResponsableVisible = false;

  modalResponsableTipo:
  | 'crear'
  | 'editar'
  | 'eliminar'
  | null = null;

  responsableModalSeleccionado:
  CatalogoResponsableResponse | null = null;


  opcionesUbicacion: SelectOption[] = [];

  pdfSeleccionado: File | null = null;
  pdfNombreMostrado = '';
  pdfError: string | null = null;
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
      responsable: [null, Validators.required],
      sistema_aplicativo: ['', Validators.required],
      status: [null, Validators.required],
      observaciones_estatus: [''],
      ubicacion: [null, Validators.required]
    });
  }


  ngOnInit() {
    this.cargarResponsables();
    this.cargarAplicativos();
    this.cargarEstatus();
    this.cargarUbicacion();
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
    const responsableSeleccionado = this.responsablesData.find(
      (responsable) => responsable.id_aplicativo === valores.responsable
    );

    const statusSeleccionado = this.catalogoEstatus.find(
      (item) => item.id_exp === Number(valores.status)
    );

    this.formularioCompletado.emit({
      ...valores,
      responsable:
        responsableSeleccionado?.nombre ??
        (valores.responsable != null ? String(valores.responsable) : ''),
      status_descripcion: statusSeleccionado?.descripcion ?? '',
      documento_pdf: this.pdfSeleccionado,
      documento_pdf_nombre: this.pdfNombreMostrado || undefined,
      campos_pospuestos: this.camposDocumentosPendientes
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      this.limpiarArchivo();
      return;
    }

    if (file.type !== 'application/pdf') {
      this.pdfError = 'Sólo se aceptan archivos PDF';
      this.pdfSeleccionado = null;
      this.pdfNombreMostrado = '';
      return;
    }

    this.pdfSeleccionado = file;
    this.pdfNombreMostrado = file.name;
    this.pdfError = null;
  }

  limpiarArchivo(): void {
    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = '';
    this.pdfError = null;
  }

  precargarPdfNombre(nombre?: string): void {
    if (nombre) {
      this.pdfNombreMostrado = nombre;
    }
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

get sistemaAplicativoError(): string | null {
  const control = this.formulario.get('sistema_aplicativo');

  if (control?.touched && control.hasError('required')) {
    return 'Debe seleccionar un aplicativo o sistema';
  }

  return null;
}

get estatusError(): string | null {
  const control = this.formulario.get('status');

  if (control?.touched && control.hasError('required')) {
    return 'Debe seleccionar un estatus';
  }

  return null;
}

get ubicacionError(): string | null {
  const control = this.formulario.get('ubicacion');

  if (control?.touched && control.hasError('required')) {
    return 'Debe seleccionar una ubicación';
  }

  return null;
}

private cargarEstatus(): void {
  this.apiService
    .getData<CatalogoReworkItem[]>('catalogo/getCat/3', true)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: HttpResponse<CatalogoReworkItem[]>) => {
        const estatus = response.body ?? [];
        this.catalogoEstatus = estatus;
        this.opcionesEstatus = estatus.map(
          (item): SelectOption => ({
            value: item.id_exp,
            label: item.descripcion
          })
        );

        if (!this.formulario.get('status')?.value) {
          this.formulario.patchValue(
            { status: this.obtenerStatusPorDefecto() },
            { emitEvent: false }
          );
        }

        this.calcularProgreso();
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar estatus:', error);
        this.catalogoEstatus = [];
        this.opcionesEstatus = [];
      }
    });
}

private obtenerStatusPorDefecto(): number | null {
  const pendiente = this.catalogoEstatus.find((item) => {
    const texto = item.descripcion.trim().toUpperCase();
    return texto === 'PENDIENTE' || texto === 'PEDIENTE';
  });

  return pendiente?.id_exp ?? this.catalogoEstatus[0]?.id_exp ?? null;
}

private cargarUbicacion(): void {
  this.apiService
    .getData<CatalogoReworkItem[]>('catalogo/getCat/6', true)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: HttpResponse<CatalogoReworkItem[]>) => {
        const ubicaciones = response.body ?? [];

        this.opcionesUbicacion = ubicaciones.map(
          (item): SelectOption => ({
            value: item.id_exp,
            label: item.descripcion
          })
        );

        if (!this.formulario.get('ubicacion')?.value) {
          this.formulario.patchValue(
            { ubicacion: this.obtenerUbicacionPorDefecto() },
            { emitEvent: false }
          );
        }

        this.calcularProgreso();
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar ubicación:', error);
        this.opcionesUbicacion = [
          { value: 1, label: 'Carpeta general' },
          { value: 2, label: 'Individual' }
        ];
        this.formulario.patchValue({ ubicacion: 1 }, { emitEvent: false });
      }
    });
}

private obtenerUbicacionPorDefecto(): number | null {
  const general = this.opcionesUbicacion.find((item) =>
    String(item.label).toLowerCase().includes('general')
  );

  return (general?.value as number) ?? (this.opcionesUbicacion[0]?.value as number) ?? null;
}

  reiniciarFormulario(): void {
    this.logger.debug('Reiniciando formulario del paso 2 completamente');

    this.formulario.reset({
      responsable: null,
      sistema_aplicativo: '',
      status: this.obtenerStatusPorDefecto(),
      observaciones_estatus: '',
      ubicacion: this.obtenerUbicacionPorDefecto()
    });

    this.calcularProgreso();

    this.logger.debug('Formulario paso 2 reiniciado completamente');
  }


precargarDatos(
  datos: Partial<{
    responsable: string;
    sistema_aplicativo: string;
    status: number;
    status_descripcion: string;
    observaciones_estatus: string;
    ubicacion: number;
  }>
): void {
  this.formulario.patchValue(
    {
      responsable: datos.responsable ?? '',
      sistema_aplicativo: datos.sistema_aplicativo ?? '',
      status: datos.status ?? this.obtenerStatusPorDefecto(),
      observaciones_estatus: datos.observaciones_estatus ?? '',
      ubicacion: datos.ubicacion ?? this.obtenerUbicacionPorDefecto()
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

  private cargarAplicativos(): void {
    this.apiService
      .getData<Aplicativo[]>('catalogo/aplicativos', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<Aplicativo[]>) => {
          const aplicativos = response.body ?? [];

          this.opcionesAplicativos = aplicativos.map(
            (aplicativo): SelectOption => ({
              value: aplicativo.nombre,
              label: aplicativo.nombre
            })
          );
        },
        error: (error: unknown) => {
          this.logger.error('Error al cargar aplicativos:', error);
          this.opcionesAplicativos = [];
        }
      });
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
