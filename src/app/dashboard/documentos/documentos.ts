
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  DocumentosService,
  SolicitudDocumento,
  TipoDocumentoOpcion,
  TipoDocumento,
  EstadoDocumento,
  DocumentoCredito,
  ResumenDocumental
} from '../../services/documentos';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documentos.html'
})
export class Documentos implements OnInit {

  private documentosService = inject(DocumentosService);
  private cdr = inject(ChangeDetectorRef);

  // ========================================
  // LISTADOS
  // ========================================

  solicitudes: SolicitudDocumento[] = [];
  tiposDocumentos: TipoDocumentoOpcion[] = [];
  documentos: DocumentoCredito[] = [];

  // ========================================
  // SOLICITUD SELECCIONADA
  // ========================================

  solicitudSeleccionada: number | null = null;

  resumen: ResumenDocumental | null = null;

  // ========================================
  // FORMULARIO NUEVO DOCUMENTO
  // ========================================

  nuevoDocumento = {
    tipo_documento: '' as TipoDocumento | '',
    observacion: ''
  };

  // ========================================
  // ACTUALIZACIÓN DE ESTADOS
  // ========================================

  estadosSeleccionados: Record<number, EstadoDocumento> = {};
  observaciones: Record<number, string> = {};

  // ========================================
  // CONTROLES
  // ========================================

