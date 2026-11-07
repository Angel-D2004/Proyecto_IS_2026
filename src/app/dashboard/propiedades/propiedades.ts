import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Propiedad } from '../../core/models/propiedad.model';
import { PropiedadesService } from '../../core/services/propiedades.service';

@Component({
  selector: 'app-propiedades',
  imports: [RouterLink],
  templateUrl: './propiedades.html',
})
export class Propiedades {
  private readonly propiedadesService = inject(PropiedadesService);

  protected readonly propiedades = signal<Propiedad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.propiedadesService.listar().subscribe({
      next: (propiedades) => {
        this.propiedades.set(propiedades);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información. Verifica que la API esté en ejecución.');
        this.cargando.set(false);
      },
    });
  }
}
