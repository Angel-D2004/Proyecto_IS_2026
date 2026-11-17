
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Interes {
  interes: number;
  cliente: number;
  propiedad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  precio: number | string;
  observacion: string | null;
  fecha_registro_in: string;
}

export interface Seguimiento {
  seguimiento: number;
  cliente: number;
  nombre_cliente: string;
  tipo_seg: string;
  observacion: string;
  proximo_contacto: string | null;
  fecha_registro_seg: string;
}

export interface Oportunidad {
  oportunidad: number;
  interes: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  precio: number | string;
  estado_oportu: string;
  observacion_opor: string | null;
  fecha_registro_opor: string;
}

export interface OpcionPago {
  opcion_pago: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface PlanPago {
  plan_pago: number;
  oportunidad: number;
  opcion_pago: number;
  nombre_opcion: string;
  codigo: string;
  enganche: number;
  plazo_meses: number | null;
  tasa_anual: number | null;
  entidad_financiera: string | null;
  condiciones: string | null;
  fecha_registro_plan: string;
}

export interface NuevoPlanPago {
  opcion_pago: number | null;
  enganche: number | null;
  plazo_meses: number | null;
  tasa_anual: number | null;
  entidad_financiera: string;
  condiciones: string;
}

export interface NuevoInteres {
  cliente: number | null;
  propiedad: number | null;
  observacion: string;
}

export interface NuevoSeguimiento {
  cliente: number | null;
  tipo_seg: string;
  observacion: string;
  proximo_contacto: string;
}

export interface NuevaOportunidad {
  interes: number | null;
  observacion_opor: string;
}

export interface SeguimientoOportunidad {
  seguimiento: number;
  oportunidad: number;
  observacion_segopor: string;
  proxima_accion: string | null;
  fecha_registro: string;
}

export interface OportunidadPendiente {
  oportunidad: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  estado: string;
  observacion_opor: string;
  proxima_accion: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  obtenerIntereses() {
    return this.http.get<{status: boolean; data: Interes[]}>(
      `${this.apiUrl}/intereses`
    );
  }

  registrarInteres(interes: NuevoInteres) {
    return this.http.post(
      `${this.apiUrl}/intereses`, interes
    );
  }

  obtenerSeguimientos() {
    return this.http.get<{status: boolean; data: Seguimiento[]}>(
      `${this.apiUrl}/seguimientos`
    );
  }

  registrarSeguimiento(seguimiento: NuevoSeguimiento) {
    return this.http.post(
      `${this.apiUrl}/seguimientos`, seguimiento
    );
  }

  obtenerOportunidades() {
    return this.http.get<{status: boolean; data: Oportunidad[]}>(
      `${this.apiUrl}/oportunidades`
    );
  }

  registrarOportunidad(oportunidad: NuevaOportunidad) {
    return this.http.post(
      `${this.apiUrl}/oportunidades`, oportunidad
    );
  }


  // Actualizar estado
  actualizarEstadoOportunidad(id: number, estado: string) {
    return this.http.put(
      `${this.apiUrl}/oportunidades/${id}/estado`,
      { estado }
    );
  }

  // Registrar seguimiento de oportunidad
  registrarSeguimientoOportunidad(
    id: number,
    observacion: string,
    proxima_accion: string
  ) {
    return this.http.post(
      `${this.apiUrl}/oportunidades/${id}/seguimientos`,
      { observacion, proxima_accion }
    );
  }

  // Consultar historial de oportunidad
  obtenerSeguimientosOportunidad(id: number) {
    return this.http.get<{
      status: boolean;
      data: SeguimientoOportunidad[];
    }>(`${this.apiUrl}/oportunidades/${id}/seguimientos`);
  }

  // Consultar acciones pendientes
  obtenerOportunidadesPendientes() {
    return this.http.get<{
      status: boolean;
      data: OportunidadPendiente[];
    }>(`${this.apiUrl}/oportunidades/pendientes`);
  }

  // Consultar historial de una propiedad
  obtenerHistorialPropiedad(id: number) {
    return this.http.get<{
      status: boolean;
      data: Interes[];
    }>(`${this.apiUrl}/intereses/propiedad/${id}`);
  }


  // Consultar opciones de pago
  obtenerOpcionesPago() {
    return this.http.get<{
      status: boolean;
      data: OpcionPago[];
    }>(`${this.apiUrl}/pagos/opciones`);
  }

  // Consultar plan de una oportunidad
  obtenerPlanPago(id: number) {
    return this.http.get<{
      status: boolean;
      data: PlanPago | null;
    }>(`${this.apiUrl}/pagos/oportunidad/${id}`);
  }

  // Guardar plan de pago
  guardarPlanPago(id: number, plan: NuevoPlanPago) {
    return this.http.put<{
      status: boolean;
      message: string;
    }>(`${this.apiUrl}/pagos/oportunidad/${id}`, plan);
  }


}
