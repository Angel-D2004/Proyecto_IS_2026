
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CitasService,
  Cita,
  NuevaCita
} from '../../services/citas';

import {
  ClientesService,
  Cliente
} from '../../services/clientes';

@Component({
  selector: 'app-citas',
  imports: [FormsModule, RouterLink],
  templateUrl: './citas.html'
})
export class Citas implements OnInit {

  private citasService = inject(CitasService);
  private clientesService = inject(ClientesService);
  private cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  clientes: Cliente[] = [];

  nuevaCita: NuevaCita = {
    cliente: null,
    fecha: '',
    lugar: 'Sala de ventas',
    motivo: ''
  };

  filtroEstado = 'todas';
  mensaje = '';
  guardando = false;

  citaSeleccionada: number | null = null;
  estadoResultado: 'realizada' | 'cancelada' = 'realizada';
  observacion = '';

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarCitas();
  }

  get citasFiltradas(): Cita[] {
    if (this.filtroEstado === 'todas') return this.citas;

    return this.citas.filter(
      cita => cita.estado_cita === this.filtroEstado
    );
  }

  cargarClientes(): void {
    this.clientesService.obtenerClientes().subscribe({
      next: (respuesta) => {
        this.clientes = respuesta.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.mensaje = 'No se pudieron cargar los clientes';
        this.cdr.detectChanges();
      }
    });
  }

  cargarCitas(): void {
    this.citasService.obtenerCitas().subscribe({
      next: (respuesta) => {
        this.citas = respuesta.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.mensaje = 'No se pudieron cargar las citas';
        this.cdr.detectChanges();
      }
    });
  }

  registrarCita(): void {
    if (this.guardando) return;

    this.guardando = true;
    this.mensaje = '';

    this.citasService.registrarCita(this.nuevaCita).subscribe({
      next: () => {
        this.mensaje = 'Cita registrada correctamente';

        this.nuevaCita = {
          cliente: null,
          fecha: '',
          lugar: 'Sala de ventas',
          motivo: ''
        };

        this.guardando = false;
        this.cargarCitas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.message ||
          'Error al registrar cita';

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarCita(cita: Cita): void {
    this.citaSeleccionada = cita.cita;
    this.estadoResultado = 'realizada';
    this.observacion = '';
  }

  guardarResultado(): void {
    if (this.citaSeleccionada === null ||
        !this.observacion.trim() ||
        this.guardando) return;

    this.guardando = true;

    this.citasService.registrarResultado(
      this.citaSeleccionada,
      this.estadoResultado,
      this.observacion
    ).subscribe({
      next: () => {
        this.mensaje = 'Resultado registrado correctamente';
        this.citaSeleccionada = null;
        this.observacion = '';
        this.guardando = false;
        this.cargarCitas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensaje = error.error?.message ||
          'No se pudo guardar el resultado';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
