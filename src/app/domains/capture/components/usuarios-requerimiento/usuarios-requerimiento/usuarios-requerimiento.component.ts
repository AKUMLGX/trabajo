import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TipoUsuarioRequerimiento, UsuarioRequerimiento } from '../../../../interfaces/usuarios-expediente.interface';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SelectOption, CustomSelectComponent } from '../../stepper-base/custom-select/custom-select.component';
import { Subject, takeUntil } from 'rxjs';
import { CustomFormFieldComponent } from "../../stepper-base/custom-form-field/custom-form-field.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios-requerimiento',
  standalone: true,
  imports: [CustomFormFieldComponent, CustomSelectComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './usuarios-requerimiento.component.html',
})
export class UsuariosRequerimientoComponent implements OnInit, OnChanges, OnDestroy {

  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  @Input() usuarios: UsuarioRequerimiento[] = [];
  @Input() deshabilitado = false;

  @Output() usuariosChange =
    new EventEmitter<UsuarioRequerimiento[]>();

  indiceUsuarioEditando: number | null = null;

  readonly opcionesTipoUsuario: SelectOption[] = [
    {
      value: 'SERVIDOR_PUBLICO',
      label: 'Servidor público'
    },
    {
      value: 'EMPRESA',
      label: 'Empresa'
    },
    {
      value: 'NA',
      label: 'N/A'
    }
  ];

  readonly formularioUsuario = this.fb.group({
    tipo_usuario:
      new FormControl<TipoUsuarioRequerimiento>(
        'SERVIDOR_PUBLICO',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      ),

    nombre:
      new FormControl<string>(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.maxLength(200)
          ]
        }
      ),

