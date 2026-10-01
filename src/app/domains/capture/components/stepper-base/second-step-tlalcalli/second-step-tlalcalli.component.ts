import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { SistemaAplicativoAutocompleteComponent } from '../sistema-aplicativo-autocomplete/sistema-aplicativo-autocomplete.component';
import { LoggerService } from '../../../services/logger.service';
import { FormHelperService } from '../../../services/form-helper.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { TemporalExpedienteService } from '../../../services/temporal-expediente.service';
import { HttpResponse } from '@angular/common/http';
import { CatalogoResponsableResponse, CrearResponsableRequest, ActualizarResponsableRequest, MensajeResponsableResponse } from '../../../../interfaces/catalogos.interface';
import { CatalogoReworkItem } from '../../../interfaces/expediente-rework.interface';
import { CustomModalComponent2 } from "../../../../responsables/components/atencion-modal/custom-modal/custom-modal/custom-modal.component";
import { ResponsablesMultiSelectComponent } from '../responsables-multi-select/responsables-multi-select.component';
import { UsuariosRequerimientoComponent } from '../../usuarios-requerimiento/usuarios-requerimiento/usuarios-requerimiento.component';
import { UsuarioRequerimiento } from '../../../../interfaces/usuarios-expediente.interface';
import { unirListaTexto } from '../../../utils/lista-texto.utils';
@Component({
    selector: 'app-second-step-tlalcalli',
    imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
    CustomTextareaComponent,
    CustomModalComponent2,
    SistemaAplicativoAutocompleteComponent,
    ResponsablesMultiSelectComponent,
    UsuariosRequerimientoComponent,
],
    templateUrl: './second-step-tlalcalli.component.html',
    styleUrl: './second-step-tlalcalli.component.css'
})
export class SecondStepTlalcalliComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly temporalService = inject(TemporalExpedienteService);
  private guardandoBorradorTemporal = false;
  private restableciendoFormulario = false;
  private skipAutoSaveUntil = 0;


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
  opcionesEstatus: SelectOption[] = [];
  catalogoEstatus: CatalogoReworkItem[] = [];

  modalResponsableVisible = false;
  responsableCatalogoId: number | string | null = null;

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
  pdfArrastrando = false;
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
      usuarios: this.fb.control<UsuarioRequerimiento[]>([], {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(1)],
      }),
      sistema_aplicativo: ['', Validators.required],
      responsable: ['', Validators.required],
      status: [null, Validators.required],
      observaciones_estatus: [''],
      ubicacion: [null, Validators.required]
    });
  }


  ngOnInit() {
    this.skipAutoSaveUntil = Date.now() + 2000;
    this.cargarResponsables();
    this.cargarEstatus();
    this.cargarUbicacion();
    this.calcularProgreso();
    this.formulario.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.calcularProgreso();
        this.guardarBorrador();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calcularProgreso(): void {
    const obligatorios = ['usuarios', 'sistema_aplicativo', 'responsable', 'status', 'ubicacion'];
    const completados = obligatorios.filter((key) => {
      const value = this.formulario.get(key)?.value;
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && String(value).trim() !== '';
    }).length;

    this.camposTotales = obligatorios.length;
    this.camposCompletados = completados;
    this.progresoFormulario = Math.round((completados / this.camposTotales) * 100);
  }

  private guardarBorrador(): void {
    if (
      this.restableciendoFormulario ||
      Date.now() < this.skipAutoSaveUntil ||
      !this.temporalService.isAutoGuardadoPermitido()
    ) {
      return;
    }

    if (!this.datosPaso1?.expediente || !this.datosPaso1?.oficio || this.guardandoBorradorTemporal) {
      return;
    }

    const paso2 = this.obtenerValoresNormalizados();

    this.guardandoBorradorTemporal = true;

    this.temporalService.autoGuardarBorrador(this.datosPaso1, paso2).subscribe({
      next: (uuid) => {
        this.guardandoBorradorTemporal = false;
        if (uuid) {
          this.logger.debug('Borrador temporal paso 2 auto-guardado', uuid);
        }
      },
      error: (error) => {
        this.guardandoBorradorTemporal = false;
        this.logger.debug('Auto-guardado temporal paso 2 falló', error);
      },
    });
  }


  onSubmit() {
    this.logger.debug('Validando Paso 2 - Formulario válido:', this.formulario.valid);

    if (this.formulario.invalid) {
      this.logger.warn('Paso 2 inválido - Campos con errores');
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
      return;
    }

    this.logger.debug('Paso 2 válido - Continuando');

    this.formularioCompletado.emit({
      ...this.obtenerValoresNormalizados(),
      documento_pdf: this.pdfSeleccionado,
      documento_pdf_nombre: this.pdfNombreMostrado || undefined,
      campos_pospuestos: this.camposDocumentosPendientes
    });
  }

  /** Valores listos para stepper/temporal: listas unidas con `; ` y usuarios sin id temporal. */
  obtenerValoresNormalizados(): Record<string, unknown> {
    const valores = this.formulario.getRawValue();
    const statusSeleccionado = this.catalogoEstatus.find(
      (item) => item.id_exp === Number(valores.status)
    );
    const usuarios = (valores.usuarios ?? []).map((usuario: UsuarioRequerimiento) => ({
      tipo_usuario: usuario.tipo_usuario,
      nombre: usuario.nombre,
      rfc: usuario.rfc,
    }));

    return {
      ...valores,
      usuarios,
      sistema_aplicativo: unirListaTexto(valores.sistema_aplicativo),
      responsable: unirListaTexto(valores.responsable),
      status_descripcion: statusSeleccionado?.descripcion ?? '',
    };
  }

  actualizarUsuarios(usuarios: UsuarioRequerimiento[]): void {
    const control = this.formulario.get('usuarios');
    control?.setValue(usuarios, { emitEvent: true });
    control?.markAsTouched();
    control?.markAsDirty();
    this.calcularProgreso();
    this.validezCambiada.emit(this.formulario.valid);
  }

  get usuariosError(): string | null {
    const control = this.formulario.get('usuarios');
    if (control?.touched && control.invalid) {
      return 'Debe agregar al menos un usuario o seleccionar N/A.';
    }
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.asignarArchivoPdf(file);
    input.value = '';
  }

  onPdfDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.pdfArrastrando = true;
  }

  onPdfDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.pdfArrastrando = false;
  }

  onPdfDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.pdfArrastrando = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.asignarArchivoPdf(file);
  }

  private asignarArchivoPdf(file: File | null): void {
    if (!file) {
      return;
    }

    const esPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
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
    this.pdfArrastrando = false;
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
    return 'Debe asignar al menos un responsable';
  }

  return null;
}

