import { Component, OnInit } from "@angular/core";
import { BrandsService } from "../../service/BrandsService.service";
import { Brands } from "../../interface/brands.interface";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-brands',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './brands.html',
    styleUrl: './brands.css'
})

export class BrandsComponent implements OnInit {
    brands: Brands[] = [];
    loading = true;
    error = '';
       constructor(private brandsService: BrandsService){
    } 
    ngOnInit(): void {
        this.getBrands();
    }
    getBrands() : void {
    this.brandsService.getBrands().subscribe({
        next: (respuesta: Brands[]) => {
        this.brands = respuesta;
        this.loading = false;
    },
    error: () => {
        this.error = 'No se ha podido cargar el listado de marcas';
        this.loading = false;
    }})
    }

}