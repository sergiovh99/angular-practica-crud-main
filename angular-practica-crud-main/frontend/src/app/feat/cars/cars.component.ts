import { Component, computed, OnInit, signal} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarsService } from '../../service/CarsService.service';
import { Coche, MetaPaginacion, RespuestaCoches } from '../../interface/coches.interface';
import { finalize } from 'rxjs';
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
  readonly coches = signal<Coche[]>([]);
  readonly filtroMarca = signal('');
  readonly filtroModelo = signal('');
  readonly columnaFiltroActiva = signal<'marca' | 'modelo' | null>(null);
  readonly cargandoCoches = signal(false);
  readonly exportandoExcel = signal(false);

  readonly cochesFiltrados = computed(() => {
  const textoMarca = this.normalizarTexto(this.filtroMarca());
  const textoModelo = this.normalizarTexto(this.filtroModelo());

  return this.coches().filter((coche) => {
    const coincideMarca =
      !textoMarca ||
      this.normalizarTexto(coche.brand.name).includes(textoMarca);

    const coincideModelo =
      !textoModelo ||
      this.normalizarTexto(coche.model.name).includes(textoModelo);

    return coincideMarca && coincideModelo;
  });
});

  meta?: MetaPaginacion;
  loading = true;
  error = '';
  campoOrdenado: CampoOrdenable | null = null;
  direccionOrden: DireccionOrden = 'ascending';
  cochesFlag = true;
  cocheAEliminar: Coche | null = null;
  eliminandoCoche = false;

  constructor(
    private carsService: CarsService,
  ) {}

  ngOnInit(): void {
    this.cargarCoches();
  } 
ordenarPor(campo: CampoOrdenable): void {
  if (this.campoOrdenado === campo) {
    this.direccionOrden =
      this.direccionOrden === 'ascending'
        ? 'descending'
        : 'ascending';
  } else {
    this.campoOrdenado = campo;
    this.direccionOrden = 'ascending';
  }

  const multiplicador =
    this.direccionOrden === 'ascending' ? 1 : -1;

  this.coches.update((cochesActuales) => {
    return [...cochesActuales].sort((a, b) => {
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

        default:
          return 0;
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
  });
}

cargarCoches(pagina: number = 1): void {
  this.cargandoCoches.set(true);
  this.error = '';

  this.carsService
    .obtenerCoches(pagina)
    .pipe(
      finalize(() => {
        this.cargandoCoches.set(false);
      })
    )
    .subscribe({
      next: (respuesta: RespuestaCoches) => {
        console.log('Respuesta de coches:', respuesta);

        this.coches.set(respuesta.items);

        this.meta = respuesta.meta;
      },
      error: (error: unknown) => {
        console.error('Error al cargar coches:', error);

        this.error = 'No se pudo cargar el listado de coches.';
        this.coches.set([]);
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
  solicitarEliminarCoche(coche: Coche): void {
  this.cocheAEliminar = coche;
}
cancelarEliminarCoche(): void {
  if (this.eliminandoCoche) {
    return;
  }

  this.cocheAEliminar = null;
}
confirmarEliminarCoche(): void {
  if (!this.cocheAEliminar || this.eliminandoCoche) {
    return;
  }

  const idCoche = this.cocheAEliminar.id;

  this.eliminandoCoche = true;
  this.error = '';

  this.carsService.eliminarCoche(idCoche).subscribe({
    next: () => {
      this.coches.update((cochesActuales) =>
        cochesActuales.filter((coche) => coche.id !== idCoche)
      );

      this.cocheAEliminar = null;
      this.eliminandoCoche = false;
    },
    error: (error: unknown) => {
      console.error('Error al eliminar el coche:', error);

      this.error = 'No se pudo eliminar el coche.';
      this.eliminandoCoche = false;
    }
  });
}
alternarFiltro(columna: 'marca' | 'modelo'): void {
  const columnaActiva = this.columnaFiltroActiva();

  this.columnaFiltroActiva.set(
    columnaActiva === columna ? null : columna
  );
}

actualizarFiltroMarca(evento: Event): void {
  const input = evento.target as HTMLInputElement;
  this.filtroMarca.set(input.value);
}

actualizarFiltroModelo(evento: Event): void {
  const input = evento.target as HTMLInputElement;
  this.filtroModelo.set(input.value);
}

limpiarFiltroMarca(): void {
  this.filtroMarca.set('');
}

limpiarFiltroModelo(): void {
  this.filtroModelo.set('');
}

private normalizarTexto(valor: string | null | undefined): string {
  return (valor ?? '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

exportarCochesExcel(): void {
  if (this.exportandoExcel()) {
    return;
  }

  this.exportandoExcel.set(true);
  this.error = '';

  this.carsService
    .exportarCochesExcel()
    .pipe(
      finalize(() => {
        this.exportandoExcel.set(false);
      })
    )
    .subscribe({
      next: (archivo: Blob) => {
        if (archivo.size === 0) {
          this.error = 'El archivo Excel generado está vacío.';
          return;
        }

        const urlArchivo = URL.createObjectURL(archivo);

        const enlace = document.createElement('a');
        enlace.href = urlArchivo;
        enlace.download = 'listado-coches.xlsx';

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        URL.revokeObjectURL(urlArchivo);
      },
      error: (error: unknown) => {
        console.error('Error al exportar los coches a Excel:', error);

        this.error =
          'No se pudo exportar el listado de coches a Excel.';
      }
    });
}

}
