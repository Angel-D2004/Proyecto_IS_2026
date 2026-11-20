
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
  SolicitudesService,
  ReservaDisponible,
  SolicitudCredito,
  NuevaSolicitud,
  SeguimientoCredito,
  EstadoSolicitud
} from '../../services/solicitudes';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './solicitudes.html'
})
export class Solicitudes implements OnInit {

  private solicitudesService = inject(SolicitudesService);
  private cdr = inject(ChangeDetectorRef);

  // ======================================
  // LISTADOS
  // ======================================

  reservasDisponibles: ReservaDisponible[] = [];
  solicitudes: SolicitudCredito[] = [];
  seguimientos: SeguimientoCredito[] = [];

  // ======================================
  // REGISTRAR SOLICITUD
  // ======================================

  nuevaSolicitud: NuevaSolicitud = {
    reserva: null,
    entidad_financiera: '',
    monto_solicitado: null,
    plazo_meses: null,
    observacion: ''
  };

  // ======================================
  // GESTIONAR SOLICITUD
  // ======================================

  solicitudSeleccionada: number | null = null;

  estadoSeleccionado: EstadoSolicitud = 'pendiente';

  nuevaObservacion = '';

  filtroEstado = 'todas';

  // ======================================
  // CONTROLES
  // ======================================

  guardando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  ngOnInit(): void {
    this.cargarReservasDisponibles();
    this.cargarSolicitudes();
  }

  mostrarMensaje(
    mensaje: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
  }

  // ======================================
  // CONSULTAR RESERVAS DISPONIBLES
  // ======================================

