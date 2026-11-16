
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  cita: number;
  cliente: number;
  nombre_cliente: string;
  fecha: string;
  lugar: string;
  motivo: string | null;
  estado_cita: 'pendiente' | 'realizada' | 'cancelada';
  resultado: string | null;
}

export interface NuevaCita {
  cliente: number | null;
  fecha: string;
  lugar: string;
  motivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/citas';

  obtenerCitas(): Observable<{ status: boolean; data: Cita[] }> {
    return this.http.get<{ status: boolean; data: Cita[] }>(this.apiUrl);
  }

  registrarCita(cita: NuevaCita): Observable<any> {
    return this.http.post(this.apiUrl, cita);
  }

  registrarResultado(
    id: number,
    estado_cita: 'realizada' | 'cancelada',
    resultado: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/resultado`, {
      estado_cita,
      resultado
    });
  }
}
