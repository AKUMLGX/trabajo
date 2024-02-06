import { Component } from '@angular/core';
import { EuacapeFormComponent } from '../second-step/euacape-form/euacape-form.component';

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

}
