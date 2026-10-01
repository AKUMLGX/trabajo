import { inject, Injectable } from '@angular/core';
import {
  map,
  Observable,
  catchError,
  throwError,
  of,
  firstValueFrom,
  switchMap,
} from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { ExpedienteTlalcalliService } from './expediente-tlalcalli.service';
import {
  TemporalEliminaResponse,
  TemporalInsertResponse,
  TemporalRegistroResponse,
  TemporalUpdateRequest,
} from '../interfaces/temporal.interface';

export type EntradaCapturaModo = 'formulario_limpio' | 'recuperar_borrador';

/**
 * Keys de localStorage usadas por el flujo de borrador de captura.
 * No incluye sessionInfo, generales_creadas_usuario, ultimo_expediente, etc.
 */
export const CAPTURE_DRAFT_STORAGE_KEYS_DOC: Record<string, string> = {
  uuid_temporal_expediente:
    'UUID del borrador temporal en backend (auto-guardado). Causa principal de precarga en ventana normal.',
  captura_completada:
    'Marca "1" tras guardar expediente exitosamente; bloquea recuperación del borrador.',
  tlalcalli_captura_storage_version:
    'Versión del esquema de storage; al cambiar se purgan keys legacy de borrador.',
  tlalcalli_form_borrador_paso1: 'Legacy (deshabilitado): borrador local paso 1.',
  tlalcalli_form_borrador_paso2: 'Legacy (deshabilitado): borrador local paso 2.',
  tlalcalli_form_borrador_paso3: 'Legacy (deshabilitado): borrador local paso 3.',
};

@Injectable({ providedIn: 'root' })
export class TemporalExpedienteService {
  /** UUID del borrador persistido en backend (Max: temporal/insert) */
  static readonly UUID_STORAGE_KEY = 'uuid_temporal_expediente';
  /** Marca sesión de captura finalizada con éxito (evita recuperar borrador obsoleto). */
  static readonly CAPTURA_COMPLETADA_KEY = 'captura_completada';
  /** Versión del esquema; incrementar fuerza limpieza de keys legacy al entrar a captura. */
  static readonly STORAGE_VERSION_KEY = 'tlalcalli_captura_storage_version';
  static readonly STORAGE_VERSION = '4';
  private static storageKeysLogged = false;
  /** UUID pendiente en memoria (retomar explícito); no se persiste en localStorage al entrar. */
  private uuidBorradorPendiente: string | null = null;

  private static readonly LEGACY_DRAFT_PREFIXES = [
    'tlalcalli_form_borrador_',
    'tlalcalli_form_historial_',
  ] as const;

  private static readonly LEGACY_DRAFT_KEYS = [
    'tlalcalli_form_borrador_paso1',
    'tlalcalli_form_borrador_paso2',
    'tlalcalli_form_borrador_paso3',
  ] as const;

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private readonly apiService = inject(ApiService);
  private readonly expedienteService = inject(ExpedienteTlalcalliService);
  private autoGuardadoBloqueado = false;
  /** Flag en memoria del singleton: la captura acaba de guardarse en esta sesión SPA. */
  private capturaFinalizadaReciente = false;

  constructor() {
    this.limpiarBorradoresLegacyOneShot();
  }

  /**
   * Limpieza one-shot de sesiones viejas (constructor / primer uso del singleton).
   * No toca sessionInfo ni catálogos creados por el usuario.
   */
  private limpiarBorradoresLegacyOneShot(): void {
    try {
      localStorage.removeItem('tlalcalli_form_borrador_paso1');
      localStorage.removeItem('tlalcalli_form_borrador_paso2');
      localStorage.removeItem('tlalcalli_form_borrador_paso3');

      if (this.getStoredUuid() && this.tieneMarcaCapturaCompletada()) {
        this.clearStoredUuid();
      }
    } catch {
      // localStorage no disponible (modo restringido)
    }
  }

