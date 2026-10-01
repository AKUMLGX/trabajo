import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {} from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FirstStepTlalcalliComponent } from '../first-step-tlalcalli/first-step-tlalcalli.component';
import { SecondStepTlalcalliComponent } from '../second-step-tlalcalli/second-step-tlalcalli.component';
import { PreConfirmacionModalComponent, CampoResumen, SeccionResumen } from '../pre-confirmacion-modal/pre-confirmacion-modal.component';
import { ExpedienteTlalcalliService } from '../../../services/expediente-tlalcalli.service';
import { LoggerService } from '../../../services/logger.service';
import {
  FormularioPaso1,
  FormularioPaso2,
  FormularioPaso3,
  ExpedienteTlalcalli
} from '../../../interfaces/expediente-tlalcalli.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TemporalExpedienteService } from '../../../services/temporal-expediente.service';
import { TemporalRegistroResponse } from '../../../interfaces/temporal.interface';
import { DateUtils } from '../../../utils/date-utils';
import { finalize, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { CatalogoReworkCacheService } from '../../../services/catalogo-rework-cache.service';
import { SelectOption } from '../custom-select/custom-select.component';



type Paso1TemporalExtra = FormularioPaso1 & {
  numero_entrada_central?: string;
  fecha_documento?: Date | string;
  dias_retraso?: number;
  remitente_general?: string;
  remitente_central?: string;
  remitente_identificador?: string;
  modo_expediente?: string;
  mes_expediente?: string;
  servicio?: number | string | null;
  plazo_vencimiento?: number | string | null;
  plazo_vencimiento_prioridad?: {
    valor: number | null;
    unidad: string;
    es_urgente: boolean;
  };
};

type Paso2TemporalExtra = FormularioPaso2 & {
  fecha_asignacion?: Date | string;
  sistema_aplicativo?: string;
  woos?: string;
  estatus?: string;
  ubicacion?: string;
  tipo_respuesta?: string;
  tipo_documento?: string;
  expediente_fisico_digital?: string;
  fecha_atencion_inicial?: Date | string;
  fecha_estimada_atencion?: Date | string;
  fecha_atencion_realizada?: Date | string;
  fecha_vencimiento_35_dias?: Date | string;
};
@Component({
    selector: 'app-stepper-tlalcalli',
    imports: [
        CommonModule,
        MatStepperModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTooltipModule,
        FirstStepTlalcalliComponent,
        SecondStepTlalcalliComponent
    ],
    templateUrl: './stepper-tlalcalli.component.html'
})
export class StepperTlalcalliComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(FirstStepTlalcalliComponent) paso1Component!: FirstStepTlalcalliComponent;
  @ViewChild(SecondStepTlalcalliComponent) paso2Component!: SecondStepTlalcalliComponent;

  datosPaso1: FormularioPaso1 | null = null;
  datosPaso2: FormularioPaso2 | null = null;
  documentoPasoFinal: FormularioPaso3 | null = null;

  readonly pasos = [
    { titulo: 'Información básica', descripcion: 'Datos del oficio y remitente' },
    { titulo: 'Seguimiento y Documentación', descripcion: 'Responsables, estatus y archivos' },
    { titulo: 'Resumen', descripcion: 'Confirmación del registro' },
  ];

  pasoActual = 0;
  expedienteGuardado = false;
  expedienteId: number | null = null;
  guardando = false;
  isTransitioning = false;
  paso1Valido = false;
  paso2Valido = false;
  borradorRecuperable = false;

  /** Catálogo de prioridad en memoria: el paso 1 se destruye al avanzar al paso 2. */
  private opcionesPrioridadCache: SelectOption[] = [];

  private pendienteResetFormularios = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteTlalcalliService,
    private snackBar: MatSnackBar,
    private logger: LoggerService,
    private dialog: MatDialog,
    private temporalService: TemporalExpedienteService,
    private catalogoCache: CatalogoReworkCacheService,
  ) {}

  ngOnInit(): void {
    this.temporalService.bloquearAutoGuardado();
    this.inicializarEstadoCaptura();
    this.cargarCatalogoPrioridades();
  }

  private cargarCatalogoPrioridades(): void {
    this.catalogoCache
      .getCat(2)
      .pipe(takeUntil(this.destroy$))
      .subscribe((prioridades) => {
        this.opcionesPrioridadCache = prioridades.map((item) => ({
          value: item.id_exp,
          label: item.descripcion,
        }));
      });
  }

  private inicializarEstadoCaptura(): void {
    this.datosPaso1 = null;
    this.datosPaso2 = null;
    this.borradorRecuperable = this.temporalService.hayBorradorRecuperable();

    if (this.temporalService.getStoredUuid()) {
      this.temporalService.limpiarStorageBorradorCaptura(false);
    }

    this.limpiarEstadoInterno(false);
    this.pendienteResetFormularios = true;
  }

  retomarBorrador(): void {
    const uuid = this.temporalService.activarRetomarBorrador();
    if (!uuid) {
      this.borradorRecuperable = false;
      return;
    }

    this.borradorRecuperable = false;
    this.recuperarBorradorSiValido(uuid, true);
  }

  descartarBorradorPendiente(): void {
    this.temporalService.descartarBorradorPendiente();
    this.borradorRecuperable = false;
    this.limpiarEstadoInterno(true);
    this.temporalService.permitirAutoGuardado();
    this.mostrarMensaje('Borrador descartado. Formulario limpio.', 'info');
  }

  private ignorarBorradorObsoleto(uuid: string): void {
    void this.temporalService.eliminarRegistroTemporal(uuid);
    this.temporalService.limpiarStorageBorradorCaptura(false);
    this.limpiarEstadoInterno(false);
    this.pendienteResetFormularios = true;
  }

  private recuperarBorradorSiValido(uuid: string, forzar = false): void {
    if (!forzar && !this.temporalService.debeRecuperarBorradorAlEntrar()) {
      return;
    }

    if (this.temporalService.isCapturaRecienCompletada()) {
      this.ignorarBorradorObsoleto(uuid);
      return;
    }

    this.guardando = true;

    this.temporalService.recuperarBorradorSiExiste(uuid, forzar).pipe(takeUntil(this.destroy$)).subscribe({
      next: (registro) => {
        this.guardando = false;

        if (this.temporalService.isCapturaRecienCompletada()) {
          this.ignorarBorradorObsoleto(uuid);
          return;
        }

        if (!registro) {
          this.limpiarEstadoInterno(false);
          this.aplicarResetFormulariosCuandoListos();
          return;
        }

        this.transicionarPaso(0);
        setTimeout(() => {
          this.cargarRegistroTemporalEnFormulario(registro);
          this.mostrarMensaje(
            'Información temporal recuperada correctamente',
            'success'
          );
          this.temporalService.permitirAutoGuardado();
        }, 0);
      },
      error: () => {
        this.guardando = false;
        this.temporalService.limpiarStorageBorradorCaptura(false);
        this.limpiarEstadoInterno(false);
        this.aplicarResetFormulariosCuandoListos();
      },
    });
  }

  private aplicarResetFormulariosCuandoListos(): void {
    this.pendienteResetFormularios = true;
    setTimeout(() => {
      if (!this.pendienteResetFormularios) {
        return;
      }
      this.resetearFormulariosHijos();
      this.pendienteResetFormularios = false;
      if (!this.expedienteGuardado && !this.borradorRecuperable) {
        this.temporalService.permitirAutoGuardado();
      }
    }, 0);
  }

  private limpiarEstadoInterno(reiniciarFormulariosHijos: boolean): void {
    this.datosPaso1 = null;
    this.datosPaso2 = null;
    this.documentoPasoFinal = null;
    this.pasoActual = 0;
    this.expedienteGuardado = false;
    this.expedienteId = null;
    this.paso1Valido = false;
    this.paso2Valido = false;

    if (reiniciarFormulariosHijos) {
      this.resetearFormulariosHijos();
    }
  }

  private resetearFormulariosHijos(): void {
    this.paso1Component?.resetearFormulario?.();
    this.paso2Component?.resetearFormulario?.();
  }

  ngAfterViewInit(): void {
    if (this.pendienteResetFormularios) {
      setTimeout(() => {
        this.resetearFormulariosHijos();
        this.pendienteResetFormularios = false;

        if (!this.expedienteGuardado && !this.borradorRecuperable) {
          this.temporalService.permitirAutoGuardado();
        }
      }, 0);
    }

    // Prevenir acceso a pasos sin completar
    if (this.stepper) {
      this.stepper.selectionChange.subscribe((event) => {
        // Si intenta ir al paso 2 (índice 1) sin completar el paso 1
        if (event.selectedIndex === 1 && (!this.paso1Valido || !this.datosPaso1)) {
          this.mostrarMensaje('Debe completar todos los campos del paso 1 antes de continuar', 'warning');
          // Forzar volver al paso 1
          setTimeout(() => {
            this.stepper.selectedIndex = 0;
            this.pasoActual = 0;
          }, 100);
        }
        // Si intenta ir al paso 3 (índice 2) sin haber guardado
        else if (event.selectedIndex === 2 && !this.expedienteGuardado) {
          this.mostrarMensaje('Debe completar y guardar el paso 2 antes de ver el resumen', 'warning');
          // Forzar volver al paso 2
          setTimeout(() => {
            this.stepper.selectedIndex = 1;
            this.pasoActual = 1;
          }, 100);
        }
      });
    }
  }

  // Paso 1
  onPaso1ValidezCambiada(valido: boolean) {
    this.paso1Valido = valido;
  }

