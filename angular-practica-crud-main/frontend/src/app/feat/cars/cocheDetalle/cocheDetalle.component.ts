import { ActivatedRoute } from '@angular/router';
import { CarsService } from '../../../service/CarsService.service';
import { Component, OnInit, ChangeDetectorRef, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarDetail, Coche, RespuestaCoches } from '../../../interface/coches.interface';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Marca, Modelo } from '../../../interface/coches.interface';
import { EMPTY, finalize, map, switchMap, Observable, take } from 'rxjs';
import { BrandsService } from '../../../service/BrandsService.service';
import { CarDocumentsService } from '../../../service/carsDocuments.service';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';

@Component({
  selector: 'app-cocheDetalle',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  standalone: true,
  templateUrl: './cocheDetalle.html',
  styleUrl: './cocheDetalle.css'
})

export class CocheDetalleComponent implements OnInit {
  coche?: Coche;
  coches: Coche[] = [];
  loading = true;
  id: string | null = null;
  error = '';
  cocheId: string | null = null;
  cochesRegistrados: Coche[] = [];
  documentoSeleccionado: File | null = null;
  readonly marcas = signal<Marca[]>([]);
readonly modelos = signal<Modelo[]>([]);
  mostrarModalDocumento = false;
  cocheFlag = true;
  currencies: string[] = [
    'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RON', 'BGN', 'HRK', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU',
    'PYG', 'BOB', 'VES', 'USD', 'CAD', 'MXN', 'JPY', 'CNY', 'INR',
    'KRW', 'SGD', 'HKD', 'MYR', 'IDR', 'THB', 'VND', 'PKR', 'AUD',
    'NZD', 'ZAR', 'EGP', 'NGN', 'KES', 'GHS'
  ];

    formulario: FormGroup;
    formularioDocumento: FormGroup;
    years: number[] = Array.from(
  { length: 2026 - 1900 + 1 },
  (_, index) => 2026 - index
);

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private brandsService: BrandsService,
    private carDocumentsService: CarDocumentsService,
    private router: Router,
    


  ) {    
    this.formulario = this.formBuilder.group({
    brandId: ['', Validators.required],
    modelId: ['', Validators.required],

    carDetails: this.formBuilder.array([
      this.crearDetalle(this.id)
    ])
  },
{
  validators: [this.validarAnoFabricacion()]
});
this.formularioDocumento = this.formBuilder.nonNullable.group({
  documentType: ['', Validators.required],
  title: ['', [Validators.required, Validators.maxLength(120)]],
  description: ['', Validators.maxLength(500)]
});

}

ngOnInit(): void {
  this.id = this.route.snapshot.paramMap.get('id');
  this.cocheFlag = this.id === null;

  this.cargarMarcas();
  this.cargarCochesRegistrados();

  const controlMarca = this.formulario.get('brandId');
  const controlModelo = this.formulario.get('modelId');

  controlMarca?.valueChanges.subscribe((brandId: string | null) => {
    // Se limpian los modelos de la marca anterior.
    this.modelos.set([]);

    // Se limpia el modelo seleccionado al cambiar de marca.
    controlModelo?.setValue('', {
      emitEvent: false
    });

    if (brandId) {
      this.cargarModelosPorMarca(brandId);
    }

    this.actualizarValidacionModeloExistente();
  });

  controlModelo?.valueChanges.subscribe(() => {
    this.actualizarValidacionModeloExistente();
  });

  // Modo creación.
  if (this.cocheFlag) {
    this.loading = false;
    return;
  }

  // Modo edición.
  if (!this.id) {
    console.error('No se ha recibido el ID del coche.');
    this.loading = false;
    return;
  }

  this.cocheId = this.id;
  this.getCocheId();
}

cargarMarcas(): void {
  this.brandsService.getModels().subscribe({
    next: (marcas) => {
      this.marcas.set(marcas);
    },
    error: (error) => {
      console.error('Error al cargar las marcas:', error);
      this.marcas.set([]);
    }
  });
}
    cargarModelosPorMarca(brandId: string): void {
  this.modelos.set([]);

  this.brandsService.getModelsByBrandId(brandId).subscribe({
    next: (modelos: Modelo[]) => {
      this.modelos.set(modelos);
    },
    error: (error) => {
      console.error('Error al cargar modelos:', error);
      this.modelos.set([]);
    }
  });
}


