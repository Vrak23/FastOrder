import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { EstadoPedido, Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-cocina',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kds-container">
      <div class="kds-header">
        <div>
          <h2><i class="fa-solid fa-fire-burner"></i> Monitor de Cocina KDS (Kitchen Display System)</h2>
          <p class="kds-sub">Gestión interactiva de comandas en tiempo real para chefs y personal de despacho.</p>
        </div>
        <div class="kds-stats">
          <span class="stat-pill orange">En Espera: {{ contarPorEstado('recibido') }}</span>
          <span class="stat-pill blue">En Cocción: {{ contarPorEstado('cocinando') }}</span>
          <span class="stat-pill green">Listos: {{ contarPorEstado('listo') }}</span>
        </div>
      </div>

      <div class="kds-columns">
        
        <!-- Columna 1: Por Preparar -->
        <div class="kds-col col-recibido">
          <div class="col-head">
            <h3><i class="fa-solid fa-bell"></i> Por Preparar ({{ pedidosRecibidos.length }})</h3>
          </div>
          <div class="cards-list">
            <div *ngIf="pedidosRecibidos.length === 0" class="empty-col">Sin pedidos en espera</div>
            <div *ngFor="let p of pedidosRecibidos" class="kds-card">
              <div class="kds-card-top">
                <span class="kds-ticket">#{{ p.id }}</span>
                <span class="kds-mesa">{{ p.mesa }}</span>
              </div>
              <div class="kds-cliente"><i class="fa-solid fa-user"></i> {{ p.cliente }} ({{ p.fecha }})</div>

              <div class="kds-items">
                <div *ngFor="let it of p.items" class="kds-item">
                  <span class="it-q">{{ it.cantidad }}x</span>
                  <div class="it-d">
                    <strong>{{ it.producto.nombre }}</strong>
                    <div *ngIf="it.salsasSeleccionadas.length" class="kds-submeta">
                      Salsas: {{ it.salsasSeleccionadas.join(', ') }}
                    </div>
                    <div *ngIf="it.extrasSeleccionados.length" class="kds-submeta">
                      Extras: {{ obtenerNombresExtras(it.extrasSeleccionados) }}
                    </div>
                    <div *ngIf="it.indicacionesCocina" class="kds-nota">
                      Nota: "{{ it.indicacionesCocina }}"
                    </div>
                  </div>
                </div>
              </div>

              <button (click)="cambiarEstado(p.id, 'cocinando')" class="btn-kds btn-iniciar">
                <i class="fa-solid fa-fire"></i> Empezar a Cocinar
              </button>
            </div>
          </div>
        </div>

        <!-- Columna 2: En Cocción -->
        <div class="kds-col col-cocinando">
          <div class="col-head">
            <h3><i class="fa-solid fa-utensils"></i> En Cocción ({{ pedidosCocinando.length }})</h3>
          </div>
          <div class="cards-list">
            <div *ngIf="pedidosCocinando.length === 0" class="empty-col">Sin platos al fuego</div>
            <div *ngFor="let p of pedidosCocinando" class="kds-card card-fuego">
              <div class="kds-card-top">
                <span class="kds-ticket">#{{ p.id }}</span>
                <span class="kds-mesa">{{ p.mesa }}</span>
              </div>
              <div class="kds-cliente"><i class="fa-solid fa-user"></i> {{ p.cliente }}</div>

              <div class="kds-items">
                <div *ngFor="let it of p.items" class="kds-item">
                  <span class="it-q">{{ it.cantidad }}x</span>
                  <div class="it-d">
                    <strong>{{ it.producto.nombre }}</strong>
                    <div *ngIf="it.salsasSeleccionadas.length" class="kds-submeta">
                      Salsas: {{ it.salsasSeleccionadas.join(', ') }}
                    </div>
                    <div *ngIf="it.extrasSeleccionados.length" class="kds-submeta">
                      Extras: {{ obtenerNombresExtras(it.extrasSeleccionados) }}
                    </div>
                    <div *ngIf="it.indicacionesCocina" class="kds-nota">
                      Nota: "{{ it.indicacionesCocina }}"
                    </div>
                  </div>
                </div>
              </div>

              <button (click)="cambiarEstado(p.id, 'listo')" class="btn-kds btn-listo">
                <i class="fa-solid fa-bell-concierge"></i> Marcar Listo para Servir
              </button>
            </div>
          </div>
        </div>

        <!-- Columna 3: Listos para Despacho -->
        <div class="kds-col col-listo">
          <div class="col-head">
            <h3><i class="fa-solid fa-circle-check"></i> Listos para Servir ({{ pedidosListos.length }})</h3>
          </div>
          <div class="cards-list">
            <div *ngIf="pedidosListos.length === 0" class="empty-col">No hay órdenes listas</div>
            <div *ngFor="let p of pedidosListos" class="kds-card card-listo">
              <div class="kds-card-top">
                <span class="kds-ticket">#{{ p.id }}</span>
                <span class="kds-mesa">{{ p.mesa }}</span>
              </div>
              <div class="kds-cliente"><i class="fa-solid fa-user"></i> {{ p.cliente }}</div>

              <div class="kds-items">
                <div *ngFor="let it of p.items" class="kds-item">
                  <span class="it-q">{{ it.cantidad }}x</span>
                  <div class="it-d">
                    <strong>{{ it.producto.nombre }}</strong>
                  </div>
                </div>
              </div>

              <button (click)="cambiarEstado(p.id, 'entregado')" class="btn-kds btn-entregar">
                <i class="fa-solid fa-circle-check"></i> Entregado al Cliente
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .kds-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }
    .kds-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .kds-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
    }
    .kds-sub {
      color: #64748b;
      font-size: 0.88rem;
      margin: 0;
    }
    .kds-stats {
      display: flex;
      gap: 10px;
    }
    .stat-pill {
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 800;
    }
    .stat-pill.orange { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .stat-pill.blue { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .stat-pill.green { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

    .kds-columns {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 900px) {
      .kds-columns {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .kds-col {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .col-head {
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .col-head h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .empty-col {
      text-align: center;
      padding: 30px 10px;
      color: #94a3b8;
      font-size: 0.88rem;
    }

    .kds-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .kds-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kds-ticket {
      font-weight: 900;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .kds-mesa {
      background: #ffedd5;
      color: #c2410c;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .kds-cliente {
      font-size: 0.84rem;
      color: #64748b;
    }

    .kds-items {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .kds-item {
      display: flex;
      gap: 8px;
      font-size: 0.85rem;
    }
    .it-q {
      font-weight: 800;
      color: #ea580c;
    }
    .it-d strong {
      color: #0f172a;
      display: block;
    }
    .kds-submeta {
      font-size: 0.76rem;
      color: #64748b;
    }
    .kds-nota {
      font-size: 0.76rem;
      color: #b91c1c;
      font-style: italic;
    }

    .btn-kds {
      width: 100%;
      border: none;
      padding: 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 4px;
      transition: opacity 0.15s;
    }
    .btn-kds:hover {
      opacity: 0.9;
    }
    .btn-iniciar {
      background: #0284c7;
      color: #ffffff;
    }
    .btn-listo {
      background: #059669;
      color: #ffffff;
    }
    .btn-entregar {
      background: #64748b;
      color: #ffffff;
    }
  `]
})
export class CocinaComponent {
  private carritoService = inject(CarritoService);

  pedidos: Pedido[] = [];

  constructor() {
    this.carritoService.pedidos$.subscribe(peds => {
      this.pedidos = peds;
    });
  }

  get pedidosRecibidos(): Pedido[] {
    return this.pedidos.filter(p => p.estado === 'recibido');
  }

  get pedidosCocinando(): Pedido[] {
    return this.pedidos.filter(p => p.estado === 'cocinando');
  }

  get pedidosListos(): Pedido[] {
    return this.pedidos.filter(p => p.estado === 'listo');
  }

  contarPorEstado(estado: EstadoPedido): number {
    return this.pedidos.filter(p => p.estado === estado).length;
  }

  cambiarEstado(pedidoId: string, nuevoEstado: EstadoPedido) {
    this.carritoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
  }

  obtenerNombresExtras(extras: any[]): string {
    return extras.map(e => e.nombre).join(', ');
  }
}
