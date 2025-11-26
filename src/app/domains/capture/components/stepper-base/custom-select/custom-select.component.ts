import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-select" [class.focused]="isFocused" [class.has-value]="hasValue" [class.error]="errorMessage" [class.disabled]="disabled">
      <label class="custom-label" [for]="fieldId">
        {{ label }}
        <span *ngIf="required" class="text-red-500 font-bold ml-1">*</span>
      </label>
      <div class="select-container">
        <select
          [id]="fieldId"
          [value]="value"
          [disabled]="disabled"
          (change)="onSelectChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="custom-select-input"
        >
          <option value="">{{ placeholder }}</option>
          <option 
            *ngFor="let option of options" 
            [value]="option.value"
            [selected]="option.value == value"
            [disabled]="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="select-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="select-border"></div>
        <div class="select-highlight"></div>
      </div>
      <div class="hint-text" *ngIf="hint && !errorMessage">{{ hint }}</div>
      <div class="error-text" *ngIf="errorMessage">{{ errorMessage }}</div>
    </div>
  `,
  styleUrls: ['./custom-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccionar...';
  @Input() options: SelectOption[] = [];
  @Input() hint: string = '';
  @Input() errorMessage: string | null = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;

  value: any = '';
  isFocused: boolean = false;
  hasValue: boolean = false;
  fieldId: string = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    this.fieldId = 'select-' + Math.random().toString(36).substr(2, 9);
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = target.value;
    
    // Convertir a número si es posible
    let finalValue: any = newValue;
    if (newValue !== '' && !isNaN(Number(newValue))) {
      finalValue = Number(newValue);
    }
    
    this.value = finalValue;
    this.hasValue = Boolean(finalValue && finalValue !== '');
    
    this.onChange(finalValue);
    this.cdr.detectChanges();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined && value !== '') {
      this.value = value;
      this.hasValue = true;
    } else {
      this.value = '';
      this.hasValue = false;
    }
    
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}