import { Directive, HostListener, Input, Output, EventEmitter, ElementRef } from '@angular/core';

/**
 * Directiva para mejorar la navegación por teclado en formularios
 * - Enter: Avanza al siguiente campo
 * - Shift+Enter: Retrocede al campo anterior
 * - Ctrl+Enter: Ejecuta acción específica (ej: buscar)
 */
@Directive({
  selector: '[appKeyboardNavigation]',
  standalone: true
})
export class KeyboardNavigationDirective {
  @Input() appKeyboardNavigation: boolean | string = true;
  @Input() nextFieldSelector?: string;
  @Input() previousFieldSelector?: string;
  @Input() actionOnCtrlEnter?: () => void;
  @Input() skipOnEnter: boolean = false; // Si es true, no avanza automáticamente
  
  @Output() enterPressed = new EventEmitter<void>();
  @Output() ctrlEnterPressed = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isTextarea = target.tagName === 'TEXTAREA';
    const isInput = target.tagName === 'INPUT';
    const isSelect = target.tagName === 'SELECT';

    // Ctrl+Enter: Ejecutar acción específica
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (this.actionOnCtrlEnter) {
        this.actionOnCtrlEnter();
      }
      this.ctrlEnterPressed.emit();
      return;
    }

    // Enter: Avanzar al siguiente campo (excepto en textareas)
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
      // Si es textarea, permitir Enter normal
      if (isTextarea) {
        return;
      }

      // Si está en un select o input y hay opciones de autocompletado abiertas, no interferir
      // Verificar si hay un panel de autocompletado visible
      const autocompletePanel = document.querySelector('.autocomplete-panel:not([style*="display: none"])');
      if (autocompletePanel) {
        return; // Dejar que el componente maneje la selección
      }

      // Si skipOnEnter está activado, solo emitir evento
      if (this.skipOnEnter) {
        this.enterPressed.emit();
        return;
      }

      event.preventDefault();
      this.focusNextField();
      this.enterPressed.emit();
      return;
    }

    // Shift+Enter: Retroceder al campo anterior
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      this.focusPreviousField();
      return;
    }
  }

  /**
   * Enfocar el siguiente campo
   */
  private focusNextField(): void {
    if (this.nextFieldSelector) {
      const nextField = document.querySelector(this.nextFieldSelector) as HTMLElement;
      if (nextField) {
        nextField.focus();
        // Si es un input, seleccionar el texto para facilitar edición
        if (nextField instanceof HTMLInputElement && nextField.type !== 'date' && nextField.type !== 'file') {
          nextField.select();
        }
        return;
      }
    }

    // Navegación automática: buscar el siguiente campo editable
    const allFields = this.getAllEditableFields();
    const currentIndex = allFields.findIndex(field => field === this.el.nativeElement);
    
    if (currentIndex >= 0 && currentIndex < allFields.length - 1) {
      const nextField = allFields[currentIndex + 1];
      nextField.focus();
      if (nextField instanceof HTMLInputElement && nextField.type !== 'date' && nextField.type !== 'file') {
        nextField.select();
      }
    }
  }

  /**
   * Enfocar el campo anterior
   */
  private focusPreviousField(): void {
    if (this.previousFieldSelector) {
      const prevField = document.querySelector(this.previousFieldSelector) as HTMLElement;
      if (prevField) {
        prevField.focus();
        if (prevField instanceof HTMLInputElement && prevField.type !== 'date' && prevField.type !== 'file') {
          prevField.select();
        }
        return;
      }
    }

    // Navegación automática: buscar el campo anterior editable
    const allFields = this.getAllEditableFields();
    const currentIndex = allFields.findIndex(field => field === this.el.nativeElement);
    
    if (currentIndex > 0) {
      const prevField = allFields[currentIndex - 1];
      prevField.focus();
      if (prevField instanceof HTMLInputElement && prevField.type !== 'date' && prevField.type !== 'file') {
        prevField.select();
      }
    }
  }

  /**
   * Obtener todos los campos editables del formulario
   */
  private getAllEditableFields(): HTMLElement[] {
    const form = this.el.nativeElement.closest('form');
    if (!form) {
      return [];
    }

    const selectors = [
      'input:not([type="hidden"]):not([disabled]):not([readonly])',
      'textarea:not([disabled]):not([readonly])',
      'select:not([disabled])',
      'button:not([disabled])'
    ];

    const fields: HTMLElement[] = [];
    selectors.forEach(selector => {
      const elements = form.querySelectorAll(selector);
      elements.forEach(el => {
        // Excluir botones de submit ocultos
        if (el instanceof HTMLButtonElement && el.type === 'submit' && el.classList.contains('hidden')) {
          return;
        }
        fields.push(el as HTMLElement);
      });
    });

    return fields;
  }
}

