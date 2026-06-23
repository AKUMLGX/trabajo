import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import {
  AtencionService,
  CatalogosAtencion,
  CrearAtencionDTO,
  TipoAccion,
  Prioridad,
  MAX_ESPECIALISTAS
} from '../../services/atencion.service';

import { AtencionEspecialistasComponent } from './atencion-especialistas/atencion-especialistas.component';
import { AtencionFlujosComponent } from './atencion-flujos/atencion-flujos.component';
import { ApiService } from '../../../capture/services/api.service';
import { Aplicativo, CrearAplicativoDTO,ActualizarAplicativoDTO,MensajeResponse } from '../../../capture/interfaces/aplicativo.interface';
import { CustomModalComponent } from './custom-modal/custom-modal/custom-modal.component';
export interface FormularioAtencion {
  tipoAccion: TipoAccion | '';
  tipoInsumo: string;
  tiposResultado: string[];
  especialistasSeleccionados: string[];
  flujoAsignadoSeleccionado: TipoAccion | '';
  opcionesSeleccionadas: string[];
  fechaEntrega: string;
  prioridad: Prioridad | '';
  sistema_aplicativo: string;
  notas: string;
}

@Component({
  selector: 'app-atencion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    AtencionEspecialistasComponent,
    AtencionFlujosComponent,
    CustomModalComponent
  ],
  templateUrl: './atencion-modal.component.html',
})
export class AtencionModalComponent implements OnInit {
  expediente: ExpedienteTlalcalli;
  cargandoCatalogos = true;
  guardando = false;

  
  modalEliminarVisible = false;
  modalEditarVisible = false;
  aplicativoSeleccionado: Aplicativo | null = null;

  catalogos: CatalogosAtencion = {
    especialistas: [
      { id_especialista: 1, codigo: 'EX_ERIKA', nombre_completo: 'Erika', tipo: 'EXTERNO', activo: true },
      { id_especialista: 2, codigo: 'EX_JULIAN', nombre_completo: 'Julian', tipo: 'EXTERNO', activo: true },
      { id_especialista: 3, codigo: 'EX_GIBRAN', nombre_completo: 'Gibran', tipo: 'EXTERNO', activo: true },
      { id_especialista: 4, codigo: 'EX_DILAN', nombre_completo: 'Dilan', tipo: 'EXTERNO', activo: true },
      { id_especialista: 5, codigo: 'EX_ABRAHAM', nombre_completo: 'Abraham', tipo: 'EXTERNO', activo: true },
      { id_especialista: 6, codigo: 'EX_LINO', nombre_completo: 'Lino', tipo: 'EXTERNO', activo: true },
      { id_especialista: 7, codigo: 'IN_IRMA', nombre_completo: 'Irma', tipo: 'INTERNO', activo: true },
      { id_especialista: 8, codigo: 'IN_KAREN', nombre_completo: 'Karen', tipo: 'INTERNO', activo: true },
      { id_especialista: 9, codigo: 'IN_HECTOR', nombre_completo: 'Hector', tipo: 'INTERNO', activo: true }
    ],
    tipos_insumo: [
      { id_insumo: 1, codigo: 'EQUIPO_FISICO', descripcion: 'Equipo(s) Físico(s)', activo: true },
      { id_insumo: 2, codigo: 'EQUIPO_VIRTUAL', descripcion: 'Equipo(s) Virtual(es)', activo: true },
      { id_insumo: 3, codigo: 'EQUIPO_MOVIL', descripcion: 'Equipo(s) Móvil(es)', activo: true },
      { id_insumo: 4, codigo: 'EQUIPO_REMOTO', descripcion: 'Equipo(s) Remoto(s)', activo: true },
      { id_insumo: 5, codigo: 'IMAGEN_CIFRADA', descripcion: 'Imagen(es) Cifrada(s)', activo: true },
      { id_insumo: 6, codigo: 'PERSONALIZADA', descripcion: 'Personalizada(s)', activo: true },
      { id_insumo: 7, codigo: 'OTROS', descripcion: 'Otros', activo: true }
    ],
    tipos_resultado: [
      { id_resultado: 1, codigo: 'ACTA_HECHOS', descripcion: 'Acta de Hechos', activo: true },
      { id_resultado: 2, codigo: 'CADENA_CUSTODIA', descripcion: 'Cadena de Custodia', activo: true },
      { id_resultado: 3, codigo: 'MEMORIA_TECNICA', descripcion: 'Memoria Técnica', activo: true },
      { id_resultado: 4, codigo: 'NO_APLICA', descripcion: 'No Aplica', activo: true }
    ]
  };

