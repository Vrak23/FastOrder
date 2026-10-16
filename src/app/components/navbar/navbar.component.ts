import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { PwaStatusService } from '../../services/pwa-status.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-container">
        
        <!-- Logo -->
        <a routerLink="/" class="brand">
          <i class="fa-solid fa-burger brand-icon"></i>
          <span class="brand-title">FastOrder</span>
        </a>

        <!-- Enlaces -->
        <nav class="nav-links">
          <a routerLink="/menu" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-utensils"></i> Menú
          </a>
          <a routerLink="/carrito" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-bag-shopping"></i> Carrito
            <span *ngIf="(items$ | async)?.length as count" class="badge-count">{{ count }}</span>
          </a>
          <a routerLink="/pedidos" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-receipt"></i> Mis Pedidos
          </a>
          <a routerLink="/cocina" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-fire-burner"></i> Cocina KDS
          </a>
        </nav>

        <!-- Estado de Red -->
        <div class="network-badge" [class.offline]="!(isOnline$ | async)">
          <span class="status-dot"></span>
          <span>{{ (isOnline$ | async) ? 'Online' : 'Offline' }}</span>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 16px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #0f172a;
    }
    .brand-icon {
      font-size: 1.4rem;
      color: #ea580c;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      gap: 6px;
    }
    .nav-item {
      color: #64748b;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 7px 14px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .nav-item:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
    .nav-item.active {
      color: #ffffff;
      background: #ea580c;
    }
    .badge-count {
      background: #ffffff;
      color: #ea580c;
      font-size: 0.72rem;
      padding: 1px 6px;
      border-radius: 99px;
      font-weight: 800;
    }
    .nav-item.active .badge-count {
      background: #ffffff;
      color: #ea580c;
    }
    .network-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #15803d;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      padding: 4px 10px;
      border-radius: 99px;
    }
    .network-badge.offline {
      color: #b91c1c;
      background: #fee2e2;
      border-color: #fecaca;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    @media (max-width: 650px) {
      .header-container { flex-wrap: wrap; }
      .nav-links { order: 3; width: 100%; justify-content: space-around; margin-top: 6px; }
    }
  `]
})
export class NavbarComponent {
  private carritoService = inject(CarritoService);
  private pwaStatusService = inject(PwaStatusService);

  items$ = this.carritoService.items$;
  isOnline$ = this.pwaStatusService.isOnline$;
}
