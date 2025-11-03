import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-form-field" [class.focused]="isFocused" [class.has-value]="hasValue" [class.error]="errorMessage">
      <label class="custom-label" [for]="fieldId">
        {{ label }}
        <span *ngIf="required" class="text-red-500 font-bold ml-1">*</span>
      </label>
      <div class="input-container">
        <input
          [id]="fieldId"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="custom-input"
        />
        <div class="input-border"></div>
        <div class="input-highlight"></div>
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

  value: string = '';
  isFocused: boolean = false;
  hasValue: boolean = false;
  fieldId: string = '';

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
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.hasValue = this.value.length > 0;
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
}
