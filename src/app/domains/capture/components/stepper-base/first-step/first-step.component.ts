import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    SearchBarComponent,
    CommonModule,
    MatStepperModule,
    MatIconModule,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  firstStepButtonStatus: boolean = false;

  isEmptyList: boolean = false;

  firstColumnHeader: string = 'Folio interno';
  secondColumnHeader: string = 'Carpeta de Investigación';
  thirdColumnHeader: string = 'Oficio';
  fourthColumnHeader: string = 'Autoridad remitente';
  fifthColumnHeader: string = 'Persona relacionada';

  @Output() firstStepButtonStatusEmitter = new EventEmitter();

  ngOnInit() {
    setTimeout(() => {
      console.log(this.firstStepButtonStatus);
      this.firstStepButtonStatus = true;
      console.log(this.firstStepButtonStatus);
    }, 1000);
    
  }

  triggerSecondStep() {
    console.log(this.firstStepButtonStatus);
    this.firstStepButtonStatusEmitter.emit(this.firstStepButtonStatus);
  }

}
