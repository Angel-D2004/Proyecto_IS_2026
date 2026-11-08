
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoPropiedad =
  'disponible' | 'reservada' | 'vendida';

export interface Propiedad {
  propiedad: number;
  codigo: string;
  nombre: string;
  ubicacion: string;
  descripcion: string | null;
  precio: number;
  estado: EstadoPropiedad;
  fecha_registro: string;
}

export interface NuevaPropiedad {
  codigo: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  precio: number | null;
}

export interface RespuestaPropiedades {
  status: boolean;
  data: Propiedad[];
}

@Injectable({
  providedIn: 'root'
})
export class PropiedadesService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/propiedades';

  obtenerPropiedades(): Observable<RespuestaPropiedades> {
    return this.http.get<RespuestaPropiedades>(this.apiUrl);
  }

  registrarPropiedad(propiedad: NuevaPropiedad): Observable<any> {
    return this.http.post(this.apiUrl, propiedad);
  }

  actualizarEstado(
    id: number,
    estado: EstadoPropiedad
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
