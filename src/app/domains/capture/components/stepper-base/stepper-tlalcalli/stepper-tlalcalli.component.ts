import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { PdfGeneratorService } from '../../../services/pdf-generator.service';
import { LoggerService } from '../../../services/logger.service';
import {
  FormularioPaso1,
  FormularioPaso2,
  FormularioPaso3,
  ExpedienteTlalcalli
} from '../../../interfaces/expediente-tlalcalli.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';
import { TemporalInsertRequest } from '../../../interfaces/temporal.interface';
import { TemporalInsertResponse } from '../../../interfaces/temporal.interface';
import { TemporalRegistroRequest, TemporalRegistroResponse, TemporalEliminaRequest, TemporalEliminaResponse } from '../../../interfaces/temporal.interface';



type Paso1TemporalExtra = FormularioPaso1 & {
  numero_entrada_central?: string;
  fecha_documento?: Date | string;
  dias_retraso?: number;
  fecha_requerimiento?: Date | string;
  remitente_general?: string;
  remitente_central?: string;
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
    templateUrl: './stepper-tlalcalli.component.html',
    styleUrls: ['./stepper-tlalcalli.component.css', './stepper-tlalcalli-global.css']
})
export class StepperTlalcalliComponent implements OnInit, AfterViewInit {
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(FirstStepTlalcalliComponent) paso1Component!: FirstStepTlalcalliComponent;
  @ViewChild(SecondStepTlalcalliComponent) paso2Component!: SecondStepTlalcalliComponent;

  datosPaso1: FormularioPaso1 | null = null;
  datosPaso2: FormularioPaso2 | null = null;
  documentoPasoFinal: FormularioPaso3 | null = null;

  pasoActual = 0;
  expedienteGuardado = false;
  expedienteId: number | null = null;
  guardando = false;
  isTransitioning = false;
  paso1Valido = false;
  paso2Valido = false;

