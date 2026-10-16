import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private productos: Producto[] = [
    {
      id: 'p1',
      nombre: 'Combo FastOrder Supremo',
      categoria: 'Combos',
      precio: 32.50,
      descripcion: 'Hamburguesa doble carne 100% res, doble cheddar fundido, tocino crocante, papas y bebida 500ml.',
      imagen: 'img/p1.png',
      badge: 'TOP VENTAS',
      tiempoPrep: '10 min',
      salsasDisponibles: ['Mayonesa Casera', 'Ají FastOrder Especial', 'Kétchup Clásico', 'Golf Ahumada'],
      extrasDisponibles: [
        { nombre: 'Queso Cheddar Extra', precio: 3.50 },
        { nombre: 'Tocino Crocante Extra', precio: 4.00 },
        { nombre: 'Huevo a la Plancha', precio: 2.50 }
      ]
    },
    {
      id: 'p2',
      nombre: 'Burger Monster Bacon Deluxe',
      categoria: 'Hamburguesas',
      precio: 24.90,
      descripcion: 'Carne artesanal (180g), queso suizo, cebolla caramelizada, triple tocino y salsa BBQ casera.',
      imagen: 'img/p2.png',
      badge: 'FAVORITO',
      tiempoPrep: '8 min',
      salsasDisponibles: ['BBQ Ahumada', 'Ají FastOrder Especial', 'Mayonesa Casera'],
      extrasDisponibles: [
        { nombre: 'Doble Carne Extra (90g)', precio: 6.00 },
        { nombre: 'Queso Cheddar Fundido', precio: 3.50 }
      ]
    },
    {
      id: 'p3',
      nombre: 'Burger Clásica Royal Criolla',
      categoria: 'Hamburguesas',
      precio: 21.00,
      descripcion: 'Carne a la parrilla, jamón artesanal inglés, huevo a la plancha, lechuga hidropónica y tomate fresco.',
      imagen: 'img/p3.png',
      tiempoPrep: '7 min',
      salsasDisponibles: ['Mayonesa Tradicional', 'Tártara de la Casa', 'Ají Pollero'],
      extrasDisponibles: [
        { nombre: 'Plátano Frito (2 rodajas)', precio: 2.00 },
        { nombre: 'Queso Edam Fundido', precio: 3.00 }
      ]
    },
    {
      id: 'p4',
      nombre: 'Combo Duo Mega Broaster',
      categoria: 'Combos',
      precio: 38.00,
      descripcion: '4 piezas de pollo broaster crujiente, porción grande de papas fritas nativas y 2 bebidas 500ml.',
      imagen: 'img/p4.png',
      badge: 'PARA DOS',
      tiempoPrep: '12 min',
      salsasDisponibles: ['Ají Pollero Picante', 'Mayonesa Casera', 'Kétchup Clásico'],
      extrasDisponibles: [
        { nombre: 'Pieza de Pollo Adicional', precio: 6.50 }
      ]
    },
    {
      id: 'p5',
      nombre: 'Crispy Chicken Strips & Dips',
      categoria: 'Broasters',
      precio: 18.50,
      descripcion: '6 tiras de pechuga marinadas con especias y rebozado ultra crujiente con 2 salsas.',
      imagen: 'img/p5.png',
      badge: 'CRISPY',
      tiempoPrep: '6 min',
      salsasDisponibles: ['Honey Mustard', 'BBQ Chipotle', 'Mayonesa Ajo'],
      extrasDisponibles: [
        { nombre: '3 Strips Adicionales', precio: 7.00 }
      ]
    },
    {
      id: 'p6',
      nombre: 'Papas Rústicas Cheddar & Bacon',
      categoria: 'Acompañamientos',
      precio: 14.50,
      descripcion: 'Papas nativas fritas crujientes con abundante salsa cheddar caliente y tocino crocante.',
      imagen: 'img/p6.png',
      tiempoPrep: '5 min',
      salsasDisponibles: ['Cheddar Tibio', 'Crema Agria', 'Ají Parrillero'],
      extrasDisponibles: [
        { nombre: 'Doble Bacon Crocante', precio: 3.50 }
      ]
    },
    {
      id: 'p7',
      nombre: 'Aros de Cebolla Crocantes (8 pcs)',
      categoria: 'Acompañamientos',
      precio: 12.00,
      descripcion: 'Aros de cebolla dulce con rebozado al panko acompañados de salsa tártara.',
      imagen: 'img/p7.png',
      tiempoPrep: '5 min',
      salsasDisponibles: ['Tártara Casera', 'BBQ'],
      extrasDisponibles: []
    },
    {
      id: 'p8',
      nombre: 'Chicha Morada Especial (1L)',
      categoria: 'Bebidas',
      precio: 9.50,
      descripcion: 'Elaborada artesanalmente con maíz morado, piña, manzana, canela, clavo y toque de limón.',
      imagen: 'img/p8.png',
      badge: '100% NATURAL',
      tiempoPrep: '1 min',
      salsasDisponibles: [],
      extrasDisponibles: []
    },
    {
      id: 'p9',
      nombre: 'Sundae Dulce de Leche & Brownie',
      categoria: 'Postres',
      precio: 10.90,
      descripcion: 'Helado cremoso de vainilla con trozos tibios de brownie de chocolate y manjar blanco.',
      imagen: 'img/p9.png',
      tiempoPrep: '2 min',
      salsasDisponibles: [],
      extrasDisponibles: []
    }
  ];

  getProductos(): Observable<Producto[]> {
    return of(this.productos);
  }
}
