# 📋 Propuestas Profesionales para Formularios de Captura de Expedientes

## 🎯 Contexto del Sistema

Sistema de gestión de expedientes para Tlapohualli (SAT). El formulario consta de 4 pasos para capturar información completa de expedientes administrativos.

---

## 🏗️ Arquitectura Propuesta

### 1. **Patrón de Diseño: Formularios Reactivos con Validación Avanzada**

#### Ventajas:
- ✅ Validación en tiempo real
- ✅ Type-safe con TypeScript
- ✅ Fácil testing unitario
- ✅ Mejor manejo de estado

#### Implementación:
```typescript
// Estructura recomendada usando ReactiveFormsModule
- FormBuilder para crear FormGroups
- Validators para reglas de negocio
- Custom Validators para validaciones complejas
- Async Validators para validaciones del servidor
```

---

### 2. **Separación de Responsabilidades (SRP)**

#### Estructura de Componentes:

```
stepper-tlapohualli/
├── components/
│   ├── first-step/
│   │   ├── first-step.component.ts
│   │   ├── first-step.component.html
│   │   ├── first-step.component.css
│   │   ├── first-step.form.ts          // ✅ Lógica del formulario separada
│   │   └── first-step.validators.ts    // ✅ Validadores custom
│   ├── second-step/
│   │   └── (similar estructura)
│   └── third-step/
│       └── (similar estructura)
├── models/
│   ├── expediente-form.model.ts        // ✅ Modelos de datos tipados
│   └── form-step.interface.ts          // ✅ Interfaces compartidas
├── services/
│   ├── expediente-form.service.ts      // ✅ Servicio para lógica de negocio
│   └── expediente-validation.service.ts // ✅ Validaciones complejas
└── utils/
    ├── form-helpers.ts                 // ✅ Utilidades para formularios
    └── date-helpers.ts                 // ✅ Utilidades para fechas
```

---

### 3. **Propuesta para Paso 1: Información Básica**

#### Campos Identificados:
1. **Expediente** *(requerido)*
   - Tipo: Text
   - Validación: Required, MaxLength(50), Pattern
   - Ejemplo: "Exp.001"

2. **Oficio** *(opcional)*
   - Tipo: Text
   - Validación: MaxLength(100), Pattern personalizado
   - Ejemplo: "199 06 02 00 00 2025-01"

3. **No. de Entrada del Central** *(opcional)*
   - Tipo: Text
   - Validación: MaxLength(100)

4. **Remitente (Área)** *(opcional)*
   - Tipo: Text o Select (si hay catálogo)
   - Validación: MaxLength(20)

5. **Referencia / Asunto** *(opcional)*
   - Tipo: Textarea
   - Validación: MaxLength(500)

6. **Fecha del Documento** *(opcional)*
   - Tipo: Date
   - Validación: Date range, no futuro

7. **Mes del Documento** *(opcional)*
   - Tipo: Select
   - Opciones: 1-12 (Enero-Diciembre)
   - Puede sincronizarse con fecha_documento

8. **Fecha en la que se recibió** *(opcional)*
   - Tipo: Date
   - Validación: Date range, no futuro

#### Propuesta de Implementación:

```typescript
// first-step.form.ts
export class FirstStepForm {
  static buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      expediente: ['', [
        Validators.required,
        Validators.maxLength(50),
        CustomValidators.expedientePattern()
      ]],
      oficio: ['', [
        Validators.maxLength(100),
        CustomValidators.oficioPattern()
      ]],
      numero_entrada_central: ['', [
        Validators.maxLength(100)
      ]],
      remitente_area: ['', [
        Validators.maxLength(20)
      ]],
      referencia_asunto: ['', [
        Validators.maxLength(500)
      ]],
      fecha_documento: [null, [
        CustomValidators.notFutureDate()
      ]],
      mes_documento: [null],
      fecha_recibido: [null, [
        CustomValidators.notFutureDate(),
        CustomValidators.afterFechaDocumento()
      ]]
    }, {
      validators: [
        CustomValidators.mesFechaConsistency()
      ]
    });
  }
}
```

---

### 4. **Propuesta para Paso 2: Plazos y Seguimiento**

#### Campos Identificados:

**Sección: Plazos y Fechas**
1. **Plazo de Vencimiento (días)**
   - Tipo: Number
   - Validación: Min(1), Max(365)
   - Auto-calcula fecha_vencimiento

2. **Fecha de Vencimiento**
   - Tipo: Date (calculada)
   - Readonly o editable con validación
   - Auto-calcula dias_retraso

3. **Días de Retraso**
   - Tipo: Number (calculado)
   - Readonly
   - Calculado: hoy - fecha_vencimiento

4. **Fecha de Notificación**
   - Tipo: Date
   - Validación: No futuro

**Sección: Sistema y Responsables**
5. **Sistema/Aplicativo**
   - Tipo: Select
   - Catálogo: Sistema Central, Aplicativo Especializado, etc.

