import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coche, RespuestaCoches } from '../interface/coches.interface';

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
  obtenerIdCoche(id:string): Observable<Coche> {
    return this.http.get<Coche>(`${this.apiUrl}/${id}`)
  }
  crearCoche(coche:Coche): Observable<Coche>{
    return this.http.post<Coche>(this.apiUrl, coche);
  }
}
