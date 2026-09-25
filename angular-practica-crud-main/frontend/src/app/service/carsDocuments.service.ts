import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CarDocument,
  UploadCarDocumentDto
} from '../interface/carsDocuments.interface';

@Injectable({
  providedIn: 'root'
})
export class CarDocumentsService {
  // Ajusta esta URL a la URL base real de tu API.
  private readonly apiUrl = 'http://localhost:3000/cars';

  constructor(private http: HttpClient) {}

  subirDocumento(
    carId: string,
    archivo: File,
    datos: UploadCarDocumentDto
  ): Observable<CarDocument> {
    const formData = new FormData();

    // El nombre "file" debe coincidir con el que espera el backend.
    formData.append('file', archivo, archivo.name);
    formData.append('documentType', datos.documentType);
    formData.append('title', datos.title);

    if (datos.description) {
      formData.append('description', datos.description);
    }

    return this.http.post<CarDocument>(
      `${this.apiUrl}/${carId}/document`,
      formData
    );
  }

  descargarDocumento(downloadUrl: string): Observable<Blob> {
    return this.http.get(
      this.obtenerUrlCompleta(downloadUrl),
      {
        responseType: 'blob'
      }
    );
  }

  eliminarDocumento(carId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${carId}/document`
    );
  }

  private obtenerUrlCompleta(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const apiBaseUrl = 'http://localhost:3000';

    return `${apiBaseUrl}${url}`;
  }
}
