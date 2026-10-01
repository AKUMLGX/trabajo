import { Component, Inject, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { ExpedienteTlalcalli } from '../../../../domains/capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import { CustomFormFieldComponent } from '../../../../domains/capture/components/stepper-base/custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../../../../domains/capture/components/stepper-base/custom-textarea/custom-textarea.component';
import {
  ExpedienteDetalleCaptura,
  OficioAdjuntoExpediente,
  OficioAdjuntoGuardadoEvent,
  TabDocumentosDetalle,
} from '../../interfaces/expediente-detalle-captura.interface';
import { FileService } from '../../../../domains/services/file.service';
import { OficioAdjuntoFormComponent } from '../oficio-adjunto-form/oficio-adjunto-form.component';
import { OficiosAdjuntosStorageService } from '../../services/oficios-adjuntos-storage.service';
import { DateUtils } from '../../../../domains/capture/utils/date-utils';
import { extraerMensajeErrorHttp } from '../../../../domains/capture/utils/http-error.utils';
import {
  diagnosticoPdfWorker,
  prepararPdfWorker,
} from '../../../../domains/capture/utils/pdf-worker.utils';
import {
  normalizarTextoAPdfBlob,
  registrarErrorPdf,
} from '../../../../domains/capture/utils/pdf-bytes.utils';

type DocumentoActivo = 'inicial' | string | null;
type ModoPanelAdjuntos = 'ver' | 'agregar' | 'editar';

export interface ExpedienteDetalleModalData {
  expediente: ExpedienteTlalcalli;
}

@Component({
  selector: 'app-expediente-detalle-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    PdfViewerModule,
    OficioAdjuntoFormComponent,
    CustomFormFieldComponent,
    CustomTextareaComponent,
  ],
  templateUrl: './expediente-detalle-modal.component.html',
  styleUrl: './expediente-detalle-modal.component.css',
})
export class ExpedienteDetalleModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  readonly LIMITE_TEXTO = 100;

  detalle: ExpedienteDetalleCaptura | null = null;
  cargando = true;
  errorCarga = false;
  private textosExpandidos = new Set<string>();

  tabDocs: TabDocumentosDetalle = 'inicial';

  oficiosAdjuntos: OficioAdjuntoExpediente[] = [];
  cargandoOficios = false;
  modoPanelAdjuntos: ModoPanelAdjuntos = 'ver';
  adjuntoSeleccionadoId: string | null = null;
  editandoLocalId: string | null = null;
  guardandoOficio = false;
  mensajeOficioApi = '';

  editandoOficioPrincipal = false;
  guardandoOficioPrincipal = false;
  mensajeOficioPrincipal = '';
  mensajeOficioPrincipalTipo: 'exito' | 'error' | '' = '';

  readonly formOficioPrincipal = this.fb.nonNullable.group({
    num_oficio: ['', [Validators.required, Validators.minLength(1)]],
    fecha_documento: [''],
    fecha_recepcion: [''],
    fecha_vencimiento: [''],
    asunto: [''],
  });

  documentoActivo: DocumentoActivo = null;
  mostrarPdf = false;
  cargandoPdf = false;
  pdfUrl = '';
  errorVisorPdf: string | null = null;

  @ViewChild(OficioAdjuntoFormComponent) formularioOficio?: OficioAdjuntoFormComponent;
  private archivosLocalesAdjuntos = new Map<string, File>();
  private pdfSub?: { unsubscribe: () => void };

  constructor(
    public dialogRef: MatDialogRef<ExpedienteDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpedienteDetalleModalData,
    private expedienteService: ExpedienteTlalcalliService,
    private fileService: FileService,
    private oficiosStorage: OficiosAdjuntosStorageService
  ) {}

  ngOnInit(): void {
    this.configurarPdfWorker();
    this.expedienteService.obtenerDetalleCaptura(this.data.expediente).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        this.cargando = false;
        this.cargarOficiosAdjuntos();
        if (detalle.tiene_pdf) {
          this.seleccionarDocumentoInicial();
        }
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.pdfSub?.unsubscribe();
    this.liberarPdfUrl();
  }

  get oficioAdjuntoSeleccionado(): OficioAdjuntoExpediente | null {
    if (!this.adjuntoSeleccionadoId) {
      return null;
    }
    return this.oficiosAdjuntos.find((o) => o.localId === this.adjuntoSeleccionadoId) ?? null;
  }

  get mostrarFormularioOficio(): boolean {
    return this.modoPanelAdjuntos === 'agregar' || this.modoPanelAdjuntos === 'editar';
  }

  get editandoOficioEnServidor(): boolean {
    if (!this.editandoLocalId) {
      return false;
    }
    const oficio = this.oficiosAdjuntos.find((o) => o.localId === this.editandoLocalId);
    return oficio?.pendiente_endpoint === false;
  }

  get esExpedienteRework(): boolean {
    return this.detalle?.origen === 'rework';
  }

  get oficioPrincipalInvalido(): boolean {
    const control = this.formOficioPrincipal.get('num_oficio');
    return Boolean(control?.invalid && control.touched);
  }

  asuntoOficio(oficio: OficioAdjuntoExpediente): string | undefined {
    return oficio.asunto;
  }

  indiceOficioPorLocalId(localId: string): number {
    const indice = this.oficiosAdjuntos.findIndex((o) => o.localId === localId);
    return indice >= 0 ? indice + 1 : 0;
  }

  private claveStorageExpediente(): string | null {
    const id = this.detalle?.id_expediente ?? this.data.expediente?.id_expediente;
    const num = this.detalle?.expediente ?? this.data.expediente?.expediente;
    const clave = id ?? num;
    return clave != null && String(clave).trim() ? String(clave).trim() : null;
  }

  private cargarOficiosAdjuntos(): void {
    const idExpediente = this.detalle?.id_expediente;
    const esRework = this.detalle?.origen === 'rework';

    if (!idExpediente || !esRework) {
      this.cargarOficiosDesdeStorage();
      return;
    }

    this.cargandoOficios = true;
    this.expedienteService.cargarOficiosAdjuntosCompletos(idExpediente).subscribe({
      next: (desdeApi) => {
        const pendientes = this.obtenerOficiosPendientesLocales();
        this.oficiosAdjuntos = this.fusionarOficiosApiYLocales(desdeApi, pendientes);
        this.limpiarStorageDuplicadosServidor(desdeApi);
        this.cargandoOficios = false;
      },
      error: () => {
        this.cargarOficiosDesdeStorage();
        this.cargandoOficios = false;
      },
    });
  }

  private obtenerOficiosPendientesLocales(): OficioAdjuntoExpediente[] {
    const clave = this.claveStorageExpediente();
    if (!clave) {
      return [];
    }
    return this.oficiosStorage.cargarPendientesLocales(clave);
  }

  private fusionarOficiosApiYLocales(
    desdeApi: OficioAdjuntoExpediente[],
    pendientes: OficioAdjuntoExpediente[]
  ): OficioAdjuntoExpediente[] {
    const servidor = this.expedienteService.deduplicarOficiosAdjuntos(desdeApi);

    const localesExtra = pendientes.filter(
      (local) => !servidor.some((api) => this.expedienteService.esMismoOficioAdjunto(local, api))
    );

    return this.expedienteService.deduplicarOficiosAdjuntos([
      ...servidor,
      ...localesExtra.map((o) => ({
        ...o,
        localId: o.localId ?? this.generarLocalId(),
        pendiente_endpoint: true,
      })),
    ]);
  }

  /** Quita del localStorage los pendientes que ya existen en servidor. */
  private limpiarStorageDuplicadosServidor(desdeApi: OficioAdjuntoExpediente[]): void {
    if (desdeApi.length === 0) {
      return;
    }

    const clave = this.claveStorageExpediente();
    if (!clave) {
      return;
    }

    const pendientes = this.obtenerOficiosPendientesLocales();
    const conservar = pendientes.filter(
      (local) => !desdeApi.some((api) => this.expedienteService.esMismoOficioAdjunto(local, api))
    );

    if (conservar.length === 0) {
      this.oficiosStorage.eliminar(clave);
      return;
    }

    this.oficiosStorage.guardar(clave, conservar);
  }

  private cargarOficiosDesdeStorage(): void {
    const clave = this.claveStorageExpediente();
    if (!clave) {
      return;
    }

    const guardados = this.oficiosStorage.cargar(clave);
    if (guardados.length === 0) {
      return;
    }

    this.oficiosAdjuntos = guardados.map((oficio) => ({
      ...oficio,
      localId: oficio.localId ?? this.generarLocalId(),
      pendiente_endpoint: oficio.pendiente_endpoint ?? true,
    }));
  }

  private persistirOficiosEnStorage(): void {
    const clave = this.claveStorageExpediente();
    if (!clave) {
      return;
    }

    const soloPendientes = this.oficiosAdjuntos.filter((o) => o.pendiente_endpoint !== false);
    if (soloPendientes.length === 0) {
      this.oficiosStorage.eliminar(clave);
      return;
    }

    this.oficiosStorage.guardar(clave, soloPendientes);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  iniciarEditarOficioPrincipal(): void {
    if (!this.detalle || !this.esExpedienteRework) {
      return;
    }

    this.formOficioPrincipal.patchValue({
      num_oficio: this.tieneValor(this.detalle.oficio) ? this.detalle.oficio.trim() : '',
      fecha_documento: DateUtils.toInputDate(this.detalle.fecha_documento) ?? '',
      fecha_recepcion: DateUtils.toInputDate(this.detalle.fecha_recepcion) ?? '',
      fecha_vencimiento: DateUtils.toInputDate(this.detalle.fecha_vencimiento) ?? '',
      asunto: this.tieneValor(this.detalle.asunto) ? this.detalle.asunto.trim() : '',
    });

    this.editandoOficioPrincipal = true;
    this.mensajeOficioPrincipal = '';
    this.mensajeOficioPrincipalTipo = '';
  }

  cancelarEditarOficioPrincipal(): void {
    this.editandoOficioPrincipal = false;
    this.formOficioPrincipal.reset();
    this.mensajeOficioPrincipal = '';
    this.mensajeOficioPrincipalTipo = '';
  }

  guardarOficioPrincipal(): void {
    if (!this.detalle || !this.esExpedienteRework) {
      return;
    }

    this.formOficioPrincipal.markAllAsTouched();
    if (this.formOficioPrincipal.invalid) {
      return;
    }

    const valores = this.formOficioPrincipal.getRawValue();
    const payload = this.expedienteService.construirPayloadReworkInicialOficio({
      num_expediente: this.detalle.expediente,
      num_oficio: valores.num_oficio,
      fecha_documento: valores.fecha_documento,
      fecha_recepcion: valores.fecha_recepcion,
      fecha_vencimiento: valores.fecha_vencimiento,
      asunto: valores.asunto,
    });

    this.guardandoOficioPrincipal = true;
    this.mensajeOficioPrincipal = '';
    this.mensajeOficioPrincipalTipo = '';

    this.expedienteService.actualizarExpedienteReworkInicialOficio(payload).subscribe({
      next: (respuesta) => {
        this.recargarDetalleExpediente(() => {
          this.editandoOficioPrincipal = false;
          this.guardandoOficioPrincipal = false;
          this.mensajeOficioPrincipal = respuesta.mensaje;
          this.mensajeOficioPrincipalTipo = 'exito';
        });
      },
      error: (error) => {
        this.guardandoOficioPrincipal = false;
        this.mensajeOficioPrincipal = extraerMensajeErrorHttp(
          error,
          'No se pudo actualizar el oficio del expediente.'
        );
        this.mensajeOficioPrincipalTipo = 'error';
      },
    });
  }

  private recargarDetalleExpediente(alTerminar?: () => void): void {
    this.expedienteService.obtenerDetalleCaptura(this.data.expediente).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        alTerminar?.();
      },
      error: () => {
        this.guardandoOficioPrincipal = false;
        this.mensajeOficioPrincipal =
          'Los datos se guardaron, pero no se pudo recargar el detalle. Cierre y vuelva a abrir el modal.';
        this.mensajeOficioPrincipalTipo = 'error';
      },
    });
  }

  valorMostrar(valor: string | null | undefined): string {
    if (!this.tieneValor(valor)) {
      return '-';
    }
    return valor!.trim();
  }

  numeroExpedienteHeader(): string {
    if (this.detalle) {
      return this.valorMostrar(this.detalle.expediente);
    }
    return this.valorMostrar(this.data.expediente?.expediente);
  }

  tieneValor(valor: string | null | undefined): boolean {
    if (valor == null) {
      return false;
    }

    const normalizado = valor.trim();
    if (!normalizado) {
      return false;
    }

    const vacios = new Set(['n/a', '-', '—', 'sin dato', 'no aplica', 'null', 'undefined']);
    return !vacios.has(normalizado.toLowerCase());
  }

  necesitaTruncado(texto: string | null | undefined, limite = this.LIMITE_TEXTO): boolean {
    return Boolean(texto && texto.length > limite);
  }

  truncarTexto(texto: string, limite = this.LIMITE_TEXTO): string {
    if (texto.length <= limite) {
      return texto;
    }
    return `${texto.substring(0, limite).trimEnd()}…`;
  }

  textoVisible(clave: string, texto: string): string {
    return this.estaExpandido(clave) || !this.necesitaTruncado(texto)
      ? texto
      : this.truncarTexto(texto);
  }

  estaExpandido(clave: string): boolean {
    return this.textosExpandidos.has(clave);
  }

  toggleExpandido(clave: string): void {
    if (this.textosExpandidos.has(clave)) {
      this.textosExpandidos.delete(clave);
      return;
    }
    this.textosExpandidos.add(clave);
  }

  cambiarTabDocs(tab: TabDocumentosDetalle): void {
    this.tabDocs = tab;
    this.cerrarFormularioOficio(false);

    if (tab === 'inicial' && this.detalle?.tiene_pdf) {
      this.seleccionarDocumentoInicial();
      return;
    }

    if (tab === 'adjuntos' && this.oficiosAdjuntos.length > 0) {
      const primero = this.oficiosAdjuntos[0];
      if (primero.localId) {
        this.seleccionarOficioAdjuntoPorId(primero.localId);
      }
    } else if (tab === 'adjuntos') {
      this.limpiarVisor();
      this.adjuntoSeleccionadoId = null;
      this.documentoActivo = null;
    }
  }

  iniciarAgregarOficio(): void {
    this.tabDocs = 'adjuntos';
    this.modoPanelAdjuntos = 'agregar';
    this.editandoLocalId = null;
    this.mensajeOficioApi = '';
    this.limpiarVisor();
    setTimeout(() => this.formularioOficio?.resetFormulario());
  }

  iniciarEditarOficio(localId: string, event?: Event): void {
    event?.stopPropagation();

    const oficio = this.oficiosAdjuntos.find((o) => o.localId === localId);
    if (!oficio) {
      return;
    }

    this.tabDocs = 'adjuntos';
    this.modoPanelAdjuntos = 'editar';
    this.editandoLocalId = localId;
    this.adjuntoSeleccionadoId = localId;
    this.mensajeOficioApi = '';
    this.limpiarVisor();
    setTimeout(() => this.formularioOficio?.cargarParaEdicion(oficio));
  }

  eliminarOficioAdjunto(localId: string, event?: Event): void {
    event?.stopPropagation();

    const oficio = this.oficiosAdjuntos.find((o) => o.localId === localId);
    if (!oficio) {
      return;
    }

    const confirmar = confirm(`¿Eliminar el oficio «${oficio.num_oficio}»?`);
    if (!confirmar) {
      return;
    }

    const quitarDeLista = (mensaje?: string): void => {
      this.archivosLocalesAdjuntos.delete(oficio.nombre_archivo);
      this.oficiosAdjuntos = this.oficiosAdjuntos.filter((o) => o.localId !== localId);
      this.persistirOficiosEnStorage();

      if (mensaje) {
        this.mensajeOficioApi = mensaje;
      }

      if (this.editandoLocalId === localId) {
        this.cerrarFormularioOficio(false);
      }

      if (this.adjuntoSeleccionadoId === localId) {
        const siguiente = this.oficiosAdjuntos[0];
        if (siguiente?.localId) {
          this.seleccionarOficioAdjuntoPorId(siguiente.localId);
        } else {
          this.adjuntoSeleccionadoId = null;
          this.documentoActivo = null;
          this.limpiarVisor();
        }
      }
    };

    const idExpediente = this.detalle?.id_expediente;
    const idArchivo = oficio.id_archivo ?? oficio.id;

    if (oficio.pendiente_endpoint !== false && idExpediente && idArchivo) {
      this.expedienteService.eliminarOficioAdjuntoRework(idExpediente, idArchivo).subscribe({
        next: () => {
          this.expedienteService.cargarOficiosAdjuntosCompletos(idExpediente).subscribe({
            next: (listado) => {
              this.oficiosAdjuntos = listado.map((o) => ({
                ...o,
                localId: o.localId ?? (o.id_archivo != null ? `api-${o.id_archivo}` : this.generarLocalId()),
              }));
              this.persistirOficiosEnStorage();
              this.limpiarStorageDuplicadosServidor(listado);

              const numExpediente = this.detalle?.expediente;
              if (numExpediente && listado.length > 0) {
                this.expedienteService
                  .sincronizarMetadatosOficiosAdjuntosRework(numExpediente, this.oficiosAdjuntos)
                  .subscribe({ error: () => undefined });
              }

              if (this.adjuntoSeleccionadoId === localId) {
                const siguiente = this.oficiosAdjuntos[0];
                if (siguiente?.localId) {
                  this.seleccionarOficioAdjuntoPorId(siguiente.localId);
                } else {
                  this.adjuntoSeleccionadoId = null;
                  this.limpiarVisor();
                }
              }
              this.mensajeOficioApi = 'Oficio eliminado del servidor.';
            },
            error: () => quitarDeLista('Oficio eliminado del servidor.'),
          });
        },
        error: (error) => {
          if (error?.status === 404) {
            quitarDeLista('Eliminado de la lista. DELETE en servidor pendiente (Max).');
            return;
          }
          quitarDeLista('No se pudo eliminar en servidor. Se quitó solo de la vista.');
        },
      });
      return;
    }

    quitarDeLista();
  }

  cancelarFormularioOficio(): void {
    this.cerrarFormularioOficio(true);
  }

  private cerrarFormularioOficio(restaurarSeleccion: boolean): void {
    const idPrevio = this.adjuntoSeleccionadoId;
    this.modoPanelAdjuntos = 'ver';
    this.editandoLocalId = null;
    this.mensajeOficioApi = '';
    this.formularioOficio?.resetFormulario();

    if (restaurarSeleccion && idPrevio) {
      this.seleccionarOficioAdjuntoPorId(idPrevio);
    }
  }

  onOficioAdjuntoGuardado(evento: OficioAdjuntoGuardadoEvent): void {
    if (evento.localId) {
      this.aplicarEdicionOficio(evento);
      return;
    }

    const { oficio, archivo } = evento;
    if (!archivo) {
      return;
    }

    this.guardandoOficio = true;
    this.archivosLocalesAdjuntos.set(archivo.name, archivo);

    const idExpediente = this.detalle?.id_expediente;
    const localId = this.generarLocalId();
    const oficioConId = {
      ...oficio,
      localId,
    };

    if (idExpediente) {
      this.expedienteService.guardarOficioAdjuntoRework(idExpediente, oficioConId, archivo).subscribe({
        next: (listado) => {
          this.aplicarListadoOficiosServidor(listado, oficioConId);
        },
        error: (error) => {
          const es404 = error?.status === 404;
          this.finalizarOficioLocal({
            ...oficioConId,
            pendiente_endpoint: true,
          });
          if (es404) {
            this.mensajeOficioApi =
              'PUT expedientes_rework/{id}/oficios no disponible (404). Oficio guardado solo en esta sesión.';
          }
        },
      });
      return;
    }

    this.finalizarOficioLocal({ ...oficioConId, pendiente_endpoint: true });
  }

  private aplicarEdicionOficio(evento: OficioAdjuntoGuardadoEvent): void {
    const { oficio, archivo, localId } = evento;
    if (!localId) {
      return;
    }

    const indice = this.oficiosAdjuntos.findIndex((o) => o.localId === localId);
    if (indice < 0) {
      return;
    }

    const anterior = this.oficiosAdjuntos[indice];
    const idExpediente = this.detalle?.id_expediente;
    const idArchivo = anterior.id_archivo ?? anterior.id;
    const numExpediente = this.detalle?.expediente;
    const enServidor = anterior.pendiente_endpoint === false;

    if (archivo) {
      this.archivosLocalesAdjuntos.delete(anterior.nombre_archivo);
      this.archivosLocalesAdjuntos.set(archivo.name, archivo);
    }

    const actualizadoBase: OficioAdjuntoExpediente = {
      ...anterior,
      ...oficio,
      localId,
      nombre_archivo: archivo?.name ?? anterior.nombre_archivo,
      id_archivo: idArchivo,
    };

    const listaActualizada = this.oficiosAdjuntos.map((o, i) =>
      i === indice ? actualizadoBase : o
    );

    const finalizarEdicion = (actualizado: OficioAdjuntoExpediente, mensaje?: string): void => {
      this.oficiosAdjuntos = this.oficiosAdjuntos.map((o, i) => (i === indice ? actualizado : o));
      this.persistirOficiosEnStorage();
      this.modoPanelAdjuntos = 'ver';
      this.editandoLocalId = null;
      this.guardandoOficio = false;
      this.mensajeOficioApi = mensaje ?? '';
      this.formularioOficio?.resetFormulario();
      this.seleccionarOficioAdjuntoPorId(localId, actualizado);
    };

    const sincronizarMetadatos = (base: OficioAdjuntoExpediente, mensajePdf?: string): void => {
      if (!enServidor || !numExpediente) {
        finalizarEdicion(
          { ...base, pendiente_endpoint: base.pendiente_endpoint ?? true },
          mensajePdf ?? 'Cambios guardados en esta sesión.'
        );
        return;
      }

      this.guardandoOficio = true;
      this.expedienteService
        .sincronizarMetadatosOficiosAdjuntosRework(numExpediente, listaActualizada)
        .subscribe({
          next: (respuesta) => {
            finalizarEdicion(
              { ...base, pendiente_endpoint: false },
              mensajePdf ?? respuesta.mensaje ?? 'Oficio actualizado en servidor.'
            );
          },
          error: () => {
            finalizarEdicion(
              { ...base, pendiente_endpoint: true },
              'No se pudieron guardar los datos en servidor.'
            );
          },
        });
    };

    if (archivo && idExpediente && idArchivo && enServidor) {
      this.guardandoOficio = true;
      this.expedienteService
        .actualizarOficioAdjuntoPdfRework(idExpediente, idArchivo, archivo)
        .subscribe({
          next: (respuesta) => {
            sincronizarMetadatos(
              { ...actualizadoBase, pendiente_endpoint: false, nombre_archivo: archivo.name },
              respuesta.mensaje || 'PDF y datos actualizados en servidor.'
            );
          },
          error: () => {
            sincronizarMetadatos(actualizadoBase, 'PDF no actualizado; se intentó guardar los datos.');
          },
        });
      return;
    }

    sincronizarMetadatos(actualizadoBase);
  }

  /** Tras PUT exitoso: reemplaza la lista con el listado completo del servidor. */
  private aplicarListadoOficiosServidor(
    desdeApi: OficioAdjuntoExpediente[],
    ref?: Pick<OficioAdjuntoExpediente, 'num_oficio' | 'nombre_archivo'>
  ): void {
    const pendientes = this.obtenerOficiosPendientesLocales();
    const fusionados = this.fusionarOficiosApiYLocales(desdeApi, pendientes).map((o) => ({
      ...o,
      localId: o.localId ?? (o.id_archivo != null ? `api-${o.id_archivo}` : this.generarLocalId()),
    }));

    this.oficiosAdjuntos = fusionados;
    this.persistirOficiosEnStorage();
    this.limpiarStorageDuplicadosServidor(desdeApi);
    this.tabDocs = 'adjuntos';
    this.modoPanelAdjuntos = 'ver';
    this.guardandoOficio = false;
    this.mensajeOficioApi = 'Oficio guardado en servidor.';
    this.formularioOficio?.resetFormulario();

    const nombreRef = ref?.nombre_archivo?.trim().toLowerCase();
    const seleccionado =
      (nombreRef &&
        fusionados.find(
          (o) => o.nombre_archivo?.trim().toLowerCase() === nombreRef
        )) ||
      (ref?.num_oficio &&
        fusionados.find(
          (o) =>
            this.expedienteService.esMismoOficioAdjunto(o, {
              num_oficio: ref.num_oficio,
              nombre_archivo: ref.nombre_archivo ?? '',
            })
        )) ||
      fusionados[fusionados.length - 1];

    if (seleccionado?.localId) {
      this.seleccionarOficioAdjuntoPorId(seleccionado.localId, seleccionado);
    }
  }

  private finalizarOficioLocal(oficioLocal: OficioAdjuntoExpediente): void {
    this.oficiosAdjuntos = this.expedienteService.deduplicarOficiosAdjuntos([
      oficioLocal,
      ...this.oficiosAdjuntos,
    ]);
    this.persistirOficiosEnStorage();
    this.tabDocs = 'adjuntos';
    this.modoPanelAdjuntos = 'ver';
    this.guardandoOficio = false;
    this.mensajeOficioApi = oficioLocal.pendiente_endpoint
      ? 'Oficio agregado en vista local. PUT no disponible o falló; no se persistió en servidor.'
      : 'Oficio guardado en servidor.';
    this.formularioOficio?.resetFormulario();

    if (oficioLocal.localId) {
      this.seleccionarOficioAdjuntoPorId(oficioLocal.localId, oficioLocal);
    }
  }

  private generarLocalId(): string {
    return `adj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  formatearFechaDetalle(fecha: string | null | undefined): string {
    return DateUtils.formatearFechaDisplay(fecha);
  }

  formatearFechaOficio(fecha: string | null | undefined): string {
    return DateUtils.formatearFechaDisplay(fecha);
  }

  resumenFechasOficio(oficio: OficioAdjuntoExpediente): string {
    const partes: string[] = [];

    if (oficio.fecha_documento?.trim()) {
      partes.push(`Doc. ${this.formatearFechaOficio(oficio.fecha_documento)}`);
    }
    if (oficio.fecha_recepcion?.trim()) {
      partes.push(`Rec. ${this.formatearFechaOficio(oficio.fecha_recepcion)}`);
    }
    if (oficio.fecha_vencimiento?.trim()) {
      partes.push(`Vence ${this.formatearFechaOficio(oficio.fecha_vencimiento)}`);
    }

    return partes.length > 0 ? partes.join(' · ') : 'Sin fechas';
  }

  seleccionarDocumentoInicial(): void {
    if (!this.detalle) {
      return;
    }

    this.documentoActivo = 'inicial';
    this.adjuntoSeleccionadoId = null;

    if (this.detalle.origen === 'rework' && this.detalle.id_archivo_pdf) {
      this.cargarPdfRework(this.detalle.id_archivo_pdf);
      return;
    }

    if (!this.detalle.tiene_pdf || !this.detalle.documento_pdf_nombre) {
      return;
    }

    this.cargarPdfRemoto(this.detalle.documento_pdf_nombre);
  }

  seleccionarOficioAdjuntoPorId(localId: string, oficio?: OficioAdjuntoExpediente): void {
    if (this.modoPanelAdjuntos !== 'ver') {
      return;
    }

    const item = oficio ?? this.oficiosAdjuntos.find((o) => o.localId === localId);
    if (!item) {
      return;
    }

    this.adjuntoSeleccionadoId = localId;
    this.documentoActivo = localId;

    const archivoLocal = this.archivosLocalesAdjuntos.get(item.nombre_archivo);
    if (archivoLocal) {
      this.cargarPdfLocal(archivoLocal);
      return;
    }

    if (item.id_archivo) {
      this.cargarPdfRework(item.id_archivo);
      return;
    }

    this.limpiarVisor();
    this.mostrarPdf = false;
  }

  descargarDocumentoActivo(): void {
    if (!this.detalle) {
      return;
    }

    if (this.documentoActivo === 'inicial' && this.detalle.tiene_pdf) {
      if (this.detalle.origen === 'rework' && this.detalle.id_archivo_pdf) {
        this.expedienteService
          .descargarPdfReworkArchivo(this.detalle.id_archivo_pdf)
          .subscribe({
            next: (blob) => this.descargarBlob(blob, this.detalle!.documento_pdf_nombre || 'documento.pdf'),
            error: (error) =>
              registrarErrorPdf('Descarga del documento inicial', error),
          });
        return;
      }

      if (this.detalle.documento_pdf_nombre) {
        const oficio = this.obtenerFolioPdf();
        if (!oficio) {
          return;
        }
        this.fileService.downloadPdfFileBandejaAtencion(
          oficio,
          this.detalle.documento_pdf_nombre,
          this.detalle.documento_pdf_nombre
        );
      }
      return;
    }

    if (typeof this.documentoActivo === 'string' && this.documentoActivo !== 'inicial') {
      const oficio = this.oficiosAdjuntos.find((o) => o.localId === this.documentoActivo);
      if (!oficio) {
        return;
      }

      const archivo = this.archivosLocalesAdjuntos.get(oficio.nombre_archivo);
      if (archivo) {
        const url = URL.createObjectURL(archivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = archivo.name;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      if (oficio.id_archivo) {
        this.expedienteService.descargarPdfReworkArchivo(oficio.id_archivo).subscribe({
          next: (blob) => this.descargarBlob(blob, oficio.nombre_archivo || 'documento.pdf'),
          error: (error) =>
            registrarErrorPdf(`Descarga del oficio adjunto ${oficio.id_archivo}`, error),
        });
      }
    }
  }

  private obtenerFolioPdf(): string | null {
    if (!this.detalle) {
      return null;
    }
    const oficio =
      this.detalle.oficio !== '-' ? this.detalle.oficio : this.data.expediente.oficio;
    return oficio ?? null;
  }

  private cargarPdfRemoto(nombreArchivo: string): void {
    const oficio = this.obtenerFolioPdf();
    if (!oficio) {
      return;
    }

    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = true;

    this.pdfSub?.unsubscribe();
    this.pdfSub = this.fileService.pdfUpdated.subscribe((pdfBase64: string) => {
      try {
        this.pdfUrl = this.base64ToObjectUrl(pdfBase64);
        this.mostrarPdf = true;
        this.cargandoPdf = false;
        this.pdfSub?.unsubscribe();
      } catch (error) {
        registrarErrorPdf('Modal detalle: getPdf no devolvió un PDF válido', error);
        this.errorVisorPdf =
          error instanceof Error ? error.message : 'Respuesta de PDF no reconocida';
        this.cargandoPdf = false;
        this.mostrarPdf = false;
      }
    });

    this.fileService.updatePdfFile(oficio, nombreArchivo);
  }

  private cargarPdfRework(idArchivo: number): void {
    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = true;

    this.expedienteService.descargarPdfReworkArchivo(idArchivo).subscribe({
      next: (blob) => {
        this.pdfUrl = URL.createObjectURL(blob);
        this.mostrarPdf = true;
        this.cargandoPdf = false;
      },
      error: (error) => {
        registrarErrorPdf(`Modal detalle: no se pudo cargar el PDF ${idArchivo}`, error);
        this.errorVisorPdf =
          error instanceof Error ? error.message : 'No se pudo obtener el PDF del servidor';
        this.cargandoPdf = false;
        this.mostrarPdf = false;
      },
    });
  }

  private descargarBlob(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  }

  private cargarPdfLocal(archivo: File): void {
    this.liberarPdfUrl();
    this.cargandoPdf = true;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const blob = new Blob([buffer], { type: 'application/pdf' });
      this.pdfUrl = URL.createObjectURL(blob);
      this.mostrarPdf = true;
      this.cargandoPdf = false;
    };
    reader.onerror = () => {
      this.cargandoPdf = false;
      this.mostrarPdf = false;
    };
    reader.readAsArrayBuffer(archivo);
  }

  private base64ToObjectUrl(pdfBase64: string): string {
    return URL.createObjectURL(normalizarTextoAPdfBlob(pdfBase64));
  }

  private limpiarVisor(): void {
    this.liberarPdfUrl();
    this.mostrarPdf = false;
    this.cargandoPdf = false;
  }

  private liberarPdfUrl(): void {
    this.errorVisorPdf = null;
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }
  }

  private configurarPdfWorker(): void {
    void prepararPdfWorker();
  }

  /** Expone el error real de PDF.js en vez de dejar el visor en blanco. */
  onErrorVisor(error: unknown): void {
    this.errorVisorPdf = error instanceof Error ? error.message : String(error);
    this.cargandoPdf = false;
    console.error(
      '[expediente-detalle-modal] Error del visor PDF:',
      this.errorVisorPdf,
      diagnosticoPdfWorker()
    );
  }
}