  cargarReservasDisponibles(): void {

    this.solicitudesService.obtenerReservasDisponibles()
      .subscribe({

        next: (respuesta) => {
          this.reservasDisponibles = respuesta.data || [];
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(error);

          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar reservas disponibles',
            'error'
          );
        }
      });
  }

  // ======================================
  // CONSULTAR SOLICITUDES
  // ======================================

  cargarSolicitudes(): void {

    this.cargando = true;

    this.solicitudesService.obtenerSolicitudes()
      .subscribe({

        next: (respuesta) => {

          this.solicitudes = respuesta.data || [];
          this.cargando = false;

          // Si hay una solicitud seleccionada,
          // conservamos su información actualizada.
          if (this.solicitudSeleccionada !== null) {

            const actual = this.solicitudes.find(
              s => s.solicitud === this.solicitudSeleccionada
            );

            if (actual) {
              this.estadoSeleccionado = actual.estado;
            } else {
              this.solicitudSeleccionada = null;
              this.seguimientos = [];
            }
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);
          this.cargando = false;

          this.mostrarMensaje(
            error.error?.message ||
            'Error al cargar solicitudes',
            'error'
          );
        }
      });
  }

  // ======================================
  // OBTENER RESERVA SELECCIONADA
  // ======================================

  get reservaActual(): ReservaDisponible | undefined {

    return this.reservasDisponibles.find(
      r => r.reserva === this.nuevaSolicitud.reserva
    );
  }

  // ======================================
  // REGISTRAR SOLICITUD
  // ======================================

  registrarSolicitud(): void {

    if (this.guardando) return;

    const datos = this.nuevaSolicitud;

    if (
      datos.reserva === null ||
      !datos.entidad_financiera.trim() ||
      datos.monto_solicitado === null ||
      !Number.isFinite(datos.monto_solicitado) ||
      datos.monto_solicitado <= 0 ||
      datos.plazo_meses === null ||
      !Number.isInteger(datos.plazo_meses) ||
      datos.plazo_meses <= 0
    ) {
      this.mostrarMensaje(
        'Complete correctamente los campos obligatorios',
        'error'
      );
      return;
    }

    if (
      this.reservaActual &&
      datos.monto_solicitado > Number(this.reservaActual.precio)
    ) {
      this.mostrarMensaje(
        'El monto solicitado supera el precio de la vivienda',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    // Guardamos una copia de los valores enviados.
    const solicitud = { ...this.nuevaSolicitud };

    this.solicitudesService.registrarSolicitud(solicitud)
      .subscribe({

        next: (respuesta) => {

          this.guardando = false;

          this.nuevaSolicitud = {
            reserva: null,
            entidad_financiera: '',
            monto_solicitado: null,
            plazo_meses: null,
            observacion: ''
          };

          this.mostrarMensaje(
            respuesta.message,
            'exito'
          );

          this.cargarReservasDisponibles();
          this.cargarSolicitudes();
        },

        error: (error) => {

          console.error(error);
          this.guardando = false;

          this.mostrarMensaje(
            error.error?.message ||
            'Error al registrar solicitud',
            'error'
          );
        }
      });
  }

  // ======================================
  // FILTRAR SOLICITUDES
  // ======================================

  get solicitudesFiltradas(): SolicitudCredito[] {

    if (this.filtroEstado === 'todas') {
      return this.solicitudes;
    }

    return this.solicitudes.filter(
      s => s.estado === this.filtroEstado
    );
  }

  // ======================================
  // SELECCIONAR SOLICITUD
  // ======================================

  seleccionarSolicitud(solicitud: SolicitudCredito): void {

    this.solicitudSeleccionada = solicitud.solicitud;
    this.estadoSeleccionado = solicitud.estado;
    this.nuevaObservacion = '';
    this.seguimientos = [];
    this.mensaje = '';

    this.cargarSeguimientos();
    this.cdr.detectChanges();
  }

  get solicitudActual(): SolicitudCredito | undefined {

    return this.solicitudes.find(
      s => s.solicitud === this.solicitudSeleccionada
    );
  }

  // ======================================
  // ESTADOS PERMITIDOS
  // ======================================

  get estadosDisponibles(): EstadoSolicitud[] {

    if (!this.solicitudActual) return [];

    switch (this.solicitudActual.estado) {

      case 'pendiente':
        return ['en_revision'];

      case 'en_revision':
        return ['aprobada', 'rechazada'];

      default:
        return [];
    }
  }

  // ======================================
  // ACTUALIZAR ESTADO
  // ======================================

  actualizarEstado(): void {

    if (this.guardando) return;

    if (
      this.solicitudSeleccionada === null ||
      !this.estadosDisponibles.includes(
        this.estadoSeleccionado
      )
    ) {
      this.mostrarMensaje(
        'Seleccione un cambio de estado permitido',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const solicitudId = this.solicitudSeleccionada;

    this.solicitudesService.actualizarEstado(
      solicitudId,
      this.estadoSeleccionado
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        this.mostrarMensaje(
          respuesta.message,
          'exito'
        );

        this.cargarSolicitudes();
      },

      error: (error) => {

        console.error(error);
        this.guardando = false;

        this.mostrarMensaje(
          error.error?.message ||
          'Error al actualizar estado',
          'error'
        );

        this.cargarSolicitudes();
      }
    });
  }

  // ======================================
  // CONSULTAR SEGUIMIENTOS
  // ======================================

  cargarSeguimientos(): void {

    if (this.solicitudSeleccionada === null) return;

    const solicitudId = this.solicitudSeleccionada;

    this.solicitudesService.obtenerSeguimientos(
      solicitudId
    ).subscribe({

      next: (respuesta) => {

        // Evitar mostrar seguimientos de otra
        // solicitud si el usuario cambió la selección.
        if (this.solicitudSeleccionada !== solicitudId) {
          return;
        }

        this.seguimientos = respuesta.data || [];
        this.cdr.detectChanges();
      },

      error: (error) => {

        if (this.solicitudSeleccionada !== solicitudId) {
          return;
        }

        console.error(error);

        this.mostrarMensaje(
          error.error?.message ||
          'Error al consultar seguimientos',
          'error'
        );
      }
    });
  }

  // ======================================
  // REGISTRAR SEGUIMIENTO
  // ======================================

  registrarSeguimiento(): void {

    if (this.guardando) return;

    if (
      this.solicitudSeleccionada === null ||
      !this.nuevaObservacion.trim()
    ) {
      this.mostrarMensaje(
        'Seleccione una solicitud y escriba una observación',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const solicitudId = this.solicitudSeleccionada;
    const observacion = this.nuevaObservacion.trim();

    this.solicitudesService.registrarSeguimiento(
      solicitudId,
      observacion
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        if (this.solicitudSeleccionada === solicitudId) {
          this.nuevaObservacion = '';
          this.cargarSeguimientos();
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
          'Error al registrar seguimiento',
          'error'
        );
      }
    });
  }

  // ======================================
  // ACTUALIZAR TODO
  // ======================================

  actualizarListados(): void {
    this.cargarReservasDisponibles();
    this.cargarSolicitudes();

    if (this.solicitudSeleccionada !== null) {
      this.cargarSeguimientos();
    }
  }
}
