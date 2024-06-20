import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StepperModalService {

  CARPETAIVN = signal<boolean>(false)
    stepperNextAuto(nextStep:boolean){
      this.CARPETAIVN.set(nextStep)
    }
}
