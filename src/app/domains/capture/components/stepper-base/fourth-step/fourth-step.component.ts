import { Component, Input } from '@angular/core';
import { FormComponent } from '../third-step/preliminar-form/form/form.component';
import { CivilPenalMercantilFormComponent } from '../third-step/preliminar-form/civil-penal-mercantil-form/civil-penal-mercantil-form.component';

@Component({
  selector: 'app-fourth-step',
  standalone: true,
  imports: [
    FormComponent,
    CivilPenalMercantilFormComponent,
  ],
  templateUrl: './fourth-step.component.html',
  styleUrl: './fourth-step.component.css'
})
export class FourthStepComponent {

  @Input({required: true}) dropdownChoice = '';

}
