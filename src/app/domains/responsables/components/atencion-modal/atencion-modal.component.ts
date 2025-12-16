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
  Prioridad,
  CatEspecialista,
  CatTipoInsumo,
  CatTipoResultado,
  MAX_ESPECIALISTAS
} from '../../services/atencion.service';

/**
 * Interfaz para el estado del formulario
 */
interface FormularioAtencion {
  tipoAccion: TipoAccion | '';
  // Rechazado (solo notas)
  medioRechazo: 'OFICIO' | 'ATENTA_NOTA' | 'CORREO' | '';
  // Atención Inmediata (ahora usa especialistas)
  abogadoAsignado: string;
  // Adquisición de Información
  tiposInsumo: string[];
  tipoResultado: string;
  especialistasSeleccionados: string[];
  // Nuevos flujos
  opcionSeleccionada: string[];  // Para los nuevos flujos (multi-select)
  resultadoSeleccionado: string; // Para el resultado del flujo
  // Fecha de entrega
  fechaEntrega: string;
  // Prioridad (común para todos los flujos)
  prioridad: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA' | '';
  // Sistema y Aplicativo (movido desde bandeja de captura)
  sistema_aplicativo: string;
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

  // ============= CATÁLOGOS PARA NUEVOS FLUJOS =============
  
  // Investigación Forense Digital
  opcionesInvestigacionForense = [
    { codigo: 'ADQ_INFO', descripcion: 'Adquisición de información', icon: 'content_copy' },
    { codigo: 'FUENTES_INFO', descripcion: 'Fuentes de información', icon: 'source' }
  ];
  resultadosInvestigacionForense = [
    { codigo: 'RIF', descripcion: 'Reporte de Investigación Forense (RIF)', icon: 'assessment' }
  ];

  // Elaboración de Dictámenes
  opcionesElaboracionDictamenes = [
    { codigo: 'INV_FORENSE', descripcion: 'Investigación forense digital', icon: 'search' },
    { codigo: 'JUICIO_NULIDAD', descripcion: 'Juicio de Nulidad', icon: 'gavel' },
    { codigo: 'PISTAS_AUDITORIA', descripcion: 'Pistas de Auditoría', icon: 'track_changes' },
    { codigo: 'OTROS', descripcion: 'Otros', icon: 'more_horiz' }
  ];
  resultadosElaboracionDictamenes = [
    { codigo: 'DAF', descripcion: 'Dictamen Análisis Forense (DAF)', icon: 'analytics' },
    { codigo: 'DPA', descripcion: 'Dictamen Pistas de Auditoría (DPA)', icon: 'track_changes' },
    { codigo: 'DJN', descripcion: 'Dictamen Juicio de Nulidad (DJN)', icon: 'gavel' },
    { codigo: 'DFP', descripcion: 'Dictamen Forense/Pistas (DFP)', icon: 'policy' },
    { codigo: 'RG', descripcion: 'Reporte General (RG)', icon: 'summarize' }
  ];

  // Recuperación de Información
  opcionesRecuperacionInfo = [
    { codigo: 'PUESTO_SERVIDOR', descripcion: 'Puesto de Servicio / Servidor', icon: 'dns' },
    { codigo: 'DISCO_EXTERNO', descripcion: 'Disco Externo', icon: 'storage' },
    { codigo: 'USB', descripcion: 'USB', icon: 'usb' },
    { codigo: 'OTROS', descripcion: 'Otros', icon: 'more_horiz' }
  ];
  resultadosRecuperacionInfo = [
    { codigo: 'RR', descripcion: 'Reporte de Resultados (RR)', icon: 'description' }
  ];

  // Destrucción de Dispositivos
  opcionesDestruccionDispositivos = [
    { codigo: 'DISCO_EXTERNO', descripcion: 'Disco Externo', icon: 'storage' },
    { codigo: 'USB', descripcion: 'USB', icon: 'usb' },
    { codigo: 'CD', descripcion: 'CD', icon: 'album' },
    { codigo: 'OTROS', descripcion: 'Otros', icon: 'more_horiz' }
  ];
  resultadosDestruccionDispositivos = [
    { codigo: 'RDD', descripcion: 'Reporte de Destrucción de Dispositivos (RDD)', icon: 'delete_sweep' }
  ];
  
