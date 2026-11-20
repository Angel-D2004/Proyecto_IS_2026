
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// ========================================
// TIPOS DE DATOS
// ========================================

export type TipoDocumento =
  | 'dpi'
  | 'carta_laboral'
  | 'estados_cuenta'
  | 'otros';

export type EstadoDocumento =
  | 'pendiente'
  | 'recibido'
  | 'verificado'
  | 'rechazado';

export interface SolicitudDocumento {
  solicitud: number;
  reserva: number;
  nombre_cliente: string;
  nombre_propiedad: string;
  entidad_financiera: string;
  estado: string;
}

export interface TipoDocumentoOpcion {
  tipo: TipoDocumento;
  nombre: string;
}

export interface DocumentoCredito {
  documento: number;
  solicitud: number;
  tipo_documento: TipoDocumento;
  estado: EstadoDocumento;
  observacion: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
}

export interface NuevoDocumento {
  solicitud: number;
  tipo_documento: TipoDocumento;
  observacion: string;
}

export interface ResumenDocumental {
  total: number;
  pendientes: number;
  recibidos: number;
  verificados: number;
  rechazados: number;
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
    documento?: number;
  };
}

// ========================================
// SERVICIO
// ========================================

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api';

  // Consultar solicitudes bancarias registradas
  obtenerSolicitudes() {
    return this.http.get<
      RespuestaApi<SolicitudDocumento[]>
    >(`${this.apiUrl}/solicitudes`);
  }

  // Consultar catálogo de documentos
  obtenerTipos() {
    return this.http.get<
      RespuestaApi<TipoDocumentoOpcion[]>
    >(`${this.apiUrl}/documentos/tipos`);
  }

  // Consultar documentos de una solicitud
  obtenerDocumentos(solicitud: number) {
    return this.http.get<
      RespuestaApi<DocumentoCredito[]>
    >(
      `${this.apiUrl}/documentos/solicitud/${solicitud}`
    );
  }

  // Registrar un tipo de documento
  registrarDocumento(datos: NuevoDocumento) {
    return this.http.post<RespuestaAccion>(
      `${this.apiUrl}/documentos`,
      datos
    );
  }

  // Actualizar estado de un documento
  actualizarEstado(
    documento: number,
    estado: EstadoDocumento,
    observacion: string
  ) {
    return this.http.put<RespuestaAccion>(
      `${this.apiUrl}/documentos/${documento}/estado`,
      {
        estado,
        observacion
      }
    );
  }

  // Consultar resumen del expediente
  obtenerResumen(solicitud: number) {
    return this.http.get<
      RespuestaApi<ResumenDocumental>
    >(
      `${this.apiUrl}/documentos/solicitud/${solicitud}/resumen`
    );
  }
}