6. **Responsable y Fecha de Asignación**
   - Tipo: Text
   - Validación: MaxLength(255)
   - Formato: "059 Víctor 2025"

7. **WOOS**
   - Tipo: Text
   - Validación: MaxLength(50), Pattern
   - Ejemplo: "REQS00002058748"

8. **Número de Solicitudes Reales**
   - Tipo: Number
   - Validación: Min(0), Pattern(/\d+/)

**Sección: Estado y Seguimiento**
9. **Estatus**
   - Tipo: Select
   - Catálogo: En Proceso, Pendiente, Completado, etc.

10. **Ubicación (Carpeta)**
    - Tipo: Select
    - Catálogo: Carpeta General-1, Carpeta Individual-1, etc.

11. **Respuesta Total y/o Parcial**
    - Tipo: Select
    - Opciones: Total, Parcial, Sin Respuesta

12. **Referencia de Respuesta**
    - Tipo: Text
    - Validación: MaxLength(100)

13. **Observaciones**
    - Tipo: Textarea
    - Validación: MaxLength(1000)

#### Propuesta de Implementación:

```typescript
// second-step.form.ts
export class SecondStepForm {
  static buildForm(fb: FormBuilder, datosPaso1: any): FormGroup {
    const form = fb.group({
      plazo_vencimiento_prioridad: [null, [
        Validators.min(1),
        Validators.max(365)
      ]],
      fecha_vencimiento: [null],
      dias_retraso: [{value: 0, disabled: true}],
      fecha_notificacion: [null, [
        CustomValidators.notFutureDate()
      ]],
      sistema_aplicativo: [''],
      responsable_fecha_asignacion: ['', [
        Validators.maxLength(255)
      ]],
      woos: ['', [
        Validators.maxLength(50),
        CustomValidators.woosPattern()
      ]],
      numero_solicitudes_reales: ['0', [
        Validators.pattern(/^\d+$/),
        Validators.min(0)
      ]],
      estatus: [''],
      ubicacion_carpeta: [''],
      respuesta_total_parcial: [''],
      referencia_respuesta: ['', [
        Validators.maxLength(100)
      ]],
      observaciones: ['', [
        Validators.maxLength(1000)
      ]]
    });

    // Auto-calcular fechas basado en fecha_recibido del paso 1
    if (datosPaso1?.fecha_recibido) {
      this.setupAutoCalculations(form, datosPaso1);
    }

    return form;
  }

  private static setupAutoCalculations(form: FormGroup, datosPaso1: any): void {
    // Auto-calcular fecha_vencimiento cuando cambie plazo
    form.get('plazo_vencimiento_prioridad')?.valueChanges.subscribe(plazo => {
      if (plazo && datosPaso1.fecha_recibido) {
        const fechaRecibido = new Date(datosPaso1.fecha_recibido);
        const fechaVencimiento = new Date(fechaRecibido);
        fechaVencimiento.setDate(fechaRecibido.getDate() + plazo);
        form.patchValue({ fecha_vencimiento: fechaVencimiento });
        this.calcularDiasRetraso(form);
      }
    });

    // Recalcular días de retraso cuando cambie fecha_vencimiento
    form.get('fecha_vencimiento')?.valueChanges.subscribe(() => {
      this.calcularDiasRetraso(form);
    });
  }

  private static calcularDiasRetraso(form: FormGroup): void {
    const fechaVencimiento = form.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(fechaVencimiento);
      vencimiento.setHours(0, 0, 0, 0);
      
      const diferencia = Math.ceil((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
      const diasRetraso = Math.max(0, diferencia);
      
      form.patchValue({ dias_retraso: diasRetraso }, { emitEvent: false });
    }
  }
}
```

---

### 5. **Propuesta para Paso 3: Documentos y Respuestas**

#### Campos Identificados:

1. **Oficios Comisión/Apoyo/Designación/Aceptación**
   - Tipo: Textarea
   - Validación: MaxLength(255)

2. **Dictamen/Reporte/Acta de Hechos/Memoria Técnica**
   - Tipo: Select
   - Catálogo: Dictamen, Reporte, Acta de Hechos, etc.

3. **Anexos**
   - Tipo: Chips/Tags (lista dinámica)
   - Agregar/Remover múltiples anexos
   - Almacenar como string separado por comas

4. **Acuse Físico – Digital**
   - Tipo: Select
   - Catálogo: RRI-2501-001, RRI-2501-002, etc.

5. **Expediente Físico y Digital**
   - Tipo: Radio o Select
   - Opciones: SÍ/NO (boolean)

6. **Comentarios Omega**
   - Tipo: Textarea
   - Validación: MaxLength(1000)

#### Propuesta de Implementación:

```typescript
// third-step.form.ts
export class ThirdStepForm {
  static buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      oficios_comision_apoyo: ['', [
        Validators.maxLength(255)
      ]],
      dictamen_reporte_acta: [''],
      anexos: [''], // String separado por comas, gestionado por chips
      acuse_fisico_digital: ['', [
        Validators.maxLength(100)
      ]],
      expediente_fisico_digital: [false],
      comentarios_omega: ['', [
        Validators.maxLength(1000)
      ]]
    });
  }
}
```

