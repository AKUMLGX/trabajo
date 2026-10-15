/**
 * Utilidades para manejo de fechas en el sistema Tlalcalli
 */
export class DateUtils {
  
  /**
   * Cuenta días hábiles (lun–vie) entre fecha de recepción y vencimiento,
   * usando la misma regla que sumarDiasHabiles en captura: el día de recepción
   * no cuenta; se avanza día a día hasta la fecha de vencimiento inclusive.
   */
  static contarDiasHabilesDesdeRecepcion(
    fechaRecepcion: Date | string | null | undefined,
    fechaVencimiento: Date | string | null | undefined
  ): number | null {
    const inicio = this.parseFechaLocal(fechaRecepcion);
    const fin = this.parseFechaLocal(fechaVencimiento);

    if (!inicio || !fin || fin.getTime() <= inicio.getTime()) {
      return null;
    }

    const cursor = new Date(inicio);
    let diasHabiles = 0;

    while (cursor.getTime() < fin.getTime()) {
      cursor.setDate(cursor.getDate() + 1);
      const diaSemana = cursor.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasHabiles++;
      }
    }

    return diasHabiles > 0 ? diasHabiles : null;
  }

  /**
   * Parsea fechas ISO (YYYY-MM-DD) o DD/MM/YYYY en hora local, sin desfase UTC.
   */
  static parseFechaLocal(fecha: Date | string | null | undefined): Date | null {
    if (!fecha) {
      return null;
    }

    if (fecha instanceof Date) {
      if (Number.isNaN(fecha.getTime())) {
        return null;
      }
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    }

    if (typeof fecha === 'string') {
      const desdePg = this.decodePgDateBinary(fecha);
      if (desdePg) {
        return desdePg;
      }
    }

    const iso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    }

    const latam = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (latam) {
      return new Date(Number(latam[3]), Number(latam[2]) - 1, Number(latam[1]));
    }

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  /**
   * Calcular fecha de vencimiento basada en fecha de recepción y plazo en días
   * @param fechaRecibido Fecha en la que se recibió el expediente
   * @param plazo Número de días del plazo
   * @returns Fecha de vencimiento calculada
   */
  static calcularFechaVencimiento(fechaRecibido: Date | string, plazo: number): Date {
    if (!fechaRecibido || !plazo || plazo <= 0) {
      return new Date();
    }
    
    const fecha = new Date(fechaRecibido);
    fecha.setDate(fecha.getDate() + plazo);
    return fecha;
  }
  
  /**
   * Calcular días de retraso basado en la fecha de vencimiento
   * @param fechaVencimiento Fecha límite del expediente
   * @returns Número de días de retraso (0 si no hay retraso)
   */
  static calcularDiasRetraso(fechaVencimiento: Date | string): number {
    if (!fechaVencimiento) return 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    
    // Calcular diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = hoy.getTime() - vencimiento.getTime();
    const diferenciaDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    // Retornar 0 si no hay retraso, o el número de días si hay retraso
    return Math.max(0, diferenciaDias);
  }
  
  /**
   * Obtener color del badge según días de retraso
   * @param diasRetraso Número de días de retraso
   * @returns Color del badge: 'green' | 'yellow' | 'red'
   */
  static getColorRetraso(diasRetraso: number): 'green' | 'yellow' | 'red' {
    if (diasRetraso === 0) return 'green';
    if (diasRetraso <= 5) return 'yellow';
    return 'red';
  }
  
  /**
   * Obtener clase CSS según días de retraso
   * @param diasRetraso Número de días de retraso
   * @returns Clases CSS de Tailwind para el badge
   */
  static getClaseRetraso(diasRetraso: number): string {
    if (diasRetraso === 0) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (diasRetraso <= 5) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-red-100 text-red-800 border-red-300';
  }
  
  /**
   * Obtener texto descriptivo según días de retraso
   * @param diasRetraso Número de días de retraso
   * @returns Texto descriptivo del estado
   */
  static getTextoRetraso(diasRetraso: number): string {
    if (diasRetraso === 0) return 'Al día';
    if (diasRetraso === 1) return '1 día de retraso';
    return `${diasRetraso} días de retraso`;
  }
  
  /**
   * Decodifica fechas PostgreSQL `date` leídas erróneamente como String/Text
   * (4 bytes: días desde 2000-01-01, big-endian). Workaround mientras el back
   * alinea el schema Diesel (columna Date vs tipo Text en Rust).
   */
  static decodePgDateBinary(valor: string): Date | null {
    if (valor.length !== 4) {
      return null;
    }

    const days =
      ((valor.charCodeAt(0) & 0xff) << 24) |
      ((valor.charCodeAt(1) & 0xff) << 16) |
      ((valor.charCodeAt(2) & 0xff) << 8) |
      (valor.charCodeAt(3) & 0xff);

    const signedDays = days > 0x7fffffff ? days - 0x100000000 : days;
    if (signedDays < 0 || signedDays > 500_000) {
      return null;
    }

    const base = new Date(Date.UTC(2000, 0, 1));
    base.setUTCDate(base.getUTCDate() + signedDays);

    if (Number.isNaN(base.getTime())) {
      return null;
    }

    return new Date(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate());
  }

  /** Detecta basura binaria típica cuando PG date se serializa como string. */
  static esBasuraFechaBackend(valor: string): boolean {
    if (!valor || valor.length === 4) {
      return valor.length === 4 && this.decodePgDateBinary(valor) != null;
    }
    return /[\u0000-\u001f\u007f-\u009f]/.test(valor);
  }

  /**
   * Fecha para UI (detalle, tablas): dd/mm/yyyy o em dash si vacía/inválida.
   * Tolera ISO, latam, Date y binario PG date mal mapeado en el API rework.
   */
  static formatearFechaDisplay(fecha: Date | string | null | undefined): string {
    if (fecha == null) {
      return '—';
    }

    if (fecha instanceof Date) {
      if (Number.isNaN(fecha.getTime())) {
        return '—';
      }
      return this.formatearFecha(fecha) || '—';
    }

    if (typeof fecha !== 'string') {
      return '—';
    }

    const trimmed = fecha.trim();
    if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null') {
      return '—';
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }

    if (trimmed.length === 4 || this.esBasuraFechaBackend(trimmed)) {
      const desdePg = this.decodePgDateBinary(trimmed);
      if (desdePg) {
        return this.formatearFecha(desdePg) || '—';
      }
    }

    if (/[\u0000-\u001f\u007f-\u009f]/.test(trimmed)) {
      return '—';
    }

    const parsed = this.parseFechaLocal(trimmed);
    if (parsed) {
      return this.formatearFecha(parsed) || '—';
    }

    return '—';
  }

  /**
   * Contrato Max (API rework): fechas en payload como dd/MM/yyyy o string vacío (nunca ISO yyyy-MM-dd).
   * Soporta cadenas concatenadas con `|` (oficios adjuntos): formatea cada segmento.
   */
  static formatearFechaReworkPayload(fecha: Date | string | null | undefined): string {
    if (fecha == null || fecha === '') {
      return '';
    }

    if (typeof fecha === 'string' && fecha.includes('|')) {
      return fecha
        .split('|')
        .map((segmento) => (segmento.trim() ? this.formatearFechaReworkPayload(segmento.trim()) : ''))
        .join('|');
    }

    return this.formatearFecha(fecha);
  }

  /**
   * Formatear fecha a DD/MM/YYYY
   * @param fecha Fecha a formatear
   * @returns String en formato DD/MM/YYYY
   */
  static formatearFecha(fecha: Date | string | null): string {
    const parsed =
      fecha instanceof Date
        ? fecha
        : this.parseFechaLocal(fecha) ?? this.decodePgDateBinary(String(fecha ?? ''));

    if (!parsed || Number.isNaN(parsed.getTime())) {
      return '';
    }

    const dia = String(parsed.getDate()).padStart(2, '0');
    const mes = String(parsed.getMonth() + 1).padStart(2, '0');
    const anio = parsed.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }
  
  /**
   * Formatear fecha para input type="date" (YYYY-MM-DD)
   * @param fecha Fecha a formatear
   * @returns String en formato YYYY-MM-DD
   */
  static formatearFechaInput(fecha: Date | string | null | undefined): string {
    const parsed = this.parseFechaLocal(fecha);
    if (!parsed) {
      return '';
    }

    const dia = String(parsed.getDate()).padStart(2, '0');
    const mes = String(parsed.getMonth() + 1).padStart(2, '0');
    const anio = parsed.getFullYear();

    return `${anio}-${mes}-${dia}`;
  }

  /** Normaliza Date | string | null a yyyy-MM-dd para input type="date". */
  static toInputDate(fecha: Date | string | null | undefined): string | null {
    const formatted = this.formatearFechaInput(fecha);
    return formatted || null;
  }
  
  /**
   * Agregar días a una fecha
   * @param fecha Fecha base
   * @param dias Número de días a agregar
   * @returns Nueva fecha con los días agregados
   */
  static agregarDias(fecha: Date | string, dias: number): Date {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }
  
  /**
   * Calcular diferencia en días entre dos fechas
   * @param fecha1 Primera fecha
   * @param fecha2 Segunda fecha
   * @returns Número de días de diferencia (puede ser negativo)
   */
  static diferenciaEnDias(fecha1: Date | string, fecha2: Date | string): number {
    const f1 = new Date(fecha1);
    const f2 = new Date(fecha2);
    
    f1.setHours(0, 0, 0, 0);
    f2.setHours(0, 0, 0, 0);
    
    const diferenciaMilisegundos = f2.getTime() - f1.getTime();
    return Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Validar si una fecha es futura
   * @param fecha Fecha a validar
   * @returns true si la fecha es futura, false en caso contrario
   */
  static esFechaFutura(fecha: Date | string): boolean {
    const f = new Date(fecha);
    const hoy = new Date();
    
    f.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    return f > hoy;
  }
  
  /**
   * Obtener fecha actual en formato YYYY-MM-DD (para inputs)
   * @returns String con la fecha actual
   */
  static getFechaActualInput(): string {
    return this.formatearFechaInput(new Date());
  }
}