    rfc:
      new FormControl<string>(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.maxLength(13)
          ]
        }
      )
  });

  readonly usuariosFormArray:
    FormArray<FormGroup> =
      this.fb.array<FormGroup>([]);

  ngOnInit(): void {
    this.cargarUsuariosRecibidos();

    this.formularioUsuario.controls
      .tipo_usuario.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(tipoUsuario => {
        this.actualizarFormularioPorTipoUsuario(
          tipoUsuario
        );
      });

    this.actualizarEstadoDeshabilitado();
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (
      changes['usuarios'] &&
      !changes['usuarios'].firstChange
    ) {
      this.cargarUsuariosRecibidos();
    }

    if (
      changes['deshabilitado'] &&
      !changes['deshabilitado'].firstChange
    ) {
      this.actualizarEstadoDeshabilitado();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get usuariosRegistrados():
    UsuarioRequerimiento[] {
    return this.usuariosFormArray
      .getRawValue() as UsuarioRequerimiento[];
  }

  get totalUsuarios(): number {
    return this.usuariosRegistrados.filter(
      usuario =>
        usuario.tipo_usuario !== 'NA'
    ).length;
  }

  get hayUsuarios(): boolean {
    return this.usuariosFormArray.length > 0;
  }

  get estaEditando(): boolean {
    return this.indiceUsuarioEditando !== null;
  }

  get tipoUsuarioSeleccionado():
    TipoUsuarioRequerimiento {
    return this.formularioUsuario.controls
      .tipo_usuario.value;
  }

  agregarUsuario(): void {
    if (this.deshabilitado) {
      return;
    }

    if (this.indiceUsuarioEditando !== null) {
      this.actualizarUsuario();
      return;
    }

    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    const datos =
      this.formularioUsuario.getRawValue();

    if (datos.tipo_usuario === 'NA') {
      this.usuariosFormArray.clear({
        emitEvent: false
      });

      this.usuariosFormArray.push(
        this.crearUsuarioFormGroup({
          id_temporal:
            this.generarIdTemporal(),

          tipo_usuario: 'NA',
          nombre: 'N/A',
          rfc: ''
        }),
        {
          emitEvent: false
        }
      );

      this.reiniciarFormularioUsuario();
      this.notificarCambio();
      return;
    }

    const nombre =
      datos.nombre.trim();

    const rfc =
      datos.rfc.trim().toUpperCase();

    if (
      this.existeUsuarioDuplicado(
        nombre,
        rfc
      )
    ) {
      return;
    }

    const existeNA =
      this.usuariosRegistrados.some(
        usuario =>
          usuario.tipo_usuario === 'NA'
      );

    if (existeNA) {
      this.usuariosFormArray.clear({
        emitEvent: false
      });
    }

    this.usuariosFormArray.push(
      this.crearUsuarioFormGroup({
        id_temporal:
          this.generarIdTemporal(),

        tipo_usuario:
          datos.tipo_usuario,

        nombre,
        rfc
      }),
      {
        emitEvent: false
      }
    );

    this.reiniciarFormularioUsuario();
    this.notificarCambio();
  }

  editarUsuario(
    indice: number
  ): void {
    if (
      this.deshabilitado ||
      indice < 0 ||
      indice >= this.usuariosFormArray.length
    ) {
      return;
    }

    const usuario = (
      this.usuariosFormArray
        .at(indice)
        .getRawValue()
    ) as UsuarioRequerimiento;

    this.indiceUsuarioEditando = indice;

    this.formularioUsuario.patchValue(
      {
        tipo_usuario:
          usuario.tipo_usuario,

        nombre:
          usuario.nombre,

        rfc:
          usuario.rfc
      },
      {
        emitEvent: true
      }
    );
  }

  cancelarEdicionUsuario(): void {
    this.indiceUsuarioEditando = null;
    this.reiniciarFormularioUsuario();
  }

  eliminarUsuario(
    indice: number
  ): void {
    if (
      this.deshabilitado ||
      indice < 0 ||
      indice >= this.usuariosFormArray.length
    ) {
      return;
    }

    this.usuariosFormArray.removeAt(
      indice,
      {
        emitEvent: false
      }
    );

    if (
      this.indiceUsuarioEditando === indice
    ) {
      this.cancelarEdicionUsuario();
    }

    if (
      this.indiceUsuarioEditando !== null &&
      this.indiceUsuarioEditando > indice
    ) {
      this.indiceUsuarioEditando--;
    }

    this.notificarCambio();
  }

  private actualizarUsuario(): void {
    if (
      this.indiceUsuarioEditando === null
    ) {
      return;
    }

    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    const indice =
      this.indiceUsuarioEditando;

    const datos =
      this.formularioUsuario.getRawValue();

    const usuarioAnterior = (
      this.usuariosFormArray
        .at(indice)
        .getRawValue()
    ) as UsuarioRequerimiento;

    const usuarioActualizado:
      UsuarioRequerimiento = {
      id_temporal:
        usuarioAnterior.id_temporal,

      tipo_usuario:
        datos.tipo_usuario,

      nombre:
        datos.tipo_usuario === 'NA'
          ? 'N/A'
          : datos.nombre.trim(),

      rfc:
        datos.tipo_usuario === 'NA'
          ? ''
          : datos.rfc
              .trim()
              .toUpperCase()
    };

    if (
      usuarioActualizado.tipo_usuario !==
      'NA' &&
      this.existeUsuarioDuplicado(
        usuarioActualizado.nombre,
        usuarioActualizado.rfc,
        indice
      )
    ) {
      return;
    }

    if (
      usuarioActualizado.tipo_usuario ===
      'NA'
    ) {
      this.usuariosFormArray.clear({
        emitEvent: false
      });

      this.usuariosFormArray.push(
        this.crearUsuarioFormGroup(
          usuarioActualizado
        ),
        {
          emitEvent: false
        }
      );
    } else {
      this.usuariosFormArray.setControl(
        indice,
        this.crearUsuarioFormGroup(
          usuarioActualizado
        ),
        {
          emitEvent: false
        }
      );
    }

    this.indiceUsuarioEditando = null;
    this.reiniciarFormularioUsuario();
    this.notificarCambio();
  }

  private existeUsuarioDuplicado(
    nombre: string,
    rfc: string,
    indiceIgnorado: number | null = null
  ): boolean {
    return this.usuariosRegistrados.some(
      (usuario, indice) => {
        if (indice === indiceIgnorado) {
          return false;
        }

        if (
          rfc &&
          usuario.rfc &&
          usuario.rfc.toUpperCase() ===
            rfc.toUpperCase()
        ) {
          return true;
        }

        return (
          usuario.nombre
            .trim()
            .toLowerCase() ===
          nombre
            .trim()
            .toLowerCase()
        );
      }
    );
  }

  private actualizarFormularioPorTipoUsuario(
    tipoUsuario:
      TipoUsuarioRequerimiento
  ): void {
    const nombreControl =
      this.formularioUsuario.controls.nombre;

    const rfcControl =
      this.formularioUsuario.controls.rfc;

    if (tipoUsuario === 'NA') {
      nombreControl.setValue(
        'N/A',
        {
          emitEvent: false
        }
      );

      rfcControl.setValue(
        '',
        {
          emitEvent: false
        }
      );

      nombreControl.clearValidators();
      rfcControl.clearValidators();

      nombreControl.disable({
        emitEvent: false
      });

      rfcControl.disable({
        emitEvent: false
      });
    } else {
      nombreControl.enable({
        emitEvent: false
      });

      rfcControl.enable({
        emitEvent: false
      });

      nombreControl.setValidators([
        Validators.required,
        Validators.maxLength(200)
      ]);

      rfcControl.setValidators([
        Validators.maxLength(13)
      ]);

      if (
        nombreControl.value === 'N/A'
      ) {
        nombreControl.setValue(
          '',
          {
            emitEvent: false
          }
        );
      }
    }

    nombreControl.updateValueAndValidity({
      emitEvent: false
    });

    rfcControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  private crearUsuarioFormGroup(
    usuario: UsuarioRequerimiento
  ): FormGroup {
    return this.fb.group({
      id_temporal: [
        usuario.id_temporal,
        Validators.required
      ],

      tipo_usuario: [
        usuario.tipo_usuario,
        Validators.required
      ],

      nombre: [
        usuario.nombre,
        Validators.required
      ],

      rfc: [
        usuario.rfc
      ]
    });
  }

  private cargarUsuariosRecibidos(): void {
    this.usuariosFormArray.clear({
      emitEvent: false
    });

    const usuariosRecibidos =
      Array.isArray(this.usuarios)
        ? this.usuarios
        : [];

    usuariosRecibidos.forEach(
      usuario => {
        this.usuariosFormArray.push(
          this.crearUsuarioFormGroup({
            id_temporal:
              usuario.id_temporal ||
              this.generarIdTemporal(),

            tipo_usuario:
              usuario.tipo_usuario,

            nombre:
              usuario.nombre,

            rfc:
              usuario.rfc || ''
          }),
          {
            emitEvent: false
          }
        );
      }
    );
  }

  private reiniciarFormularioUsuario():
    void {
    this.formularioUsuario.reset(
      {
        tipo_usuario:
          'SERVIDOR_PUBLICO',

        nombre: '',
        rfc: ''
      },
      {
        emitEvent: true
      }
    );
  }

  private actualizarEstadoDeshabilitado():
    void {
    if (this.deshabilitado) {
      this.formularioUsuario.disable({
        emitEvent: false
      });

      this.usuariosFormArray.disable({
        emitEvent: false
      });

      return;
    }

    this.formularioUsuario.enable({
      emitEvent: false
    });

    this.usuariosFormArray.enable({
      emitEvent: false
    });

    this.actualizarFormularioPorTipoUsuario(
      this.tipoUsuarioSeleccionado
    );
  }

  private generarIdTemporal(): string {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private notificarCambio(): void {
    const usuarios =
      this.usuariosRegistrados.map(
        usuario => ({
          ...usuario
        })
      );

    this.usuariosChange.emit(usuarios);
  }

}
