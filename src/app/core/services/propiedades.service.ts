import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Propiedad, PropiedadInput } from '../models/propiedad.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PropiedadesService {
  private readonly api = inject(ApiService);
  private readonly recurso = 'propiedades';

  listar(): Observable<Propiedad[]> {
    return this.api.listar<Propiedad>(this.recurso);
  }

  obtener(id: number): Observable<Propiedad> {
    return this.api.obtener<Propiedad>(this.recurso, id);
  }

  crear(payload: PropiedadInput): Observable<Propiedad> {
    return this.api.crear<Propiedad>(this.recurso, payload);
  }

  actualizar(id: number, payload: Partial<PropiedadInput>): Observable<Propiedad> {
    return this.api.actualizar<Propiedad>(this.recurso, id, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.api.eliminar(this.recurso, id);
  }
}
