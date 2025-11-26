import { Component, Input, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KeyboardNavigationDirective } from '../../../directives/keyboard-navigation.directive';

@Component({
  selector: 'app-custom-form-field',
  standalone: true,
  imports: [CommonModule, KeyboardNavigationDirective],
  template: `
    <div class="custom-form-field" [class.focused]="isFocused" [class.has-value]="hasValue" [class.error]="errorMessage">
      <label class="custom-label" [for]="fieldId">
        {{ label }}
        <span *ngIf="required" class="text-red-500 font-bold ml-1">*</span>
      </label>
      <div class="input-container">
        <input
          #inputElement
          [id]="fieldId"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.maxlength]="maxlength"
          [attr.list]="datalistOptions && datalistOptions.length > 0 ? fieldId + '-list' : null"
          [class.with-dropdown]="enableAutocomplete && datalistOptions && datalistOptions.length > 0"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [appKeyboardNavigation]="true"
          [skipOnEnter]="enableAutocomplete && showOptions"
          class="custom-input"
        />
        <datalist *ngIf="datalistOptions && datalistOptions.length > 0" [id]="fieldId + '-list'">
          <option *ngFor="let option of datalistOptions" [value]="option"></option>
        </datalist>
        <button
          *ngIf="enableAutocomplete && datalistOptions && datalistOptions.length > 0"
          type="button"
          class="autocomplete-toggle"
          (mousedown)="toggleOptions($event)"
          aria-label="Mostrar opciones"
        >
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1.5L7 6.5L13 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="input-border"></div>
        <div class="input-highlight"></div>
      </div>
      <div
        class="autocomplete-panel"
        *ngIf="enableAutocomplete && showOptions && filteredOptions.length > 0"
      >
        <div
          class="autocomplete-option"
          *ngFor="let option of filteredOptions; let idx = index"
          [class.active]="idx === highlightedIndex"
          (mousedown)="selectOption(option, $event)"
        >
          {{ option }}
        </div>
      </div>
      <div class="hint-text" *ngIf="hint && !errorMessage">{{ hint }}</div>
      <div class="error-text" *ngIf="errorMessage">{{ errorMessage }}</div>
    </div>
  `,
  styleUrls: ['./custom-form-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormFieldComponent),
      multi: true
    }
  ]
})
export class CustomFormFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() hint: string = '';
  @Input() errorMessage: string | null = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() datalistOptions: string[] = [];
  @Input() enableAutocomplete: boolean = false;
  @Input() maxlength: number | null = null;

  value: string = '';
  isFocused: boolean = false;
  hasValue: boolean = false;
  fieldId: string = '';
  showOptions: boolean = false;
  filteredOptions: string[] = [];
  highlightedIndex = -1;

  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;

  private blurTimeout?: number;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    this.fieldId = 'field-' + Math.random().toString(36).substr(2, 9);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.hasValue = this.value.length > 0;
    this.onChange(this.value);
    if (this.enableAutocomplete) {
      this.updateFilteredOptions();
      this.showOptions = this.filteredOptions.length > 0;
      this.highlightedIndex = -1;
    }
  }

  onFocus(): void {
    this.isFocused = true;
    if (this.enableAutocomplete) {
      if (this.blurTimeout) {
        window.clearTimeout(this.blurTimeout);
        this.blurTimeout = undefined;
      }
      this.updateFilteredOptions();
      this.showOptions = this.filteredOptions.length > 0;
      this.highlightedIndex = -1;
    }
  }

  onBlur(): void {
    this.isFocused = false;
    if (this.enableAutocomplete) {
      this.blurTimeout = window.setTimeout(() => {
        this.showOptions = false;
      }, 150);
    }
    this.onTouched();
  }

  toggleOptions(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.enableAutocomplete) {
      return;
    }

    if (this.blurTimeout) {
      window.clearTimeout(this.blurTimeout);
      this.blurTimeout = undefined;
    }

    this.updateFilteredOptions();
    this.showOptions = !this.showOptions && this.filteredOptions.length > 0;
    this.highlightedIndex = -1;

    if (this.showOptions) {
      setTimeout(() => this.inputElement?.nativeElement.focus(), 0);
    }
  }

  selectOption(option: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.value = option;
    this.hasValue = true;
    this.onChange(this.value);
    this.showOptions = false;
    this.highlightedIndex = -1;

    setTimeout(() => this.inputElement?.nativeElement.focus(), 0);
  }

  onKeyDown(event: KeyboardEvent): void {
    // Si hay opciones de autocompletado abiertas, manejar navegación en ellas
    if (this.enableAutocomplete && this.showOptions && this.filteredOptions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredOptions.length;
        return;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.highlightedIndex =
          this.highlightedIndex <= 0 ? this.filteredOptions.length - 1 : this.highlightedIndex - 1;
        return;
      } else if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
          event.preventDefault();
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
          return;
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.showOptions = false;
        this.highlightedIndex = -1;
        return;
      }
    }

    // Si Enter sin Ctrl/Shift y no hay opciones abiertas, la directiva manejará la navegación
    // No interferir aquí para permitir que la directiva funcione
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.hasValue = this.value.length > 0;
    if (this.enableAutocomplete) {
      this.updateFilteredOptions();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private updateFilteredOptions(): void {
    if (!this.enableAutocomplete || !this.datalistOptions || this.datalistOptions.length === 0) {
      this.filteredOptions = [];
      return;
    }

    const term = (this.value || '').toLowerCase().trim();
    if (!term) {
      this.filteredOptions = [...this.datalistOptions];
    } else {
      this.filteredOptions = this.datalistOptions.filter(option =>
        option.toLowerCase().includes(term)
      );
    }
  }
}