  constructor(
    private expedienteService: ExpedienteTlalcalliService,
    private pdfService: PdfGeneratorService,
    private snackBar: MatSnackBar,
    private logger: LoggerService,
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
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
  this.datosPaso1 = datos;
  this.transicionarPaso(1);
  this.mostrarMensaje('Paso 1 completado correctamente', 'success');
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

    const { documento_pdf, campos_pospuestos, ...seguimiento } = datos;
    this.datosPaso2 = seguimiento as FormularioPaso2;
    this.documentoPasoFinal = {
      documento_pdf: documento_pdf as File | undefined,
      documento_pdf_nombre: documento_pdf ? (documento_pdf as File).name : undefined,
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
    this.insertarTemporal(true);
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
          etiqueta: 'Asunto',
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
        camposFechas.push({
          etiqueta: 'Prioridad',
          valor: this.datosPaso1.prioridad,
          icono: 'priority_high',
          tipo: 'prioridad',
          prioridadColor: this.obtenerColorPrioridad(this.datosPaso1.prioridad)
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

  private obtenerColorPrioridad(prioridad: string): string {
    const colores: { [key: string]: string } = {
      'URGENTE': 'red',
      'ALTA': 'orange',
      'MEDIA': 'yellow',
      'BAJA': 'green'
    };
    return colores[prioridad] || 'yellow';
  }

  onPaso2Siguiente() {
    if (this.paso2Component) {
      this.paso2Component.onSubmit();
    }
  }

onPaso2Anterior(): void {
  if (this.paso2Component?.formulario) {
    this.datosPaso2 = {
      ...(this.datosPaso2 || {}),
      ...this.paso2Component.formulario.getRawValue()
    } as FormularioPaso2;
  }

  this.insertarTemporal(true);
}

  // Finalizar expediente
  async finalizarExpediente() {
    if (!this.datosPaso1 || !this.datosPaso2 || !this.documentoPasoFinal) {
      this.mostrarMensaje('Faltan datos en el formulario', 'error');
      return;
    }

    // PDF ya no es requerido

    this.guardando = true;

    try {
      const expediente = await this.expedienteService
        .crearExpedienteDesdePasos(
          this.datosPaso1,
          this.datosPaso2,
          this.documentoPasoFinal
        )
        .toPromise();

      this.expedienteId = expediente?.id_expediente || null;
      this.expedienteGuardado = true;
      console.log('UUID antes de eliminar temporal:',localStorage.getItem('uuid_temporal_expediente'));
      this.eliminarRegistroTemporal();
      this.transicionarPaso(2);
      this.mostrarMensaje('Expediente guardado exitosamente', 'success');

      this.pdfService.generarPDFExpediente(
        this.datosPaso1,
        this.datosPaso2,
        this.documentoPasoFinal,
        this.expedienteId || undefined
      );

      this.mostrarResumenExpediente(expediente);
    } catch (error: any) {
      this.manejarError(error);
    } finally {
      this.guardando = false;
    }
  }


private insertarTemporal(regresarAPaso1: boolean = false): void {
  if (!this.datosPaso1 || !this.datosPaso2) {
    this.mostrarMensaje('Faltan datos para guardar el registro temporal', 'warning');
    return;
  }

  const body = this.construirBodyTemporal();

  this.guardando = true;

  this.apiService
    .postTemporal<TemporalInsertResponse>('temporal/insert', body)
    .subscribe({
      next: (response) => {
        const uuid = response.body?.uuid;

        if (!uuid) {
          this.mostrarMensaje('El servicio no devolvió UUID', 'warning');
          this.guardando = false;
          return;
        }

        localStorage.setItem('uuid_temporal_expediente', uuid);

        console.log('UUID temporal guardado:', uuid);

        this.guardando = false;

        if (regresarAPaso1) {
          this.transicionarPaso(0);

          setTimeout(() => {
            this.paso1Component?.precargarDatos?.(this.datosPaso1);
          }, 300);
        }

        this.mostrarMensaje(
          'Registro temporal guardado correctamente. Puedes revisar los datos antes de guardar.',
          'success',
          4000
        );
      },
      error: (error) => {
        this.guardando = false;
        this.manejarError(error);
      }
    });
}

private construirBodyTemporal(): TemporalInsertRequest {
  const ahora = new Date().toISOString();

  const paso1 = this.datosPaso1 as Paso1TemporalExtra;
  const paso2 = this.datosPaso2 as Paso2TemporalExtra;

  const responsable =
    paso2.responsable_fecha_asignacion ||
    paso2.responsable ||
    '';

  return {
    id_expediente: this.expedienteId ?? 0,

    oficio: paso1.oficio || '',
    expediente: paso1.expediente || '',
    numero_entrada_central: paso1.numero_entrada_central || '',
    remitente_general: paso1.remitente_general || '',
    remitente_central: paso1.remitente_central || '',
    remitente_area: paso1.remitente_area || '',
    fecha_documento: this.formatearFechaParaApi(paso1.fecha_documento),
    fecha_recibido: this.formatearFechaParaApi(paso1.fecha_recibido),
    referencia_asunto: paso1.referencia_asunto || '',
    fecha_vencimiento: this.formatearFechaParaApi(paso1.fecha_vencimiento),

    dias_retraso: paso1.dias_retraso || 0,
    responsable,
    fecha_asignacion: this.formatearFechaParaApi(paso2.fecha_asignacion),

    sistema_aplicativo: paso2.sistema_aplicativo || '',
    woos: paso2.woos || '',
    estatus: paso2.estatus || 'En revisión',
    ubicacion: paso2.ubicacion || '',
    tipo_respuesta: paso2.tipo_respuesta || '',
    tipo_documento: paso2.tipo_documento || '',

    expediente_fisico_digital: paso2.expediente_fisico_digital || '',

    fecha_creacion: ahora,
    fecha_actualizacion: ahora,
    usuario_creacion: 'admin',
    usuario_actualizacion: 'admin',

    tipo_medio_recepcion: paso1.tipo_medio_recepcion || '',
    tiene_fecha_atencion_inicial: !!paso2.fecha_atencion_inicial,
    fecha_atencion_inicial: this.formatearFechaParaApi(paso2.fecha_atencion_inicial),
    fecha_estimada_atencion: this.formatearFechaParaApi(paso2.fecha_estimada_atencion),
    fecha_atencion_realizada: this.formatearFechaParaApi(paso2.fecha_atencion_realizada),
    fecha_vencimiento_35_dias: this.formatearFechaParaApi(paso2.fecha_vencimiento_35_dias),

    documento_pdf_nombre: this.documentoPasoFinal?.documento_pdf_nombre || '',
    prioridad: paso1.prioridad || '',
    fecha_requerimiento: this.formatearFechaParaApi(paso1.fecha_requerimiento)
  };
}

private formatearFechaParaApi(fecha: Date | string | null | undefined): string {
  if (!fecha) return '';

  if (typeof fecha === 'string') {
    return fecha.includes('T') ? fecha.split('T')[0] : fecha;
  }

  return fecha.toISOString().split('T')[0];
}


private obtenerRegistroTemporal(): void {
  const uuid = localStorage.getItem('uuid_temporal_expediente');

  if (!uuid) {
    this.mostrarMensaje(
      'No existe un registro temporal guardado',
      'warning',
      3000
    );

    this.transicionarPaso(0);
    return;
  }

  const body: TemporalRegistroRequest = {
    uuid
  };

  console.log('POST temporal/registro:', body);

  this.guardando = true;

  this.apiService
    .postTemporal<TemporalRegistroResponse>(
      'temporal/registro',
      body
    )
    .subscribe({
next: (response) => {
  const registro = response.body;

  if (!registro) {
    this.mostrarMensaje('No se encontró información temporal', 'warning');
    this.guardando = false;
    this.transicionarPaso(0);
    return;
  }

  console.log('Registro temporal recuperado:', registro);

  this.guardando = false;
  this.transicionarPaso(0);

  setTimeout(() => {
    this.cargarRegistroTemporalEnFormulario(registro);
  }, 300);

  this.mostrarMensaje(
    'Información temporal recuperada correctamente',
    'success'
  );
},

      error: (error) => {
        console.error('ERROR temporal/registro:', error);

        this.guardando = false;
        this.manejarError(error);
      }
    });
}

private cargarRegistroTemporalEnFormulario(
  registro: TemporalRegistroResponse
): void {
  const datosPaso1 = {
    oficio: registro.oficio,
    expediente: registro.expediente,
    numero_entrada_central: registro.numero_entrada_central,

    remitente_area: registro.remitente_area,
    remitente_general: registro.remitente_general,
    remitente_central: registro.remitente_central,

    fecha_documento:
      this.convertirFechaApiADate(registro.fecha_documento),

    fecha_recibido:
      this.convertirFechaApiADate(registro.fecha_recibido),

    fecha_vencimiento:
      this.convertirFechaApiADate(registro.fecha_vencimiento),

    fecha_requerimiento:
      this.convertirFechaApiADate(registro.fecha_requerimiento),

    referencia_asunto: registro.referencia_asunto,
    tipo_medio_recepcion: registro.tipo_medio_recepcion,
    prioridad: registro.prioridad
  };

const datosPaso2: Partial<FormularioPaso2> = {
  responsable: registro.responsable ?? ''
};

  this.datosPaso1 = {
    ...(this.datosPaso1 || {}),
    ...datosPaso1
  } as unknown as FormularioPaso1;

  this.datosPaso2 = {
    ...(this.datosPaso2 || {}),
    ...datosPaso2
  } as FormularioPaso2;

  this.documentoPasoFinal = {
    ...(this.documentoPasoFinal || {}),
    documento_pdf_nombre:
      registro.documento_pdf_nombre
  };

  this.expedienteId = registro.id_expediente;
  this.paso1Valido = true;
  this.paso2Valido = true;

  setTimeout(() => {
    this.paso1Component?.precargarDatos?.(
      datosPaso1
    );

    this.paso2Component?.precargarDatos?.(
      datosPaso2
    );
  }, 100);
}


private convertirFechaApiADate(fecha: string | null | undefined): Date | undefined {
  if (!fecha) return undefined;

  return new Date(`${fecha}T00:00:00`);
}


private eliminarRegistroTemporal(): void {
  const uuid = localStorage.getItem('uuid_temporal_expediente');
  console.log('UUID para eliminar temporal:', uuid);

  if (!uuid) {
    console.log('No hay UUID temporal para eliminar');
    return;
  }

  const body: TemporalEliminaRequest = {
    uuid
  };

  console.log('DELETE temporal/elimina:', body);

  this.apiService
    .deleteTemporal<TemporalEliminaResponse>('temporal/elimina', body)
    .subscribe({
      next: (response) => {
        console.log('Temporal eliminado correctamente:', response.body);

        localStorage.removeItem('uuid_temporal_expediente');
      },
      error: (error) => {
        console.error('Error al eliminar temporal:', error);

        this.mostrarMensaje(
          'El expediente se guardó, pero no se pudo eliminar el registro temporal',
          'warning',
          5000
        );
      }
    });
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

  // regenerarPDF() {
  //   if (this.datosPaso1 && this.datosPaso2 && this.documentoPasoFinal) {
  //     this.pdfService.generarPDFExpediente(
  //       this.datosPaso1,
  //       this.datosPaso2,
  //       this.documentoPasoFinal,
  //       this.expedienteId || undefined
  //     );
  //     this.mostrarMensaje('PDF generado nuevamente', 'success', 3000);
  //   } else {
  //     this.mostrarMensaje('⚠️ No hay datos para generar el PDF', 'warning', 3000);
  //   }
  // }

  regenerarPDF() {
  if (this.datosPaso1 && this.datosPaso2) {
    this.pdfService.generarPDFExpediente(
      this.datosPaso1,
      this.datosPaso2,
      this.documentoPasoFinal ?? {},
      this.expedienteId || undefined
    );

    this.mostrarMensaje('PDF generado nuevamente', 'success', 3000);
  } else {
    this.mostrarMensaje('⚠️ No hay datos para generar el PDF', 'warning', 3000);
  }
}


  reiniciarFormulario() {
    this.isTransitioning = true;
    setTimeout(() => {
      // Limpiar todos los datos
      this.datosPaso1 = null;
      this.datosPaso2 = null;
      this.documentoPasoFinal = null;
      this.pasoActual = 0;
      this.expedienteGuardado = false;
      this.expedienteId = null;
      this.paso1Valido = false;
      this.isTransitioning = false;

      // Reiniciar componentes hijos si existen
      if (this.paso1Component) {
        this.paso1Component.reiniciarFormulario?.();
      }
      if (this.paso2Component) {
        this.paso2Component.reiniciarFormulario?.();
      }

      this.mostrarMensaje('Formulario reiniciado completamente', 'info');
    }, 300);
  }

  /**
   * Crear nuevo registro con datos precargados
   * Mantiene algunos datos del formulario anterior (remitente, tipo, etc.)
   * pero genera un nuevo número de expediente
   */
crearNuevoRegistro(): void {
  if (!this.datosPaso1 || !this.datosPaso2) {
    this.mostrarMensaje('No hay datos para reutilizar', 'warning');
    return;
  }

  this.insertarTemporal(true);
  }
}
