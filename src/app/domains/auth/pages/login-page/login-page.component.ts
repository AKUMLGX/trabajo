import { Component } from '@angular/core';
import { Oauth2Service } from '../../../services/ouath2.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  constructor(private oauth2Service: Oauth2Service) {}

  login():void {
    this.oauth2Service.do_oauth();
  }

}
