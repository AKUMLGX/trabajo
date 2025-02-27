import { from } from 'rxjs';
import { Injectable, signal, } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataFormService {

  initialFormData = ({
    folio_interno:"",
    carpeta_investigacion:"",
    oficio:"",
    autoridad_remitente:"",
    persona_relacionada:"",
    volante_jefatura:"",
    turno_jefatura:""
  });

  formData = signal({ ...this.initialFormData });

  updateFormData(data: Partial<typeof this.initialFormData>): void {
    this.formData.update((currentData) => ({
      ...currentData,
      ...data,
    }));
  }

}
