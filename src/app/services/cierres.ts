
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RespuestaApi<T> {
  status: boolean;
  data: T;
  message?: string;
}

export interface RespuestaAccion {
  status: boolean;
  message: string;
  data?: {
    firma?: number;
    entrega?: number;
  };
}

export interface SolicitudDisponibleFirma {
  solicitud: number;
  nombre_cliente: string;
  nombre_propiedad: string;
}

export interface FirmaEscritura {
  firma: number;
  solicitud: number;
  fecha_firma: string;
  notario: string;
  referencia_escritura: string;
  observacion: string | null;
  fecha_registro: string;
  reserva: number;
  entidad_financiera: string;
  nombre_cliente: string;
  nombre_propiedad: string;
}

export interface NuevaFirma {
  solicitud: number | null;
  fecha_firma: string;
  notario: string;
  referencia_escritura: string;
  observacion: string;
}

export interface FirmaDisponibleEntrega {
  firma: number;
  solicitud: number;
  fecha_firma: string;
  nombre_cliente: string;
  nombre_propiedad: string;
}

export interface EntregaVivienda {
  entrega: number;
  firma: number;
  fecha_entrega: string;
  responsable: string;
  observacion: string | null;
  fecha_registro: string;
  solicitud: number;
  fecha_firma: string;
  nombre_cliente: string;
  nombre_propiedad: string;
}

export interface NuevaEntrega {
  firma: number | null;
  fecha_entrega: string;
  responsable: string;
  observacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CierresService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/cierres';

  obtenerSolicitudesDisponibles() {
    return this.http.get<
      RespuestaApi<SolicitudDisponibleFirma[]>
    >(`${this.apiUrl}/solicitudes-disponibles`);
  }

  obtenerFirmas() {
    return this.http.get<
      RespuestaApi<FirmaEscritura[]>
    >(`${this.apiUrl}/firmas`);
  }

  registrarFirma(datos: NuevaFirma) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/firmas`,
      datos
    );
  }

  obtenerFirmasDisponibles() {
    return this.http.get<
      RespuestaApi<FirmaDisponibleEntrega[]>
    >(`${this.apiUrl}/firmas-disponibles`);
  }

  obtenerEntregas() {
    return this.http.get<
      RespuestaApi<EntregaVivienda[]>
    >(`${this.apiUrl}/entregas`);
  }

  registrarEntrega(datos: NuevaEntrega) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/entregas`,
      datos
    );
  }
}