  guardando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarTiposDocumentos();
  }

  // ========================================
  // MENSAJES
  // ========================================

  mostrarMensaje(
    mensaje: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
  }

  // ========================================
  // CONSULTAR SOLICITUDES
  // ========================================

  cargarSolicitudes(): void {

    this.documentosService.obtenerSolicitudes()
      .subscribe({

        next: (respuesta) => {
          this.solicitudes = respuesta.data || [];
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(error);

          this.mostrarMensaje(
            error.error?.message ||
            'Error al cargar solicitudes',
            'error'
          );
        }
      });
  }

  // ========================================
  // CONSULTAR TIPOS
  // ========================================

  cargarTiposDocumentos(): void {

    this.documentosService.obtenerTipos()
      .subscribe({

        next: (respuesta) => {
          this.tiposDocumentos = respuesta.data || [];
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(error);

          this.mostrarMensaje(
            'Error al cargar los tipos de documentos',
            'error'
          );
        }
      });
  }

  // ========================================
  // SELECCIONAR SOLICITUD
  // ========================================

  seleccionarSolicitud(): void {

    this.documentos = [];
    this.resumen = null;

    this.estadosSeleccionados = {};
    this.observaciones = {};

    this.nuevoDocumento = {
      tipo_documento: '',
      observacion: ''
    };

    this.mensaje = '';

    if (this.solicitudSeleccionada === null) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.actualizarDocumentos();
  }

  // ========================================
  // SOLICITUD ACTUAL
  // ========================================

  get solicitudActual(): SolicitudDocumento | undefined {

    return this.solicitudes.find(
      s => s.solicitud === this.solicitudSeleccionada
    );
  }

  // ========================================
  // DOCUMENTOS QUE AÚN FALTAN
  // ========================================

  get tiposDisponibles(): TipoDocumentoOpcion[] {

    return this.tiposDocumentos.filter(tipo => {

      const registrado = this.documentos.some(
        documento =>
          documento.tipo_documento === tipo.tipo
      );

      return !registrado;
    });
  }

  // ========================================
  // CONSULTAR DOCUMENTOS
  // ========================================

  cargarDocumentos(): void {

    if (this.solicitudSeleccionada === null) return;

    const solicitudId = this.solicitudSeleccionada;

    this.cargando = true;

    this.documentosService.obtenerDocumentos(solicitudId)
      .subscribe({

        next: (respuesta) => {

          if (this.solicitudSeleccionada !== solicitudId) {
            return;
          }

          this.documentos = respuesta.data || [];

          this.estadosSeleccionados = {};
          this.observaciones = {};

          for (const documento of this.documentos) {

            this.estadosSeleccionados[documento.documento] =
              documento.estado;

            this.observaciones[documento.documento] = '';
          }

          this.cargando = false;
          this.cdr.detectChanges();
        },

        error: (error) => {

          if (this.solicitudSeleccionada !== solicitudId) {
            return;
          }

          console.error(error);
          this.cargando = false;

          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar documentos',
            'error'
          );
        }
      });
  }

  // ========================================
  // CONSULTAR RESUMEN
  // ========================================

  cargarResumen(): void {

    if (this.solicitudSeleccionada === null) return;

    const solicitudId = this.solicitudSeleccionada;

    this.documentosService.obtenerResumen(solicitudId)
      .subscribe({

        next: (respuesta) => {

          if (this.solicitudSeleccionada !== solicitudId) {
            return;
          }

          this.resumen = respuesta.data;
          this.cdr.detectChanges();
        },

        error: (error) => {

          if (this.solicitudSeleccionada !== solicitudId) {
            return;
          }

          console.error(error);

          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar resumen documental',
            'error'
          );
        }
      });
  }

  // ========================================
  // ACTUALIZAR EXPEDIENTE
  // ========================================

  actualizarDocumentos(): void {
    this.cargarDocumentos();
    this.cargarResumen();
  }

  // ========================================
  // REGISTRAR DOCUMENTO
  // ========================================

  registrarDocumento(): void {

    if (this.guardando) return;

    if (this.solicitudSeleccionada === null) {

      this.mostrarMensaje(
        'Seleccione una solicitud',
        'error'
      );

      return;
    }

    if (!this.nuevoDocumento.tipo_documento) {

      this.mostrarMensaje(
        'Seleccione un tipo de documento',
        'error'
      );

      return;
    }

    if (this.solicitudActual?.estado === 'rechazada') {

      this.mostrarMensaje(
        'No puede registrar documentos en una solicitud rechazada',
        'error'
      );

      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const solicitudId = this.solicitudSeleccionada;

    const datos = {
      solicitud: solicitudId,
      tipo_documento:
        this.nuevoDocumento.tipo_documento as TipoDocumento,
      observacion: this.nuevoDocumento.observacion.trim()
    };

    this.documentosService.registrarDocumento(datos)
      .subscribe({

        next: (respuesta) => {

          this.guardando = false;

          if (this.solicitudSeleccionada === solicitudId) {

            this.nuevoDocumento = {
              tipo_documento: '',
              observacion: ''
            };

            this.actualizarDocumentos();
          }

          this.mostrarMensaje(
            respuesta.message,
            'exito'
          );
        },

        error: (error) => {

          console.error(error);
          this.guardando = false;

          this.mostrarMensaje(
            error.error?.message ||
            'Error al registrar documento',
            'error'
          );
        }
      });
  }

  // ========================================
  // ESTADOS DISPONIBLES
  // ========================================

  estadosDisponibles(
    documento: DocumentoCredito
  ): EstadoDocumento[] {

    switch (documento.estado) {

      case 'pendiente':
        return ['recibido'];

      case 'recibido':
        return ['verificado', 'rechazado'];

      case 'rechazado':
        return ['recibido'];

      default:
        return [];
    }
  }

  // ========================================
  // ACTUALIZAR ESTADO DEL DOCUMENTO
  // ========================================

  actualizarEstado(documento: DocumentoCredito): void {

    if (this.guardando) return;

    const nuevoEstado =
      this.estadosSeleccionados[documento.documento];

    if (
      !nuevoEstado ||
      !this.estadosDisponibles(documento).includes(nuevoEstado)
    ) {

      this.mostrarMensaje(
        'Seleccione un cambio de estado permitido',
        'error'
      );

      return;
    }

    if (this.solicitudActual?.estado === 'rechazada') {

      this.mostrarMensaje(
        'La solicitud de crédito está rechazada',
        'error'
      );

      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const solicitudId = this.solicitudSeleccionada;

    const observacion =
      this.observaciones[documento.documento] || '';

    this.documentosService.actualizarEstado(
      documento.documento,
      nuevoEstado,
      observacion
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        if (this.solicitudSeleccionada === solicitudId) {
          this.actualizarDocumentos();
        }

        this.mostrarMensaje(
          respuesta.message,
          'exito'
        );
      },

      error: (error) => {

        console.error(error);
        this.guardando = false;

        if (this.solicitudSeleccionada === solicitudId) {
          this.actualizarDocumentos();
        }

        this.mostrarMensaje(
          error.error?.message ||
          'Error al actualizar documento',
          'error'
        );
      }
    });
  }

  // ========================================
  // ETIQUETA DE TIPO DE DOCUMENTO
  // ========================================

  nombreDocumento(tipo: TipoDocumento): string {

    const encontrado = this.tiposDocumentos.find(
      t => t.tipo === tipo
    );

    return encontrado?.nombre || tipo;
  }

  // ========================================
  // ETIQUETA DE ESTADO
  // ========================================

  nombreEstado(estado: EstadoDocumento): string {

    const nombres: Record<EstadoDocumento, string> = {
      pendiente: 'Pendiente',
      recibido: 'Recibido',
      verificado: 'Verificado',
      rechazado: 'Rechazado'
    };

    return nombres[estado];
  }
}
