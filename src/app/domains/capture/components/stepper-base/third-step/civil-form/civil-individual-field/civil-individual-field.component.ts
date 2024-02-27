import { Component, Input, forwardRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

@Component({
  selector: 'app-civil-individual-field',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './civil-individual-field.component.html',
  styleUrl: './civil-individual-field.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CivilIndividualFieldComponent),
      multi: true,
    },
  ],
})
export class CivilIndividualFieldComponent implements ControlValueAccessor {

  @Input() label: string = '';
  @Input() formControlName: string = '';

  // Implement ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any) {}
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

}