get sistemaAplicativoError(): string | null {
  const control = this.formulario.get('sistema_aplicativo');

  if (control?.touched && control.hasError('required')) {
    return 'Debe seleccionar al menos un aplicativo o sistema';
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

  resetearFormulario(): void {
    this.restableciendoFormulario = true;
    this.skipAutoSaveUntil = Date.now() + 2000;
    this.guardandoBorradorTemporal = false;
    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = '';
    this.pdfError = null;
    this.limpiarArchivo();

    this.responsableCatalogoId = null;
    this.formulario.reset({
      usuarios: [],
      responsable: '',
      sistema_aplicativo: '',
      status: this.obtenerStatusPorDefecto(),
      observaciones_estatus: '',
      ubicacion: this.obtenerUbicacionPorDefecto(),
    }, { emitEvent: false });

    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.calcularProgreso();
    this.validezCambiada.emit(this.formulario.valid);
    this.restableciendoFormulario = false;
  }

  reiniciarFormulario(): void {
    this.resetearFormulario();
  }


precargarDatos(
  datos: Partial<{
    usuarios: Array<Partial<UsuarioRequerimiento>>;
    responsable: string;
    sistema_aplicativo: string;
    status: number;
    status_descripcion: string;
    observaciones_estatus: string;
    ubicacion: number;
  }>
): void {
  const responsable = String(datos?.responsable ?? '').trim();
  const aplicativo = String(datos?.sistema_aplicativo ?? '').trim();
  const observaciones = String(datos?.observaciones_estatus ?? '').trim();
  const usuarios: UsuarioRequerimiento[] = Array.isArray(datos?.usuarios)
    ? datos.usuarios.map((usuario) => ({
        id_temporal:
          usuario.id_temporal ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        tipo_usuario: usuario.tipo_usuario ?? 'SERVIDOR_PUBLICO',
        nombre: usuario.nombre ?? '',
        rfc: usuario.rfc ?? '',
      }))
    : [];
  if (
    !responsable &&
    !aplicativo &&
    !observaciones &&
    usuarios.length === 0 &&
    datos?.status == null &&
    datos?.ubicacion == null
  ) {
    return;
  }

  this.restableciendoFormulario = true;
  this.skipAutoSaveUntil = Date.now() + 2000;

  this.formulario.patchValue(
    {
      usuarios,
      responsable: unirListaTexto(responsable),
      sistema_aplicativo: unirListaTexto(aplicativo),
      status: datos.status ?? this.obtenerStatusPorDefecto(),
      observaciones_estatus: datos.observaciones_estatus ?? '',
      ubicacion: datos.ubicacion ?? this.obtenerUbicacionPorDefecto()
    },
    {
      emitEvent: false
    }
  );
  this.restableciendoFormulario = false;

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

        const nombreAnterior = this.responsablesData.find(
          (item) => item.id_aplicativo === idAplicativo
        )?.nombre;
        this.reemplazarResponsableAsignado(nombreAnterior, nombreLimpio);

        this.cerrarModalResponsable();
        this.cargarResponsables();
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

        this.responsableCatalogoId = null;

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
  const idSeleccionado = this.responsableCatalogoId;

  if (idSeleccionado === null || idSeleccionado === '') {
    return null;
  }

  return this.responsablesData.find(
    (responsable) =>
      responsable.id_aplicativo ===
      Number(idSeleccionado)
  ) ?? null;
  }

  private reemplazarResponsableAsignado(anterior: string | undefined, nuevo: string): void {
    if (!anterior) {
      return;
    }
    const control = this.formulario.get('responsable');
    const actualizados = String(control?.value ?? '')
      .split(';')
      .map((nombre) => (nombre.trim() === anterior ? nuevo : nombre));
    control?.setValue(unirListaTexto(actualizados));
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