onPaso1Completado(datos: FormularioPaso1) {
  if (this.paso1Component?.opcionesPrioridad?.length) {
    this.opcionesPrioridadCache = [...this.paso1Component.opcionesPrioridad];
  }

  this.datosPaso1 = datos;
  this.transicionarPaso(1);
  this.mostrarMensaje('Paso 1 completado correctamente', 'success');

  const paso2Pendiente = this.datosPaso2;
  if (paso2Pendiente) {
    setTimeout(() => {
      this.paso2Component?.precargarDatos?.(
        paso2Pendiente as Parameters<SecondStepTlalcalliComponent['precargarDatos']>[0]
      );
    }, 300);
  }
}

  onPaso1Siguiente() {
    if (this.paso1Component) {
      this.paso1Component.onSubmit();
    }
  }

  // Paso 2 (seguimiento): confirmar en modal → POST en finalizarExpediente() → paso 3 (éxito)
  onPaso2Completado(datos: any) {
    if (!datos) {
      this.mostrarMensaje('No se recibieron datos del paso 2', 'error');
      return;
    }

    const { campos_pospuestos, documento_pdf, documento_pdf_nombre, ...seguimiento } = datos;
    this.datosPaso2 = seguimiento as FormularioPaso2;
    this.documentoPasoFinal = {
      documento_pdf: documento_pdf ?? null,
      documento_pdf_nombre: documento_pdf?.name ?? documento_pdf_nombre,
      campos_pospuestos: campos_pospuestos || []
    };

    this.mostrarModalConfirmacion();
  }

  // Modal de pre-confirmación con resumen de datos organizados en secciones
  private mostrarModalConfirmacion() {
    const secciones: SeccionResumen[] = this.construirSeccionesResumen();
    console.log(`${secciones[0]}`);

    const dialogRef = this.dialog.open(PreConfirmacionModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'pre-confirmacion-dialog',
      data: {
        titulo: '¿Confirmar registro?',
        subtitulo: 'Verifique que todos los datos sean correctos',
        expediente: this.datosPaso1?.expediente,
        secciones: secciones,
        botonConfirmar: 'Guardar expediente',
        botonCancelar: 'Revisar'
      }
    });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
    this.finalizarExpediente();
  } else {
    const datosPaso2Actuales = this.construirDatosPaso2Actuales();
    if (datosPaso2Actuales) {
      this.datosPaso2 = datosPaso2Actuales;
    }

    this.guardarTemporalBestEffort(() => {
      this.transicionarPaso(0);
      setTimeout(() => {
        if (this.datosPaso1) {
          this.paso1Component?.precargarDatos?.(this.datosPaso1);
        }
      }, 300);
    });
  }
  });

}

  // Construir secciones organizadas para el modal
  private construirSeccionesResumen(): SeccionResumen[] {
    const secciones: SeccionResumen[] = [];

    // Sección 1: Información del Requerimiento
    if (this.datosPaso1) {
      let fecha_acuse : string = this.datosPaso1.fecha_recibido?.toString() || "";
      let fecha_vencimiento : string = this.datosPaso1.fecha_vencimiento?.toString() || "";
      const camposRequerimiento: CampoResumen[] = [];

      camposRequerimiento.push({
        etiqueta: 'Tipo',
        valor: this.formatearTipoMedio(this.datosPaso1.tipo_medio_recepcion),
        icono: 'description'
      });

      if (this.datosPaso1.oficio) {
        camposRequerimiento.push({
          etiqueta: 'Número/Oficio',
          valor: this.datosPaso1.oficio,
          icono: 'tag',
          tipo: 'destacado'
        });
      }

      if (this.datosPaso1.remitente_area) {
        camposRequerimiento.push({
          etiqueta: 'Remitente',
          valor: this.datosPaso1.remitente_area,
          icono: 'business'
        });
      }

      if (this.datosPaso1.referencia_asunto) {
        const asunto = this.datosPaso1.referencia_asunto;
        camposRequerimiento.push({
          etiqueta: 'Asunto/Referencia',
          valor: asunto.length > 80 ? asunto.substring(0, 80) + '...' : asunto,
          icono: 'subject'
        });
      }

      secciones.push({
        titulo: 'Información del Requerimiento',
        icono: 'assignment',
        campos: camposRequerimiento
      });

      // Sección 2: Fechas y Prioridad
      const camposFechas: CampoResumen[] = [];

      if (this.datosPaso1.fecha_recibido) {
        camposFechas.push({
          etiqueta: 'Fecha de Acuse',
          valor:   this.reformateo_fast(fecha_acuse), //new Date(this.datosPaso1.fecha_recibido).toString(),   //this.formatearFecha(this.datosPaso1.fecha_recibido),
          icono: 'event',
          tipo: 'fecha'
        });
      }

      if (this.datosPaso1.fecha_vencimiento) {
        camposFechas.push({
          etiqueta: 'Fecha Vencimiento',
          valor:  this.reformateo_fast(fecha_vencimiento),//this.datosPaso1.fecha_vencimiento.toString(),//this.formatearFecha(this.datosPaso1.fecha_vencimiento),
          icono: 'event_busy',
          tipo: 'fecha'
        });
      }

      if (this.datosPaso1.prioridad) {
        const etiquetaPrioridad = this.etiquetaPrioridadLegible(this.datosPaso1.prioridad);
        camposFechas.push({
          etiqueta: 'Prioridad',
          valor: etiquetaPrioridad,
          icono: 'priority_high',
          tipo: 'prioridad',
          prioridadColor: this.obtenerColorPrioridad(etiquetaPrioridad)
        });
      }

      if (camposFechas.length > 0) {
        secciones.push({
          titulo: 'Fechas y Prioridad',
          icono: 'schedule',
          campos: camposFechas
        });
      }
    }

    // Sección 3: Asignación
    if (this.datosPaso2) {
      const camposAsignacion: CampoResumen[] = [];

      const nombreResponsable =
        this.datosPaso2.responsable_fecha_asignacion || this.datosPaso2.responsable;

      if (nombreResponsable) {
        camposAsignacion.push({
          etiqueta: 'Responsable',
          valor: nombreResponsable,
          icono: 'person',
          tipo: 'responsable'
        });
      }

      if (this.datosPaso2.sistema_aplicativo) {
        camposAsignacion.push({
          etiqueta: 'Aplicativo / Sistema',
          valor: this.datosPaso2.sistema_aplicativo,
          icono: 'computer'
        });
      }

      if (this.datosPaso2.status_descripcion || this.datosPaso2.estatus) {
        camposAsignacion.push({
          etiqueta: 'Estatus',
          valor: this.datosPaso2.status_descripcion || String(this.datosPaso2.estatus),
          icono: 'flag'
        });
      }

      if (this.datosPaso2.ubicacion) {
        camposAsignacion.push({
          etiqueta: 'Ubicación',
          valor: this.formatearUbicacionResumen(this.datosPaso2.ubicacion),
          icono: 'folder'
        });
      }

      if (this.datosPaso2.observaciones_estatus) {
        const observaciones = this.datosPaso2.observaciones_estatus;
        camposAsignacion.push({
          etiqueta: 'Observaciones del estatus',
          valor: observaciones.length > 80 ? observaciones.substring(0, 80) + '...' : observaciones,
          icono: 'notes'
        });
      }

      if (camposAsignacion.length > 0) {
        secciones.push({
          titulo: 'Asignación',
          icono: 'person_pin',
          campos: camposAsignacion
        });
      }
    }

    return secciones;
  }

  private formatearUbicacionResumen(ubicacion: string | number): string {
    const mapa: Record<string, string> = {
      '1': 'Carpeta general',
      '2': 'Individual'
    };

    return mapa[String(ubicacion)] || String(ubicacion);
  }

  private formatearTipoMedio(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ATENTA_NOTA': 'Atenta nota',
      'OFICIO': 'Oficio',
      'REQUERIMIENTO_VERBAL': 'Petición interna',
      'CORREO_ELECTRONICO': 'Correo electrónico'
    };
    return tipos[tipo] || tipo;
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'N/A';
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private reformateo_fast(fecha : string) : string {
    let elementos = fecha.split('-'); //obtenemos año mes dia
    return `${elementos[2]}-${elementos[1]}-${elementos[0]}`
  }

  etiquetaPrioridadLegible(prioridad?: string | number | null): string {
    if (prioridad === null || prioridad === undefined || prioridad === '') {
      return 'Normal';
    }

    const id = Number(prioridad);
    if (Number.isFinite(id)) {
      const opciones =
        this.opcionesPrioridadCache.length > 0
          ? this.opcionesPrioridadCache
          : this.paso1Component?.opcionesPrioridad ?? [];

      const opcion = opciones.find((item) => Number(item.value) === id);
      if (opcion?.label) {
        return this.etiquetaPrioridadResumida(opcion.label);
      }
    }

    return this.etiquetaPrioridadResumida(String(prioridad));
  }

  /** Texto corto para badge (ej. "Normal" en lugar del párrafo completo del catálogo). */
  private etiquetaPrioridadResumida(etiqueta: string): string {
    const parentesis = etiqueta.indexOf('(');
    if (parentesis > 0) {
      return etiqueta.slice(0, parentesis).trim();
    }

    return etiqueta.trim();
  }

  private obtenerColorPrioridad(prioridad: string): string {
    const normalizado = prioridad.trim().toUpperCase();

    if (normalizado.includes('EXTRA')) {
      return 'red';
    }

    if (normalizado.includes('URGENTE')) {
      return 'orange';
    }

    if (normalizado.includes('NORMAL')) {
      return 'yellow';
    }

    const colores: Record<string, string> = {
      ALTA: 'orange',
      MEDIA: 'yellow',
      BAJA: 'green',
    };

    return colores[normalizado] || 'yellow';
  }

  onPaso2Siguiente() {
    if (this.paso2Component) {
      this.paso2Component.onSubmit();
    }
  }