  formulario: FormularioAtencion = {
    tipoAccion: '',
    tipoInsumo: '',
    tiposResultado: [],
    especialistasSeleccionados: [],
    flujoAsignadoSeleccionado: '',
    opcionesSeleccionadas: [],
    fechaEntrega: '',
    prioridad: '',
    sistema_aplicativo: '',
    notas: ''
  };

  opcionesTipoAccion = [
    {
      value: 'RECHAZADO' as TipoAccion,
      label: 'Rechazado',
      icon: 'cancel',
      description: 'Rechazar el expediente y asignar especialistas',
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      value: 'PENDIENTE_INFO' as TipoAccion,
      label: 'Pendiente por Falta de Información',
      icon: 'more_horiz',
      description: 'Solicitar información adicional y asignar especialistas',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      value: 'ASIGNADO' as TipoAccion,
      label: 'Asignado',
      icon: 'assignment',
      description: 'Asignar a un flujo de trabajo especializado',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    }
  ];

  aplicativos: Aplicativo[] = [];
  aplicativosFiltrados: Aplicativo[] = [];

  sistemasAplicativos: string[] = [];
  sistemasFiltrados: string[] = [];

  sistemaDropdownAbierto = false;
  sistemaBusqueda = '';

  constructor(
    public dialogRef: MatDialogRef<AtencionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlalcalli },
    private atencionService: AtencionService,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
  ) {
    this.expediente = data.expediente;
    console.log('EXPEDIENTE RECIBIDO EN MODAL:', this.expediente);
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarAplicativos();
  }


