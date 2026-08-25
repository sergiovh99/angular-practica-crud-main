import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brands } from '../interface/brands.interface';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private readonly apiUrl = 'http://localhost:3000/brands';
  constructor(private http: HttpClient) {}
   getBrands(): Observable<Brands[]> {
        return this.http.get<Brands[]>(this.apiUrl);
    }
    getBrandsById(    
      brandId?: string,): Observable<Brands[]>{  
      let params = new HttpParams();
    if (brandId) {
      params = params.set('brandId', brandId);
    }
    return this.http.get<Brands[]>(this.apiUrl, {params});
  }
}