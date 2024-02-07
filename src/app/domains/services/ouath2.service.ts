import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Oauth2 } from '../interfaces/oauthParameters.interface';


@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {

  constructor(private httpClient: HttpClient) { }

  login(): void {
    this.httpClient.get(environment.baseUrl + environment.tokenValidationEndpoint)
      .subscribe(data => {
        //console.log("Se obtiene lo siguiente " + data);
      });   
  }

  do_oauth(): void {
    this.httpClient.get<Oauth2>(environment.baseUrl + environment.oauthParametersEndpoint)
      .subscribe(data => {
        console.log("Se obtiene lo siguiente " + data.authentication_url);
      });   
  }
  


}

