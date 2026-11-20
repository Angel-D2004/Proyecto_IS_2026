
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RespuestaApi<T> {
  status: boolean;
  data: T;
  message?: string;
}

export interface EntregaPendiente {
  entrega: number;
  oportunidad: number;
  propiedad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  precio: number;
  fecha_entrega: string;
}

export interface VentaCerrada {
  venta: number;
  entrega: number;
  oportunidad: number;
  propiedad: number;
  precio_cierre: number;
  fecha_cierre: string;
  nombre_cliente: string;
  nombre_propiedad: string;
  estado_venta: string;
  fecha_entrega: string;
}

export interface ResumenFinal {
  clientes: number;
  propiedades: number;
  propiedades_vendidas: number;
  oportunidades_activas: number;
  reservas_activas: number;
  creditos_pendientes: number;
  ventas_completadas: number;
  monto_total_ventas: number;
}

export interface VentaProceso {
  oportunidad: number;
  estado_oportu: string;
  cliente: string;
  propiedad: string;
  precio: number;
}

export interface PropiedadReporte {
  propiedad: number;
  nombre: string;
  precio: number;
  estado_venta: string;
}

export interface ClienteOportunidad {
  cliente: number;
  nombre_cliente: string;
  oportunidad: number;
  estado_oportu: string;
  nombre_propiedad: string;
}

export interface CreditoPendiente {
  solicitud: number;
  entidad_financiera: string;
  monto_solicitado: number;
  estado: string;
  nombre_cliente: string;
}

export interface ReservaActiva {
  reserva: number;
  estado: string;
  monto_reserva: number;
  nombre_propiedad: string;
  nombre_cliente: string;
}

export interface VentaMensual {
  mes: string;
  cantidad_ventas: number;
  monto_total: number;
}

@Injectable({
  providedIn: 'root'
})
export class FinalizacionService {

  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api';

  entregasDisponibles() {
    return this.http.get<RespuestaApi<EntregaPendiente[]>>(
      `${this.api}/ventas_finales/disponibles`
    );
  }

  cerrarVenta(entrega: number) {
    return this.http.post<{
      status: boolean;
      message: string;
      data?: { venta: number };
    }>(
      `${this.api}/ventas_finales`,
      { entrega }
    );
  }

  historialVentas() {
    return this.http.get<RespuestaApi<VentaCerrada[]>>(
      `${this.api}/ventas_finales`
    );
  }

  resumen() {
    return this.http.get<RespuestaApi<ResumenFinal>>(
      `${this.api}/reportes/resumen`
    );
  }

  ventasProceso() {
    return this.http.get<RespuestaApi<VentaProceso[]>>(
      `${this.api}/reportes/ventas-proceso`
    );
  }

  propiedades() {
    return this.http.get<RespuestaApi<PropiedadReporte[]>>(
      `${this.api}/reportes/propiedades`
    );
  }

  clientesOportunidades() {
    return this.http.get<RespuestaApi<ClienteOportunidad[]>>(
      `${this.api}/reportes/clientes-oportunidades`
    );
  }

  creditosPendientes() {
    return this.http.get<RespuestaApi<CreditoPendiente[]>>(
      `${this.api}/reportes/creditos-pendientes`
    );
  }

  reservasActivas() {
    return this.http.get<RespuestaApi<ReservaActiva[]>>(
      `${this.api}/reportes/reservas-activas`
    );
  }

  ventasMensuales() {
    return this.http.get<RespuestaApi<VentaMensual[]>>(
      `${this.api}/reportes/ventas-mensuales`
    );
  }
}
