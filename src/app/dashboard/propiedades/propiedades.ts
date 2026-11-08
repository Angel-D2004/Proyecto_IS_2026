
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { PropiedadesService, Propiedad, NuevaPropiedad, EstadoPropiedad } from '../../services/propiedades';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-propiedades',
  imports: [FormsModule, RouterLink],
  templateUrl: './propiedades.html'
})

export class Propiedades implements OnInit {

  private propiedadesService = inject(PropiedadesService);
  private cdr = inject(ChangeDetectorRef);

  propiedades: Propiedad[] = [];

  nuevaPropiedad: NuevaPropiedad = {
    codigo: '',
    nombre: '',
    ubicacion: '',
    descripcion: '',
    precio: null
  };

  mensaje = '';
  guardando = false;
  filtroEstado = 'todas';

  ngOnInit(): void {
    this.cargarPropiedades();
  }

  get propiedadesFiltradas(): Propiedad[] {
    if (this.filtroEstado === 'todas') {
      return this.propiedades;
    }

    return this.propiedades.filter(
      propiedad => propiedad.estado === this.filtroEstado
    );
  }

  cargarPropiedades(): void {
    this.propiedadesService.obtenerPropiedades().subscribe({
      next: (respuesta) => {
        this.propiedades = respuesta.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar propiedades:', error);
        this.mensaje = 'No se pudieron cargar las propiedades';
        this.cdr.detectChanges();
      }
    });
  }

  registrarPropiedad(): void {
    if (this.guardando) return;

    this.guardando = true;
    this.mensaje = '';

    this.propiedadesService.registrarPropiedad(
      this.nuevaPropiedad
    ).subscribe({
      next: () => {
        this.mensaje = 'Propiedad registrada correctamente';

        this.nuevaPropiedad = {
          codigo: '',
          nombre: '',
          ubicacion: '',
          descripcion: '',
          precio: null
        };

        this.guardando = false;
        this.cargarPropiedades();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al registrar propiedad:', error);

        this.mensaje = error.error?.message ||
          'Error al registrar propiedad';

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(propiedad: Propiedad, estado: string): void {
    if (!['disponible', 'reservada', 'vendida'].includes(estado)) {
      return;
    }

    if (propiedad.estado === estado) return;

    this.propiedadesService.actualizarEstado(
      propiedad.propiedad,
      estado as EstadoPropiedad
    ).subscribe({
      next: () => {
        this.mensaje = 'Estado actualizado correctamente';
        this.cargarPropiedades();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.mensaje = 'No se pudo actualizar el estado';
        this.cargarPropiedades();
        this.cdr.detectChanges();
      }
    });
  }

  
}
