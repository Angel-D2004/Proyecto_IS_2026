
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// =======================================
// INTERFACES
// =======================================

export interface ClienteEvaluacion {
  cliente: number;
  nombres: string;
  apellidos: string;
}

export interface OportunidadEvaluacion {
  oportunidad: number;
  nombre_cliente?: string;
  nombre_propiedad?: string;
  estado_oportu: string;
}

export interface InformacionFinanciera {
  cliente?: number;
  ingresos_mensuales: number;
  gastos_mensuales: number;
  deudas_mensuales: number;
}

export interface CapacidadPago {
  cliente: number;
  ingresos_mensuales: number;
  gastos_mensuales: number;
  deudas_mensuales: number;
  disponible_mensual: number;
  capacidad_referencial: number;
}

export interface EvaluacionCrediticia {
  evaluacion: number;
  oportunidad: number;
  cliente: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';
  resultado: string | null;
  fecha_registro_eval: string;
}

export interface ObservacionCrediticia {
  observacion_id: number;
  evaluacion: number;
  observacion: string;
  fecha_registro_ob: string;
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
    evaluacion?: number;
    observacion_id?: number;
  };
}

// =======================================
// SERVICIO
// =======================================

@Injectable({
  providedIn: 'root'
})
export class EvaluacionesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api';

  // US-27: Consultar clientes
  obtenerClientes() {
    return this.http.get<RespuestaApi<ClienteEvaluacion[]>>(
      `${this.apiUrl}/clientes`
    );
  }

  // Consultar oportunidades existentes
  obtenerOportunidades() {
    return this.http.get<RespuestaApi<OportunidadEvaluacion[]>>(
      `${this.apiUrl}/oportunidades`
    );
  }

  // US-27: Consultar información financiera
  obtenerFinanzas(cliente: number) {
    return this.http.get<
      RespuestaApi<InformacionFinanciera | null>
    >(
      `${this.apiUrl}/evaluaciones/finanzas/${cliente}`
    );
  }

  // US-27: Guardar información financiera
  guardarFinanzas(
    cliente: number,
    datos: InformacionFinanciera
  ) {
    return this.http.put<RespuestaAccion>(
      `${this.apiUrl}/evaluaciones/finanzas/${cliente}`,
      datos
    );
  }

  // US-28: Consultar capacidad de pago
  obtenerCapacidad(cliente: number) {
    return this.http.get<RespuestaApi<CapacidadPago>>(
      `${this.apiUrl}/evaluaciones/capacidad/${cliente}`
    );
  }

  // US-29: Crear evaluación crediticia
  crearEvaluacion(oportunidad: number) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/evaluaciones`,
      { oportunidad }
    );
  }

  // US-30: Consultar evaluaciones
  obtenerEvaluaciones() {
    return this.http.get<
      RespuestaApi<EvaluacionCrediticia[]>
    >(
      `${this.apiUrl}/evaluaciones`
    );
  }

  // US-31: Actualizar estado
  actualizarEstado(
    evaluacion: number,
    estado: string,
    resultado: string
  ) {
    return this.http.put<RespuestaAccion>(
      `${this.apiUrl}/evaluaciones/${evaluacion}/estado`,
      {
        estado,
        resultado
      }
    );
  }

  // US-32: Consultar observaciones
  obtenerObservaciones(evaluacion: number) {
    return this.http.get<
      RespuestaApi<ObservacionCrediticia[]>
    >(
      `${this.apiUrl}/evaluaciones/${evaluacion}/observaciones`
    );
  }

  // US-32: Registrar observación
  registrarObservacion(
    evaluacion: number,
    observacion: string
  ) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/evaluaciones/${evaluacion}/observaciones`,
      { observacion }
    );
  }
}
