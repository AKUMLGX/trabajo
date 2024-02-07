export interface Oauth2Params {
    authentication_url: string;
    response_type:      string;
    resource_server:    string;
    state:              string;
    client_id:          string;
    redirect_uri:       string;
    scope:              string;
}

export interface Oauth2Code {
    code: string,
    scope: string,
}

export interface SessionInfo {
    rfc: string;
    nombre: string;
    roles: string;
    token: string;
}

