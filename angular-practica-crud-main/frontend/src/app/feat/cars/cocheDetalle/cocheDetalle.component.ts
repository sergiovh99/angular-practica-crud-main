import { ActivatedRoute } from '@angular/router';
import { CarsService } from '../../../service/CarsService.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Coche } from '../../../interface/coches.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cocheDetalle',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './cocheDetalle.html',
  styleUrl: './cocheDetalle.css'
})

export class CocheDetalleComponent implements OnInit {
  coche?: Coche;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
 this.getCocheId(); 
}
  getCocheId(): void {
       this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.error = 'No se ha recibido el id del coche.';
        this.loading = false;
        return;
      }

      this.carsService.obtenerIdCoche(id).pipe(finalize(() =>{
              this.loading = false;
              this.cdr.markForCheck();
            })
        ).
        subscribe({
        next: (coche: Coche) => {
          this.coche = coche;
          this.loading = false;
           this.cdr.markForCheck();

        },
        error: (error: unknown) => {
          console.error('Error al obtener el coche:', error);

          this.error = 'No se pudo cargar el detalle del coche.';
          this.loading = false;
          this.cdr.markForCheck();

        }
      });
    });
  }
}
