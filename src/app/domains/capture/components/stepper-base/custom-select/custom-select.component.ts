import { Component, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
    selector: 'app-custom-select',
    imports: [CommonModule],
    templateUrl: './custom-select.component.html',
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
  isFocused = false;
  hasValue = false;
  fieldId = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    this.fieldId = 'select-' + Math.random().toString(36).substring(2, 11);
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = target.value;

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
    this.value = value ?? '';
    this.hasValue = this.value !== '';
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