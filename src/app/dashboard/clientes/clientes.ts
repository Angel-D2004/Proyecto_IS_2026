import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Cliente } from '../../core/models/cliente.model';
import { ClientesService } from '../../core/services/clientes.service';

@Component({
  selector: 'app-clientes',
  imports: [RouterLink],
  templateUrl: './clientes.html',
})
export class Clientes {
  private readonly clientesService = inject(ClientesService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clientesService.listar().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información. Verifica que la API esté en ejecución.');
        this.cargando.set(false);
      },
    });
  }
}
