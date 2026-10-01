import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-custom-textarea',
    imports: [NgClass],
    template: `
    <div class="tl-field">
      <label
        [for]="fieldId"
        class="tl-label transition-colors"
        [ngClass]="{
          '!text-tlalcalli-primary': isFocused && !errorMessage,
          '!text-tlalcalli-error-muted': errorMessage,
          '!text-tlalcalli-gray': disabled
        }">
        {{ label }}
        @if (required) {
          <span class="ml-0.5 text-tlalcalli-error">*</span>
        }
      </label>

      <textarea
        [id]="fieldId"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [rows]="rows"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        class="tl-input !h-auto min-h-[96px] resize-y py-3 leading-relaxed"
        [ngClass]="{
          '!border-tlalcalli-error bg-tlalcalli-error/[0.03] focus:!ring-tlalcalli-error/10': errorMessage
        }"
      ></textarea>

      @if (hint && !errorMessage) {
        <div class="tl-field-hint">{{ hint }}</div>
      }

      @if (errorMessage) {
        <div class="tl-field-error">
          <span class="icon-font !text-[14px]">error</span>
          {{ errorMessage }}
        </div>
      }
    </div>
    `,
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

  private onChange = (_value: string) => {};
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
