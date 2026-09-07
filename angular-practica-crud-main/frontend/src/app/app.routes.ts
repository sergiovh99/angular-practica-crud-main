import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CarsComponent } from './feat/cars/cars.component';
import { BrandsComponent } from './feat/brands/brands.component';
import { CocheDetalleComponent } from './feat/cars/cocheDetalle/cocheDetalle.component';
import { CrearCocheComponent } from './feat/cars/crearCoche/crearCoche.component';

export const routes: Routes = [
        {
    path: '',
    component: HomeComponent,
    },
 {
    path: 'cars',
    component: CarsComponent,

  },
  {
    path: 'brands',
    component: BrandsComponent,

  },
  { path: 'coches/:id', component: CocheDetalleComponent },  
  { path: 'cars/new', component: CrearCocheComponent },

 {
    path: '**',
    redirectTo: '',
  },
];
