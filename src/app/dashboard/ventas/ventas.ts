import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Venta } from '../../core/models/venta.model';
import { VentasService } from '../../core/services/ventas.service';

@Component({
  selector: 'app-ventas',
  imports: [RouterLink],
  templateUrl: './ventas.html',
})
export class Ventas {
  private readonly ventasService = inject(VentasService);

  protected readonly ventas = signal<Venta[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.ventasService.listar().subscribe({
      next: (ventas) => {
        this.ventas.set(ventas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información. Verifica que la API esté en ejecución.');
        this.cargando.set(false);
      },
    });
  }
}
