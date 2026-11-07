import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  usuario: number;
  nombre: string;
  email: string;
  rol: string;
  activo: number;
}

export interface RespuestaUsuarios {
  status: boolean;
  data: Usuario[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/usuarios';

  obtenerUsuarios(): Observable<RespuestaUsuarios> {
    return this.http.get<RespuestaUsuarios>(this.apiUrl);
  }
}