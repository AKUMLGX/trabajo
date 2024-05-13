import { EuacapeAperturaBack } from './euacape-apertura-back';

export interface EuacapeAperturaResponse {
    descripcion: string,
    autor: string,
    values: EuacapeAperturaBack[],
}
