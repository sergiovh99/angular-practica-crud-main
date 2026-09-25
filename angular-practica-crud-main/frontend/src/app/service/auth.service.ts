import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthUser,
  LoginRequest,
  LoginResponse
} from '../interface/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/auth';
  private readonly userKey = 'authUser';

  constructor(private http: HttpClient) {}

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      datos,
      {
        // Necesario si el backend usa cookies y Angular/API
        // están en orígenes distintos.
        withCredentials: true
      }
    );
  }

guardarUsuario(usuario: AuthUser): void {
  localStorage.setItem(this.userKey, JSON.stringify(usuario));
}

obtenerUsuario(): AuthUser | null {
  const usuario = localStorage.getItem(this.userKey);

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario) as AuthUser;
  } catch {
    this.cerrarSesionLocal();
    return null;
  }
}

estaAutenticado(): boolean {
  return this.obtenerUsuario() !== null;
}

cerrarSesionLocal(): void {
  localStorage.removeItem(this.userKey);
}

}
