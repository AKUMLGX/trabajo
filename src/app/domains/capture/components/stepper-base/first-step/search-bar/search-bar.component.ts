import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  index = 0;
  btnClass: any;
  iptClass:any;

  isSendButtonHidden: boolean = false;

  tabChange(data: number){
    this.index = data;
  }
  btnClickHandler() {
    if(this.btnClass) {
      this.btnClass  = '';
      this.iptClass  = '';
    } else {
    this.btnClass = 'close'
    this.iptClass = 'square'
    }
  }

  sendSearch() {

    const inputSearch = document.getElementById("searchId") as HTMLInputElement;
    const retrievingValueType = inputSearch.value;

  }

//ESTE APPROACH NO VA A FUNCIONAR. PARA HABILITAR EL BOTON DE ENVIAR
//ES NECESARIO TRABAJAR CON REACTIVE FORMS DE ANGULAR
//PUES ES LA FORMA MAS RAPIDA
//PARA IMPLEMENTAR EL HECHO DE QUE EL USUARIO AL INGRESAR UN CARACTER
//SE ACTIVE EL BOTON DE ENVIAR
  


}
