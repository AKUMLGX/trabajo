import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-custom-textarea',
    imports: [NgClass],
    template: `
    <div class="relative mb-7 w-full">
      <label
        [for]="fieldId"
        class="mb-2.5 block text-[15px] font-noto-sans tracking-wide text-gray-800 transition-colors duration-300"
        [ngClass]="{
          'text-tlalcalli-primary': isFocused && !errorMessage,
          'text-red-500': errorMessage,
          'text-gray-400': disabled
        }">
        {{ label }}
        @if (required) {
          <span class="ml-1 font-noto-sans text-red-500">*</span>
        }
      </label>

      <div class="relative w-full overflow-visible rounded-2xl">
        <textarea
          [id]="fieldId"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [rows]="rows"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="w-full resize-y rounded-2xl border-2 px-6 py-4 text-base font-noto-sans tracking-wide text-gray-800 outline-none transition-all duration-300 placeholder:font-normal placeholder:italic placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-70"
          [ngClass]="{
            'border-transparent bg-gradient-to-br from-white to-slate-50 shadow-[0_4px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-tlalcalli-primary/20 hover:from-white hover:to-slate-100 hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]': !isFocused && !errorMessage && !disabled,
            'border-tlalcalli-primary bg-white shadow-[0_0_0_6px_rgba(48,38,76,0.10),0_8px_25px_rgba(0,0,0,0.15)]': isFocused && !errorMessage,
            'border-red-500 bg-red-50 shadow-[0_0_0_6px_rgba(239,68,68,0.10),0_8px_25px_rgba(239,68,68,0.15)]': errorMessage
          }"
        ></textarea>

        <div
          class="pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-300"
          [ngClass]="{
            'w-full bg-tlalcalli-primary shadow-[0_0_8px_rgba(48,38,76,0.30)]': isFocused && !errorMessage,
            'w-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.30)]': errorMessage,
            'w-0': !isFocused && !errorMessage
          }">
        </div>
      </div>

      @if (hint && !errorMessage) {
        <div
          class="mt-2 text-[13px] font-noto-sans italic text-gray-500"
          [ngClass]="{ 'font-semibold text-tlalcalli-primary': isFocused }">
          {{ hint }}
        </div>
      }

      @if (errorMessage) {
        <div class="mt-2 text-[13px] font-noto-sans text-red-500">
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
