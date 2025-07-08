import { HttpClient, HttpHandlerFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Oauth2Code,
  Oauth2Params,
  SessionInfo,
} from '../interfaces/oauth2.interfaces';
import { LogoutService } from './logout.service';
import { UserService } from './user.service';
import { BehaviorSubject, from } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Oauth2Service {
  constructor(
    private httpClient: HttpClient, 
    private logoutService: LogoutService,
    private userService: UserService
  ) { }

  getToken(oauth2Code: Oauth2Code): void {
    this.httpClient
      .post<SessionInfo>(
        environment.baseUrl + environment.tokenValidationEndpoint,
        oauth2Code, { withCredentials: true }
      )
      .subscribe({
        next: (data) => {
          localStorage.setItem('sessionInfo', JSON.stringify(data));
          // Notificar al UserService que la información ha cambiado
          this.userService.actualizarUsuario();
        },
        error: () => {
          this.logoutService.logout();
        },
      });
  }

  refeshToken() {
      return this.httpClient
      .get(
        environment.baseUrl + environment.refreshTokenEndpoint, { withCredentials: true, responseType: "text" }
      );
     
  }

  do_oauth(): void {
    this.httpClient
      .get<Oauth2Params>(
        environment.baseUrl + environment.oauthParametersEndpoint
      )
      .subscribe((data) => {
        let target_url =
          data.authentication_url +
          '?response_type=' +
          data.response_type +
          '&resourceServer=' +
          data.resource_server +
          '&state=' +
          data.state +
          '&client_id=' +
          data.client_id +
          '&redirect_uri=' +
          data.redirect_uri +
          '&scope=' +
          data.scope;
        window.location.href = target_url;
      });
  }
}
