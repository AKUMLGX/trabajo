import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectCarpetaStatusService {



  isCarpetaAvailable= signal(false);

  isCarpetaNull = signal(true);

  upadateCarpetaStatus(carpetaInv:boolean){
    this.isCarpetaAvailable.set(carpetaInv)
  }

  valideteIfCarpetaIsNull(isCarpetaNull:boolean){
    this.isCarpetaNull.set(isCarpetaNull)
  }
}
