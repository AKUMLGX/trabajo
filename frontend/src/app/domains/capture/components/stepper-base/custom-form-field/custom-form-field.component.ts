import { Component, Input, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-form-field',
  templateUrl: './custom-form-field.component.html',
  styleUrls: ['./custom-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormFieldComponent),
      multi: true,
    },
  ],
})
export class CustomFormFieldComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() datalistOptions: string[] = [];
  @Input() enableAutocomplete: boolean = false;

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
    if (!this.enableAutocomplete || !this.showOptions || this.filteredOptions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredOptions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex =
        this.highlightedIndex <= 0 ? this.filteredOptions.length - 1 : this.highlightedIndex - 1;
    } else if (event.key === 'Enter') {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
        event.preventDefault();
        this.selectOption(this.filteredOptions[this.highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.showOptions = false;
      this.highlightedIndex = -1;
    }
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
