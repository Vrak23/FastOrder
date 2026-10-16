import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { EstadoPedido, Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos-avance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pedidos-container">
      <div class="pedidos-header">
        <div>
          <h2><i class="fa-solid fa-receipt"></i> Mis Pedidos y Seguimiento en Vivo</h2>
          <p class="subtitulo">Sigue la preparación de tus comidas y su despacho desde cocina en tiempo real.</p>
        </div>
        <a routerLink="/menu" class="btn-nuevo-pedido">
          <i class="fa-solid fa-plus"></i> Nuevo Pedido
        </a>
      </div>

      <div *ngIf="(pedidos$ | async)?.length === 0" class="sin-pedidos">
        <i class="fa-solid fa-clock-rotate-left empty-icon"></i>
        <h3>No tienes pedidos activos</h3>
        <p>Los pedidos que realices aparecerán aquí con su seguimiento interactivo.</p>
      </div>

      <div *ngIf="(pedidos$ | async)?.length" class="lista-pedidos">
        <div *ngFor="let p of pedidos$ | async" class="card-pedido">
          
          <!-- Encabezado de la comanda -->
          <div class="card-top">
            <div class="ticket-info">
              <span class="ticket-id">#{{ p.id }}</span>
              <span class="ticket-hora"><i class="fa-solid fa-clock"></i> {{ p.fecha }}</span>
            </div>
            <div class="badges-row">
              <span *ngIf="p.esOffline" class="badge-offline" title="Guardado en almacenamiento local"><i class="fa-solid fa-cloud-arrow-up"></i> Offline</span>
              <span class="badge-estado" [ngClass]="'estado-' + p.estado">
                <i class="fa-solid fa-circle-dot"></i> {{ obtenerEstadoTexto(p.estado) }}
              </span>
            </div>
          </div>

          <!-- Stepper de Progreso Visual -->
          <div class="stepper-box">
            <div class="step-item" [class.done]="esPasoCompletado(p.estado, 'recibido')" [class.current]="p.estado === 'recibido'">
              <div class="step-circle"><i class="fa-solid fa-file-invoice"></i></div>
              <span class="step-name">Recibido</span>
            </div>
            <div class="step-bar" [class.done]="esPasoCompletado(p.estado, 'cocinando')"></div>
            
            <div class="step-item" [class.done]="esPasoCompletado(p.estado, 'cocinando')" [class.current]="p.estado === 'cocinando'">
              <div class="step-circle"><i class="fa-solid fa-fire-burner"></i></div>
              <span class="step-name">En Cocina</span>
            </div>
            <div class="step-bar" [class.done]="esPasoCompletado(p.estado, 'listo')"></div>

            <div class="step-item" [class.done]="esPasoCompletado(p.estado, 'listo')" [class.current]="p.estado === 'listo'">
              <div class="step-circle"><i class="fa-solid fa-bell-concierge"></i></div>
              <span class="step-name">¡Listo!</span>
            </div>
            <div class="step-bar" [class.done]="esPasoCompletado(p.estado, 'entregado')"></div>

            <div class="step-item" [class.done]="p.estado === 'entregado'" [class.current]="p.estado === 'entregado'">
              <div class="step-circle"><i class="fa-solid fa-circle-check"></i></div>
              <span class="step-name">Servido</span>
            </div>
          </div>

          <!-- Metadatos del cliente -->
          <div class="card-meta">
            <span><i class="fa-solid fa-user"></i> {{ p.cliente }}</span>
            <span><i class="fa-solid fa-location-dot"></i> {{ p.mesa }}</span>
            <span><i class="fa-solid fa-credit-card"></i> {{ p.metodoPago }}</span>
            <span *ngIf="p.tiempoEstimado"><i class="fa-solid fa-hourglass-half"></i> Est: {{ p.tiempoEstimado }}</span>
          </div>

          <!-- Desglose de Platos -->
          <div class="items-tabla">
            <div *ngFor="let it of p.items" class="item-row">
              <span class="it-cantidad">{{ it.cantidad }}x</span>
              <div class="it-info-det">
                <span class="it-nombre">{{ it.producto.nombre }}</span>
                <div *ngIf="it.salsasSeleccionadas.length" class="it-meta-text">
                  Salsas: {{ it.salsasSeleccionadas.join(', ') }}
                </div>
                <div *ngIf="it.extrasSeleccionados.length" class="it-meta-text">
                  Extras: {{ obtenerNombresExtras(it.extrasSeleccionados) }}
                </div>
                <div *ngIf="it.indicacionesCocina" class="it-meta-nota">
                  Nota: "{{ it.indicacionesCocina }}"
                </div>
              </div>
              <span class="it-precio">S/ {{ it.precioTotal.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Totales y Pago -->
          <div class="card-totales">
            <div class="totales-desglose">
              <span>Subtotal: S/ {{ p.subtotal.toFixed(2) }} | IGV (18%): S/ {{ p.igv.toFixed(2) }}</span>
            </div>
            <div class="total-final">
              <span>Total:</span>
              <strong>S/ {{ p.total.toFixed(2) }}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .pedidos-container {
      max-width: 950px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }
    .pedidos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .pedidos-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 4px;
    }
    .subtitulo {
      color: #64748b;
      font-size: 0.88rem;
      margin: 0;
    }
    .btn-nuevo-pedido {
      background: #ea580c;
      color: #ffffff;
      text-decoration: none;
      padding: 9px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.88rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-nuevo-pedido:hover {
      background: #c2410c;
    }

    .sin-pedidos {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 50px 20px;
      border-radius: 0px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .empty-icon {
      font-size: 3rem;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .sin-pedidos h3 {
      color: #0f172a;
      margin-bottom: 6px;
      font-weight: 800;
    }
    .sin-pedidos p {
      color: #64748b;
      font-size: 0.9rem;
    }

    .lista-pedidos {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card-pedido {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0px;
      padding: 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .ticket-id {
      font-size: 1.25rem;
      font-weight: 900;
      color: #0f172a;
      margin-right: 10px;
    }
    .ticket-hora {
      font-size: 0.84rem;
      color: #94a3b8;
    }
    .badges-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .badge-offline {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      padding: 3px 8px;
      border-radius: 99px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .badge-estado {
      font-size: 0.76rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 99px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .estado-recibido {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .estado-cocinando {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .estado-listo {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .estado-entregado {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    /* Stepper */
    .stepper-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.3s;
    }
    .step-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
    }
    .step-item.done .step-circle {
      background: #10b981;
      color: #ffffff;
    }
    .step-item.done .step-name {
      color: #047857;
    }
    .step-item.current .step-circle {
      background: #ea580c;
      color: #ffffff;
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(234, 88, 12, 0.4);
    }
    .step-item.current .step-name {
      color: #ea580c;
      font-weight: 800;
    }
    .step-bar {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 8px -14px;
    }
    .step-bar.done {
      background: #10b981;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .card-meta span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .items-tabla {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }
    .item-row {
      display: flex;
      align-items: flex-start;
      font-size: 0.86rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .item-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .it-cantidad {
      font-weight: 800;
      color: #ea580c;
      width: 32px;
    }
    .it-info-det {
      flex: 1;
    }
    .it-nombre {
      font-weight: 700;
      color: #0f172a;
      display: block;
    }
    .it-meta-text {
      font-size: 0.76rem;
      color: #64748b;
    }
    .it-meta-nota {
      font-size: 0.76rem;
      color: #b91c1c;
      font-style: italic;
    }
    .it-precio {
      font-weight: 700;
      color: #0f172a;
    }

    .card-totales {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
    .totales-desglose {
      font-size: 0.82rem;
      color: #64748b;
    }
    .total-final {
      display: flex;
      align-items: baseline;
      gap: 6px;
      color: #0f172a;
      font-size: 0.95rem;
    }
    .total-final strong {
      font-size: 1.3rem;
      font-weight: 900;
      color: #ea580c;
    }
  `]
})
export class PedidosAvanceComponent {
  private carritoService = inject(CarritoService);
  pedidos$ = this.carritoService.pedidos$;

  obtenerEstadoTexto(estado: EstadoPedido): string {
    const estados: Record<EstadoPedido, string> = {
      recibido: 'En Espera',
      cocinando: 'En Cocina',
      listo: 'Listo para Servir',
      entregado: 'Entregado'
    };
    return estados[estado] || estado;
  }

  esPasoCompletado(estadoActual: EstadoPedido, paso: EstadoPedido): boolean {
    const orden: EstadoPedido[] = ['recibido', 'cocinando', 'listo', 'entregado'];
    return orden.indexOf(estadoActual) >= orden.indexOf(paso);
  }

  obtenerNombresExtras(extras: any[]): string {
    return extras.map(e => e.nombre).join(', ');
  }
}
