import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaCoches } from '../interface/coches.interface';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private readonly apiUrl = 'http://localhost:3000/cars';

  constructor(private http: HttpClient) {}

  obtenerCoches(
  ): Observable<RespuestaCoches> {
    return this.http.get<RespuestaCoches>(this.apiUrl);
  }
}
