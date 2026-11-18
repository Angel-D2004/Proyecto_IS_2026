
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';

import {
  ReservasService,
  Reserva,
  NuevaReserva,
  OportunidadReserva
} from '../../services/reservas';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [FormsModule, RouterLink, SlicePipe],
  templateUrl: './reservas.html'
})
export class Reservas implements OnInit {

  private reservasService = inject(ReservasService);
  private cdr = inject(ChangeDetectorRef);

  reservas: Reserva[] = [];
  oportunidades: OportunidadReserva[] = [];

  nuevaReserva: NuevaReserva = {
    oportunidad: null,
    monto_reserva: null,
    observacion: ''
  };

  filtroEstado = 'todas';

  guardando = false;
  mensaje = '';

  ngOnInit(): void {
    this.cargarOportunidades();
    this.cargarReservas();
  }

  // =======================================
  // CONSULTAR OPORTUNIDADES
  // =======================================

  cargarOportunidades(): void {

    this.reservasService.obtenerOportunidades()
      .subscribe({

        next: (respuesta) => {

          this.oportunidades = respuesta.data;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            'Error al consultar oportunidades';

          this.cdr.detectChanges();

        }

      });
  }

  // =======================================
  // CONSULTAR RESERVAS
  // =======================================

  cargarReservas(): void {

    this.reservasService.obtenerReservas()
      .subscribe({

        next: (respuesta) => {

          this.reservas = respuesta.data;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            'Error al consultar reservas';

          this.cdr.detectChanges();

        }

      });
  }

  // =======================================
  // OPORTUNIDADES DISPONIBLES
  // =======================================

  get oportunidadesDisponibles(): OportunidadReserva[] {

    return this.oportunidades.filter(o => {

      const activa =
        o.estado_oportu === 'abierta' ||
        o.estado_oportu === 'en_proceso';

      const yaReservada = this.reservas.some(
        r => r.oportunidad === o.oportunidad
      );

      return activa && !yaReservada;

    });
  }

  // =======================================
  // FILTRAR RESERVAS
  // =======================================

  get reservasFiltradas(): Reserva[] {

    if (this.filtroEstado === 'todas') {
      return this.reservas;
    }

    return this.reservas.filter(
      r => r.estado === this.filtroEstado
    );
  }

  // =======================================
  // REGISTRAR RESERVA
  // =======================================

  registrarReserva(): void {

    if (this.guardando) return;

    if (
      this.nuevaReserva.oportunidad === null ||
      this.nuevaReserva.monto_reserva === null ||
      !Number.isFinite(this.nuevaReserva.monto_reserva) ||
      this.nuevaReserva.monto_reserva <= 0
    ) {
      this.mensaje =
        'Seleccione una oportunidad y un monto válido';

      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.reservasService.registrarReserva(
      this.nuevaReserva
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        this.mensaje = respuesta.message;

        this.nuevaReserva = {
          oportunidad: null,
          monto_reserva: null,
          observacion: ''
        };

        this.cargarReservas();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al registrar reserva';

        this.cdr.detectChanges();

      }

    });
  }

  // =======================================
  // ACTUALIZAR ESTADO
  // =======================================

  cambiarEstado(
    reserva: Reserva,
    estado: 'confirmada' | 'cancelada'
  ): void {

    if (this.guardando || reserva.estado !== 'pendiente') {
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.reservasService.actualizarEstado(
      reserva.reserva,
      estado
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;
        this.mensaje = respuesta.message;

        this.cargarReservas();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al actualizar reserva';

        this.cargarReservas();

        this.cdr.detectChanges();

      }

    });
  }
}
