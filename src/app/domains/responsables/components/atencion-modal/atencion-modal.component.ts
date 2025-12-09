import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExpedienteTlapohualli } from '../../../capture/interfaces/expediente-tlapohualli.interface';
import { 
  AtencionService, 
  CatalogosAtencion, 
  CrearAtencionDTO, 
  TipoAccion,
  CatEspecialista,
  CatTipoInsumo,
  CatTipoResultado
} from '../../services/atencion.service';

/**
 * Interfaz para el estado del formulario
 */
interface FormularioAtencion {
  tipoAccion: TipoAccion | '';
  // Rechazado
  medioRechazo: 'OFICIO' | 'ATENTA_NOTA' | 'CORREO' | '';
  // Atención Inmediata
  abogadoAsignado: string;
  // Adquisición de Información
  tiposInsumo: string[];
  tipoResultado: string;
  especialistasSeleccionados: string[];
  // Común
  notas: string;
}

@Component({
  selector: 'app-atencion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './atencion-modal.component.html',
  styleUrl: './atencion-modal.component.css'
})
export class AtencionModalComponent implements OnInit {
  expediente: ExpedienteTlapohualli;
  catalogos: CatalogosAtencion = {
    especialistas: [],
    tipos_insumo: [],
    tipos_resultado: []
  };
  
  // Estado del formulario
  formulario: FormularioAtencion = {
    tipoAccion: '',
    medioRechazo: '',
    abogadoAsignado: '',
    tiposInsumo: [],
    tipoResultado: '',
    especialistasSeleccionados: [],
    notas: ''
  };
  
  // Estados de UI
  cargandoCatalogos = true;
  guardando = false;
  
  // Opciones de tipo de acción
  opcionesTipoAccion = [
    { 
      value: 'RECHAZADO' as TipoAccion, 
      label: 'Rechazado', 
      icon: 'cancel',
      description: 'Rechazar el expediente mediante oficio, atenta nota o correo',
      color: 'text-red-600'
    },
    { 
      value: 'PENDIENTE_INFO' as TipoAccion, 
      label: 'Pendiente por Información', 
      icon: 'pending',
      description: 'Solicitar información adicional antes de proceder',
      color: 'text-amber-600'
    },
    { 
      value: 'ATENCION_INMEDIATA' as TipoAccion, 
      label: 'Atención Inmediata', 
      icon: 'flash_on',
      description: 'Asignar a un abogado para atención prioritaria',
      color: 'text-blue-600'
    },
    { 
      value: 'ADQUISICION_INFO' as TipoAccion, 
      label: 'Adquisición de Información', 
      icon: 'folder_special',
      description: 'Proceso completo con insumos, resultado y especialistas',
      color: 'text-green-600'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<AtencionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlapohualli },
    private atencionService: AtencionService,
    private snackBar: MatSnackBar
  ) {
    this.expediente = data.expediente;
    console.log('📋 [AtencionModal] Expediente recibido:', this.expediente);
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  /**
   * Cargar catálogos desde el backend
   */
  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.atencionService.obtenerCatalogos().subscribe({
      next: (catalogos) => {
        this.catalogos = catalogos;
        this.cargandoCatalogos = false;
        console.log('✅ [AtencionModal] Catálogos cargados:', this.catalogos);
      },
      error: (error) => {
        console.error('❌ [AtencionModal] Error al cargar catálogos:', error);
        this.cargandoCatalogos = false;
        this.mostrarError('Error al cargar catálogos');
      }
    });
  }

  /**
   * Cerrar el modal
   */
  cerrar(): void {
    this.dialogRef.close();
  }

  /**
   * Verificar si el formulario es válido
   */
  formularioValido(): boolean {
    if (!this.formulario.tipoAccion) return false;
    
    switch (this.formulario.tipoAccion) {
      case 'RECHAZADO':
        return !!this.formulario.medioRechazo;
      case 'PENDIENTE_INFO':
        return true; // Solo notas (opcional)
      case 'ATENCION_INMEDIATA':
        return !!this.formulario.abogadoAsignado.trim();
      case 'ADQUISICION_INFO':
        return this.formulario.tiposInsumo.length > 0 && 
               !!this.formulario.tipoResultado &&
               this.formulario.especialistasSeleccionados.length > 0;
      default:
        return false;
    }
  }