cargarAplicativos(): void {

  this.apiService.getData<Aplicativo[]>('catalogo/aplicativos').subscribe({
    next: (response) => {
      const data = response.body ?? [];

      this.aplicativos = data.map(app => ({
      ...app,
      es_usuario: false
      }));

      this.aplicativosFiltrados = [...this.aplicativos];

      this.sistemasAplicativos = this.aplicativos.map(app => app.nombre);
      this.sistemasFiltrados = [...this.sistemasAplicativos];
    },
    error: (error) => {
      console.error('ERROR APLICATIVOS:', error);

      this.snackBar.open('Error al cargar aplicativos.', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    }
  });
}


existeAplicativo(nombre: string): boolean {
  return this.aplicativos.some(
    app => app.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
  );
}

crearAplicativoDesdeBusqueda(): void {
  const nombre = this.sistemaBusqueda.trim();

  if (!nombre) return;
  if (this.existeAplicativo(nombre)) return;

  this.crearAplicativo(nombre);
}



private crearAplicativo(nombre: string): void {
  const body: CrearAplicativoDTO = { nombre };

  this.apiService.postData<Aplicativo>('catalogo/aplicativos', body).subscribe({
    next: (response) => {
      if (response.body) {
        const nuevoAplicativo: Aplicativo = {
        ...response.body,
        es_usuario: true
      };

        this.aplicativos = [...this.aplicativos, nuevoAplicativo];        
        this.sistemasAplicativos = this.aplicativos.map(app => app.nombre);
        this.sistemasFiltrados = [...this.sistemasAplicativos];

        this.seleccionarSistema(response.body.nombre);

        this.snackBar.open('Aplicativo creado correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    }
  });
}



  cargarCatalogos(): void {
    this.cargandoCatalogos = true;

    this.atencionService.obtenerCatalogos().subscribe({
      next: (catalogos) => {
        if (catalogos.especialistas?.length) this.catalogos.especialistas = catalogos.especialistas;
        if (catalogos.tipos_insumo?.length) this.catalogos.tipos_insumo = catalogos.tipos_insumo;
        if (catalogos.tipos_resultado?.length) this.catalogos.tipos_resultado = catalogos.tipos_resultado;

        this.cargandoCatalogos = false;
      },
      error: () => {
        this.cargandoCatalogos = false;
      }
    });
  }

  esEditable(app: Aplicativo): boolean {
  return app.id_aplicativo > 40;
  }


editarAplicativo(app: Aplicativo): void {
  if (app.es_sistema) {
    this.snackBar.open('No se pueden modificar aplicativos predefinidos.', 'Cerrar', {
      duration: 4000
    });
    return;
  }

  this.aplicativoSeleccionado = app;
  this.modalEditarVisible = true;
}


eliminarAplicativo(app: Aplicativo): void {
  if (app.es_sistema) {
    this.snackBar.open('No se pueden eliminar aplicativos predefinidos.', 'Cerrar', {
      duration: 4000
    });
    return;
  }

  this.aplicativoSeleccionado = app;
  this.modalEliminarVisible = true;
}

cerrarModalAplicativo(): void {
  this.modalEliminarVisible = false;
  this.modalEditarVisible = false;
  this.aplicativoSeleccionado = null;
}

confirmarEdicionAplicativo(nombre: string | void): void {
  if (!this.aplicativoSeleccionado) return;

  const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

  if (!nombreLimpio) return;

  const body: ActualizarAplicativoDTO = {
    id_aplicativo: this.aplicativoSeleccionado.id_aplicativo,
    nombre: nombreLimpio
  };

  this.apiService.updateAplicativo<MensajeResponse>(body).subscribe({
    next: () => {
      this.snackBar.open('Aplicativo actualizado correctamente.', 'Cerrar', {
        duration: 3000
      });

      this.cerrarModalAplicativo();
      this.cargarAplicativos();
    },
    error: (error) => {
      console.error('ERROR UPDATE APLICATIVO:', error);

      this.snackBar.open('Error al actualizar aplicativo.', 'Cerrar', {
        duration: 4000
      });
    }
  });
}

confirmarEliminacionAplicativo(): void {
  if (!this.aplicativoSeleccionado) return;

  this.apiService.deleteAplicativo<MensajeResponse>(
    this.aplicativoSeleccionado.id_aplicativo
  ).subscribe({
    next: () => {
      this.snackBar.open('Aplicativo eliminado correctamente.', 'Cerrar', {
        duration: 3000
      });

      this.cerrarModalAplicativo();
      this.cargarAplicativos();
    },
    error: (error) => {
      console.error('ERROR DELETE APLICATIVO:', error);

      this.snackBar.open('Error al eliminar aplicativo.', 'Cerrar', {
        duration: 4000
      });
    }
  });
}




  cerrar(): void {
    if (!this.guardando) {
      this.dialogRef.close();
    }
  }

  seleccionarTipoAccion(tipo: TipoAccion): void {
    this.formulario.tipoAccion = tipo;
    this.formulario.tipoInsumo = '';
    this.formulario.tiposResultado = [];
    this.formulario.flujoAsignadoSeleccionado = '';
    this.formulario.opcionesSeleccionadas = [];
    this.formulario.especialistasSeleccionados = [];
    this.formulario.fechaEntrega = '';
    this.formulario.prioridad = '';
  }

filtrarSistemas(): void {
  const busqueda = this.sistemaBusqueda.trim().toLowerCase();

  this.aplicativosFiltrados = busqueda
    ? this.aplicativos.filter(app =>
        app.nombre.toLowerCase().includes(busqueda)
      )
    : [...this.aplicativos];

  this.sistemasFiltrados = this.aplicativosFiltrados.map(app => app.nombre);
}

  onSistemaInputChange(): void {
    this.formulario.sistema_aplicativo = this.sistemaBusqueda;
    this.sistemaDropdownAbierto = true;
    this.filtrarSistemas();
  }

  seleccionarSistema(sistema: string): void {
    this.formulario.sistema_aplicativo = sistema;
    this.sistemaBusqueda = sistema;
    this.sistemaDropdownAbierto = false;
  }

  cerrarSistemaDropdown(): void {
    setTimeout(() => {
      this.sistemaDropdownAbierto = false;
    }, 150);
  }

  get especialistasExternos() {
    return this.catalogos.especialistas.filter(e => e.tipo === 'EXTERNO' && e.activo);
  }

  get especialistasInternos() {
    return this.catalogos.especialistas.filter(e => e.tipo === 'INTERNO' && e.activo);
  }

  get mostrarEspecialistasDirecto(): boolean {
    return this.formulario.tipoAccion === 'RECHAZADO' || this.formulario.tipoAccion === 'PENDIENTE_INFO';
  }

  get seleccionDirectaCompleta(): boolean {
    return this.mostrarEspecialistasDirecto && this.formulario.especialistasSeleccionados.length > 0;
  }

  formularioValido(): boolean {
    if (!this.formulario.tipoAccion) return false;

    if (this.formulario.tipoAccion === 'RECHAZADO' || this.formulario.tipoAccion === 'PENDIENTE_INFO') {
      return this.formulario.especialistasSeleccionados.length > 0;
    }

    if (this.formulario.tipoAccion === 'ASIGNADO') {
      if (!this.formulario.sistema_aplicativo.trim()) return false;
      if (!this.formulario.flujoAsignadoSeleccionado) return false;
      if (!this.formulario.fechaEntrega) return false;
      if (this.formulario.especialistasSeleccionados.length === 0) return false;

      if (this.formulario.flujoAsignadoSeleccionado === 'ADQUISICION_INFO') {
        return !!this.formulario.tipoInsumo && this.formulario.tiposResultado.length > 0;
      }

      return this.formulario.opcionesSeleccionadas.length > 0;
    }

    return false;
  }

  private obtenerNombreEspecialista(codigo: string): string {
    return this.catalogos.especialistas.find(e => e.codigo === codigo)?.nombre_completo || codigo;
  }

private construirDTO(): any {
  const tipoAccion = this.formulario.tipoAccion === 'ASIGNADO'
    ? this.formulario.flujoAsignadoSeleccionado
    : this.formulario.tipoAccion;

const dto: any = {
  id_expediente: this.expediente.id_expediente!,
  tipo_accion: tipoAccion,
  prioridad: this.formulario.prioridad,
  fecha_entrega: this.formulario.fechaEntrega,
  tipos_insumo: [],
  especialistas: this.formulario.especialistasSeleccionados.map(codigo => ({
    codigo,
    nombre: this.obtenerNombreEspecialista(codigo)
  })),
  sistema_aplicativo: this.formulario.sistema_aplicativo,
  notas: this.formulario.notas
};

  if (tipoAccion === 'ADQUISICION_INFO') {
    dto.tipos_insumo = this.formulario.tipoInsumo
      ? [this.formulario.tipoInsumo]
      : [];

    dto.tipo_resultado = this.formulario.tiposResultado;  }

  if (
    tipoAccion === 'INVESTIGACION_FORENSE' ||
    tipoAccion === 'ELABORACION_DICTAMENES' ||
    tipoAccion === 'RECUPERACION_INFO' ||
    tipoAccion === 'DESTRUCCION_DISPOSITIVOS' ||
    tipoAccion === 'SOLICITUD_INFORMACION'
  ) {
    dto.opcion_seleccionada = this.formulario.opcionesSeleccionadas;
  }

  return dto;
}

guardar(): void {
  if (!this.formularioValido()) {
    this.snackBar.open('Completa los campos requeridos antes de guardar.', 'Cerrar', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
    return;
  }

  if (!this.expediente.id_expediente) {
    this.snackBar.open('El expediente no tiene ID válido.', 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  const body = this.construirDTO();

  console.log('BODY ATENCIÓN:', body);

  this.guardando = true;

  this.apiService.crearAtencion<any>(body).subscribe({
    next: (response) => {
      this.guardando = false;

      this.snackBar.open('Atención guardada correctamente.', 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });

      this.dialogRef.close(response.body);
    },
    error: (error) => {
      this.guardando = false;

      console.error('ERROR ATENCIÓN:', error);

      this.snackBar.open('Error al guardar la atención.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

  protected readonly MAX_ESPECIALISTAS = MAX_ESPECIALISTAS;
}