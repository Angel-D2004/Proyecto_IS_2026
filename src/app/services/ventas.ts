
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
}
