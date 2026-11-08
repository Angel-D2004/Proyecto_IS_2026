
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  cliente: number;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  origen: string | null;
  estado: string;
  fecha_registro: string;
}

export interface NuevoCliente {
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  origen: string;
}

export interface RespuestaClientes {
  status: boolean;
  data: Cliente[];
}

@Injectable({
  providedIn: 'root'
})

export class ClientesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/clientes';

  obtenerClientes(): Observable<RespuestaClientes> {
    return this.http.get<RespuestaClientes>(this.apiUrl);
  }

  registrarCliente(cliente: NuevoCliente): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  actualizarCliente(id: number, cliente: NuevoCliente): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cliente);
  }
}
