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

}
