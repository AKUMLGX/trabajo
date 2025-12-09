import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
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
  styleUrl: './atencion-modal.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AtencionModalComponent implements OnInit {
  expediente: ExpedienteTlapohualli;
  // Catálogos con datos estáticos como fallback
  catalogos: CatalogosAtencion = {
    especialistas: [
      { id_especialista: 1, codigo: 'EX_ERIKA', nombre_completo: 'Ex-Erika', tipo: 'EXTERNO', activo: true },
      { id_especialista: 2, codigo: 'EX_JULIAN', nombre_completo: 'Ex-Julian', tipo: 'EXTERNO', activo: true },
      { id_especialista: 3, codigo: 'EX_GIBRAN', nombre_completo: 'Ex-Gibran', tipo: 'EXTERNO', activo: true },
      { id_especialista: 4, codigo: 'EX_DILAN', nombre_completo: 'Ex-Dilan', tipo: 'EXTERNO', activo: true },
      { id_especialista: 5, codigo: 'EX_ABRAHAM', nombre_completo: 'Ex-Abraham', tipo: 'EXTERNO', activo: true },
      { id_especialista: 6, codigo: 'EX_LINO', nombre_completo: 'Ex-Lino', tipo: 'EXTERNO', activo: true },
      { id_especialista: 7, codigo: 'IN_IRMA', nombre_completo: 'In-Irma', tipo: 'INTERNO', activo: true },
      { id_especialista: 8, codigo: 'IN_KAREN', nombre_completo: 'In-Karen', tipo: 'INTERNO', activo: true },
      { id_especialista: 9, codigo: 'IN_HECTOR', nombre_completo: 'In-Hector', tipo: 'INTERNO', activo: true }
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
   * Cargar catálogos desde el backend (usa fallback estático si falla)
   */
  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.atencionService.obtenerCatalogos().subscribe({
      next: (catalogos) => {
        // Solo actualizar si el backend devuelve datos
        if (catalogos.tipos_insumo?.length > 0) {
          this.catalogos.tipos_insumo = catalogos.tipos_insumo;
        }
        if (catalogos.tipos_resultado?.length > 0) {
          this.catalogos.tipos_resultado = catalogos.tipos_resultado;
        }
        if (catalogos.especialistas?.length > 0) {
          this.catalogos.especialistas = catalogos.especialistas;
        }
        this.cargandoCatalogos = false;
        console.log('✅ [AtencionModal] Catálogos cargados:', this.catalogos);
      },
      error: (error) => {
        console.warn('⚠️ [AtencionModal] Usando catálogos estáticos (backend no disponible):', error);
        // Mantener los datos estáticos ya definidos
        this.cargandoCatalogos = false;
        // No mostrar error, usar fallback silenciosamente
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

  /**
   * Obtener la descripción del resultado seleccionado
   */
  getDescripcionResultado(): string {
    if (!this.formulario.tipoResultado) return '';
    const resultado = this.catalogos.tipos_resultado.find(r => r.codigo === this.formulario.tipoResultado);
    return resultado?.descripcion || this.formulario.tipoResultado;
  }

  /**
   * Obtener icono para cada tipo de insumo
   */
  getInsumoIcon(codigo: string): string {
    const iconos: { [key: string]: string } = {
      'EQUIPO_FISICO': 'computer',
      'EQUIPO_VIRTUAL': 'cloud',
      'EQUIPO_MOVIL': 'smartphone',
      'EQUIPO_REMOTO': 'settings_remote',
      'IMAGEN_CIFRADA': 'enhanced_encryption',
      'PERSONALIZADA': 'tune',
      'OTROS': 'more_horiz'
    };
    return iconos[codigo] || 'inventory_2';
  }

  /**
   * Obtener icono para cada tipo de resultado
   */
  getResultadoIcon(codigo: string): string {
    const iconos: { [key: string]: string } = {
      'ACTA_HECHOS': 'description',
      'CADENA_CUSTODIA': 'link',
      'MEMORIA_TECNICA': 'article',
      'NO_APLICA': 'block'
    };
    return iconos[codigo] || 'fact_check';
  }
}

