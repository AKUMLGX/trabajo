export type TipoUsuarioRequerimiento =
  | 'SERVIDOR_PUBLICO'
  | 'EMPRESA'
  | 'NA';

export interface UsuarioRequerimiento {
  id_temporal: string;
  tipo_usuario: TipoUsuarioRequerimiento;
  nombre: string;
  rfc: string;
}

export interface UsuarioRequerimientoPayload {
  tipo_usuario: TipoUsuarioRequerimiento;
  nombre: string;
  rfc: string;
}