cargarCochesRegistrados(): void {
  this.carsService.obtenerCoches().subscribe({
    next: (respuesta: RespuestaCoches) => {
      this.cochesRegistrados = respuesta.items;
      this.actualizarValidacionModeloExistente();
    },
    error: (error) => {
      console.error(error);
      this.error = 'No se pudo comprobar si el modelo ya está registrado.';
    }
  });
}
getCocheId(): void {
  this.loading = true;
  this.error = '';

  this.route.paramMap.pipe(
    take(1),

    switchMap((params) => {
      const id = params.get('id');

      if (!id) {
        this.error = 'No se ha recibido el id del coche.';
        return EMPTY;
      }

      this.cocheId = id;

      return this.carsService.obtenerIdCoche(id);
    }),

    switchMap((coche: Coche) => {
      this.coche = coche;


      return this.brandsService.getModelsByBrandId(coche.brand.id).pipe(
        map((modelos) => ({
          coche,
          modelos
        }))
      );
    }),

    finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })
  ).subscribe({
    next: ({ coche, modelos }) => {
      this.modelos.set(modelos)

      this.formulario.patchValue(
        {
          brandId: coche.brand.id,
          modelId: coche.model.id
        },
        { emitEvent: false }
      );

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

      this.cdr.markForCheck();
    },

    error: (error: unknown) => {
      console.error('Error al obtener el coche:', error);
      this.error = 'No se pudo cargar el detalle del coche.';
      this.cdr.markForCheck();
    }
  });
}


    get carDetails(): FormArray {
    return this.formulario.get('carDetails') as FormArray;
  }
private actualizarValidacionModeloExistente(): void {
  const brandId = this.formulario.get('brandId')?.value;
  const controlModelo = this.formulario.get('modelId');
  const modelId = controlModelo?.value;

  if (!controlModelo) {
    return;
  }

  const errores = {
    ...(controlModelo.errors ?? {})
  };

  // Si aún no se ha elegido una marca o un modelo, elimina el error de duplicado.
  if (!brandId || !modelId) {
    delete errores['modeloYaRegistrado'];

    controlModelo.setErrors(
      Object.keys(errores).length > 0 ? errores : null
    );

    return;
  }

  const modeloYaExiste = this.coches.some((coche: Coche) => {
    const mismaMarca = coche.brand.id === brandId;
    const mismoModelo = coche.model.id === modelId;

    // Al crear, se comparan todos los coches.
    // Al editar, se ignora el coche actual.
    const esElMismoCocheEditado =
      !this.cocheFlag && coche.id === this.cocheId;

    return mismaMarca && mismoModelo && !esElMismoCocheEditado;
  });

  if (modeloYaExiste) {
    controlModelo.setErrors({
      ...errores,
      modeloYaRegistrado: true
    });

    return;
  }

  delete errores['modeloYaRegistrado'];

  controlModelo.setErrors(
    Object.keys(errores).length > 0 ? errores : null
  );
}



