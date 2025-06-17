import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';

@Injectable({
  providedIn: 'root'
})
export class DictaminadorComunicacionService {
  private asuntoSeleccionadoSubject = new BehaviorSubject<tableAsuntosPorDictaminar | null>(null);
  private esRechazadoSubject = new BehaviorSubject<boolean>(false);
  private mostrarRevisionSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Métodos para el asunto seleccionado
  setAsuntoSeleccionado(asunto: tableAsuntosPorDictaminar | null) {
    this.asuntoSeleccionadoSubject.next(asunto);
  }

  getAsuntoSeleccionado(): Observable<tableAsuntosPorDictaminar | null> {
    return this.asuntoSeleccionadoSubject.asObservable();
  }

  // Métodos para el estado de rechazo
  setEsRechazado(esRechazado: boolean) {
    this.esRechazadoSubject.next(esRechazado);
  }

  getEsRechazado(): Observable<boolean> {
    return this.esRechazadoSubject.asObservable();
  }

  // Métodos para el estado de revisión
  setMostrarRevision(mostrar: boolean) {
    this.mostrarRevisionSubject.next(mostrar);
  }

  getMostrarRevision(): Observable<boolean> {
    return this.mostrarRevisionSubject.asObservable();
  }

  // Método para limpiar todos los estados
  limpiarEstados() {
    this.asuntoSeleccionadoSubject.next(null);
    this.esRechazadoSubject.next(false);
    this.mostrarRevisionSubject.next(false);
  }
} 