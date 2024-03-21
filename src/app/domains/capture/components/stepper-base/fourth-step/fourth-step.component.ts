import { Component, Input } from '@angular/core';
import { FormComponent } from '../third-step/preliminar-form/form/form.component';

@Component({
  selector: 'app-fourth-step',
  standalone: true,
  imports: [
    FormComponent,
  ],
  templateUrl: './fourth-step.component.html',
  styleUrl: './fourth-step.component.css'
})
export class FourthStepComponent {

  @Input({required: true}) dropdownChoice: string = '';

}
