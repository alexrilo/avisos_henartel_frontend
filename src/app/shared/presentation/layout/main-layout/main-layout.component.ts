import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../../../auth/application/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, SidebarComponent, MobileMenuComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  
  // Signal for mobile menu toggle
  isMobileMenuOpen = signal(false);

  // Page title based on current route (simplified - could be dynamic)
  pageTitle = signal('ServiFlow');
  pageDescription = signal('Gestiona y rastrea solicitudes de servicio técnico.');

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}