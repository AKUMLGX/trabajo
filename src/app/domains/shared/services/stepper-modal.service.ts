import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StepperModalService {

  constructor() { }



  CARPETAIVN = signal<boolean>(false)


    stepperNextAuto(
      carpeta:boolean
    ){
      this.CARPETAIVN.set(carpeta)
    }

}
