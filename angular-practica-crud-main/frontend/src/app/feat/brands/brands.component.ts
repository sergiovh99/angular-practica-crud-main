import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { BrandsService } from "../../service/BrandsService.service";
import { Brands } from "../../interface/brands.interface";
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
type CampoOrdenable = 'id' | 'nombre' ;
type DireccionOrden = 'ascending' | 'descending';
@Component({
    selector: 'app-brands',
    imports: [CommonModule, RouterLink],
    standalone: true,
    templateUrl: './brands.html',
    styleUrl: './brands.css'
})

export class BrandsComponent implements OnInit {
    brands: Brands[] = [];
    loading = true;
    error = '';
      campoOrdenado: CampoOrdenable | null = null;
  direccionOrden: DireccionOrden = 'ascending';
       constructor(private brandsService: BrandsService,
        private cdr: ChangeDetectorRef
       ){
    } 
    ngOnInit(): void {
        this.getBrands();
    }
      ordenarPor(campo: CampoOrdenable): void {
    if (this.campoOrdenado === campo) {
      this.direccionOrden =
        this.direccionOrden === 'ascending' ? 'descending' : 'ascending';
    } else {
      this.campoOrdenado = campo;
      this.direccionOrden = 'ascending';
    }

    const multiplicador = this.direccionOrden === 'ascending' ? 1 : -1;

    this.brands = [...this.brands].sort((a, b) => {
      let valorA: string | number;
      let valorB: string | number;

      switch (campo) {
        case 'id':
          valorA = a.id;
          valorB = b.id;
          break;

        case 'nombre':
          valorA = a.name;
          valorB = b.name;
          break;
      }

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return (valorA - valorB) * multiplicador;
      }

      return (
        String(valorA).localeCompare(String(valorB), 'es', {
          sensitivity: 'base'
        }) * multiplicador
      );
    });
  }
    getBrands() : void {
    this.brandsService.getBrands().pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            })
          ).subscribe({
        next: (respuesta: Brands[]) => {
        this.brands = respuesta;
        this.loading = false;
        this.cdr.markForCheck();

    },
    error: () => {
        this.error = 'No se ha podido cargar el listado de marcas';
        this.loading = false;
        this.cdr.markForCheck();

    }})
    }

}