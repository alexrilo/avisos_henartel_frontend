import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../auth/application/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  authService = inject(AuthService);

  // Role-based navigation items
  // Permissions matrix:
  // - ADMINISTRADOR: Dashboard, Usuarios, Clientes, Avisos
  // - COORDINADOR: Dashboard, Clientes, Avisos (NO Usuarios)
  // - TÉCNICO: Panel Técnico only
  private allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/home', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { label: 'Usuarios', icon: 'group', route: '/dashboard/usuarios', roles: ['ADMINISTRADOR'] },
    { label: 'Clientes', icon: 'business', route: '/dashboard/clientes', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { label: 'Avisos', icon: 'assignment', route: '/dashboard/avisos', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { label: 'Panel Técnico', icon: 'engineering', route: '/dashboard/panel-tecnico', roles: ['TÉCNICO'] }
  ];

  get navItems(): NavItem[] {
    const userRole = this.authService.user()?.role;
    if (!userRole) return [];
    
    return this.allNavItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  get isAdminOrCoord(): boolean {
    const role = this.authService.user()?.role;
    return role !== 'TECNICO';
  }

  /**
   * Generates a URL-safe test ID from the navigation label.
   * Normalizes text by removing accents and special characters.
   */
  getNavTestId(label: string): string {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with dashes
      .replace(/^-|-$/g, '');          // Remove leading/trailing dashes
  }
}