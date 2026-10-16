import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="carrito-container">
      <div class="carrito-header">
        <h2><i class="fa-solid fa-bag-shopping"></i> Tu Bandeja de Pedido</h2>
        <button *ngIf="(items$ | async)?.length" (click)="vaciar()" class="btn-vaciar">
          <i class="fa-solid fa-trash-can"></i> Limpiar
        </button>
      </div>

      <!-- Carrito Vacío -->
      <div *ngIf="(items$ | async)?.length === 0" class="vacio-card">
        <i class="fa-solid fa-cart-arrow-down vacio-icon"></i>
        <h3>No tienes productos seleccionados</h3>
        <p>Visita nuestro menú y agrega tus platos y combos favoritos.</p>
        <button (click)="irAlMenu()" class="btn-explorar">
          <i class="fa-solid fa-utensils"></i> Explorar el Menú
        </button>
      </div>

      <!-- Layout Carrito con Items -->
      <div *ngIf="(items$ | async)?.length" class="layout-carrito">
        
        <!-- Lista de Productos -->
        <div class="lista-items">
          <div *ngFor="let item of items$ | async; let i = index" class="item-card">
            <img [src]="item.producto.imagen" [alt]="item.producto.nombre" class="item-img">
            
            <div class="item-info">
              <h4>{{ item.producto.nombre }}</h4>
              
              <div *ngIf="item.salsasSeleccionadas.length" class="item-meta">
                <strong>Salsas:</strong> {{ item.salsasSeleccionadas.join(', ') }}
              </div>
              <div *ngIf="item.extrasSeleccionados.length" class="item-meta">
                <strong>Extras:</strong> {{ obtenerNombresExtras(item.extrasSeleccionados) }}
              </div>
              <div *ngIf="item.indicacionesCocina" class="item-meta nota">
                <strong>Nota:</strong> <em>"{{ item.indicacionesCocina }}"</em>
              </div>

              <span class="item-unit-price">S/ {{ item.precioUnitario.toFixed(2) }} c/u</span>
            </div>

            <div class="qty-control">
              <button (click)="cambiarCantidad(i, -1)" class="btn-qty">-</button>
              <span class="qty-num">{{ item.cantidad }}</span>
              <button (click)="cambiarCantidad(i, 1)" class="btn-qty">+</button>
            </div>

            <div class="item-subtotal">
              S/ {{ item.precioTotal.toFixed(2) }}
            </div>

            <button (click)="eliminar(i)" class="btn-eliminar" title="Eliminar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Panel Lateral de Resumen y Checkout -->
        <div class="resumen-card">
          <h3 class="resumen-title"><i class="fa-solid fa-receipt"></i> Datos de Atención</h3>
          
          <div class="form-campo">
            <label>Nombre del Cliente:</label>
            <input type="text" [(ngModel)]="nombreCliente" placeholder="Ej. Rodrigo Llanos" class="input-text">
          </div>

          <div class="form-campo">
            <label>Modalidad de Servicio:</label>
            <div class="toggle-modalidad">
              <button 
                type="button" 
                (click)="tipoEntrega = 'salon'" 
                [class.active]="tipoEntrega === 'salon'"
                class="btn-modalidad"
              >
                <i class="fa-solid fa-chair"></i> En Salón
              </button>
              <button 
                type="button" 
                (click)="tipoEntrega = 'llevar'" 
                [class.active]="tipoEntrega === 'llevar'"
                class="btn-modalidad"
              >
                <i class="fa-solid fa-bag-shopping"></i> Para Llevar
              </button>
            </div>
          </div>

          <div *ngIf="tipoEntrega === 'salon'" class="form-campo">
            <label>Número de Mesa:</label>
            <select [(ngModel)]="mesaSeleccionada" class="select-form">
              <option value="Mesa 1">Mesa 1 (Ventana)</option>
              <option value="Mesa 2">Mesa 2 (Terraza)</option>
              <option value="Mesa 3">Mesa 3 (Principal)</option>
              <option value="Mesa 4">Mesa 4 (VIP)</option>
              <option value="Mesa 5">Mesa 5 (Central)</option>
              <option value="Mesa 6">Mesa 6 (Barra)</option>
            </select>
          </div>

          <div class="form-campo">
            <label>Forma de Pago:</label>
            <select [(ngModel)]="metodoPago" class="select-form">
              <option value="Yape / Plin">Yape / Plin (Billetera Digital)</option>
              <option value="Tarjeta POS">Tarjeta Débito / Crédito (POS)</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>

          <div class="form-campo">
            <label>Notas Adicionales para la Comanda:</label>
            <input type="text" [(ngModel)]="notasGenerales" placeholder="Ej. Servir bebidas primero, cubiertos extra..." class="input-text">
          </div>

          <!-- Desglose de Pago -->
          <div class="desglose-box">
            <div class="desglose-fila">
              <span>Subtotal:</span>
              <span>S/ {{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="desglose-fila">
              <span>IGV (18%):</span>
              <span>S/ {{ igv.toFixed(2) }}</span>
            </div>
            <div class="desglose-fila total-fila">
              <span>Total a Pagar:</span>
              <strong class="total-monto">S/ {{ total.toFixed(2) }}</strong>
            </div>
          </div>

          <button (click)="enviarPedido()" class="btn-confirmar">
            <i class="fa-solid fa-fire"></i> Confirmar y Enviar a Cocina
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .carrito-container {
      max-width: 1050px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }
    .carrito-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .carrito-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
    }
    .btn-vaciar {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #64748b;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn-vaciar:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: #fef2f2;
    }

    .vacio-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 60px 20px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .vacio-icon {
      font-size: 3.5rem;
      color: #ea580c;
      margin-bottom: 16px;
    }
    .vacio-card h3 {
      font-size: 1.3rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .vacio-card p {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 24px;
    }
    .btn-explorar {
      background: #ea580c;
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-explorar:hover {
      background: #c2410c;
    }

    .layout-carrito {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media (min-width: 850px) {
      .layout-carrito {
        grid-template-columns: 1.4fr 1fr;
      }
    }

    .lista-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .item-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .item-img {
      width: 65px;
      height: 65px;
      border-radius: 0px;
      object-fit: cover;
    }
    .item-info {
      flex: 1;
    }
    .item-info h4 {
      font-size: 0.98rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
    }
    .item-meta {
      font-size: 0.78rem;
      color: #64748b;
      margin-bottom: 2px;
    }
    .item-meta.nota {
      color: #b91c1c;
      font-weight: 600;
    }
    .item-unit-price {
      font-size: 0.82rem;
      color: #ea580c;
      font-weight: 700;
      display: block;
      margin-top: 4px;
    }

    .qty-control {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 2px;
    }
    .btn-qty {
      width: 26px;
      height: 26px;
      border: none;
      background: #ffffff;
      color: #0f172a;
      font-weight: 800;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .qty-num {
      padding: 0 10px;
      font-weight: 800;
      font-size: 0.88rem;
      color: #0f172a;
    }
    .item-subtotal {
      font-weight: 800;
      color: #0f172a;
      font-size: 1.1rem;
      min-width: 70px;
      text-align: right;
    }
    .btn-eliminar {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
      transition: color 0.15s;
    }
    .btn-eliminar:hover {
      color: #ef4444;
    }

    .resumen-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 22px;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .resumen-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .form-campo {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .form-campo label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
    }
    .input-text, .select-form {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      outline: none;
    }
    .input-text:focus, .select-form:focus {
      border-color: #ea580c;
    }
    .toggle-modalidad {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .btn-modalidad {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #64748b;
      padding: 9px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn-modalidad.active {
      background: #ffedd5;
      border-color: #ea580c;
      color: #c2410c;
    }

    .desglose-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 14px;
      margin: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .desglose-fila {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #64748b;
    }
    .total-fila {
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 4px;
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
    }
    .total-monto {
      color: #ea580c;
      font-size: 1.3rem;
      font-weight: 900;
    }
    .btn-confirmar {
      width: 100%;
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 13px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s;
    }
    .btn-confirmar:hover {
      background: #c2410c;
    }
  `]
})
export class CarritoComponent {
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  items$ = this.carritoService.items$;
  nombreCliente = 'Rodrigo Llanos';
  mesaSeleccionada = 'Mesa 5';
  tipoEntrega: 'salon' | 'llevar' = 'salon';
  metodoPago = 'Yape / Plin';
  notasGenerales = '';

  get subtotal(): number {
    return this.carritoService.obtenerSubtotal();
  }

  get igv(): number {
    return this.carritoService.obtenerIGV();
  }

  get total(): number {
    return this.carritoService.obtenerTotal();
  }

  cambiarCantidad(index: number, delta: number) {
    this.carritoService.cambiarCantidad(index, delta);
  }

  eliminar(index: number) {
    this.carritoService.eliminarItem(index);
  }

  vaciar() {
    this.carritoService.vaciarCarrito();
  }

  irAlMenu() {
    this.router.navigate(['/menu']);
  }

  obtenerNombresExtras(extras: any[]): string {
    return extras.map(e => e.nombre).join(', ');
  }

  enviarPedido() {
    this.carritoService.registrarPedido(
      this.nombreCliente, 
      this.mesaSeleccionada, 
      this.tipoEntrega, 
      this.metodoPago,
      this.notasGenerales
    );
    this.router.navigate(['/pedidos']);
  }
}
