
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Reserva {
  reserva: number;
  oportunidad: number;
  propiedad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  monto_reserva: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observacion: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
}

export interface OportunidadReserva {
  oportunidad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  estado_oportu: string;
}

export interface NuevaReserva {
  oportunidad: number | null;
  monto_reserva: number | null;
  observacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api';

  // Consultar oportunidades
  obtenerOportunidades() {
    return this.http.get<{
      status: boolean;
      data: OportunidadReserva[];
    }>(`${this.apiUrl}/oportunidades`);
  }

  // Consultar reservas
  obtenerReservas() {
    return this.http.get<{
      status: boolean;
      data: Reserva[];
    }>(`${this.apiUrl}/reservas`);
  }

  // Registrar reserva
  registrarReserva(reserva: NuevaReserva) {
    return this.http.post<{
      status: boolean;
      message: string;
    }>(`${this.apiUrl}/reservas`, reserva);
  }

  // Actualizar estado
  actualizarEstado(
    id: number,
    estado: 'confirmada' | 'cancelada'
  ) {
    return this.http.put<{
      status: boolean;
      message: string;
    }>(
      `${this.apiUrl}/reservas/${id}/estado`,
      { estado }
    );
  }
}