onPaso2Anterior(): void {
  const datosPaso2Actuales = this.construirDatosPaso2Actuales();
  if (datosPaso2Actuales) {
    this.datosPaso2 = datosPaso2Actuales;
  }

  this.guardarTemporalBestEffort(() => {
    this.transicionarPaso(0);
    setTimeout(() => {
      if (this.datosPaso1) {
        this.paso1Component?.precargarDatos?.(this.datosPaso1);
      }
    }, 300);
  });
}

  async finalizarExpediente() {
    const uuidTemporal = this.temporalService.getStoredUuid();
    this.temporalService.bloquearAutoGuardado();
    this.temporalService.marcarCapturaCompletada();

    if (!this.datosPaso1 || !this.datosPaso2) {
      this.mostrarMensaje('Faltan datos en el formulario', 'error');
      return;
    }

    this.guardando = true;

    try {
      const respuesta = await firstValueFrom(
        this.expedienteService.crearExpedienteReworkInicial(this.datosPaso1, this.datosPaso2)
      );

      this.expedienteId = respuesta?.id_expediente ?? null;
      this.expedienteGuardado = true;

      const pdfFile = this.documentoPasoFinal?.documento_pdf;
      if (this.expedienteId && pdfFile instanceof File) {
        try {
          const pdfResp = await firstValueFrom(
            this.expedienteService.cargarPdfRework(this.expedienteId, pdfFile)
          );

          const sinEspacio =
            pdfResp.mensaje?.toLowerCase().includes('espacio suficiente') ?? false;

          if (sinEspacio || !pdfResp.id) {
            this.mostrarMensaje(
              pdfResp.mensaje || 'El expediente se guardó, pero no se pudo adjuntar el PDF.',
              'warning',
              6000
            );
          } else {
            this.documentoPasoFinal = {
              documento_pdf: pdfFile,
              documento_pdf_nombre: pdfFile.name,
              campos_pospuestos: this.documentoPasoFinal?.campos_pospuestos ?? [],
            };
            this.mostrarMensaje(pdfResp.mensaje || 'PDF cargado correctamente', 'success');
          }
        } catch (pdfError: unknown) {
          console.error('Error al cargar PDF rework:', pdfError);
          this.mostrarMensaje(
            'Expediente guardado, pero falló la carga del PDF. Intente adjuntarlo después.',
            'warning',
            6000
          );
        }
      }

      if (this.temporalService.isValidStoredUuid(uuidTemporal)) {
        await this.temporalService.eliminarRegistroTemporal(uuidTemporal);
      }

      this.resetearFormulariosHijos();
      this.transicionarPaso(2);
      if (!pdfFile) {
        this.mostrarMensaje(respuesta?.mensaje || 'Expediente guardado exitosamente', 'success');
      }
    } catch (error: unknown) {
      this.manejarError(error);
    } finally {
      this.guardando = false;
    }
  }


