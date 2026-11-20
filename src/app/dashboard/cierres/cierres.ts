
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
  CierresService,
  SolicitudDisponibleFirma,
  FirmaEscritura,
  FirmaDisponibleEntrega,
  EntregaVivienda,
  NuevaFirma,
  NuevaEntrega
} from '../../services/cierres';

@Component({
  selector: 'app-cierres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cierres.html'
})
export class Cierres implements OnInit {

  private cierresService = inject(CierresService);
  private cdr = inject(ChangeDetectorRef);

  pestana: 'firmas' | 'entregas' = 'firmas';

  solicitudesDisponibles: SolicitudDisponibleFirma[] = [];
  firmas: FirmaEscritura[] = [];
  firmasDisponibles: FirmaDisponibleEntrega[] = [];
  entregas: EntregaVivienda[] = [];

  nuevaFirma: NuevaFirma = {
    solicitud: null,
    fecha_firma: '',
    notario: '',
    referencia_escritura: '',
    observacion: ''
  };

  nuevaEntrega: NuevaEntrega = {
    firma: null,
    fecha_entrega: '',
    responsable: '',
    observacion: ''
  };

  guardando = false;
  cargando = false;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  ngOnInit(): void {
    this.actualizarTodo();
  }

  mostrarMensaje(
    texto: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
  }

  cambiarPestana(
    pestana: 'firmas' | 'entregas'
  ): void {
    this.pestana = pestana;
    this.mensaje = '';
  }

  actualizarTodo(): void {
    this.cargarSolicitudesDisponibles();
    this.cargarFirmas();
    this.cargarFirmasDisponibles();
    this.cargarEntregas();
  }

  cargarSolicitudesDisponibles(): void {

    this.cierresService.obtenerSolicitudesDisponibles()
      .subscribe({
        next: respuesta => {
          this.solicitudesDisponibles = respuesta.data || [];
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar solicitudes disponibles',
            'error'
          );
        }
      });
  }

  cargarFirmas(): void {

    this.cierresService.obtenerFirmas()
      .subscribe({
        next: respuesta => {
          this.firmas = respuesta.data || [];
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar firmas',
            'error'
          );
        }
      });
  }

  cargarFirmasDisponibles(): void {

    this.cierresService.obtenerFirmasDisponibles()
      .subscribe({
        next: respuesta => {
          this.firmasDisponibles = respuesta.data || [];
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar firmas disponibles',
            'error'
          );
        }
      });
  }

  cargarEntregas(): void {

    this.cierresService.obtenerEntregas()
      .subscribe({
        next: respuesta => {
          this.entregas = respuesta.data || [];
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.mostrarMensaje(
            error.error?.message ||
            'Error al consultar entregas',
            'error'
          );
        }
      });
  }

  get firmaSeleccionada(): FirmaDisponibleEntrega | undefined {
    return this.firmasDisponibles.find(
      f => f.firma === this.nuevaEntrega.firma
    );
  }

  // Evitamos registrar entregas anteriores a la firma.
  get fechaMinimaEntrega(): string {
    const fecha = this.firmaSeleccionada?.fecha_firma;

    if (!fecha) return '';

    // El backend puede devolver fecha como ISO.
    return String(fecha).slice(0, 10);
  }

  registrarFirma(): void {

    if (this.guardando) return;

    const datos = this.nuevaFirma;

    if (
      datos.solicitud === null ||
      !datos.fecha_firma ||
      !datos.notario.trim() ||
      !datos.referencia_escritura.trim()
    ) {
      this.mostrarMensaje(
        'Complete todos los campos obligatorios de la firma',
        'error'
      );
      return;
    }

    if (
      !this.solicitudesDisponibles.some(
        s => s.solicitud === datos.solicitud
      )
    ) {
      this.mostrarMensaje(
        'Seleccione una solicitud disponible para firma',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.cierresService.registrarFirma({
      ...datos,
      notario: datos.notario.trim(),
      referencia_escritura: datos.referencia_escritura.trim(),
      observacion: datos.observacion.trim()
    }).subscribe({

      next: respuesta => {
        this.guardando = false;

        this.nuevaFirma = {
          solicitud: null,
          fecha_firma: '',
          notario: '',
          referencia_escritura: '',
          observacion: ''
        };

        this.actualizarTodo();
        this.mostrarMensaje(respuesta.message, 'exito');
      },

      error: error => {
        this.guardando = false;
        console.error(error);

        this.mostrarMensaje(
          error.error?.message ||
          'Error al registrar la firma',
          'error'
        );

        this.actualizarTodo();
      }
    });
  }

  registrarEntrega(): void {

    if (this.guardando) return;

    const datos = this.nuevaEntrega;

    if (
      datos.firma === null ||
      !datos.fecha_entrega ||
      !datos.responsable.trim()
    ) {
      this.mostrarMensaje(
        'Complete los campos obligatorios de entrega',
        'error'
      );
      return;
    }

    if (!this.firmaSeleccionada) {
      this.mostrarMensaje(
        'Seleccione una firma pendiente de entrega',
        'error'
      );
      return;
    }

    if (
      this.fechaMinimaEntrega &&
      datos.fecha_entrega < this.fechaMinimaEntrega
    ) {
      this.mostrarMensaje(
        'La fecha de entrega no puede ser anterior a la firma',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.cierresService.registrarEntrega({
      ...datos,
      responsable: datos.responsable.trim(),
      observacion: datos.observacion.trim()
    }).subscribe({

      next: respuesta => {
        this.guardando = false;

        this.nuevaEntrega = {
          firma: null,
          fecha_entrega: '',
          responsable: '',
          observacion: ''
        };

        this.actualizarTodo();
        this.mostrarMensaje(respuesta.message, 'exito');
      },

      error: error => {
        this.guardando = false;
        console.error(error);

        this.mostrarMensaje(
          error.error?.message ||
          'Error al registrar la entrega',
          'error'
        );

        this.actualizarTodo();
      }
    });
  }
}
