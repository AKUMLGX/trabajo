import {
  CatalogoCentralResponse,
  CatalogoGeneralResponse,
  CatalogoGeneralesCentralResponse,
} from '../../interfaces/first-step-catalogos.interface';
import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';

/** Etiqueta unificada cuando no hay clave de administración en origen. */
export const ETIQUETA_SIN_DATO_ADMIN = 'Sin dato';

export interface CatalogoRemitenteAdmin {
  generales: Map<string, string>;
  centralesPorGeneral: Map<string, Map<string, string>>;
  todasCentrales: Map<string, string>;
  /** Nombre normalizado → claves; para registros que guardaron el nombre completo del área. */
  porNombre: Map<string, { generalClave: string; centralClave: string }>;
}

function normalizarNombreArea(texto: string | null | undefined): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function construirCatalogoRemitenteAdmin(
  generales: CatalogoGeneralResponse[],
  generalesXCentral: CatalogoGeneralesCentralResponse
): CatalogoRemitenteAdmin {
  const generalesMap = new Map<string, string>();
  const porNombre = new Map<string, { generalClave: string; centralClave: string }>();
  for (const g of generales.filter((x) => !x.eliminado)) {
    generalesMap.set(g.clave, `${g.clave} - ${g.nombre}`);
    porNombre.set(normalizarNombreArea(g.nombre), { generalClave: g.clave, centralClave: '' });
  }

  const centralesPorGeneral = new Map<string, Map<string, string>>();
  const todasCentrales = new Map<string, string>();

  for (const [generalClave, lista] of Object.entries(generalesXCentral ?? {})) {
    const mapa = new Map<string, string>();
    for (const c of (lista ?? []).filter((x) => !x.eliminado)) {
      const etiqueta = `${c.clave} - ${c.nombre}`;
      mapa.set(c.clave, etiqueta);
      todasCentrales.set(c.clave, etiqueta);
      porNombre.set(normalizarNombreArea(c.nombre), { generalClave, centralClave: c.clave });
    }
    centralesPorGeneral.set(generalClave, mapa);
  }

  return { generales: generalesMap, centralesPorGeneral, todasCentrales, porNombre };
}

/** Formato documentado en BD rework: GENERAL,CENTRAL,identificador libre. */
const MAX_IDENTIFICADOR_REMITENTE = 50;

/**
 * Valor de columna `remitente` en expediente_tlalcalli_rework: GENERAL,CENTRAL,identificador
 * para que el panel pueda agrupar por administración sin campos extra en data_busqueda.
 */
export function serializarRemitenteRework(params: {
  remitente_general?: string | null;
  remitente_central?: string | null;
  remitente_identificador?: string | null;
  remitente_area?: string | null;
}): string {
  const identificadorRaw = (params.remitente_identificador || params.remitente_area || '').trim();
  const identificador =
    identificadorRaw.length > MAX_IDENTIFICADOR_REMITENTE
      ? identificadorRaw.substring(0, MAX_IDENTIFICADOR_REMITENTE)
      : identificadorRaw;

  const general = (params.remitente_general || '').trim();
  const central = (params.remitente_central || '').trim();

  if (general) {
    return `${general},${central},${identificador}`;
  }

  const yaCompuesto = parsearRemitenteCompuesto(identificadorRaw);
  if (yaCompuesto) {
    return identificadorRaw;
  }

  const compuestoEnArea = parsearRemitenteCompuesto(params.remitente_area);
  if (compuestoEnArea) {
    return `${compuestoEnArea.generalClave},${compuestoEnArea.centralClave},${identificador}`;
  }

  return identificador;
}

export function parsearRemitenteCompuesto(remitente: string | null | undefined): {
  generalClave: string;
  centralClave: string;
  identificador: string;
} | null {
  const texto = (remitente || '').trim();
  if (!texto.includes(',')) {
    return null;
  }
  const partes = texto.split(',').map((p) => p.trim());
  if (partes.length < 2) {
    return null;
  }
  const [generalClave, centralClave, ...resto] = partes;
  if (!generalClave) {
    return null;
  }
  return {
    generalClave,
    centralClave: centralClave || '',
    identificador: resto.join(',').trim(),
  };
}