/** Guarda borrador temporal sin bloquear la navegación si el backend falla. */
private guardarTemporalBestEffort(alContinuar: () => void): void {
  if (!this.datosPaso1 || !this.datosPaso2) {
    alContinuar();
    return;
  }

  if (!this.temporalService.puedeGuardarBorrador(this.datosPaso1, this.datosPaso2)) {
    alContinuar();
    return;
  }

  this.temporalService
    .guardarBorradorCompleto(this.datosPaso1, this.datosPaso2)
    .pipe(
      finalize(() => alContinuar()),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (uuid) => {
        if (uuid) {
          this.logger.debug('Borrador temporal guardado al retroceder', uuid);
        }
      },
      error: (error) => {
        this.logger.warn('Borrador temporal no guardado al retroceder', error);
      },
    });
}

private construirDatosPaso2Actuales(): FormularioPaso2 | null {
  if (!this.paso2Component?.formulario) {
    return this.datosPaso2;
  }

  return this.paso2Component.obtenerValoresNormalizados() as FormularioPaso2;
}


private cargarRegistroTemporalEnFormulario(
  registro: TemporalRegistroResponse
): void {
  const oficio = registro.num_oficio?.trim() ?? '';
  const expediente = registro.num_expediente?.trim() ?? '';
  if (!oficio && !expediente) {
    this.limpiarEstadoInterno(false);
    this.aplicarResetFormulariosCuandoListos();
    return;
  }

  this.datosPaso1 = null;
  this.datosPaso2 = null;

  const plazo = DateUtils.contarDiasHabilesDesdeRecepcion(
    registro.fecha_recepcion,
    registro.fecha_vencimiento
  );

  const datosPaso1 = {
    oficio: registro.num_oficio,
    expediente: registro.num_expediente,
    numero_entrada_central: registro.num_entrada,
    remitente_area: registro.remitente,
    servicio: registro.servicio,
    plazo_vencimiento: plazo ?? undefined,
    plazo_vencimiento_prioridad: {
      valor: plazo,
      unidad: 'dias_habiles' as const,
      es_urgente: registro.prioridad === 2 || registro.prioridad === 3
    },
    fecha_documento: this.convertirFechaApiAInput(registro.fecha_documento),
    fecha_recibido: this.convertirFechaApiAInput(registro.fecha_recepcion),
    fecha_vencimiento: this.convertirFechaApiAInput(registro.fecha_vencimiento),
    referencia_asunto: registro.asunto,
    prioridad: registro.prioridad
  };

  const datosPaso2: Partial<FormularioPaso2> = {
    usuarios: this.expedienteService.parsearUsuariosCadena(registro.usuarios),
    responsable: registro.responsable ?? '',
    sistema_aplicativo: registro.aplicativos ?? '',
    status: registro.status,
    estatus: String(registro.status),
    ubicacion: registro.ubicacion,
    observaciones_estatus: registro.observaciones ?? ''
  };

  this.datosPaso1 = {
    ...datosPaso1
  } as unknown as FormularioPaso1;

  this.datosPaso2 = {
    ...datosPaso2
  } as FormularioPaso2;

  this.paso1Valido = true;
  this.paso2Valido = true;

  setTimeout(() => {
    this.paso1Component?.precargarDatos?.(datosPaso1);

    this.paso2Component?.precargarDatos?.(
      datosPaso2 as Parameters<SecondStepTlalcalliComponent['precargarDatos']>[0]
    );
  }, 100);
}

