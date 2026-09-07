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
  templateUrl: './crearCoche.html'
})
export class CrearCocheComponent {
  loading = false;
  error = '';
  formulario: FormGroup;

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
      licensePlate: ['', Validators.required],
      manufactureYear: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1900)]
      ],
      mileage: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      registrationDate: ['', Validators.required],
      color: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required]
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
