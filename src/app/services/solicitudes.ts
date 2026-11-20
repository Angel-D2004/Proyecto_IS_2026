
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// =======================================
// INTERFACES
// =======================================

export interface ReservaDisponible {
  reserva: number;
  oportunidad: number;
  propiedad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  precio: number;
}

export type EstadoSolicitud =
  | 'pendiente'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada';

export interface SolicitudCredito {
  solicitud: number;
  reserva: number;
  oportunidad: number;
  propiedad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  entidad_financiera: string;
  monto_solicitado: number;
  plazo_meses: number;
  estado: EstadoSolicitud;
  observacion: string | null;
  fecha_solicitud: string;
  fecha_actualizacion: string;
}

export interface NuevaSolicitud {
  reserva: number | null;
  entidad_financiera: string;
  monto_solicitado: number | null;
  plazo_meses: number | null;
  observacion: string;
}

export interface SeguimientoCredito {
  seguimiento: number;
  solicitud: number;
  observacion: string;
  fecha_registro: string;
}

export interface RespuestaApi<T> {
  status: boolean;
  data: T;
  message?: string;
}

export interface RespuestaAccion {
  status: boolean;
  message: string;
  data?: {
    solicitud?: number;
    seguimiento?: number;
  };
}

// =======================================
// SERVICIO DE SOLICITUDES
// =======================================

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/solicitudes';

  // Consultar reservas elegibles
  obtenerReservasDisponibles() {
    return this.http.get<
      RespuestaApi<ReservaDisponible[]>
    >(`${this.apiUrl}/reservas-disponibles`);
  }

  // Consultar solicitudes
  obtenerSolicitudes() {
    return this.http.get<
      RespuestaApi<SolicitudCredito[]>
    >(this.apiUrl);
  }

  // Registrar solicitud
  registrarSolicitud(datos: NuevaSolicitud) {
    return this.http.post<RespuestaAccion>(
      this.apiUrl,
      datos
    );
  }

  // Actualizar estado
  actualizarEstado(
    solicitud: number,
    estado: EstadoSolicitud
  ) {
    return this.http.put<RespuestaAccion>(
      `${this.apiUrl}/${solicitud}/estado`,
      { estado }
    );
  }

  // Consultar seguimientos
  obtenerSeguimientos(solicitud: number) {
    return this.http.get<
      RespuestaApi<SeguimientoCredito[]>
    >(`${this.apiUrl}/${solicitud}/seguimientos`);
  }

  // Registrar seguimiento
  registrarSeguimiento(
    solicitud: number,
    observacion: string
  ) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/${solicitud}/seguimientos`,
      { observacion }
    );
  }
}
