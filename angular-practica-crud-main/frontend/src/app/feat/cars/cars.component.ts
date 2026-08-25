import { Component, OnInit } from "@angular/core";
import { CarsService } from "../../service/CarsService.service";
import { Coche, MetaPaginacion } from "../../interface/coches.interface";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cars',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './cars.html',
    styleUrl: './cars.css'
})

export class CarsComponent implements OnInit {
    coches: Coche[] = [];
    meta?: MetaPaginacion
    loading = true;
    error = '';
    constructor(private carsService: CarsService){
    }
        ngOnInit(): void {
    this.cargarCoches();
  }
     cargarCoches(pagina = 1): void {
    this.loading = true;
    this.error = '';

    this.carsService.obtenerCoches(
).subscribe({next: (respuesta: { items: Coche[]; meta: MetaPaginacion | undefined; }) => {
    this.coches = respuesta.items;
    this.meta = respuesta.meta;
  },
  error: (error: any) => {
    console.error('Error al obtener los coches:', error);
  }
});

  }
    paginaAnterior(): void {
    if (this.meta?.hasPreviousPage) {
      this.cargarCoches(this.meta.currentPage - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.meta?.hasNextPage) {
      this.cargarCoches(this.meta.currentPage + 1);
    }
  }
}

