import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-civil-individual-field',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './civil-individual-field.component.html',
  styleUrl: './civil-individual-field.component.css'
})
export class CivilIndividualFieldComponent {

  @Input({required: true}) label!: string;
  @Input({required: true}) formControlName!: string;

}
