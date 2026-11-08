
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesService, Cliente, NuevoCliente } from '../../services/clientes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {

  private clientesService = inject(ClientesService);
  private cdr = inject(ChangeDetectorRef);

  clienteEditando: number | null = null;

  clientes: Cliente[] = [];

  nuevoCliente: NuevoCliente = {
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    origen: ''
  };

  mensaje = '';
  guardando = false;

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clientesService.obtenerClientes().subscribe({
      next: (respuesta) => {
        this.clientes = respuesta.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar clientes:', error);
      }
    });
  }

  
  registrarCliente(): void {
    if (this.guardando) return;

    this.guardando = true;
    this.mensaje = '';

    const peticion = this.clienteEditando !== null
      ? this.clientesService.actualizarCliente(
          this.clienteEditando, this.nuevoCliente
        )
      : this.clientesService.registrarCliente(this.nuevoCliente);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.clienteEditando !== null
          ? 'Cliente actualizado correctamente'
          : 'Prospecto registrado correctamente';

        this.clienteEditando = null;

        this.nuevoCliente = {
          nombres: '',
          apellidos: '',
          telefono: '',
          email: '',
          origen: ''
        };

        this.guardando = false;
        this.cargarClientes();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al guardar cliente:', error);
        this.mensaje = error.error?.message || 'Error al guardar cliente';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }


  
  editarCliente(cliente: Cliente): void {
    this.clienteEditando = cliente.cliente;

    this.nuevoCliente = {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
      origen: cliente.origen ?? ''
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.clienteEditando = null;

    this.nuevoCliente = {
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      origen: ''
    };

    this.mensaje = '';
  }

}