  // Catálogo de Sistemas y Aplicativos
  sistemasAplicativos: string[] = [
    'SUN',
    'VISOR TRIBUTARIO',
    'SIPRED',
    'CRP',
    'SIINCO',
    'SICRE',
    'DYP',
    'SIATCO',
    'MAT DYC (Trámites)',
    'MAT DYC (Pistas)',
    'CFDI',
    'CORREOS ELECTRONICOS',
    'EFU',
    'SIREFE',
    'CITASAT',
    'Sistema de Turnos del SAT (Muchkin)',
    'MAT RFC',
    'CUWEB/ CORUS/ CIEC (contraseña)',
    'RESPONSIVAS SIMPLES Y CERTIFICADAS (No para Aplicativos, esas las entrega directo el área solicitante OIC, AGE)',
    'Fiscalización Electrónica Básica',
    'MAT NyV',
    'MAT DYP',
    'AGS Everest',
    'SAC',
    '.PST y conversaciones de Skype',
    'FUERPS Certificadas',
    'MODELO DE VIGILANCIA PROFUNDA (MVP)',
    'SISE',
    'CSF',
    'MAT Cobranza',
    'Responsivas Extranet/VPN',
    'Extranet/VPN',
    'BUZÓN TRIBUTARIO',
    'FUERPS',
    'Júpiter',
    'LAGS',
    'CIF',
    'ROLES HISTÓRICOS',
    'CERTISAT',
    'Opinión de Cumplimiento'
  ];

  // Estado del formulario
  formulario: FormularioAtencion = {
    tipoAccion: '',
    medioRechazo: '',
    abogadoAsignado: '',
    tiposInsumo: [],
    tipoResultado: '',
    especialistasSeleccionados: [],
    opcionSeleccionada: [],
    resultadoSeleccionado: '',
    fechaEntrega: '',
    prioridad: '',
    sistema_aplicativo: '', // Nuevo campo: Sistema y Aplicativo
    notas: ''
  };

