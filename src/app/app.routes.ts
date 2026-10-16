import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { PedidosAvanceComponent } from './components/pedidos-avance/pedidos-avance.component';
import { CocinaComponent } from './components/cocina/cocina.component';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', component: MenuComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'pedidos', component: PedidosAvanceComponent },
  { path: 'cocina', component: CocinaComponent },
  { path: '**', redirectTo: 'menu' }
];
