export interface Marca {
  id: string;
  name: string;
}

export interface Modelo {
  id: string;
  name: string;
}
export interface CarDetail{
  availability: boolean;
  currency: string;
  licensePlate: string;
  manufactureYear: number;
  mileage: number;
  price: number;
  registrationDate: string;
  color: string;
  description: string;
  imageUrl: string;}

export interface Coche {
  id: string;
  brand: Marca;
  model: Modelo;
  total: number;
  imageUrl: string;
  carDetails: CarDetail[];
}

export interface MetaPaginacion {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RespuestaCoches {
  items: Coche[];
  meta: MetaPaginacion;
}
