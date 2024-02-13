import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsuntoChoiceService {

  constructor() { }

  asuntoUserChoice = signal('');

  choiceFromDropdown(usersChoice: string){
    this.asuntoUserChoice.set(usersChoice)
  }

}
