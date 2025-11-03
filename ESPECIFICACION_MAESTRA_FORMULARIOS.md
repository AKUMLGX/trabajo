# 📋 ESPECIFICACIÓN MAESTRA - Formulario de Captura de Expedientes Tlapohualli

**Documento Único de Referencia**  
**Fecha:** 3 de Noviembre de 2025  
**Proyecto:** Tlapohualli - SAT

---

## 📌 Índice

1. [Análisis de Campos](#análisis-de-campos)
2. [Componentes a Mantener/Eliminar](#componentes-a-mantenereliminar)
3. [Arquitectura del Formulario](#arquitectura-del-formulario)
4. [Distribución en 3 Pasos](#distribución-en-3-pasos)
5. [Catálogos y Tipos de Dato](#catálogos-y-tipos-de-dato)
6. [Validaciones y Cálculos Automáticos](#validaciones-y-cálculos-automáticos)
7. [Implementación Técnica](#implementación-técnica)
8. [Ejemplos de Datos](#ejemplos-de-datos)

---

## 1. Análisis de Campos

### Total de campos: 23

| # | Campo | Tipo | Requerido | Cálculo Automático | Catálogo | Observaciones |
|---|-------|------|-----------|-------------------|----------|---------------|
| 1 | Expediente | Text | ✅ | ❌ | ❌ | Ej: Exp.001 |
| 2 | Oficio | Text | ❌ | ❌ | ❌ | Ej: 199 06 02 00 00 2025-01 |
| 3 | No. de Entrada del Central | Text | ❌ | ❌ | ❌ | Ej: 2025-007 |
| 4 | Remitente (Área) | Text/Select | ❌ | ❌ | ⚠️ Posible | Ej: AGSC, AGE/CPP, OIC |
| 5 | Fecha del Documento | Date | ❌ | ❌ | ❌ | Formato: DD/MM/YYYY |
| 6 | Fecha en la que se recibió | Date | ❌ | ❌ | ❌ | Formato: DD/MM/YYYY |
| 7 | Plazo de vencimiento y Prioridad | Number | ❌ | ❌ | ❌ | Días (Ej: 20, 10, 15) |
| 8 | Fecha de vencimiento | Date | ❌ | ✅ | ❌ | Se calcula: fecha_recibido + plazo |
| 9 | Días de Retraso | Number | ❌ | ✅ | ❌ | Se calcula: hoy - fecha_vencimiento |
| 10 | Referencia / Asunto | Textarea | ❌ | ❌ | ❌ | Descripción larga |
| 11 | Sistema/Aplicativo | Select | ❌ | ❌ | ✅ | CERTISAT, MAT CBZ, No aplica |
| 12 | Responsable y fecha de asignación | Text | ❌ | ❌ | ❌ | Cambia durante el proceso |
| 13 | WOOS | Text | ❌ | ❌ | ❌ | Ej: REQS00002058748 |
| 14 | Estatus | Select | ❌ | ❌ | ✅ | ATENDIDO, EN PROCESO, etc. |
| 15 | Ubicación | Select | ❌ | ❌ | ✅ | Carpeta General-1, Individual-1 |
| 16 | Oficios Comisión/Apoyo/Designación/Aceptación | Text | ❌ | ❌ | ❌ | Ej: N/A |
| 17 | Respuesta Total y/o Parcial | Select | ❌ | ❌ | ✅ | Total, Parcial, Sin Respuesta |
| 18 | Fecha de notificación | Date | ❌ | ❌ | ❌ | Formato: DD/MM/YYYY |
| 19 | Dictamen/Reporte/Acta/Memoria Técnica | Select | ❌ | ❌ | ✅ | Sin Info., Dictamen, etc. |
| 20 | Anexos | Text/Chips | ❌ | ❌ | ❌ | Lista separada por comas |
| 21 | Acuse Físico – Digital | Text/Select | ❌ | ❌ | ⚠️ Posible | Ej: RRI-2501-001 |
| 22 | Expediente Físico y Digital | Boolean | ❌ | ❌ | ❌ | SI/NO |
| 23 | Comentarios Omega | Textarea | ❌ | ❌ | ❌ | Se llena al final del proceso |

---

## 2. Componentes a Mantener/Eliminar

### ✅ Componentes a MANTENER

| Componente | Ubicación | Uso |
|------------|-----------|-----|
| `custom-form-field` | `stepper-base/custom-form-field/` | Campos de texto/número/fecha consistentes |
| `custom-select` | `stepper-base/custom-select/` | Dropdowns de catálogos |
| `custom-textarea` | `stepper-base/custom-textarea/` | Campos de texto largo |
| `first-step-tlapohualli` | `stepper-base/first-step-tlapohualli/` | Paso 1 del formulario |
| `second-step-tlapohualli` | `stepper-base/second-step-tlapohualli/` | Paso 2 del formulario |
| `third-step-tlapohualli` | `stepper-base/third-step-tlapohualli/` | Paso 3 del formulario |
| `stepper-tlapohualli` | `stepper-base/stepper-tlapohualli/` | Contenedor principal |

### ❌ Componentes a ELIMINAR (no se usan)

| Componente | Ubicación | Razón |
|------------|-----------|-------|
| `particle-effects` | `stepper-base/particle-effects/` | Efectos decorativos innecesarios |
| `theme-toggle` | `stepper-base/theme-toggle/` | No se requiere cambio de tema |
| `document-upload` | `stepper-base/document-upload/` | No se suben archivos en este flujo |
| `first-step` | `stepper-base/first-step/` | Versión vieja, usar first-step-tlapohualli |
| `second-step` | `stepper-base/second-step/` | Versión vieja, usar second-step-tlapohualli |
| `third-step` | `stepper-base/third-step/` | Versión vieja, usar third-step-tlapohualli |
| `fourth-step` | `stepper-base/fourth-step/` | No se necesita, el paso 4 es resumen |

---

## 3. Arquitectura del Formulario

### Estructura de Archivos (Única y Definitiva)

```
src/app/domains/capture/
├── components/
│   ├── capture-landing-page/           # ✅ Ya existe y funciona
│   └── stepper-base/
│       ├── custom-form-field/          # ✅ Mantener
│       ├── custom-select/              # ✅ Mantener
│       ├── custom-textarea/            # ✅ Mantener
│       ├── first-step-tlapohualli/     # ✅ Reimplementar
│       ├── second-step-tlapohualli/    # ✅ Reimplementar
│       ├── third-step-tlapohualli/     # ✅ Reimplementar
│       └── stepper-tlapohualli/        # ✅ Ya tiene estructura base
├── interfaces/
│   └── expediente-tlapohualli.interface.ts  # ✅ Ya existe, actualizar
├── services/
│   ├── expediente-tlapohualli.service.ts    # ✅ Ya existe
│   └── catalogos.service.ts                 # 🆕 Crear para catálogos
└── utils/
    ├── form-validators.ts                   # 🆕 Crear validadores custom
    └── date-utils.ts                        # 🆕 Crear utilidades de fecha
```

---

## 4. Distribución en 3 Pasos

### PASO 1: Información Básica y Fechas (8 campos)

**Sección: Datos del Expediente**
1. ✅ **Expediente** *(requerido)*
   - Tipo: `text`
   - Validación: `required`, `maxLength(50)`, pattern personalizado
   - Ejemplo: `Exp.001`

2. ✅ **Oficio**
   - Tipo: `text`
   - Validación: `maxLength(100)`
   - Ejemplo: `199 06 02 00 00 2025-01`

3. ✅ **No. de Entrada del Central**
   - Tipo: `text`
   - Validación: `maxLength(100)`
   - Ejemplo: `2025-007`

4. ✅ **Remitente (Área)**
   - Tipo: `text` o `select` (si hay catálogo)
   - Validación: `maxLength(50)`
   - Ejemplos: `AGSC`, `AGE/CPP`, `OIC`
   - **Propuesta:** Usar `text` con autocompletado de valores frecuentes

**Sección: Fechas del Expediente**
5. ✅ **Fecha del Documento**
   - Tipo: `date`
   - Validación: No futuro
   - Formato: `DD/MM/YYYY`

6. ✅ **Fecha en la que se recibió**
   - Tipo: `date`
   - Validación: No futuro, >= Fecha del Documento
   - Formato: `DD/MM/YYYY`

**Sección: Descripción**
7. ✅ **Referencia / Asunto**
   - Tipo: `textarea`
   - Validación: `maxLength(1000)`
   - Descripción larga del expediente

8. ✅ **Plazo de vencimiento y Prioridad**
   - Tipo: `number`
   - Validación: `min(1)`, `max(365)`
   - Unidad: Días
   - Ejemplos: `20`, `10`, `15`

---

### PASO 2: Seguimiento y Control (10 campos)

**Sección: Fechas de Seguimiento** *(Campos calculados y editable)*
9. ✅ **Fecha de vencimiento**
   - Tipo: `date` (calculada, puede editarse)
   - Cálculo: `fecha_recibido + plazo_vencimiento`
   - Mostrar como sugerencia editable

10. ✅ **Días de Retraso**
    - Tipo: `number` (calculado, readonly)
    - Cálculo: `max(0, hoy - fecha_vencimiento)`
    - Se recalcula automáticamente
    - **Badge visual:** Verde (0 días), Amarillo (1-5), Rojo (>5)

11. ✅ **Fecha de notificación**
    - Tipo: `date`
    - Validación: No futuro

**Sección: Sistema y Responsabilidad**
12. ✅ **Sistema/Aplicativo**
    - Tipo: `select`
    - Catálogo: `CERTISAT`, `MAT CBZ`, `No aplica`, otros
    - **Propuesta:** Catálogo dinámico desde backend

13. ✅ **Responsable y fecha de asignación**
    - Tipo: `text`
    - Validación: `maxLength(255)`
    - Nota: Puede cambiar durante el proceso
    - Ejemplo: `N/A`, `059 Víctor 2025`
    - **Propuesta:** Campo de historial de cambios (opcional)

14. ✅ **WOOS**
    - Tipo: `text`
    - Validación: `maxLength(50)`, pattern `REQS\d{11}`
    - Ejemplo: `REQS00002058748`

**Sección: Estado del Expediente**
15. ✅ **Estatus**
    - Tipo: `select`
    - Catálogo: `ATENDIDO`, `EN PROCESO`, `PENDIENTE`, `CANCELADO`
    - **Badge visual** con colores según estatus

16. ✅ **Ubicación (Carpeta)**
    - Tipo: `select`
    - Catálogo: 
      - `Carpeta General - 1`
      - `Carpeta General - 2`
      - `Carpeta Individual - 1`
      - `Carpeta Individual - 2`
      - `Archivo Digital`

17. ✅ **Respuesta Total y/o Parcial**
    - Tipo: `select`
    - Catálogo: `Total`, `Parcial`, `Sin Respuesta`

18. ✅ **Oficios Comisión/Apoyo/Designación/Aceptación**
    - Tipo: `text` o `textarea`
    - Validación: `maxLength(255)`
    - Ejemplo: `N/A`

---

### PASO 3: Documentos y Cierre (5 campos)

**Sección: Documentación**
19. ✅ **Dictamen/Reporte/Acta de Hechos/Memoria Técnica**
    - Tipo: `select`
    - Catálogo:
      - `Dictamen`
      - `Reporte`
      - `Acta de Hechos`
      - `Memoria Técnica`
      - `Sin Info.`

20. ✅ **Anexos**
    - Tipo: `text` (lista separada por comas) o `chips`
    - Ejemplos: 
      - `OUJD835K_20250109.E.1 RRI-2501-001`
      - `Info. en el Oficio`
      - `Sin Info.`
    - **Propuesta:** Sistema de chips/tags para agregar/quitar anexos

21. ✅ **Acuse Físico – Digital**
    - Tipo: `text` o `select`
    - Ejemplos: `RRI-2501-001`, `Info. en el Oficio`, `SIN INFO.`
    - **Propuesta:** Campo de texto libre con sugerencias

**Sección: Expediente Físico**
22. ✅ **Expediente Físico y Digital**
    - Tipo: `radio` o `select`
    - Opciones: `SI` / `NO` (boolean)
    - Valor por defecto: `NO`

**Sección: Comentarios Finales**
23. ✅ **Comentarios Omega**
    - Tipo: `textarea`
    - Validación: `maxLength(2000)`
    - Nota: Se llena al final del proceso de atención
    - Ejemplo: `(validar que la Información este en el servidor, el expediente esta completo validar que regreso el disco duro F40550090801202`

---

## 5. Catálogos y Tipos de Dato

### Catálogos a Crear en el Backend

```typescript
// catalogos.interface.ts

export interface CatalogoSistemaAplicativo {
  id: number;
  nombre: string;
  activo: boolean;
}
// Valores: CERTISAT, MAT CBZ, No aplica, ...

export interface CatalogoEstatus {
  id: number;
  nombre: string;
  color: string;  // Para badges visuales
  activo: boolean;
}
// Valores: ATENDIDO, EN PROCESO, PENDIENTE, CANCELADO

export interface CatalogoUbicacion {
  id: number;
  nombre: string;
  activo: boolean;
}
// Valores: Carpeta General-1, Carpeta General-2, Carpeta Individual-1, ...

export interface CatalogoTipoRespuesta {
  id: number;
  nombre: string;
  activo: boolean;
}
// Valores: Total, Parcial, Sin Respuesta

export interface CatalogoTipoDocumento {
  id: number;
  nombre: string;
  activo: boolean;
}
// Valores: Dictamen, Reporte, Acta de Hechos, Memoria Técnica, Sin Info.
```

### Interface Principal Actualizada

```typescript
// expediente-tlapohualli.interface.ts (actualizado)

export interface ExpedienteTlapohualli {
  id_expediente?: number;
  
  // Paso 1: Información Básica
  expediente: string;                    // REQUERIDO
  oficio?: string;
  numero_entrada_central?: string;
  remitente_area?: string;
  fecha_documento?: Date;
  fecha_recibido?: Date;
  referencia_asunto?: string;
  plazo_vencimiento_prioridad?: number;
  
  // Paso 2: Seguimiento
  fecha_vencimiento?: Date;              // Calculada
  dias_retraso?: number;                 // Calculado
  fecha_notificacion?: Date;
  sistema_aplicativo?: string;
  responsable_fecha_asignacion?: string;
  woos?: string;
  estatus?: string;
  ubicacion_carpeta?: string;
  respuesta_total_parcial?: string;
  oficios_comision_apoyo?: string;
  
  // Paso 3: Documentos y Cierre
  dictamen_reporte_acta?: string;
  anexos?: string;                       // Separado por comas
  acuse_fisico_digital?: string;
  expediente_fisico_digital?: boolean;
  comentarios_omega?: string;
  
  // Metadatos
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
}
```

---

## 6. Validaciones y Cálculos Automáticos

### Validadores Custom

```typescript
// form-validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ExpedienteValidators {
  
  // Validar formato de expediente: Exp.001
  static expedienteFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^Exp\.\d{3}$/i;
      return pattern.test(control.value) ? null : { 
        expedienteFormat: { 
          message: 'Formato: Exp.XXX (Ej: Exp.001)' 
        } 
      };
    };
  }
  
  // Validar formato de oficio: 199 06 02 00 00 2025-01
  static oficioFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^\d{3}[\s-]\d{2}[\s-]\d{2}[\s-]\d{2}[\s-]\d{2}[\s-]\d{4}[\s-]\d{2,4}$/;
      return pattern.test(control.value) ? null : { 
        oficioFormat: { 
          message: 'Formato: XXX XX XX XX XX XXXX-XX' 
        } 
      };
    };
  }
  
  // Validar formato de WOOS: REQS00002058748
  static woosFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^REQS\d{11}$/i;
      return pattern.test(control.value) ? null : { 
        woosFormat: { 
          message: 'Formato: REQS seguido de 11 dígitos' 
        } 
      };
    };
  }
  
  // Validar que la fecha no sea futura
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
  
  // Validar que fecha_recibido >= fecha_documento
  static fechaRecibidoValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent || !control.value) return null;
      
      const fechaDocumento = parent.get('fecha_documento')?.value;
      if (!fechaDocumento) return null;
      
      const fechaRecibido = new Date(control.value);
      const fechaDoc = new Date(fechaDocumento);
      
      return fechaRecibido >= fechaDoc ? null : { 
        fechaRecibidoInvalida: { 
          message: 'Fecha de recepción debe ser >= Fecha del documento' 
        } 
      };
    };
  }
}
```

### Utilidades de Cálculo

```typescript
// date-utils.ts

export class DateUtils {
  
  // Calcular fecha de vencimiento
  static calcularFechaVencimiento(fechaRecibido: Date, plazo: number): Date {
    if (!fechaRecibido || !plazo) return new Date();
    
    const fecha = new Date(fechaRecibido);
    fecha.setDate(fecha.getDate() + plazo);
    return fecha;
  }
  
  // Calcular días de retraso
  static calcularDiasRetraso(fechaVencimiento: Date): number {
    if (!fechaVencimiento) return 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    
    const diferencia = Math.ceil(
      (hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.max(0, diferencia);
  }
  
  // Obtener color del badge según días de retraso
  static getColorRetraso(diasRetraso: number): string {
    if (diasRetraso === 0) return 'green';
    if (diasRetraso <= 5) return 'yellow';
    return 'red';
  }
  
  // Formatear fecha a DD/MM/YYYY
  static formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}
```

---

## 7. Implementación Técnica

### Paso 1: first-step-tlapohualli.component.ts

```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { ExpedienteValidators } from '../../../utils/form-validators';

@Component({
  selector: 'app-first-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomTextareaComponent
  ],
  templateUrl: './first-step-tlapohualli.component.html',
  styleUrl: './first-step-tlapohualli.component.css'
})
export class FirstStepTlapohualliComponent {
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();

  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      expediente: ['', [
        Validators.required,
        Validators.maxLength(50),
        ExpedienteValidators.expedienteFormat()
      ]],
      oficio: ['', [
        Validators.maxLength(100),
        ExpedienteValidators.oficioFormat()
      ]],
      numero_entrada_central: ['', Validators.maxLength(100)],
      remitente_area: ['', Validators.maxLength(50)],
      fecha_documento: [null, ExpedienteValidators.noFutureDate()],
      fecha_recibido: [null, [
        ExpedienteValidators.noFutureDate(),
        ExpedienteValidators.fechaRecibidoValida()
      ]],
      referencia_asunto: ['', Validators.maxLength(1000)],
      plazo_vencimiento_prioridad: [null, [
        Validators.min(1),
        Validators.max(365)
      ]]
    });
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.formularioCompletado.emit(this.formulario.value);
      this.siguientePaso.emit();
    } else {
      this.marcarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
  
  // Getters para errores
  get expedienteError(): string | null {
    const control = this.formulario.get('expediente');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El expediente es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
      if (control.errors['expedienteFormat']) return control.errors['expedienteFormat'].message;
    }
    return null;
  }
  
  // ... más getters según sea necesario
}
```

### Paso 2: second-step-tlapohualli.component.ts

```typescript
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { ExpedienteValidators } from '../../../utils/form-validators';
import { DateUtils } from '../../../utils/date-utils';

@Component({
  selector: 'app-second-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './second-step-tlapohualli.component.html',
  styleUrl: './second-step-tlapohualli.component.css'
})
export class SecondStepTlapohualliComponent implements OnInit {
  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  
  // Catálogos
  sistemasAplicativo = [
    { value: 'CERTISAT', label: 'CERTISAT' },
    { value: 'MAT CBZ', label: 'MAT CBZ' },
    { value: 'No aplica', label: 'No aplica' }
  ];
  
  estatusOpciones = [
    { value: 'ATENDIDO', label: 'ATENDIDO', color: 'green' },
    { value: 'EN PROCESO', label: 'EN PROCESO', color: 'blue' },
    { value: 'PENDIENTE', label: 'PENDIENTE', color: 'yellow' },
    { value: 'CANCELADO', label: 'CANCELADO', color: 'red' }
  ];
  
  ubicacionOpciones = [
    { value: 'Carpeta General - 1', label: 'Carpeta General - 1' },
    { value: 'Carpeta General - 2', label: 'Carpeta General - 2' },
    { value: 'Carpeta Individual - 1', label: 'Carpeta Individual - 1' },
    { value: 'Carpeta Individual - 2', label: 'Carpeta Individual - 2' },
    { value: 'Archivo Digital', label: 'Archivo Digital' }
  ];
  
  respuestaOpciones = [
    { value: 'Total', label: 'Total' },
    { value: 'Parcial', label: 'Parcial' },
    { value: 'Sin Respuesta', label: 'Sin Respuesta' }
  ];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      fecha_vencimiento: [null],
      dias_retraso: [{ value: 0, disabled: true }],
      fecha_notificacion: [null, ExpedienteValidators.noFutureDate()],
      sistema_aplicativo: [''],
      responsable_fecha_asignacion: ['', Validators.maxLength(255)],
      woos: ['', [
        Validators.maxLength(50),
        ExpedienteValidators.woosFormat()
      ]],
      estatus: [''],
      ubicacion_carpeta: [''],
      respuesta_total_parcial: [''],
      oficios_comision_apoyo: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit() {
    // Calcular fecha de vencimiento si hay datos del paso 1
    if (this.datosPaso1?.fecha_recibido && this.datosPaso1?.plazo_vencimiento_prioridad) {
      const fechaVencimiento = DateUtils.calcularFechaVencimiento(
        this.datosPaso1.fecha_recibido,
        this.datosPaso1.plazo_vencimiento_prioridad
      );
      this.formulario.patchValue({ fecha_vencimiento: fechaVencimiento });
      this.calcularDiasRetraso();
    }
    
    // Auto-calcular días de retraso cuando cambie fecha_vencimiento
    this.formulario.get('fecha_vencimiento')?.valueChanges.subscribe(() => {
      this.calcularDiasRetraso();
    });
  }

  calcularDiasRetraso() {
    const fechaVencimiento = this.formulario.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const diasRetraso = DateUtils.calcularDiasRetraso(fechaVencimiento);
      this.formulario.patchValue({ dias_retraso: diasRetraso }, { emitEvent: false });
    }
  }
  
  get colorRetraso(): string {
    const diasRetraso = this.formulario.get('dias_retraso')?.value || 0;
    return DateUtils.getColorRetraso(diasRetraso);
  }

  onSubmit() {
    if (this.formulario.valid) {
      // Incluir dias_retraso aunque esté disabled
      const formValue = {
        ...this.formulario.value,
        dias_retraso: this.formulario.get('dias_retraso')?.value
      };
      this.formularioCompletado.emit(formValue);
      this.siguientePaso.emit();
    } else {
      this.marcarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
}
```

### Paso 3: third-step-tlapohualli.component.ts

```typescript
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';

@Component({
  selector: 'app-third-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './third-step-tlapohualli.component.html',
  styleUrl: './third-step-tlapohualli.component.css'
})
export class ThirdStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Input() datosPaso2: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() finalizar = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  
  // Catálogos
  tiposDocumento = [
    { value: 'Dictamen', label: 'Dictamen' },
    { value: 'Reporte', label: 'Reporte' },
    { value: 'Acta de Hechos', label: 'Acta de Hechos' },
    { value: 'Memoria Técnica', label: 'Memoria Técnica' },
    { value: 'Sin Info.', label: 'Sin Información' }
  ];
  
  expedienteFisicoOpciones = [
    { value: true, label: 'SÍ' },
    { value: false, label: 'NO' }
  ];
  
  // Chips para anexos
  anexosChips: string[] = [];
  nuevoAnexo = '';

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      dictamen_reporte_acta: [''],
      anexos: [''],
      acuse_fisico_digital: ['', Validators.maxLength(100)],
      expediente_fisico_digital: [false],
      comentarios_omega: ['', Validators.maxLength(2000)]
    });
  }

  // Gestión de anexos (chips)
  agregarAnexo() {
    if (this.nuevoAnexo.trim() && !this.anexosChips.includes(this.nuevoAnexo.trim())) {
      this.anexosChips.push(this.nuevoAnexo.trim());
      this.actualizarAnexos();
      this.nuevoAnexo = '';
    }
  }

  removerAnexo(anexo: string) {
    this.anexosChips = this.anexosChips.filter(a => a !== anexo);
    this.actualizarAnexos();
  }

  private actualizarAnexos() {
    const anexosString = this.anexosChips.join(', ');
    this.formulario.patchValue({ anexos: anexosString });
  }
  
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.agregarAnexo();
    }
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.formularioCompletado.emit(this.formulario.value);
      this.finalizar.emit();
    } else {
      this.marcarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
}
```

---

## 8. Ejemplos de Datos

### Registro 1
```json
{
  "expediente": "Exp.001",
  "oficio": "199 06 02 00 00 2025-01",
  "numero_entrada_central": "",
  "remitente_area": "AGSC",
  "fecha_documento": "2025-01-07",
  "fecha_recibido": "2025-01-07",
  "plazo_vencimiento_prioridad": 20,
  "fecha_vencimiento": "2025-01-27",
  "dias_retraso": 0,
  "referencia_asunto": "Adquisición Bancen del usuario con RFC corto OUJD8535K, N.S. PW063TNT",
  "sistema_aplicativo": "No aplica",
  "responsable_fecha_asignacion": "N/A",
  "woos": "REQS00002058748",
  "estatus": "ATENDIDO",
  "ubicacion_carpeta": "Carpeta General - 1",
  "oficios_comision_apoyo": "N/A",
  "respuesta_total_parcial": "Total",
  "fecha_notificacion": null,
  "dictamen_reporte_acta": "Sin Info.",
  "anexos": "OUJD835K_20250109.E.1 RRI-2501-001",
  "acuse_fisico_digital": "RRI-2501-001",
  "expediente_fisico_digital": true,
  "comentarios_omega": "(validar que la Información este en el servidor, el expediente esta completo validar que regreso el disco duro F40550090801202"
}
```

### Registro 2
```json
{
  "expediente": "Exp.002",
  "oficio": "103-10-00-00-00-2024-2134",
  "numero_entrada_central": "",
  "remitente_area": "AGE/CPP",
  "fecha_documento": "2024-12-18",
  "fecha_recibido": "2025-01-09",
  "plazo_vencimiento_prioridad": 10,
  "fecha_vencimiento": "2025-01-19",
  "dias_retraso": 0,
  "referencia_asunto": "Informe sobre propiedad del Certisat",
  "sistema_aplicativo": "CERTISAT",
  "responsable_fecha_asignacion": "N/A",
  "woos": "N/A",
  "estatus": "ATENDIDO",
  "ubicacion_carpeta": "Carpeta General - 1",
  "oficios_comision_apoyo": "N/A",
  "respuesta_total_parcial": "Total",
  "fecha_notificacion": null,
  "dictamen_reporte_acta": "Sin Info.",
  "anexos": "Info. en el Oficio",
  "acuse_fisico_digital": "Info. en el Oficio",
  "expediente_fisico_digital": true,
  "comentarios_omega": "OK completo"
}
```

### Registro 3
```json
{
  "expediente": "Exp.003",
  "oficio": "101-04-2025-00010",
  "numero_entrada_central": "2025-007",
  "remitente_area": "OIC",
  "fecha_documento": "2024-01-06",
  "fecha_recibido": "2025-01-09",
  "plazo_vencimiento_prioridad": 15,
  "fecha_vencimiento": "2025-01-24",
  "dias_retraso": 0,
  "referencia_asunto": "Dictamen en MAT Cobranza sobre el contribuyente Esperanza de Vida San Ramón AC, con RFC EVS210922SW9",
  "sistema_aplicativo": "MAT CBZ",
  "responsable_fecha_asignacion": "N/A",
  "woos": "N/A",
  "estatus": "ATENDIDO",
  "ubicacion_carpeta": "Carpeta General - 1",
  "oficios_comision_apoyo": "N/A",
  "respuesta_total_parcial": "Total",
  "fecha_notificacion": null,
  "dictamen_reporte_acta": "Sin Info.",
  "anexos": "Sin Info.",
  "acuse_fisico_digital": "SIN INFO.",
  "expediente_fisico_digital": true,
  "comentarios_omega": "OK completo"
}
```

---

## 9. Plan de Implementación

### Fase 1: Limpieza y Preparación ✅
- [x] Limpiar componentes de pasos
- [x] Mantener custom-form-field, custom-select, custom-textarea
- [x] Identificar componentes innecesarios

### Fase 2: Utilidades y Validadores (Próximo)
- [ ] Crear `form-validators.ts`
- [ ] Crear `date-utils.ts`
- [ ] Crear `catalogos.service.ts`

### Fase 3: Implementación de Pasos
- [ ] Implementar Paso 1 completo
- [ ] Implementar Paso 2 completo
- [ ] Implementar Paso 3 completo

### Fase 4: Integración
- [ ] Conectar con servicio backend
- [ ] Implementar guardado de expediente
- [ ] Mostrar resumen en Paso 4

### Fase 5: Testing y Refinamiento
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Refinamiento UI/UX

---

## 10. Notas Importantes

1. **Campo "Responsable y fecha de asignación":** Puede cambiar durante el proceso. Considerar agregar un historial de cambios opcional.

2. **Cálculo de días de retraso:** Se calcula automáticamente basado en `hoy - fecha_vencimiento`. Mostrar con badges de colores (verde, amarillo, rojo).

3. **Anexos:** Implementar como sistema de chips/tags para agregar/remover múltiples anexos fácilmente.

4. **Comentarios Omega:** Se llena al final del proceso, puede ser un campo largo con mucho texto.

5. **Catálogos:** Todos los catálogos deben venir del backend de forma dinámica para facilitar mantenimiento.

6. **Componentes a eliminar:** 
   - `particle-effects/`
   - `theme-toggle/`
   - `document-upload/` (no se suben archivos)
   - `first-step/`, `second-step/`, `third-step/`, `fourth-step/` (versiones viejas)

---

**Última actualización:** 3 de Noviembre de 2025  
**Estado:** Especificación Completa Lista para Implementación
