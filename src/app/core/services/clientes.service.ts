import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cliente, ClienteInput } from '../models/cliente.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly api = inject(ApiService);
  private readonly recurso = 'clientes';

  listar(): Observable<Cliente[]> {
    return this.api.listar<Cliente>(this.recurso);
  }

  obtener(id: number): Observable<Cliente> {
    return this.api.obtener<Cliente>(this.recurso, id);
  }

  crear(payload: ClienteInput): Observable<Cliente> {
    return this.api.crear<Cliente>(this.recurso, payload);
  }

  actualizar(id: number, payload: Partial<ClienteInput>): Observable<Cliente> {
    return this.api.actualizar<Cliente>(this.recurso, id, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.api.eliminar(this.recurso, id);
  }
}
