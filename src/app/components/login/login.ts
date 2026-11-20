
import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  contrasena = '';

  cargando = false;
  mensaje = '';

  ingresar(): void {

    if (this.cargando) return;

    if (!this.email.trim() || !this.contrasena) {
      this.mensaje = 'Ingrese correo y contraseña';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.auth.iniciarSesion(
      this.email.trim(),
      this.contrasena
    ).subscribe({

      next: respuesta => {

        this.cargando = false;

        this.auth.guardarSesion(respuesta);

        this.router.navigateByUrl('/panel');
      },

      error: error => {

        this.cargando = false;

        this.mensaje =
          error.error?.message ||
          'No se pudo iniciar sesión';

        this.cdr.detectChanges();
      }
    });
  }
}