  /**
   * Toggle de insumo seleccionado
   */
  toggleInsumo(codigo: string): void {
    const index = this.formulario.tiposInsumo.indexOf(codigo);
    if (index > -1) {
      this.formulario.tiposInsumo.splice(index, 1);
    } else {
      this.formulario.tiposInsumo.push(codigo);
    }
  }

  /**
   * Verificar si un insumo está seleccionado
   */
  insumoSeleccionado(codigo: string): boolean {
    return this.formulario.tiposInsumo.includes(codigo);
  }

  /**
   * Toggle de especialista seleccionado
   */
  toggleEspecialista(codigo: string): void {
    const index = this.formulario.especialistasSeleccionados.indexOf(codigo);
    if (index > -1) {
      this.formulario.especialistasSeleccionados.splice(index, 1);
    } else {
      this.formulario.especialistasSeleccionados.push(codigo);
    }
  }

  /**
   * Verificar si un especialista está seleccionado
   */
  especialistaSeleccionado(codigo: string): boolean {
    return this.formulario.especialistasSeleccionados.includes(codigo);
  }

  /**
   * Obtener especialistas externos
   */
  get especialistasExternos(): CatEspecialista[] {
    return this.catalogos.especialistas.filter(e => e.tipo === 'EXTERNO');
  }

  /**
   * Obtener especialistas internos
   */
  get especialistasInternos(): CatEspecialista[] {
    return this.catalogos.especialistas.filter(e => e.tipo === 'INTERNO');
  }

  /**
   * Guardar la atención
   */
  guardar(): void {
    if (!this.formularioValido()) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    this.guardando = true;

    // Verificar que tenemos id_expediente
    if (!this.expediente.id_expediente) {
      this.mostrarError('Error: El expediente no tiene ID válido');
      this.guardando = false;
      return;
    }

    // Construir el DTO
    const dto: CrearAtencionDTO = {
      id_expediente: this.expediente.id_expediente,
      tipo_accion: this.formulario.tipoAccion as TipoAccion,
      notas: this.formulario.notas || undefined
    };

    // Agregar campos según el tipo de acción
    switch (this.formulario.tipoAccion) {
      case 'RECHAZADO':
        dto.medio_rechazo = this.formulario.medioRechazo as any;
        break;
      case 'ATENCION_INMEDIATA':
        dto.abogado_asignado = this.formulario.abogadoAsignado;
        break;
      case 'ADQUISICION_INFO':
        dto.tipos_insumo = this.formulario.tiposInsumo;
        dto.tipo_resultado = this.formulario.tipoResultado as any;
        dto.especialistas = this.formulario.especialistasSeleccionados.map(codigo => {
          const esp = this.catalogos.especialistas.find(e => e.codigo === codigo);
          return {
            codigo: codigo,
            nombre: esp?.nombre_completo || codigo
          };
        });
        break;
    }

    console.log('💾 [AtencionModal] Guardando atención:', dto);

    this.atencionService.crearAtencion(dto).subscribe({
      next: (response) => {
        console.log('✅ [AtencionModal] Atención guardada:', response);
        this.guardando = false;
        this.mostrarExito('Atención registrada correctamente');
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error) => {
        console.error('❌ [AtencionModal] Error al guardar:', error);
        this.guardando = false;
        this.mostrarError('Error al registrar la atención');
      }
    });
  }

  /**
   * Mostrar mensaje de éxito
   */
  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Mostrar mensaje de error
   */
  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Obtener la descripción del tipo de acción seleccionado
   */
  getDescripcionTipoAccion(): string {
    const opcion = this.opcionesTipoAccion.find(o => o.value === this.formulario.tipoAccion);
    return opcion?.description || '';
  }

  /**
   * Resetear campos al cambiar tipo de acción
   */
  onTipoAccionChange(): void {
    // Resetear campos específicos
    this.formulario.medioRechazo = '';
    this.formulario.abogadoAsignado = '';
    this.formulario.tiposInsumo = [];
    this.formulario.tipoResultado = '';
    this.formulario.especialistasSeleccionados = [];
  }
}