  // Nota: La prioridad ahora se asigna en la bandeja de captura, no en atención
  
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
    },
    { 
      value: 'INVESTIGACION_FORENSE' as TipoAccion, 
      label: 'Investigación Forense Digital', 
      icon: 'search',
      description: 'Análisis forense con reporte de investigación',
      color: 'text-purple-600'
    },
    { 
      value: 'ELABORACION_DICTAMENES' as TipoAccion, 
      label: 'Elaboración de Dictámenes', 
      icon: 'gavel',
      description: 'Generación de dictámenes especializados',
      color: 'text-indigo-600'
    },
    { 
      value: 'RECUPERACION_INFO' as TipoAccion, 
      label: 'Recuperación de Información', 
      icon: 'restore',
      description: 'Recuperación de datos de dispositivos de almacenamiento',
      color: 'text-teal-600'
    },
    { 
      value: 'DESTRUCCION_DISPOSITIVOS' as TipoAccion, 
      label: 'Destrucción de Dispositivos', 
      icon: 'delete_forever',
      description: 'Destrucción segura de dispositivos de almacenamiento',
      color: 'text-rose-600'
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
    
    // Nota: La prioridad ya no se valida aquí, se asigna en captura
    
    switch (this.formulario.tipoAccion) {
      case 'RECHAZADO':
        return true; // Solo notas (opcional)
      case 'PENDIENTE_INFO':
        return true; // Solo notas (opcional)
      case 'ATENCION_INMEDIATA':
        return this.formulario.especialistasSeleccionados.length > 0 &&
               this.formulario.especialistasSeleccionados.length <= MAX_ESPECIALISTAS;
      case 'ADQUISICION_INFO':
        return this.formulario.tiposInsumo.length > 0 && 
               !!this.formulario.tipoResultado &&
               this.formulario.especialistasSeleccionados.length > 0 &&
               this.formulario.especialistasSeleccionados.length <= MAX_ESPECIALISTAS &&
               !!this.formulario.fechaEntrega;
      case 'INVESTIGACION_FORENSE':
      case 'ELABORACION_DICTAMENES':
      case 'RECUPERACION_INFO':
      case 'DESTRUCCION_DISPOSITIVOS':
        return this.formulario.opcionSeleccionada.length > 0 && 
               !!this.formulario.resultadoSeleccionado &&
               this.formulario.especialistasSeleccionados.length > 0 &&
               this.formulario.especialistasSeleccionados.length <= MAX_ESPECIALISTAS &&
               !!this.formulario.fechaEntrega;
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
   * Toggle de especialista seleccionado (máximo 3)
   */
  toggleEspecialista(codigo: string): void {
    const index = this.formulario.especialistasSeleccionados.indexOf(codigo);
    if (index > -1) {
      // Deseleccionar
      this.formulario.especialistasSeleccionados.splice(index, 1);
    } else {
      // Validar máximo 3 especialistas
      if (this.formulario.especialistasSeleccionados.length >= MAX_ESPECIALISTAS) {
        this.mostrarError(`Máximo ${MAX_ESPECIALISTAS} especialistas permitidos`);
        return;
      }
      this.formulario.especialistasSeleccionados.push(codigo);
    }
  }

  /**
   * Verificar si se puede agregar más especialistas
   */
  puedeAgregarEspecialista(): boolean {
    return this.formulario.especialistasSeleccionados.length < MAX_ESPECIALISTAS;
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

    // Construir el DTO (prioridad ya no se envía, viene del expediente)
    const dto: CrearAtencionDTO = {
      id_expediente: this.expediente.id_expediente,
      tipo_accion: this.formulario.tipoAccion as TipoAccion,
      sistema_aplicativo: this.formulario.sistema_aplicativo || undefined,
      notas: this.formulario.notas || undefined
    };

    // Agregar campos según el tipo de acción
    switch (this.formulario.tipoAccion) {
      case 'RECHAZADO':
        // Solo notas (ya incluidas arriba)
        break;
      case 'PENDIENTE_INFO':
        // Solo notas (ya incluidas arriba)
        break;
      case 'ATENCION_INMEDIATA':
        // Especialistas (máximo 3)
        dto.especialistas = this.formulario.especialistasSeleccionados.slice(0, MAX_ESPECIALISTAS).map(codigo => {
          const esp = this.catalogos.especialistas.find(e => e.codigo === codigo);
          return {
            codigo: codigo,
            nombre: esp?.nombre_completo || codigo
          };
        });
        dto.fecha_entrega = this.formulario.fechaEntrega || undefined;
        break;
      case 'ADQUISICION_INFO':
        dto.tipos_insumo = this.formulario.tiposInsumo;
        dto.tipo_resultado = this.formulario.tipoResultado;
        dto.fecha_entrega = this.formulario.fechaEntrega;
        dto.especialistas = this.formulario.especialistasSeleccionados.slice(0, MAX_ESPECIALISTAS).map(codigo => {
          const esp = this.catalogos.especialistas.find(e => e.codigo === codigo);
          return {
            codigo: codigo,
            nombre: esp?.nombre_completo || codigo
          };
        });
        break;
      case 'INVESTIGACION_FORENSE':
      case 'ELABORACION_DICTAMENES':
      case 'RECUPERACION_INFO':
      case 'DESTRUCCION_DISPOSITIVOS':
        dto.opcion_seleccionada = this.formulario.opcionSeleccionada; // Nombre correcto para backend
        dto.tipo_resultado = this.formulario.resultadoSeleccionado; // Usar tipo_resultado
        dto.fecha_entrega = this.formulario.fechaEntrega;
        dto.especialistas = this.formulario.especialistasSeleccionados.slice(0, MAX_ESPECIALISTAS).map(codigo => {
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
    // Resetear campos específicos (pero mantener sistema_aplicativo)
    this.formulario.medioRechazo = '';
    this.formulario.abogadoAsignado = '';
    this.formulario.tiposInsumo = [];
    this.formulario.tipoResultado = '';
    this.formulario.especialistasSeleccionados = [];
    this.formulario.opcionSeleccionada = [];
    this.formulario.resultadoSeleccionado = '';
    this.formulario.fechaEntrega = '';
    this.formulario.prioridad = '';
    // sistema_aplicativo se mantiene al cambiar tipo de acción
  }

  /**
   * Toggle opción seleccionada (para nuevos flujos)
   */
  toggleOpcion(codigo: string): void {
    const index = this.formulario.opcionSeleccionada.indexOf(codigo);
    if (index > -1) {
      this.formulario.opcionSeleccionada.splice(index, 1);
    } else {
      this.formulario.opcionSeleccionada.push(codigo);
    }
  }

  /**
   * Verificar si una opción está seleccionada
   */
  opcionSeleccionada(codigo: string): boolean {
    return this.formulario.opcionSeleccionada.includes(codigo);
  }

  /**
   * Obtener opciones según el tipo de acción
   */
  getOpcionesActuales(): any[] {
    switch (this.formulario.tipoAccion) {
      case 'INVESTIGACION_FORENSE':
        return this.opcionesInvestigacionForense;
      case 'ELABORACION_DICTAMENES':
        return this.opcionesElaboracionDictamenes;
      case 'RECUPERACION_INFO':
        return this.opcionesRecuperacionInfo;
      case 'DESTRUCCION_DISPOSITIVOS':
        return this.opcionesDestruccionDispositivos;
      default:
        return [];
    }
  }

  /**
   * Obtener resultados según el tipo de acción
   */
  getResultadosActuales(): any[] {
    switch (this.formulario.tipoAccion) {
      case 'INVESTIGACION_FORENSE':
        return this.resultadosInvestigacionForense;
      case 'ELABORACION_DICTAMENES':
        return this.resultadosElaboracionDictamenes;
      case 'RECUPERACION_INFO':
        return this.resultadosRecuperacionInfo;
      case 'DESTRUCCION_DISPOSITIVOS':
        return this.resultadosDestruccionDispositivos;
      default:
        return [];
    }
  }

  /**
   * Verificar si es un flujo con wizard de opciones
   */
  esFlujoConOpciones(): boolean {
    return ['INVESTIGACION_FORENSE', 'ELABORACION_DICTAMENES', 'RECUPERACION_INFO', 'DESTRUCCION_DISPOSITIVOS'].includes(this.formulario.tipoAccion);
  }

  /**
   * Obtener el título del paso de opciones según el flujo
   */
  getTituloOpciones(): string {
    switch (this.formulario.tipoAccion) {
      case 'INVESTIGACION_FORENSE':
        return 'Tipo de Investigación';
      case 'ELABORACION_DICTAMENES':
        return 'Tipo de Dictamen';
      case 'RECUPERACION_INFO':
        return 'Tipo de Dispositivo';
      case 'DESTRUCCION_DISPOSITIVOS':
        return 'Dispositivo a Destruir';
      default:
        return 'Opciones';
    }
  }

  /**
   * Obtener descripción del resultado seleccionado para nuevos flujos
   */
  getDescripcionResultadoNuevo(): string {
    if (!this.formulario.resultadoSeleccionado) return '';
    const resultados = this.getResultadosActuales();
    const resultado = resultados.find(r => r.codigo === this.formulario.resultadoSeleccionado);
    return resultado?.descripcion || this.formulario.resultadoSeleccionado;
  }

  /**
   * Obtener fecha mínima (hoy)
   */
  getFechaMinima(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Establecer fecha rápida (X días desde hoy)
   */
  setFechaRapida(dias: number): void {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    this.formulario.fechaEntrega = fecha.toISOString().split('T')[0];
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

