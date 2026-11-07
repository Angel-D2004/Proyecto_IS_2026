import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Cita } from '../../core/models/cita.model';
import { CitasService } from '../../core/services/citas.service';

@Component({
  selector: 'app-citas',
  imports: [RouterLink],
  templateUrl: './citas.html',
})
export class Citas {
  private readonly citasService = inject(CitasService);

  protected readonly citas = signal<Cita[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.citasService.listar().subscribe({
      next: (citas) => {
        this.citas.set(citas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información. Verifica que la API esté en ejecución.');
        this.cargando.set(false);
      },
    });
  }
}
