import { CivilApertura } from "./civil-apertura";

export interface CivilAperturaResponse {
    descripcion: string,
    autor: string,
    values: CivilApertura[],
}
