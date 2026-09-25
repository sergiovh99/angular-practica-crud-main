import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coche, Marca, Modelo, RespuestaCoches } from '../interface/coches.interface';

@Injectable({
  providedIn: 'root'
})
export class CarsService {

  private readonly apiUrl = 'http://localhost:3000/cars';

  constructor(private http: HttpClient) {}


obtenerCoches(pagina: number = 1): Observable<RespuestaCoches> {
  const params = new HttpParams().set('page', pagina);

  return this.http.get<RespuestaCoches>(this.apiUrl, {
    params
  });
}
  obtenerIdCoche(id:string): Observable<Coche> {
    return this.http.get<Coche>(`${this.apiUrl}/${id}`)
  }
  crearCoche(coche: unknown): Observable<Coche>{
    return this.http.post<Coche>(this.apiUrl, coche);
  }
  actualizarCoche(id: string, coche: unknown): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, coche);
  }
  eliminarCoche(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  exportarCochesExcel(): Observable<Blob> {
  return this.http.get(
    `${this.apiUrl}/export/excel`,
    {
      responseType: 'blob'
    }
  );
}

}

