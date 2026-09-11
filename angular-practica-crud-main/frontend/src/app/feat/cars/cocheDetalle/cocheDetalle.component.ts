import { ActivatedRoute } from '@angular/router';
import { CarsService } from '../../../service/CarsService.service';
import { Component, OnInit, ChangeDetectorRef, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Coche } from '../../../interface/coches.interface';
import { finalize } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cocheDetalle',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  standalone: true,
  templateUrl: './cocheDetalle.html',
  styleUrl: './cocheDetalle.css'
})

export class CocheDetalleComponent implements OnInit {
  coche?: Coche;
  loading = true;
  id?: string | null = null;
  error = '';
  cocheFlag = true;
  currencies: string[] = [
    'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RON', 'BGN', 'HRK', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU',
    'PYG', 'BOB', 'VES', 'USD', 'CAD', 'MXN', 'JPY', 'CNY', 'INR',
    'KRW', 'SGD', 'HKD', 'MYR', 'IDR', 'THB', 'VND', 'PKR', 'AUD',
    'NZD', 'ZAR', 'EGP', 'NGN', 'KES', 'GHS'
  ];
    formulario: FormGroup;
    years: number[] = Array.from(
  { length: 2026 - 1900 + 1 },
  (_, index) => 2026 - index
);

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private router: Router


  ) {    
    this.formulario = this.formBuilder.group({
    brandId: ['', Validators.required],
    modelId: ['', Validators.required],

    carDetails: this.formBuilder.array([
      this.crearDetalle(this.id)
    ])
  });}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.cocheFlag = this.id === null;
    if(this.cocheFlag) {
      this.carDetails;
      this.loading = false;
    }else{
      this.getCocheId(); 
    }
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

          this.formulario.patchValue({
            brandId: coche.brand.id,
            modelId: coche.model.id
          });
          this.carDetails.clear();
        coche.carDetails.forEach((detalle) => {
          this.carDetails.push(
            this.crearDetalle({
              licensePlate: detalle.licensePlate,
              manufactureYear: detalle.manufactureYear
  ? Number(detalle.manufactureYear)
  : null,
              mileage: detalle.mileage,
              price: detalle.price,
              currency: detalle.currency,
              registrationDate: detalle.registrationDate
                ? detalle.registrationDate.slice(0, 10)
                : '',
              color: detalle.color,
              description: detalle.description,
              availability: detalle.availability
            })
          );
        });

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
    get carDetails(): FormArray {
    return this.formulario.get('carDetails') as FormArray;
  }
  crearDetalle(detalle?: any): FormGroup {
  return this.formBuilder.group({
    licensePlate: [detalle?.licensePlate ?? '',[Validators.required]],
    manufactureYear: [detalle?.manufactureYear ?? null,   [
    Validators.required,
    Validators.min(1900),
    Validators.max(2026)
  ]],
    mileage: [detalle?.mileage ?? null, [Validators.required, Validators.min(0)]],
    price: [detalle?.price ?? null,[ Validators.required, Validators.min(1)]],
    currency: [detalle?.currency ?? 'EUR'],
    registrationDate: [detalle?.registrationDate ?? '', [Validators.required]],
    color: [detalle?.color ?? '', [Validators.required]],
    description: [detalle?.description ?? '' ],
    availability: [detalle?.availability ?? true]
  });
}

    agregarDetalle(): void {
    this.carDetails.push(this.crearDetalle());
  }
eliminarDetalle(indice: number): void {
  if (this.carDetails.length > 1) {
    this.carDetails.removeAt(indice);
  } else {
    this.carDetails.at(0).reset({
      marca: null,
      modelo: null,
      placa: null
    });
  }
}

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const nuevoCoche = this.formulario.getRawValue();

    this.carsService.crearCoche(nuevoCoche).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/cars']);
      },
      error: (error: unknown) => {
        console.error(error);
        this.error = 'No se pudo crear el coche.';
        this.loading = false;
      }
    });
  }
}