/** Misma heurística que captura: prefijos de clave general y central concatenados. */
export function separarRemitenteConcatenado(
  remitenteArea: string | null | undefined,
  catalogo: CatalogoRemitenteAdmin | null
): { generalClave: string; centralClave: string; identificador: string } {
  const texto = (remitenteArea || '').trim();
  if (!texto || !catalogo) {
    return { generalClave: '', centralClave: '', identificador: texto };
  }

  const porNombre = catalogo.porNombre?.get(normalizarNombreArea(texto));
  if (porNombre) {
    return { ...porNombre, identificador: texto };
  }

  const clavesGenerales = [...catalogo.generales.keys()].sort((a, b) => b.length - a.length);
  const generalClave = clavesGenerales.find((clave) => texto.startsWith(clave)) || '';
  const restoTrasGeneral = generalClave ? texto.slice(generalClave.length) : texto;

  const centrales = catalogo.centralesPorGeneral.get(generalClave);
  const clavesCentrales = centrales ? [...centrales.keys()].sort((a, b) => b.length - a.length) : [];
  const centralClave = clavesCentrales.find((clave) => restoTrasGeneral.startsWith(clave)) || '';
  const identificador = centralClave ? restoTrasGeneral.slice(centralClave.length).trim() : restoTrasGeneral.trim();

  return { generalClave, centralClave, identificador };
}

function clavesDesdeEtiqueta(etiqueta: string, mapa: Map<string, string>): string {
  const t = etiqueta.trim();
  if (!t) {
    return '';
  }
  if (mapa.has(t)) {
    return t;
  }
  const prefijo = t.split(' - ')[0]?.trim();
  return prefijo && mapa.has(prefijo) ? prefijo : t;
}

export function etiquetaAdministracionGeneral(
  e: ExpedienteTlalcalli,
  catalogo: CatalogoRemitenteAdmin | null
): string {
  const claveExplicita = (e.remitente_general || '').trim();
  if (claveExplicita) {
    return catalogo?.generales.get(claveExplicita) ?? claveExplicita;
  }
  const compuesto = parsearRemitenteCompuesto(e.remitente_area);
  if (compuesto?.generalClave) {
    return catalogo?.generales.get(compuesto.generalClave) ?? compuesto.generalClave;
  }
  const separado = separarRemitenteConcatenado(e.remitente_area, catalogo);
  if (separado.generalClave) {
    return catalogo?.generales.get(separado.generalClave) ?? separado.generalClave;
  }
  return ETIQUETA_SIN_DATO_ADMIN;
}

export function etiquetaAdministracionCentral(
  e: ExpedienteTlalcalli,
  catalogo: CatalogoRemitenteAdmin | null
): string {
  const claveExplicita = (e.remitente_central || '').trim();
  if (claveExplicita) {
    const general = clavesDesdeEtiqueta(e.remitente_general || '', catalogo?.generales ?? new Map());
    const porGeneral = catalogo?.centralesPorGeneral.get(general);
    return porGeneral?.get(claveExplicita) ?? catalogo?.todasCentrales.get(claveExplicita) ?? claveExplicita;
  }
  const compuesto = parsearRemitenteCompuesto(e.remitente_area);
  if (compuesto?.centralClave) {
    const porGeneral = catalogo?.centralesPorGeneral.get(compuesto.generalClave);
    return porGeneral?.get(compuesto.centralClave) ?? compuesto.centralClave;
  }
  const separado = separarRemitenteConcatenado(e.remitente_area, catalogo);
  if (separado.centralClave) {
    const porGeneral = catalogo?.centralesPorGeneral.get(separado.generalClave);
    return porGeneral?.get(separado.centralClave) ?? separado.centralClave;
  }
  return ETIQUETA_SIN_DATO_ADMIN;
}

/**
 * Normaliza claves explícitas cuando data_busqueda las exponga (StructForSearch).
 * Hoy solo llega `remitente` (identificador); se infiere general/central con catálogo o formato compuesto.
 */
export function enriquecerExpedientesRemitenteAdmin(
  expedientes: ExpedienteTlalcalli[],
  catalogo: CatalogoRemitenteAdmin | null
): ExpedienteTlalcalli[] {
  return expedientes.map((e) => {
    if (e.remitente_general || e.remitente_central) {
      return e;
    }
    const compuesto = parsearRemitenteCompuesto(e.remitente_area);
    if (compuesto) {
      return {
        ...e,
        remitente_general: compuesto.generalClave,
        remitente_central: compuesto.centralClave,
        remitente_area: compuesto.identificador || e.remitente_area,
      };
    }
    const separado = separarRemitenteConcatenado(e.remitente_area, catalogo);
    if (!separado.generalClave && !separado.centralClave) {
      return e;
    }
    return {
      ...e,
      remitente_general: separado.generalClave,
      remitente_central: separado.centralClave,
      remitente_area: separado.identificador || e.remitente_area,
    };
  });
}