  /** Log único de keys persistentes que pueden precargar el formulario. */
  logKeysCapturaOnce(): void {
    if (TemporalExpedienteService.storageKeysLogged) {
      return;
    }
    TemporalExpedienteService.storageKeysLogged = true;

    try {
      const relevantes: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) {
          continue;
        }
        if (/^(uuid|captura|tlalcalli_form|temporal)/i.test(key)) {
          relevantes.push(`${key}=${localStorage.getItem(key)}`);
        }
      }
      console.warn('[Captura] keys persistentes (una vez):', relevantes);
    } catch {
      console.warn('[Captura] keys persistentes: no se pudo leer localStorage');
    }
  }

  getStoredUuid(): string | null {
    return localStorage.getItem(TemporalExpedienteService.UUID_STORAGE_KEY);
  }

  setStoredUuid(uuid: string): void {
    localStorage.setItem(TemporalExpedienteService.UUID_STORAGE_KEY, uuid);
  }

  clearStoredUuid(): void {
    localStorage.removeItem(TemporalExpedienteService.UUID_STORAGE_KEY);
  }

  bloquearAutoGuardado(): void {
    this.autoGuardadoBloqueado = true;
  }

  permitirAutoGuardado(): void {
    this.autoGuardadoBloqueado = false;
  }

  isAutoGuardadoPermitido(): boolean {
    return !this.autoGuardadoBloqueado;
  }

  /**
   * Elimina UUID, keys legacy y borradores locales.
   * @param consumirMarcaCaptura Si true, también quita captura_completada.
   */
  limpiarStorageBorradorCaptura(consumirMarcaCaptura = false): void {
    this.clearStoredUuid();
    this.purgarKeysLegacyBorrador();

    for (const key of TemporalExpedienteService.LEGACY_DRAFT_KEYS) {
      localStorage.removeItem(key);
    }

    if (consumirMarcaCaptura) {
      this.consumirMarcaCapturaCompletada();
    }
  }

  private purgarKeysLegacyBorrador(): void {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) {
        continue;
      }

      if (
        TemporalExpedienteService.LEGACY_DRAFT_PREFIXES.some((prefix) =>
          key.startsWith(prefix)
        )
      ) {
        keys.push(key);
      }
    }

    keys.forEach((key) => localStorage.removeItem(key));
  }

  /** Bump de versión: purga legacy y UUID residual (sesiones anteriores a captura_completada). */
  migrarStorageCapturaSiNecesario(): void {
    const versionActual = localStorage.getItem(
      TemporalExpedienteService.STORAGE_VERSION_KEY
    );

    if (versionActual === TemporalExpedienteService.STORAGE_VERSION) {
      return;
    }

    this.purgarKeysLegacyBorrador();
    for (const key of TemporalExpedienteService.LEGACY_DRAFT_KEYS) {
      localStorage.removeItem(key);
    }

    this.clearStoredUuid();

    localStorage.setItem(
      TemporalExpedienteService.STORAGE_VERSION_KEY,
      TemporalExpedienteService.STORAGE_VERSION
    );
  }

  /**
   * Evalúa storage al entrar a /layout/capture.
   * Siempre inicia formulario limpio; un UUID válido queda solo en memoria para retomar explícito.
   * NUNCA consume captura_completada (eso solo ocurre al insertar un borrador nuevo).
   */
  async prepararEntradaCaptura(): Promise<EntradaCapturaModo> {
    this.logKeysCapturaOnce();
    this.limpiarBorradoresLegacyOneShot();
    this.migrarStorageCapturaSiNecesario();
    this.bloquearAutoGuardado();
    this.uuidBorradorPendiente = null;

    const uuid = this.getStoredUuid();
    const uuidValido = this.isValidStoredUuid(uuid);

    if (this.isCapturaRecienCompletada()) {
      this.limpiarStorageBorradorCaptura(false);
      return 'formulario_limpio';
    }

    if (uuidValido) {
      this.uuidBorradorPendiente = uuid;
      this.clearStoredUuid();
      return 'formulario_limpio';
    }

    this.limpiarStorageBorradorCaptura(false);
    return 'formulario_limpio';
  }

  /** Hay borrador en backend pendiente de retomar (solo tras prepararEntradaCaptura). */
  hayBorradorRecuperable(): boolean {
    return this.isValidStoredUuid(this.uuidBorradorPendiente);
  }

  obtenerUuidBorradorPendiente(): string | null {
    return this.uuidBorradorPendiente;
  }

  /** Activa retomar: restaura UUID en storage para auto-guardado posterior. */
  activarRetomarBorrador(): string | null {
    if (!this.isValidStoredUuid(this.uuidBorradorPendiente)) {
      return null;
    }

    this.setStoredUuid(this.uuidBorradorPendiente);
    const uuid = this.uuidBorradorPendiente;
    this.uuidBorradorPendiente = null;
    return uuid;
  }

  /** Descarta borrador pendiente en memoria (sin tocar localStorage). */
  descartarBorradorPendiente(): void {
    const uuid = this.uuidBorradorPendiente;
    this.uuidBorradorPendiente = null;

    if (this.isValidStoredUuid(uuid)) {
      void this.eliminarRegistroTemporal(uuid);
    }
  }

  /** Sync: bloquea auto-guardado, quita UUID y marca captura_completada. */
  marcarCapturaCompletada(): void {
    this.capturaFinalizadaReciente = true;
    this.uuidBorradorPendiente = null;
    this.bloquearAutoGuardado();
    this.limpiarStorageBorradorCaptura(false);
    localStorage.setItem(TemporalExpedienteService.CAPTURA_COMPLETADA_KEY, '1');
  }

  /**
   * Auto-recuperación deshabilitada: el borrador solo se carga con retomar explícito.
   */
  debeRecuperarBorradorAlEntrar(): boolean {
    return false;
  }

  /**
   * Tras captura exitosa: PRIMERO marca + quita UUID (sync), LUEGO DELETE temporal.
   */
  async finalizarCapturaExitosa(): Promise<void> {
    const uuid = this.getStoredUuid();
    this.marcarCapturaCompletada();

    if (this.isValidStoredUuid(uuid)) {
      await this.eliminarRegistroTemporal(uuid);
    }
  }

  /**
   * Elimina registro temporal en backend. Reintenta una vez si falla.
   * @returns true si DELETE respondió OK o no había UUID válido.
   */
  async eliminarRegistroTemporal(uuid?: string | null): Promise<boolean> {
    const id = uuid ?? this.getStoredUuid();

    if (!this.isValidStoredUuid(id)) {
      return true;
    }

    const intentarEliminar = (): Promise<boolean> =>
      firstValueFrom(
        this.deleteTemporal(id).pipe(
          map(() => true),
          catchError(() => of(false))
        )
      );

    if (await intentarEliminar()) {
      return true;
    }

    return intentarEliminar();
  }

  /**
   * Al entrar tras captura completada: elimina borrador huérfano en BD y limpia storage.
   * No consume la marca captura_completada (lo hace el stepper).
   */
  async limpiarBorradorHuerfanoPostCaptura(): Promise<void> {
    this.bloquearAutoGuardado();
    const uuid = this.getStoredUuid();

    if (this.isValidStoredUuid(uuid)) {
      await this.eliminarRegistroTemporal(uuid);
    }

    this.limpiarStorageBorradorCaptura(false);
  }

  private tieneMarcaCapturaCompletada(): boolean {
    return !!localStorage.getItem(TemporalExpedienteService.CAPTURA_COMPLETADA_KEY);
  }

  isCapturaRecienCompletada(): boolean {
    return this.capturaFinalizadaReciente || this.tieneMarcaCapturaCompletada();
  }

  consumirMarcaCapturaCompletada(): void {
    localStorage.removeItem(TemporalExpedienteService.CAPTURA_COMPLETADA_KEY);
    this.capturaFinalizadaReciente = false;
  }

  private puedePersistirUuid(): boolean {
    return this.isAutoGuardadoPermitido();
  }

  private persistirUuidSiPermitido(uuid: string | null): string | null {
    if (uuid && this.puedePersistirUuid()) {
      this.setStoredUuid(uuid);
    }
    return uuid;
  }

  /** Valida formato UUID antes de llamar al backend. */
  isValidStoredUuid(uuid: string | null | undefined): uuid is string {
    return !!uuid && TemporalExpedienteService.UUID_REGEX.test(uuid.trim());
  }

  /** UUID en localStorage apunta a un registro que ya no existe en BD. */
  isRegistroTemporalInvalido(error: unknown): boolean {
    const httpError = error as {
      status?: number;
      message?: string;
      error?: { mensaje?: string; message?: string; codigo?: number } | string;
    };

    const backendError =
      typeof httpError?.error === 'string'
        ? httpError.error
        : httpError?.error?.mensaje ?? httpError?.error?.message;

    const mensaje = String(backendError ?? httpError?.message ?? '').toLowerCase();

    if (httpError?.status === 404) {
      return true;
    }

    return (
      httpError?.status === 500 &&
      (mensaje.includes('record not found') ||
        mensaje.includes('no encontrado') ||
        mensaje.includes('not found'))
    );
  }

  /**
   * El borrador temporal corresponde a un expediente/oficio ya guardado en BD.
   * Cubre sesiones anteriores a captura_completada donde el UUID quedó en localStorage.
   */
  esBorradorYaCapturadoEnExpedientes(
    registro: TemporalRegistroResponse
  ): Observable<boolean> {
    const expediente = registro.num_expediente?.trim();
    const oficio = registro.num_oficio?.trim();

    if (!expediente || !oficio) {
      return of(false);
    }

    return this.expedienteService.consultarExpedientes({ expediente, oficio }).pipe(
      map((filas) =>
        filas.some((fila) => {
          const filaExpediente = fila.expediente?.trim();
          const filaOficio = fila.oficio?.trim();
          return (
            (filaExpediente === expediente && filaOficio === oficio) ||
            filaExpediente === expediente ||
            filaOficio === oficio
          );
        })
      ),
      catchError(() => of(false))
    );
  }

  /**
   * Recupera borrador si es legítimo (captura no completada y expediente aún no guardado).
   */
  recuperarBorradorSiExiste(
    uuid: string,
    forzar = false
  ): Observable<TemporalRegistroResponse | null> {
    if (!forzar && !this.debeRecuperarBorradorAlEntrar()) {
      return of(null);
    }

    if (this.isCapturaRecienCompletada()) {
      this.limpiarStorageBorradorCaptura(false);
      return of(null);
    }

    return this.getTemporalRegistro(uuid).pipe(
      switchMap((response) => {
        const registro = response.body ?? null;

        if (!registro) {
          this.limpiarStorageBorradorCaptura(false);
          return of(null);
        }

        return this.esBorradorYaCapturadoEnExpedientes(registro).pipe(
          switchMap((yaCapturado) => {
            if (yaCapturado) {
              void this.eliminarRegistroTemporal(uuid);
              this.limpiarStorageBorradorCaptura(false);
              return of(null);
            }

            return of(registro);
          })
        );
      }),
      catchError(() => {
        this.limpiarStorageBorradorCaptura(false);
        return of(null);
      })
    );
  }

  insertTemporal(paso1: unknown, paso2: unknown): Observable<HttpResponse<TemporalInsertResponse>> {
    const body = this.expedienteService.construirPayloadTemporal(paso1, paso2);
    return this.apiService.postTemporal<TemporalInsertResponse>('temporal/insert', body);
  }

  updateTemporal(
    uuid: string,
    paso1: unknown,
    paso2: unknown
  ): Observable<HttpResponse<string>> {
    const payload: TemporalUpdateRequest = {
      uuid,
      ...this.expedienteService.construirPayloadTemporal(paso1, paso2),
    };
    return this.apiService.putTemporal<string>('temporal/update', payload);
  }

  getTemporalRegistro(uuid?: string): Observable<HttpResponse<TemporalRegistroResponse>> {
    if (this.isCapturaRecienCompletada()) {
      return throwError(() => new Error('Captura recién completada: omitir recuperación de borrador'));
    }

    const id = uuid ?? this.getStoredUuid();

    if (!this.isValidStoredUuid(id)) {
      return throwError(() => new Error('UUID inválido para recuperar borrador temporal'));
    }

    return this.apiService.postTemporal<TemporalRegistroResponse>('temporal/registro', { uuid: id });
  }

  /**
   * Recupera borrador guardado en localStorage.
   * UUID inválido u obsoleto: limpia storage y continúa sin propagar error HTTP.
   */
  loadStoredRegistroTemporal(): Observable<TemporalRegistroResponse | null> {
    if (this.isCapturaRecienCompletada()) {
      this.limpiarStorageBorradorCaptura(false);
      return of(null);
    }

    const uuid = this.getStoredUuid();

    if (!this.isValidStoredUuid(uuid)) {
      if (uuid) {
        this.limpiarStorageBorradorCaptura(false);
      }
      return of(null);
    }

    return this.recuperarBorradorSiExiste(uuid);
  }

  deleteTemporal(uuid?: string): Observable<HttpResponse<TemporalEliminaResponse>> {
    const id = uuid ?? this.getStoredUuid();
    return this.apiService.deleteTemporal<TemporalEliminaResponse>('temporal/elimina', { uuid: id });
  }

  /**
   * Descarta el borrador temporal: limpia localStorage de inmediato y luego
   * intenta eliminar el registro en backend (best effort).
   */
  descartarBorrador(): Observable<void> {
    const uuid = this.getStoredUuid() ?? this.uuidBorradorPendiente;
    this.uuidBorradorPendiente = null;
    this.limpiarStorageBorradorCaptura(false);
    this.bloquearAutoGuardado();

    if (!this.isValidStoredUuid(uuid)) {
      return of(undefined);
    }

    return this.deleteTemporal(uuid).pipe(
      map(() => undefined),
      catchError(() =>
        this.deleteTemporal(uuid).pipe(
          map(() => undefined),
          catchError(() => of(undefined))
        )
      )
    );
  }

  /**
   * Auto-guardado: insert si no hay uuid, update si ya existe borrador.
   * Devuelve el uuid activo.
   */
  autoGuardarBorrador(paso1: unknown, paso2: unknown): Observable<string | null> {
    if (!this.isAutoGuardadoPermitido()) {
      return of(null);
    }

    if (!this.tieneDatosMinimosParaBorrador(paso1)) {
      return of(null);
    }

    if (!this.puedeGuardarBorrador(paso1, paso2)) {
      return of(null);
    }

    const uuidExistente = this.getStoredUuid();

    if (uuidExistente) {
      if (!this.isValidStoredUuid(uuidExistente)) {
        this.limpiarStorageBorradorCaptura(false);
        return this.insertarBorradorLazy(paso1, paso2);
      }

      return this.updateTemporal(uuidExistente, paso1, paso2).pipe(
        map(() => (this.puedePersistirUuid() ? uuidExistente : null)),
        catchError((error) => {
          if (!this.isRegistroTemporalInvalido(error)) {
            return of(null);
          }

          this.limpiarStorageBorradorCaptura(false);
          return this.insertarBorradorLazy(paso1, paso2);
        })
      );
    }

    // Lazy insert: solo al escribir (llamado desde valueChanges con datos mínimos).
    return this.insertarBorradorLazy(paso1, paso2);
  }

  /** Inserta borrador solo si auto-guardado sigue permitido (evita UUID al entrar a la página). */
  private insertarBorradorLazy(paso1: unknown, paso2: unknown): Observable<string | null> {
    if (!this.isAutoGuardadoPermitido() || !this.tieneDatosMinimosParaBorrador(paso1)) {
      return of(null);
    }

    return this.insertTemporal(paso1, paso2).pipe(
      map((response) => {
        const uuid = this.persistirUuidSiPermitido(response.body?.uuid ?? null);
        if (uuid) {
          this.consumirMarcaCapturaCompletada();
        }
        return uuid;
      }),
      catchError(() => of(null))
    );
  }

  guardarBorradorCompleto(paso1: unknown, paso2: unknown): Observable<string | null> {
    return this.autoGuardarBorrador(paso1, paso2);
  }

  /** Evita POST/PUT temporal con payload incompleto (el back hace panic con fechas vacías). */
  puedeGuardarBorrador(paso1: unknown, paso2: unknown): boolean {
    if (!this.tieneDatosMinimosParaBorrador(paso1)) {
      return false;
    }

    const payload = this.expedienteService.construirPayloadTemporal(paso1, paso2);

    return (
      payload.fecha_documento.length > 0 &&
      payload.fecha_recepcion.length > 0 &&
      payload.fecha_vencimiento.length > 0 &&
      payload.responsable.trim().length > 0 &&
      payload.status > 0
    );
  }

  private tieneDatosMinimosParaBorrador(paso1: unknown): boolean {
    if (!paso1 || typeof paso1 !== 'object') {
      return false;
    }

    const datos = paso1 as Record<string, unknown>;
    const oficio = String(datos['oficio'] ?? '').trim();
    const expediente = String(datos['expediente'] ?? '').trim();

    return oficio.length > 0 && expediente.length > 0;
  }
}
