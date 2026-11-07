import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService, Usuario} from '../../../services/usuarios';

@Component({
  selector: 'app-content',
  imports: [RouterLink],
  templateUrl: './content.html',
})
export class Content implements OnInit {

  private usuariosService = inject(UsuariosService);

  // Nos permite actualizar la vista cuando recibimos los datos
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (respuesta) => {
        console.log('Respuesta del backend:', respuesta);

        this.usuarios = respuesta.data;

        console.log('Usuarios asignados:', this.usuarios);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });
  }

}
