import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Venta, VentaInput } from '../models/venta.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly api = inject(ApiService);
  private readonly recurso = 'ventas';

  listar(): Observable<Venta[]> {
    return this.api.listar<Venta>(this.recurso);
  }

  obtener(id: number): Observable<Venta> {
    return this.api.obtener<Venta>(this.recurso, id);
  }

  crear(payload: VentaInput): Observable<Venta> {
    return this.api.crear<Venta>(this.recurso, payload);
  }

  actualizar(id: number, payload: Partial<VentaInput>): Observable<Venta> {
    return this.api.actualizar<Venta>(this.recurso, id, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.api.eliminar(this.recurso, id);
  }
}
