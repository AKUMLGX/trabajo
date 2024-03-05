import { Component } from '@angular/core';
import { PreliminarFormComponent } from './preliminar-form/preliminar-form.component';


@Component({
  selector: 'app-third-step',
  standalone: true,
  imports: [ PreliminarFormComponent],
  templateUrl: './third-step.component.html',
  styleUrl: './third-step.component.css'
})
export class ThirdStepComponent {

}
