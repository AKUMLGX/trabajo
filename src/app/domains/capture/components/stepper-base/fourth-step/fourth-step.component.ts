import { Component, Input } from '@angular/core';
import { EuacapeFormComponent } from '../third-step/preliminar-form/euacape-form/euacape-form.component';

@Component({
  selector: 'app-fourth-step',
  standalone: true,
  imports: [
    EuacapeFormComponent,
  ],
  templateUrl: './fourth-step.component.html',
  styleUrl: './fourth-step.component.css'
})
export class FourthStepComponent {

  @Input({required: true}) dropdownChoice: string = '';

}
