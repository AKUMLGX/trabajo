import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,  
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  constructor(
    private fb: FormBuilder,
  ){}

  public userInputForm: FormGroup = this.fb.group({
    userInput: ['', [Validators.required]],
  });

  saveuserInputForm(): void {
    console.log(this.userInputForm.value);
  }

  index = 0;
  btnClass: any;
  iptClass:any;

  capturedText = '';

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

  // submitSearch(event:any) {

  //   //this.capturedText = event.target.value ;

  //   console.log(event.target.value);

  // }

}