private convertirFechaApiAInput(fecha: string | null | undefined): string | null {
  if (!fecha) {
    return null;
  }

  const latam = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (latam) {
    return `${latam[3]}-${latam[2]}-${latam[1]}`;
  }

  const iso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  return DateUtils.toInputDate(fecha);
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private manejarError(error: any) {
    this.logger.error('Error al guardar expediente:', error);

    let mensajeError = 'Error al guardar el expediente';
    let tipo: 'success' | 'error' | 'info' | 'warning' = 'error';

    if (error?.status === 409) {
      tipo = 'warning';
      const detalle = (error?.error?.message || error?.error || '').toLowerCase();
      if (detalle.includes('oficio')) {
        mensajeError = '⚠️ OFICIO DUPLICADO\n\nEste número de oficio ya existe en el sistema.';
      } else if (detalle.includes('expediente')) {
        mensajeError = '⚠️ EXPEDIENTE DUPLICADO\n\nEste número de expediente ya existe.';
      } else {
        mensajeError = '⚠️ REGISTRO DUPLICADO\n\nVerifica la información indicada.';
      }
    } else if (error?.status === 400) {
      tipo = 'warning';
      mensajeError = '⚠️ DATOS INVÁLIDOS\n\n' + (error?.error?.message || 'Revisa los campos del formulario.');
    } else if (error?.status === 500) {
      mensajeError = '❌ ERROR DEL SERVIDOR\n\nNo se pudo procesar la solicitud.';
    } else if (error?.status === 0) {
      mensajeError = '❌ SIN CONEXIÓN\n\nVerifica tu conexión a internet.';
    }

    this.mostrarMensaje(mensajeError, tipo, 8000);
    // Mostrar modal para errores importantes
    if (tipo === 'warning' || tipo === 'error') {
      // TODO: Reemplazar con modal de confirmación
      // Por ahora mantener alert para errores críticos
      if (tipo === 'warning') {
        alert(mensajeError);
      }
    }
  }

  // Utilidades
  mostrarResumenExpediente(expediente: ExpedienteTlalcalli | undefined) {
    if (!expediente) return;

    const resumen = `
      Expediente: ${expediente.expediente}
      Oficio: ${expediente.oficio || 'N/A'}
      Remitente: ${expediente.remitente_area || 'N/A'}
      Estatus: ${expediente.estatus || 'N/A'}
      Fecha de creación: ${expediente.fecha_creacion ? new Date(expediente.fecha_creacion).toLocaleDateString() : 'N/A'}
    `;

    this.snackBar.open(resumen, 'Cerrar', {
      duration: 10000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning', duracion: number = 5000) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`${tipo}-snackbar`]
    });
  }

  get puedeAvanzarPaso1(): boolean {
    return this.paso1Valido;
  }

  get puedeAvanzarPaso2(): boolean {
  return this.paso2Component?.formulario?.valid ?? false;
  }

  onPaso2ValidezCambiada(valido: boolean) {
  this.paso2Valido = valido;
  }

  get estaCompletado(): boolean {
    return this.expedienteGuardado;
  }

  obtenerResumenCompleto() {
    return {
      paso1: this.datosPaso1,
      paso2: this.datosPaso2,
      documento: this.documentoPasoFinal,
      expedienteId: this.expedienteId,
      fechaCreacion: new Date().toISOString()
    };
  }

  transicionarPaso(nuevoPaso: number) {
    this.isTransitioning = true;
    setTimeout(() => {
      this.pasoActual = nuevoPaso;
      this.isTransitioning = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  reiniciarFormulario() {
    this.isTransitioning = true;
    this.temporalService.bloquearAutoGuardado();
    this.temporalService.consumirMarcaCapturaCompletada();
    this.temporalService.descartarBorrador().subscribe();

    setTimeout(() => {
      this.limpiarEstadoInterno(true);
      this.transicionarPaso(0);
      this.temporalService.permitirAutoGuardado();
      this.isTransitioning = false;
      this.mostrarMensaje('Formulario reiniciado completamente', 'info');
    }, 300);
  }
}
