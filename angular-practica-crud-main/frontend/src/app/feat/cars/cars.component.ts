import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CarsService } from '../../service/CarsService.service';
import { Coche, MetaPaginacion, RespuestaCoches } from '../../interface/coches.interface';
type CampoOrdenable = 'marca' | 'modelo' | 'total';
type DireccionOrden = 'ascending' | 'descending';
@Component({
  selector: 'app-cars',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  standalone: true,
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})


export class CarsComponent implements OnInit {
  coches: Coche[] = [];
  meta?: MetaPaginacion;
  loading = true;
  error = '';
  campoOrdenado: CampoOrdenable | null = null;
  direccionOrden: DireccionOrden = 'ascending';
  cochesFlag = true;
  constructor(
    private carsService: CarsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCoches();
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

    this.coches = [...this.coches].sort((a, b) => {
      let valorA: string | number;
      let valorB: string | number;

      switch (campo) {
        case 'marca':
          valorA = a.brand.name;
          valorB = b.brand.name;
          break;

        case 'modelo':
          valorA = a.model.name;
          valorB = b.model.name;
          break;

        case 'total':
          valorA = a.total;
          valorB = b.total;
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
  cargarCoches(pagina = 1): void {
    this.loading = true;
    this.error = '';

    this.carsService.obtenerCoches()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (respuesta: RespuestaCoches) => {
          this.coches = respuesta.items;
          this.meta = respuesta.meta;

          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          console.error('Error al obtener los coches:', error);
          this.error = 'No se pudieron cargar los coches.';

          this.cdr.markForCheck();
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
