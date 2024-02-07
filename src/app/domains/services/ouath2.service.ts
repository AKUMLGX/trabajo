import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Oauth2 } from '../interfaces/oauth2.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Oauth2Service {
  constructor(private httpClient: HttpClient, private router: Router) {}

  login(): void {
    this.httpClient
      .get(environment.baseUrl + environment.tokenValidationEndpoint)
      .subscribe((data) => {
        //console.log("Se obtiene lo siguiente " + data);
      });
  }

  do_oauth(): void {
    this.httpClient
      .get<Oauth2>(environment.baseUrl + environment.oauthParametersEndpoint)
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