---

## 🎨 Mejores Prácticas de UI/UX

### 1. **Componentes Reutilizables**

Mantener los componentes custom existentes:
- `CustomFormFieldComponent`
- `CustomSelectComponent`
- `CustomTextareaComponent`

### 2. **Validación en Tiempo Real**

```typescript
// Mostrar errores solo después de que el usuario interactúe
- touched: usuario tocó el campo
- dirty: usuario modificó el valor
- Invalid: el valor no cumple las validaciones
```

### 3. **Feedback Visual**

- ✅ Iconos de estado (✓, ✗, ⚠)
- ✅ Colores semánticos (verde=éxito, rojo=error, amarillo=advertencia)
- ✅ Mensajes de ayuda contextuales
- ✅ Indicadores de progreso del formulario

### 4. **Accesibilidad**

- ✅ Labels asociados a inputs
- ✅ ARIA labels para screen readers
- ✅ Navegación por teclado
- ✅ Contraste de colores adecuado

---

## 🔧 Servicios y Utilidades

### 1. **Servicio de Validación Personalizada**

```typescript
// custom-validators.ts
export class CustomValidators {
  static expedientePattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^Exp\.\d{3}$/i;
      return pattern.test(control.value) ? null : { expedientePattern: true };
    };
  }

  static oficioPattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^\d{3}\s\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{4}-\d{2}$/;
      return pattern.test(control.value) ? null : { oficioPattern: true };
    };
  }

  static notFutureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fecha = new Date(control.value);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      return fecha <= hoy ? null : { futureDate: true };
    };
  }

  static afterFechaDocumento(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent || !control.value) return null;
      
      const fechaDocumento = parent.get('fecha_documento')?.value;
      if (!fechaDocumento) return null;
      
      const fechaRecibido = new Date(control.value);
      const fechaDoc = new Date(fechaDocumento);
      
      return fechaRecibido >= fechaDoc ? null : { dateBeforeDocument: true };
    };
  }

  static mesFechaConsistency(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const fechaDoc = form.get('fecha_documento')?.value;
      const mesDoc = form.get('mes_documento')?.value;
      
      if (!fechaDoc || !mesDoc) return null;
      
      const fecha = new Date(fechaDoc);
      const mesFecha = fecha.getMonth() + 1;
      
      return mesFecha === mesDoc ? null : { mesFechaInconsistency: true };
    };
  }

  static woosPattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^REQS\d{11}$/i;
      return pattern.test(control.value) ? null : { woosPattern: true };
    };
  }
}
```

### 2. **Helper de Fechas**

```typescript
// date-helpers.ts
export class DateHelpers {
  static formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static calcularDiasRetraso(fechaVencimiento: Date): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    
    const diferencia = Math.ceil((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  }
}
```

---

## 📦 Estructura de Interfaces

```typescript
// expediente-form.model.ts
export interface ExpedienteFormData {
  paso1: Paso1FormData;
  paso2: Paso2FormData;
  paso3: Paso3FormData;
}

export interface Paso1FormData {
  expediente: string;
  oficio?: string;
  numero_entrada_central?: string;
  remitente_area?: string;
  referencia_asunto?: string;
  fecha_documento?: Date;
  mes_documento?: number;
  fecha_recibido?: Date;
}

export interface Paso2FormData {
  plazo_vencimiento_prioridad?: number;
  fecha_vencimiento?: Date;
  dias_retraso?: number;
  fecha_notificacion?: Date;
  sistema_aplicativo?: string;
  responsable_fecha_asignacion?: string;
  woos?: string;
  numero_solicitudes_reales?: number;
  estatus?: string;
  ubicacion_carpeta?: string;
  respuesta_total_parcial?: string;
  referencia_respuesta?: string;
  observaciones?: string;
}

export interface Paso3FormData {
  oficios_comision_apoyo?: string;
  dictamen_reporte_acta?: string;
  anexos?: string;
  acuse_fisico_digital?: string;
  expediente_fisico_digital?: boolean;
  comentarios_omega?: string;
}
```

---

## 🧪 Testing

### Estrategia de Testing:

1. **Unit Tests** para validadores custom
2. **Component Tests** para cada paso del formulario
3. **Integration Tests** para el flujo completo del stepper
4. **E2E Tests** para el caso de uso completo

---

## 🚀 Próximos Pasos

1. ✅ Aprobar arquitectura propuesta
2. ⏳ Implementar validadores custom
3. ⏳ Crear servicios de utilidad
4. ⏳ Implementar Paso 1 con la nueva arquitectura
5. ⏳ Implementar Paso 2 con la nueva arquitectura
6. ⏳ Implementar Paso 3 con la nueva arquitectura
7. ⏳ Integrar validaciones complejas
8. ⏳ Agregar tests unitarios
9. ⏳ Optimizar UX/UI

---

**Última actualización:** $(date)
**Autor:** Sistema de Desarrollo Tlapohualli
