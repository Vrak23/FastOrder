import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { CarritoService } from '../../services/carrito.service';
import { OpcionExtra, Producto } from '../../models/producto.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-container">
      
      <!-- Controles de Filtro y Búsqueda -->
      <div class="top-controls">
        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="busqueda" 
            placeholder="Buscar hamburguesas, combos, bebidas..." 
            class="search-input"
          />
        </div>

        <div class="category-tabs">
          <button 
            *ngFor="let cat of categorias" 
            (click)="categoriaSeleccionada = cat" 
            [class.active]="categoriaSeleccionada === cat" 
            class="tab-btn"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Productos -->
      <div class="grid-productos">
        <div *ngFor="let p of productosFiltrados" class="card-producto" (click)="abrirModal(p)">
          <div class="img-wrapper">
            <img [src]="p.imagen" [alt]="p.nombre" class="img-producto">
            <span *ngIf="p.badge" class="badge-tag">{{ p.badge }}</span>
            <span *ngIf="p.tiempoPrep" class="time-tag">
              <i class="fa-solid fa-clock"></i> {{ p.tiempoPrep }}
            </span>
          </div>

          <div class="body-producto">
            <span class="categoria-label">{{ p.categoria }}</span>
            <h3 class="titulo">{{ p.nombre }}</h3>
            <p class="desc">{{ p.descripcion }}</p>

            <div class="footer-producto">
              <div class="precio-block">
                <span class="moneda">S/</span>
                <span class="monto">{{ p.precio.toFixed(2) }}</span>
              </div>
              <button class="btn-personalizar" (click)="$event.stopPropagation(); abrirModal(p)">
                <i class="fa-solid fa-plus"></i> Pedir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="productosFiltrados.length === 0" class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>No se encontraron productos.</p>
      </div>

      <!-- MODAL DE PERSONALIZACIÓN -->
      <div *ngIf="modalVisible && productoSeleccionado" class="modal-backdrop" (click)="cerrarModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <h3>{{ productoSeleccionado.nombre }}</h3>
            <button class="btn-close" (click)="cerrarModal()">&times;</button>
          </div>

          <div class="modal-body">
            
            <div class="modal-preview">
              <img [src]="productoSeleccionado.imagen" class="modal-thumb">
              <p class="modal-desc">{{ productoSeleccionado.descripcion }}</p>
            </div>

            <!-- Salsas -->
            <div *ngIf="productoSeleccionado.salsasDisponibles?.length" class="seccion-opcion">
              <label class="opcion-titulo">Salsas a elección:</label>
              <div class="chips-salsas">
                <button 
                  type="button" 
                  *ngFor="let s of productoSeleccionado.salsasDisponibles" 
                  (click)="toggleSalsa(s)" 
                  [class.active]="salsasElegidas.includes(s)"
                  class="chip-salsa"
                >
                  <i class="fa-solid" [ngClass]="salsasElegidas.includes(s) ? 'fa-check' : 'fa-plus'"></i> {{ s }}
                </button>
              </div>
            </div>

            <!-- Extras -->
            <div *ngIf="productoSeleccionado.extrasDisponibles?.length" class="seccion-opcion">
              <label class="opcion-titulo">Ingredientes adicionales:</label>
              <div class="lista-extras">
                <label *ngFor="let extra of productoSeleccionado.extrasDisponibles" class="extra-item" [class.checked]="esExtraSeleccionado(extra)">
                  <input type="checkbox" [checked]="esExtraSeleccionado(extra)" (change)="toggleExtra(extra)">
                  <span class="extra-nombre">{{ extra.nombre }}</span>
                  <span class="extra-precio">+ S/ {{ extra.precio.toFixed(2) }}</span>
                </label>
              </div>
            </div>

            <!-- Notas -->
            <div class="seccion-opcion">
              <label class="opcion-titulo">Indicaciones para Cocina:</label>
              <input type="text" [(ngModel)]="indicaciones" placeholder="Ej. Sin cebolla, término 3/4..." class="input-indicaciones">
            </div>

          </div>

          <div class="modal-footer">
            <div class="modal-qty">
              <button (click)="cambiarCantidadModal(-1)" class="btn-qty-modal">-</button>
              <span class="qty-val-modal">{{ cantidadModal }}</span>
              <button (click)="cambiarCantidadModal(1)" class="btn-qty-modal">+</button>
            </div>

            <button (click)="confirmarAgregar()" class="btn-agregar-modal">
              <span>Agregar al Pedido</span>
              <strong>S/ {{ precioTotalModal.toFixed(2) }}</strong>
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .menu-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px 16px 40px;
    }

    /* Top Controls */
    .top-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .search-wrap {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    .search-input {
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 11px 14px 11px 38px;
      border-radius: 6px;
      font-size: 0.92rem;
      outline: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .search-input:focus {
      border-color: #ea580c;
    }

    .category-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .tab-btn {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 7px 16px;
      border-radius: 99px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .tab-btn:hover {
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .tab-btn.active {
      background: #ea580c;
      border-color: #ea580c;
      color: #ffffff;
    }

    /* Grid */
    .grid-productos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .card-producto {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .card-producto:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
      border-color: #fdba74;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      height: 160px;
      background: #f1f5f9;
    }
    .img-producto {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #ea580c;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .time-tag {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(15, 23, 42, 0.75);
      color: #f8fafc;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .body-producto {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .categoria-label {
      font-size: 0.72rem;
      color: #ea580c;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .titulo {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 3px 0 6px;
      line-height: 1.25;
    }
    .desc {
      font-size: 0.82rem;
      color: #64748b;
      margin-bottom: 14px;
      line-height: 1.4;
      flex: 1;
    }
    .footer-producto {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
      margin-top: auto;
    }
    .precio-block {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }
    .moneda {
      font-size: 0.8rem;
      color: #ea580c;
      font-weight: 800;
    }
    .monto {
      font-size: 1.25rem;
      font-weight: 900;
      color: #0f172a;
    }
    .btn-personalizar {
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 7px 14px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.82rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-personalizar:hover {
      background: #c2410c;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #94a3b8;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      max-width: 480px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    .modal-header {
      padding: 14px 18px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
    }
    .modal-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .btn-close {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 1.4rem;
      cursor: pointer;
    }
    .modal-body {
      padding: 16px 18px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .modal-preview {
      display: flex;
      gap: 14px;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 6px;
    }
    .modal-thumb {
      width: 65px;
      height: 65px;
      border-radius: 6px;
      object-fit: cover;
    }
    .modal-desc {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0;
      line-height: 1.35;
    }
    .seccion-opcion {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .opcion-titulo {
      font-size: 0.82rem;
      font-weight: 800;
      color: #0f172a;
    }
    .chips-salsas {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip-salsa {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 6px 12px;
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip-salsa.active {
      background: #ffedd5;
      border-color: #ea580c;
      color: #c2410c;
      font-weight: 700;
    }
    .lista-extras {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .extra-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .extra-item.checked {
      background: #fff7ed;
      border-color: #ea580c;
    }
    .extra-nombre {
      color: #0f172a;
      flex: 1;
      margin-left: 8px;
    }
    .extra-precio {
      font-weight: 800;
      color: #ea580c;
    }
    .input-indicaciones {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 9px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      outline: none;
    }
    .input-indicaciones:focus {
      border-color: #ea580c;
    }
    .modal-footer {
      padding: 14px 18px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      align-items: center;
      background: #f8fafc;
    }
    .modal-qty {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 2px;
    }
    .btn-qty-modal {
      width: 30px;
      height: 30px;
      background: transparent;
      border: none;
      color: #0f172a;
      font-weight: 800;
      cursor: pointer;
    }
    .qty-val-modal {
      padding: 0 10px;
      font-weight: 800;
      color: #0f172a;
    }
    .btn-agregar-modal {
      flex: 1;
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 11px 16px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-agregar-modal:hover {
      background: #c2410c;
    }
  `]
})
export class MenuComponent {
  private menuService = inject(MenuService);
  private carritoService = inject(CarritoService);

  productos: Producto[] = [];
  busqueda = '';
  categoriaSeleccionada = 'Todos';
  categorias = ['Todos', 'Combos', 'Hamburguesas', 'Broasters', 'Acompañamientos', 'Bebidas', 'Postres'];

  modalVisible = false;
  productoSeleccionado: Producto | null = null;
  cantidadModal = 1;
  salsasElegidas: string[] = [];
  extrasElegidos: OpcionExtra[] = [];
  indicaciones = '';

  constructor() {
    this.menuService.getProductos().subscribe(prods => {
      this.productos = prods;
    });
  }

  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      const matchCat = this.categoriaSeleccionada === 'Todos' || p.categoria === this.categoriaSeleccionada;
      const matchQuery = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                         p.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());
      return matchCat && matchQuery;
    });
  }

  abrirModal(producto: Producto) {
    this.productoSeleccionado = producto;
    this.cantidadModal = 1;
    this.salsasElegidas = producto.salsasDisponibles?.slice(0, 2) || [];
    this.extrasElegidos = [];
    this.indicaciones = '';
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.productoSeleccionado = null;
  }

  cambiarCantidadModal(delta: number) {
    if (this.cantidadModal + delta >= 1) {
      this.cantidadModal += delta;
    }
  }

  toggleSalsa(salsa: string) {
    if (this.salsasElegidas.includes(salsa)) {
      this.salsasElegidas = this.salsasElegidas.filter(s => s !== salsa);
    } else {
      this.salsasElegidas.push(salsa);
    }
  }

  esExtraSeleccionado(extra: OpcionExtra): boolean {
    return this.extrasElegidos.some(e => e.nombre === extra.nombre);
  }

  toggleExtra(extra: OpcionExtra) {
    if (this.esExtraSeleccionado(extra)) {
      this.extrasElegidos = this.extrasElegidos.filter(e => e.nombre !== extra.nombre);
    } else {
      this.extrasElegidos.push(extra);
    }
  }

  get precioTotalModal(): number {
    if (!this.productoSeleccionado) return 0;
    const extrasTotal = this.extrasElegidos.reduce((sum, e) => sum + e.precio, 0);
    return (this.productoSeleccionado.precio + extrasTotal) * this.cantidadModal;
  }

  confirmarAgregar() {
    if (!this.productoSeleccionado) return;
    this.carritoService.agregarProductoPersonalizado(
      this.productoSeleccionado,
      this.cantidadModal,
      this.salsasElegidas,
      this.extrasElegidos,
      this.indicaciones
    );
    this.cerrarModal();
  }
}
