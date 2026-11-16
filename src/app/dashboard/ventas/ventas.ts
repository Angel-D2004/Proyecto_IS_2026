
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

import {
  VentasService,
  Interes,
  Seguimiento,
  Oportunidad,
  NuevoInteres,
  NuevoSeguimiento,
  NuevaOportunidad
} from '../../services/ventas';

import {
  ClientesService,
  Cliente
} from '../../services/clientes';

import {
  PropiedadesService,
  Propiedad
} from '../../services/propiedades';

import {
  CitasService,
  Cita
} from '../../services/citas';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule, RouterLink],
  templateUrl: './ventas.html'
})
export class Ventas implements OnInit {

  private ventasService = inject(VentasService);
  private clientesService = inject(ClientesService);
  private propiedadesService = inject(PropiedadesService);
  private citasService = inject(CitasService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  propiedades: Propiedad[] = [];
  intereses: Interes[] = [];
  seguimientos: Seguimiento[] = [];
  oportunidades: Oportunidad[] = [];
  citas: Cita[] = [];

  pestana = 'intereses';
  mensaje = '';
  guardando = false;
  filtroCliente: number | null = null;

  nuevoInteres: NuevoInteres = {
    cliente: null,
    propiedad: null,
    observacion: ''
  };

  nuevoSeguimiento: NuevoSeguimiento = {
    cliente: null,
    tipo_seg: 'llamada',
    observacion: '',
    proximo_contacto: ''
  };

  nuevaOportunidad: NuevaOportunidad = {
    interes: null,
    observacion_opor: ''
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {

    forkJoin({
      clientes: this.clientesService.obtenerClientes(),
      propiedades: this.propiedadesService.obtenerPropiedades(),
      intereses: this.ventasService.obtenerIntereses(),
      seguimientos: this.ventasService.obtenerSeguimientos(),
      oportunidades: this.ventasService.obtenerOportunidades(),
      citas: this.citasService.obtenerCitas()
    }).subscribe({

      next: (respuesta) => {
        this.clientes = respuesta.clientes.data;
        this.propiedades = respuesta.propiedades.data;
        this.intereses = respuesta.intereses.data;
        this.seguimientos = respuesta.seguimientos.data;
        this.oportunidades = respuesta.oportunidades.data;
        this.citas = respuesta.citas.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.mensaje = 'No se pudieron cargar los datos';
        this.cdr.detectChanges();
      }
    });
  }

  get propiedadesDisponibles(): Propiedad[] {
    return this.propiedades.filter(
      p => p.estado === 'disponible'
    );
  }

  get interesesDisponibles(): Interes[] {
    return this.intereses.filter(i =>
      !this.oportunidades.some(o => o.interes === i.interes)
    );
  }

  get clienteSeleccionado(): Cliente | undefined {
    return this.clientes.find(
      c => c.cliente === this.filtroCliente
    );
  }

  get seguimientosFiltrados(): Seguimiento[] {
    return this.seguimientos.filter(s =>
      this.filtroCliente === null ||
      s.cliente === this.filtroCliente
    );
  }

  get citasFiltradas(): Cita[] {
    return this.citas.filter(c =>
      this.filtroCliente === null ||
      c.cliente === this.filtroCliente
    );
  }

  registrarInteres(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarInteres(this.nuevoInteres),
      'Interés registrado correctamente',
      () => {
        this.nuevoInteres = {
          cliente: null,
          propiedad: null,
          observacion: ''
        };
      }
    );
  }

  registrarSeguimiento(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarSeguimiento(
        this.nuevoSeguimiento
      ),
      'Seguimiento registrado correctamente',
      () => {
        this.nuevoSeguimiento = {
          cliente: null,
          tipo_seg: 'llamada',
          observacion: '',
          proximo_contacto: ''
        };
      }
    );
  }

  registrarOportunidad(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarOportunidad(
        this.nuevaOportunidad
      ),
      'Oportunidad creada correctamente',
      () => {
        this.nuevaOportunidad = {
          interes: null,
          observacion_opor: ''
        };
      }
    );
  }

  private guardar(
    peticion: Observable<unknown>,
    mensaje: string,
    limpiar: () => void
  ): void {

    this.guardando = true;
    this.mensaje = '';

    peticion.subscribe({

      next: () => {
        this.mensaje = mensaje;
        limpiar();
        this.guardando = false;
        this.cargarDatos();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al guardar:', error);
        this.mensaje = error.error?.message ||
          'No se pudo guardar la información';

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
