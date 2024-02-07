import { Component } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

}
