import { EuacapeApertura } from './euacape-apertura';

export interface EuacapeAperturaResponse {
    descripcion: string,
    autor: string,
    values: EuacapeApertura[],
}
