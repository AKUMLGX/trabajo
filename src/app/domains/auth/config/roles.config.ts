/**
 * Catálogo único de roles y módulos de Tlálcalli.
 * Los nombres de rol deben coincidir con el claim `roles` del IdP (sin `cn=`) y con
 * la lista blanca `get_user_rol` de `back/src/helper.rs`.
 */

export type ModuloTlalcalli = 'captura' | 'consulta' | 'asignacion' | 'atencionCierre' | 'estadisticos';

export type ModuloPermissions = Record<ModuloTlalcalli, boolean>;

export interface ModuloConfig {
  clave: ModuloTlalcalli;
  titulo: string;
  ruta: string;
  icono: string;
}

/** Orden del menú lateral. */
export const MODULOS_TLALCALLI: ModuloConfig[] = [
  { clave: 'captura', titulo: 'Captura', ruta: '/layout/capture', icono: 'dvr' },
  { clave: 'consulta', titulo: 'Consulta', ruta: '/layout/tracking', icono: 'analytics' },
  { clave: 'asignacion', titulo: 'Seguimiento y Asignación', ruta: '/layout/responsables', icono: 'pending_actions' },
  { clave: 'atencionCierre', titulo: 'Atención / cierre', ruta: '/layout/atencion-cierre', icono: 'check_circle' },
  { clave: 'estadisticos', titulo: 'Panel Estadístico', ruta: '/layout/dashboard', icono: 'insights' },
];

/** Token que usa la sesión de prueba local (el back con DISABLE_AUTH=true lo acepta). */
export const TOKEN_SESION_LOCAL = 'MOCK_ACCESS_TOKEN';

export const ROL_CAPTURA = 'SIAT_TLALCALLI_001_CAPTURA_ASUNTO';
export const ROL_SUPERVISA = 'SIAT_TLALCALLI_002_SUPERVISA_ASUNTO';
/** El id del IdP se conserva; en negocio es el rol del especialista que solo consulta lo que tiene asignado. */
export const ROL_ESPECIALISTA = 'SIAT_TLALCALLI_003_ADMINISTRA_ASUNTO';

export type RolTlalcalli = typeof ROL_CAPTURA | typeof ROL_SUPERVISA | typeof ROL_ESPECIALISTA;

export interface RolConfig {
  id: RolTlalcalli;
  etiqueta: string;
  descripcion: string;
}

/** Orden de presentación (perfil y selector de rol local). */
export const ROLES_TLALCALLI: RolConfig[] = [
  { id: ROL_CAPTURA, etiqueta: 'Captura de asuntos', descripcion: 'Acceso a todos los módulos' },
  { id: ROL_SUPERVISA, etiqueta: 'Supervisión de asuntos', descripcion: 'Seguimiento y Asignación, y Atención/cierre' },
  {
    id: ROL_ESPECIALISTA,
    etiqueta: 'Consulta de especialista',
    descripcion: 'Solo Seguimiento y Asignación: consulta de los asuntos que tiene asignados',
  },
];

const TODOS: ModuloPermissions = {
  captura: true,
  consulta: true,
  asignacion: true,
  atencionCierre: true,
  estadisticos: true,
};

export const PERMISOS_POR_ROL: Record<RolTlalcalli, ModuloPermissions> = {
  [ROL_CAPTURA]: { ...TODOS },
  [ROL_SUPERVISA]: { ...sinPermisos(), asignacion: true, atencionCierre: true },
  [ROL_ESPECIALISTA]: { ...sinPermisos(), asignacion: true },
};

/** Acciones dentro de un módulo al que el rol ya tiene acceso. */
export interface AccionesPermitidas {
  /** Editar expediente y agregar, editar o eliminar oficios desde Consulta. */
  editarConsulta: boolean;
  /** Guardar seguimiento, enviar correo de asignación y administrar el catálogo de especialistas. */
  editarSeguimiento: boolean;
  /** Ver en Seguimiento todos los asuntos; false = solo los asignados al especialista de la sesión. */
  verTodosLosAsuntos: boolean;
}

export const ACCIONES_POR_ROL: Record<RolTlalcalli, AccionesPermitidas> = {
  [ROL_CAPTURA]: { editarConsulta: true, editarSeguimiento: true, verTodosLosAsuntos: true },
  [ROL_SUPERVISA]: { editarConsulta: false, editarSeguimiento: true, verTodosLosAsuntos: true },
  [ROL_ESPECIALISTA]: { editarConsulta: false, editarSeguimiento: false, verTodosLosAsuntos: false },
};

export function sinAcciones(): AccionesPermitidas {
  return { editarConsulta: false, editarSeguimiento: false, verTodosLosAsuntos: false };
}

/** Unión (OR) de las acciones de todos los roles reconocidos del usuario. */
export function accionesDeRoles(roles: string[]): AccionesPermitidas {
  const acciones = sinAcciones();
  for (const rol of roles) {
    const id = normalizarRol(rol);
    if (!esRolTlalcalli(id)) continue;
    const delRol = ACCIONES_POR_ROL[id];
    acciones.editarConsulta = acciones.editarConsulta || delRol.editarConsulta;
    acciones.editarSeguimiento = acciones.editarSeguimiento || delRol.editarSeguimiento;
    acciones.verTodosLosAsuntos = acciones.verTodosLosAsuntos || delRol.verTodosLosAsuntos;
  }
  return acciones;
}

export function sinPermisos(): ModuloPermissions {
  return { captura: false, consulta: false, asignacion: false, atencionCierre: false, estadisticos: false };
}

/** Quita el prefijo `cn=` que manda el IdP. */
export function normalizarRol(rol: string): string {
  return rol.replace(/^cn=/i, '').trim();
}

export function esRolTlalcalli(rol: string): rol is RolTlalcalli {
  return normalizarRol(rol) in PERMISOS_POR_ROL;
}

/** Unión (OR) de los permisos de todos los roles reconocidos del usuario. */
export function permisosDeRoles(roles: string[]): ModuloPermissions {
  const permisos = sinPermisos();
  for (const rol of roles) {
    const id = normalizarRol(rol);
    if (!esRolTlalcalli(id)) continue;
    const delRol = PERMISOS_POR_ROL[id];
    for (const modulo of MODULOS_TLALCALLI) {
      permisos[modulo.clave] = permisos[modulo.clave] || delRol[modulo.clave];
    }
  }
  return permisos;
}

/** Ruta del primer módulo permitido (orden del menú) o acceso denegado si no tiene ninguno. */
export function rutaInicialDeRoles(roles: string[]): string {
  const permisos = permisosDeRoles(roles);
  return MODULOS_TLALCALLI.find((m) => permisos[m.clave])?.ruta ?? '/layout/access-denied';
}

/** Etiqueta del primer rol reconocido, en el orden de `ROLES_TLALCALLI`. */
export function etiquetaRolPrincipal(roles: string[]): string | null {
  const ids = new Set(roles.map(normalizarRol));
  return ROLES_TLALCALLI.find((r) => ids.has(r.id))?.etiqueta ?? null;
}