private normalizarMatriculasCoche(coche: any): any {
  return {
    ...coche,
    carDetails: coche.carDetails.map((detalle: CarDetail) => ({
      ...detalle,
      licensePlate: this.formatearMatricula(detalle.licensePlate)
    }))
  };
}

  crearDetalle(detalle?: any): FormGroup {
  return this.formBuilder.group({
    licensePlate: [detalle?.licensePlate ?? '',[Validators.required,  Validators.pattern(/^\d{4}\s?[B-DF-HJ-NPR-TV-Z]{3}$/i)]],
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
private formatearFechaISO(fecha: string | null): string | null {
  if (!fecha) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return `${fecha}T00:00:00.000Z`;
  }


  return new Date(fecha).toISOString();
}
validarAnoFabricacion(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const carDetails = control.get('carDetails')?.value;

    if (!Array.isArray(carDetails)) {
      return null;
    }

    const hayFechaInvalida = carDetails.some((detalle: CarDetail) => {
      if (
        detalle.manufactureYear === null ||
        detalle.manufactureYear === undefined ||
        !detalle.registrationDate
      ) {
        return false;
      }

      const anoFabricacion = Number(detalle.manufactureYear);

      const anoMatriculacion = Number(
        String(detalle.registrationDate).slice(0, 4)
      );

      if (
        !Number.isFinite(anoFabricacion) ||
        !Number.isFinite(anoMatriculacion)
      ) {
        return false;
      }

      // Fabricación puede ser igual o anterior a matriculación.
      return anoFabricacion > anoMatriculacion;
    });

    return hayFechaInvalida
      ? { anoFabricacionInvalido: true }
      : null;
  };
}


private formatearMatricula(
  matricula: string | null | undefined
): string {
  const matriculaLimpia = (matricula ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, '');

  if (/^\d{4}[B-DF-HJ-NPR-TV-Z]{3}$/.test(matriculaLimpia)) {
    return `${matriculaLimpia.slice(0, 4)} ${matriculaLimpia.slice(4)}`;
  }

  return matriculaLimpia;
}



onDocumentosSeleccionados(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  this.documentoSeleccionado = input.files[0];

  this.formularioDocumento.reset({
    documentType: '',
    title: '',
    description: ''
  });

  this.mostrarModalDocumento = true;

  input.value = '';
}
confirmarDocumento(): void {
  if (this.formularioDocumento.invalid) {
    this.formularioDocumento.markAllAsTouched();
    return;
  }

  this.mostrarModalDocumento = false;
}
cancelarDocumento(): void {
  this.documentoSeleccionado = null;

  this.formularioDocumento.reset({
    documentType: '',
    title: '',
    description: ''
  });

  this.mostrarModalDocumento = false;
}

subirDocumento(cocheId: string): void {
  if (!this.documentoSeleccionado) {
    this.loading = false;
    this.router.navigate(['/cars']);
    return;
  }

  const datosDocumento = this.formularioDocumento.getRawValue();

  this.carDocumentsService.subirDocumento(
    cocheId,
    this.documentoSeleccionado,
    {
      documentType: datosDocumento.documentType,
      title: datosDocumento.title,
      description: datosDocumento.description
    }
  ).subscribe({
    next: () => {
      this.loading = false;
      this.router.navigate(['/cars']);
    },
    error: (error: unknown) => {
      console.error('Error al subir el documento:', error);

      this.error =
        'El coche se guardó, pero no se pudo adjuntar el documento.';
      this.loading = false;
    }
  });
}

gestionarErrorGuardado(error: unknown): void {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 409
  ) {
    this.error =
      'Ya existe un coche registrado con la marca y el modelo seleccionados.';
    return;
  }

  this.error = this.cocheFlag
    ? 'No se pudo crear el coche.'
    : 'No se pudieron guardar los cambios.';
}
crearCocheYAdjuntarDocumentos(nuevoCoche: unknown): void {
    const cocheParaEnviar = this.normalizarMatriculasCoche(nuevoCoche);
  console.log(
    'Coche enviado a la API:',
    JSON.stringify(cocheParaEnviar, null, 2)
  );
  this.carsService.crearCoche(cocheParaEnviar).subscribe({
    next: (cocheCreado: Coche) => {
      this.subirDocumento(cocheCreado.id);
    },
  error: (error: HttpErrorResponse) => {
  console.error('Error al crear coche:', error);
  this.loading = false;

  if (error.status === 409) {
    this.error =
      error.error?.message ??
      'Ya existe un coche registrado con esta marca y este modelo.';

    const controlModelo = this.formulario.get('modelId');

    controlModelo?.setErrors({
      ...(controlModelo.errors ?? {}),
      modeloYaRegistrado: true
    });

    controlModelo?.markAsTouched();
    return;
  }

  this.error = 'No se pudo crear el coche.';
  this.loading = false;
}

  });
}
actualizarCocheYAdjuntarDocumentos(nuevoCoche: unknown): void {
  if (!this.cocheId) {
    this.error = 'No se encontró el identificador del coche.';
    this.loading = false;
    return;
  }

  this.carsService.actualizarCoche(this.cocheId, nuevoCoche).subscribe({
    next: () => {
      // actualizarCoche devuelve void, pero el ID ya se conoce.
      this.subirDocumento(this.cocheId!);
    },
    error: (error: unknown) => {
      console.error(error);
      this.gestionarErrorGuardado(error);
      this.loading = false;
    }
  });
}
eliminarDocumento(): void {
  this.cancelarDocumento();
}
comprobarClickCrear(evento: MouseEvent): void {
  console.log('Se ha pulsado el botón Crear coche');
  console.log('Loading:', this.loading);
  console.log('Formulario válido:', this.formulario.valid);
}



guardar(): void {

  if (this.loading) {
    console.log('Guardado bloqueado: loading es true');
    return;
  }

  this.error = '';

  const datosAntesDeValidar = this.formulario.getRawValue();

  const detallesFormateados = datosAntesDeValidar.carDetails.map(
    (detalle: CarDetail) => ({
      ...detalle,
      licensePlate: this.formatearMatricula(detalle.licensePlate)
    })
  );

  this.formulario.patchValue(
    {
      carDetails: detallesFormateados
    },
    {
      emitEvent: false
    }
  );

  this.formulario.updateValueAndValidity({
    emitEvent: false
  });


  this.actualizarValidacionModeloExistente();

  const controlModelo = this.formulario.get('modelId');

  if (controlModelo?.hasError('modeloYaRegistrado')) {
    controlModelo.markAsTouched();

    this.error =
      'Ya existe un coche registrado con la marca y el modelo seleccionados.';
    console.log('Guardado bloqueado: modelo ya registrado');

    return;
  }

  if (this.formulario.invalid) {
    this.formulario.markAllAsTouched();

    this.error = 'Revisa los campos marcados antes de continuar.';

    console.log('Formulario inválido');

    return;
  }

  if (
    this.documentoSeleccionado &&
    this.formularioDocumento.invalid
  ) {
    this.formularioDocumento.markAllAsTouched();

    this.error =
      'Revisa los datos obligatorios del documento antes de continuar.';

    return;
  }

  this.loading = true;

  const datosFormulario = this.formulario.getRawValue();

  const {
    licensePlate: licenciaPrincipal,
    ...datosCoche
  } = datosFormulario;

  const nuevoCoche = {
    ...datosCoche,
    carDetails: datosFormulario.carDetails.map((detalle: CarDetail) => ({
      ...detalle,
      licensePlate: this.formatearMatricula(detalle.licensePlate),
      registrationDate: this.formatearFechaISO(detalle.registrationDate)
    }))
  };



  if (this.cocheFlag) {
    this.crearCocheYAdjuntarDocumentos(nuevoCoche);
  } else {
    this.actualizarCocheYAdjuntarDocumentos(nuevoCoche);
  }
}





}
