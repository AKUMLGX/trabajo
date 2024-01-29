import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { StepperBaseComponent } from '../../components/stepper-base/stepper-base.component';

@Component({
  selector: 'app-capture-page',
  standalone: true,
  imports: [
    InitTemplateComponent,
    StepperBaseComponent,
  ],
  templateUrl: './capture-page.component.html',
  styleUrl: './capture-page.component.css'
})
export class CapturePageComponent {

}
