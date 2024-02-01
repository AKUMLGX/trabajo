import { Component } from '@angular/core';
import { EuacapeFormComponent } from './euacape-form/euacape-form.component';

@Component({
  selector: 'app-second-step',
  standalone: true,
  imports: [EuacapeFormComponent],
  templateUrl: './second-step.component.html',
  styleUrl: './second-step.component.css'
})
export class SecondStepComponent {

}
