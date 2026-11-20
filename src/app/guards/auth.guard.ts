
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.obtenerToken()) {
    return router.createUrlTree(['/login']);
  }

  return auth.consultarSesion().pipe(

    map(respuesta =>
      respuesta.status
        ? true
        : router.createUrlTree(['/login'])
    ),

    catchError(() => {
      auth.cerrarSesion();

      return of(
        router.createUrlTree(['/login'])
      );
    })

  );
};
