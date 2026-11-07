import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cita, CitaInput } from '../models/cita.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly api = inject(ApiService);
  private readonly recurso = 'citas';

  listar(): Observable<Cita[]> {
    return this.api.listar<Cita>(this.recurso);
  }

  obtener(id: number): Observable<Cita> {
    return this.api.obtener<Cita>(this.recurso, id);
  }

  crear(payload: CitaInput): Observable<Cita> {
    return this.api.crear<Cita>(this.recurso, payload);
  }

  actualizar(id: number, payload: Partial<CitaInput>): Observable<Cita> {
    return this.api.actualizar<Cita>(this.recurso, id, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.api.eliminar(this.recurso, id);
  }
}
