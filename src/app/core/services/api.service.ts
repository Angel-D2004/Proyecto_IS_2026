import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

interface ApiEnvelope<T> {
  data: T;
}

/**
 * Cliente HTTP genérico del contenedor SPA.
 * Centraliza la URL base y el formato de respuesta { data } de la API.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listar<T>(recurso: string): Observable<T[]> {
    return this.http
      .get<ApiEnvelope<T[]>>(`${API_BASE_URL}/${recurso}`)
      .pipe(map((respuesta) => respuesta.data));
  }

  obtener<T>(recurso: string, id: number): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(`${API_BASE_URL}/${recurso}/${id}`)
      .pipe(map((respuesta) => respuesta.data));
  }

  crear<T>(recurso: string, payload: unknown): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(`${API_BASE_URL}/${recurso}`, payload)
      .pipe(map((respuesta) => respuesta.data));
  }

  actualizar<T>(recurso: string, id: number, payload: unknown): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(`${API_BASE_URL}/${recurso}/${id}`, payload)
      .pipe(map((respuesta) => respuesta.data));
  }

  eliminar(recurso: string, id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/${recurso}/${id}`);
  }
}
