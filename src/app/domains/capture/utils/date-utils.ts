/**
 * Utilidades para manejo de fechas en el sistema Tlalcalli
 */
export class DateUtils {
  
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
   * Formatear fecha a DD/MM/YYYY
   * @param fecha Fecha a formatear
   * @returns String en formato DD/MM/YYYY
   */
  static formatearFecha(fecha: Date | string | null): string {
    if (!fecha) return '';
    
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  }
  
  /**
   * Formatear fecha para input type="date" (YYYY-MM-DD)
   * @param fecha Fecha a formatear
   * @returns String en formato YYYY-MM-DD
   */
  static formatearFechaInput(fecha: Date | string | null): string {
    if (!fecha) return '';
    
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    
    return `${anio}-${mes}-${dia}`;
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

