import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  constructor() {}    
  logout() {
    //localStorage.clear();
    //window.location.href = environment.logoutUrl;
  }     
}



