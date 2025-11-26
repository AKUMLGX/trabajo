import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores personalizados para el formulario de expedientes Tlapohualli
 */
export class ExpedienteValidators {
  
  /**
   * Validar formato de expediente: Exp.001-2025, Exp.002-2025, etc.
   * Patrón: Exp. seguido de 3 dígitos, guión y año de 4 dígitos
   */
  static expedienteFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const pattern = /^Exp\.\d{3}-\d{4}$/i;
      return pattern.test(control.value) ? null : { 
        expedienteFormat: { 
          message: 'Formato: Exp.XXX-YYYY (Ejemplo: Exp.001-2025)' 
        } 
      };
    };
  }
  
  /**
   * Validar formato de oficio: 199 06 02 00 00 2025-01
   * Patrón flexible que acepta espacios o guiones como separadores
   */
  static oficioFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Patrón flexible: acepta espacios, guiones o combinación
      const pattern = /^\d{3}[\s-]\d{2}[\s-]\d{2}[\s-]\d{2}[\s-]\d{2}[\s-]\d{4}[\s-]\d{2,4}$/;
      return pattern.test(control.value) ? null : { 
        oficioFormat: { 
          message: 'Formato: XXX XX XX XX XX XXXX-XX (Ejemplo: 199 06 02 00 00 2025-01)' 
        } 
      };
    };
  }
  
  /**
   * Validar formato de WOOS: REQS00002058748
   * Patrón: REQS seguido de 11 dígitos
   */
  static woosFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const pattern = /^REQS\d{11}$/i;
      return pattern.test(control.value) ? null : { 
        woosFormat: { 
          message: 'Formato: REQS seguido de 11 dígitos (Ejemplo: REQS00002058748)' 
        } 
      };
    };
  }
  
  /**
   * Validar que la fecha no sea futura
   */
  static noFutureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fecha = new Date(control.value);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      
      return fecha <= hoy ? null : { 
        futureDate: { 
          message: 'La fecha no puede ser futura' 
        } 
      };
    };
  }
  
  /**
   * Validar que fecha_recibido >= fecha_documento
   * Este validador debe aplicarse al campo fecha_recibido
   */
  static fechaRecibidoValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent || !control.value) return null;
      
      const fechaDocumento = parent.get('fecha_documento')?.value;
      if (!fechaDocumento) return null;
      
      const fechaRecibido = new Date(control.value);
      const fechaDoc = new Date(fechaDocumento);
      
      // Normalizar a medianoche para comparar solo fechas
      fechaRecibido.setHours(0, 0, 0, 0);
      fechaDoc.setHours(0, 0, 0, 0);
      
      return fechaRecibido >= fechaDoc ? null : { 
        fechaRecibidoInvalida: { 
          message: 'La fecha de recepción debe ser igual o posterior a la fecha del documento' 
        } 
      };
    };
  }
  
  /**
   * Validar rango de números (min-max)
   */
  static numberRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      if (isNaN(value)) {
        return { numberRange: { message: 'Debe ser un número válido' } };
      }
      
      if (value < min || value > max) {
        return { 
          numberRange: { 
            message: `El valor debe estar entre ${min} y ${max}` 
          } 
        };
      }
      
      return null;
    };
  }
  
  /**
   * Validar que solo contenga números
   */
  static onlyNumbers(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const pattern = /^\d+$/;
      return pattern.test(control.value) ? null : { 
        onlyNumbers: { 
          message: 'Solo se permiten números' 
        } 
      };
    };
  }
}

