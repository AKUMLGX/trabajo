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
    exp: number;
    /** Especialista del catálogo que corresponde al usuario (rol 003). En local se elige al entrar; después se resolverá por RFC. */
    especialista?: EspecialistaSesion | null;
}

export interface EspecialistaSesion {
    nombre: string;
    /** Una persona puede estar en varios grupos (analista, QA, correlación) con un id por grupo. */
    ids: number[];
}

// Nueva interfaz para los claims completos del JWT
export interface JWTClaims {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    nbf: number;
    sub: string;
    cn: string;
    roles: string;
    nombreCompleto: string;
    tipoContribuyente?: string;
    tipoPersona?: string;
}

// Interfaz extendida para información completa del usuario
export interface UsuarioCompleto {
    // Datos básicos de sessionInfo
    rfc: string;
    nombre: string;
    roles: string;
    token: string;
    exp: number;
    
    // Datos adicionales del JWT
    tipoContribuyente?: string;
    tipoPersona?: string;
    fechaExpiracion: Date;
    fechaEmision: Date;
    rolesArray: string[];
    especialista?: EspecialistaSesion | null;
    
    // Información de administración SAT
    administracion: number | null;
    descripcionAdministracion: string;
    
    // Datos calculados/derivados
    esAdmin: boolean;
    esCapturista: boolean;
    esSupervisor: boolean;
    esSupervisorAtencion: boolean;
    esCapturistaAtencion: boolean;
    tiempoRestanteSesion: number; // minutos
    sesionProximaExpirar: boolean; // si expira en menos de 15 min
}

// Interfaz para el estado de autenticación
export interface EstadoAutenticacion {
    isAuthenticated: boolean;
    isLoading: boolean;
    usuario: UsuarioCompleto | null;
    error: string | null;
}

// Interfaces para administración
export interface AdministracionResponse {
    Administracion: number;
}

export interface AdministracionInfo {
    administracion: AdministracionResponse;
}

export interface CardsAdministracionResponse {
    data: AdministracionInfo[];
}

