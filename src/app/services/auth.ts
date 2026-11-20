
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export type RolUsuario =
  | 'vendedor'
  | 'supervisor'
  | 'administrador';

export interface UsuarioSesion {
  usuario: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface RespuestaLogin {
  status: boolean;
  message: string;
  data: {
    token: string;
    usuario: UsuarioSesion;
  };
}

export interface RespuestaSesion {
  status: boolean;
  data: UsuarioSesion;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/auth';

  iniciarSesion(email: string, contrasena: string) {
    return this.http.post<RespuestaLogin>(
      `${this.apiUrl}/login`,
      { email, contrasena }
    );
  }

  guardarSesion(respuesta: RespuestaLogin): void {
    sessionStorage.setItem(
      'token_inmobiliaria',
      respuesta.data.token
    );
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem(
      'token_inmobiliaria'
    );
  }

  consultarSesion() {

    const token = this.obtenerToken();

    return this.http.get<RespuestaSesion>(
      `${this.apiUrl}/me`,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token || ''}`
        })
      }
    );
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token_inmobiliaria');
  }
}
