import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Router } from '@angular/router';
import { CarsService } from '../../../service/CarsService.service';

@Component({
  selector: 'app-crearCoche',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crearCoche.html',
    styleUrl: './crearCoche.css'

})
export class CrearCocheComponent {
  loading = false;
  error = '';
  formulario: FormGroup;
  currencies: string[] = [
    'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RON', 'BGN', 'HRK', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU',
    'PYG', 'BOB', 'VES', 'USD', 'CAD', 'MXN', 'JPY', 'CNY', 'INR',
    'KRW', 'SGD', 'HKD', 'MYR', 'IDR', 'THB', 'VND', 'PKR', 'AUD',
    'NZD', 'ZAR', 'EGP', 'NGN', 'KES', 'GHS'
  ];
  constructor(
    private formBuilder: FormBuilder,
    private carsService: CarsService,
    private router: Router
  ) {
    this.formulario = this.formBuilder.group({
    brandId: ['', Validators.required],
    modelId: ['', Validators.required],

    carDetails: this.formBuilder.array([
      this.crearDetalle()
    ])
  });

}

  get carDetails(): FormArray {
    return this.formulario.get('carDetails') as FormArray;
  }

  crearDetalle() {
    return this.formBuilder.group({
      availability: [true],
      currency: ['EUR', Validators.required],
      licensePlate: ['', [Validators.required, Validators.pattern(/^[0-9]{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/)]],
      manufactureYear: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1900), Validators.max(2026)]
      ],
      mileage: [, [Validators.required, Validators.min(1)]],
      price: [, [Validators.required, Validators.min(1)]],
      registrationDate: ['', Validators.required, Validators.pattern('YYYY-MM-DDTHH:MM:SS.mmmZ')],
      color: ['', Validators.required],
      description: [''],
    });
  }

  agregarDetalle(): void {
    this.carDetails.push(this.crearDetalle());
  }

  eliminarDetalle(indice: number): void {
    if (this.carDetails.length > 1) {
      this.carDetails.removeAt(indice);
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
