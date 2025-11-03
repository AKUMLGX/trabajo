import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-textarea" [class.focused]="isFocused" [class.has-value]="hasValue" [class.error]="errorMessage" [class.disabled]="disabled">
      <label class="custom-label" [for]="fieldId">
        {{ label }}
        <span *ngIf="required" class="text-red-500 font-bold ml-1">*</span>
      </label>
      <div class="textarea-container">
        <textarea
          [id]="fieldId"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [rows]="rows"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="custom-textarea-input"
        ></textarea>
        <div class="textarea-border"></div>
        <div class="textarea-highlight"></div>
      </div>
      <div class="hint-text" *ngIf="hint && !errorMessage">{{ hint }}</div>
      <div class="error-text" *ngIf="errorMessage">{{ errorMessage }}</div>
    </div>
  `,
  styleUrls: ['./custom-textarea.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTextareaComponent),
      multi: true
    }
  ]
})
export class CustomTextareaComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() hint: string = '';
  @Input() errorMessage: string | null = '';
  @Input() disabled: boolean = false;
  @Input() rows: number = 4;
  @Input() required: boolean = false;

  value: string = '';
  isFocused: boolean = false;
  hasValue: boolean = false;
  fieldId: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    this.fieldId = 'textarea-' + Math.random().toString(36).substr(2, 9);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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
