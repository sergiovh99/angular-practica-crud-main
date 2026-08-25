export interface Marca {
  id: string;
  name: string;
}

export interface Modelo {
  id: string;
  name: string;
}

export interface Coche {
  id: string;
  brand: Marca;
  model: Modelo;
  total: number;
  imageUrl: string;
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
