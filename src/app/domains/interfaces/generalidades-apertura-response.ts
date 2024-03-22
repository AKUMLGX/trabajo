import { GeneralidadesApertura } from "./generalidades-apertura";

export interface GeneralidadesAperturaResponse {
    descripcion: string,
    autor: string,
    values: GeneralidadesApertura[],
}
