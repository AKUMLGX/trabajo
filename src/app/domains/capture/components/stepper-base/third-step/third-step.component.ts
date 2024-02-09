import { Component } from '@angular/core';
import { PreliminarEuacapeFormComponent } from './preliminar-euacape-form/preliminar-euacape-form.component';


@Component({
  selector: 'app-third-step',
  standalone: true,
  imports: [ PreliminarEuacapeFormComponent],
  templateUrl: './third-step.component.html',
  styleUrl: './third-step.component.css'
})
export class ThirdStepComponent {

}
