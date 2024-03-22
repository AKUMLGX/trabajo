import { PenalApertura } from "./penal-apertura";

export interface PenalAperturaResponse {
    descripcion: string,
    autor: string,
    values: PenalApertura[],
}
