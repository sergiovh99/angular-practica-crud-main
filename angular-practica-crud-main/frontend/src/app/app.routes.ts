import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CarsComponent } from './feat/cars/cars.component';
import { BrandsComponent } from './feat/brands/brands.component';
export const routes: Routes = [
  {
 path: '',
    component: BrandsComponent,
    pathMatch: 'full'
  },
   {
    path: '',
    component: CarsComponent,
    pathMatch: 'full'
  },
      {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  }
   
];
