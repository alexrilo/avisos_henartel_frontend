import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../auth/application/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  isActive?: boolean;
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.css']
})
export class MobileMenuComponent {
  authService = inject(AuthService);

  // Role-based navigation items for mobile
  // Permissions matrix:
  // - ADMINISTRADOR: Dashboard, Clientes, Avisos, Usuarios
  // - COORDINADOR: Dashboard, Clientes, Avisos (NO Usuarios)
  // - TÉCNICO: Dashboard, Panel Técnico, Clientes
  private allNavItems: NavItem[] = [
    { label: 'Feed', icon: 'grid_view', route: '/dashboard/home', roles: ['ADMINISTRADOR', 'COORDINADOR', 'TÉCNICO'], isActive: false },
    { label: 'Trabajos', icon: 'assignment', route: '/dashboard/avisos', roles: ['ADMINISTRADOR', 'COORDINADOR'], isActive: false },
    { label: 'Mapa', icon: 'map', route: '/dashboard/clientes', roles: ['ADMINISTRADOR', 'COORDINADOR', 'TÉCNICO'], isActive: false },
    { label: 'Perfil', icon: 'person', route: '/dashboard/usuarios', roles: ['ADMINISTRADOR'], isActive: false },
    // Técnico specifically
    { label: 'Mis Trabajos', icon: 'engineering', route: '/dashboard/panel-tecnico', roles: ['TÉCNICO'], isActive: true }
  ];

  get navItems(): NavItem[] {
    const userRole = this.authService.user()?.role;
    if (!userRole) return [];
    
    // For técnico, show a different set of items
    if (userRole === 'TÉCNICO') {
      return [
        { label: 'Feed', icon: 'grid_view', route: '/dashboard/home', roles: ['TÉCNICO'], isActive: false },
        { label: 'Mis Trabajos', icon: 'engineering', route: '/dashboard/panel-tecnico', roles: ['TÉCNICO'], isActive: true },
        { label: 'Mapa', icon: 'map', route: '/dashboard/clientes', roles: ['TÉCNICO'], isActive: false },
        { label: 'Perfil', icon: 'person', route: '/dashboard/home', roles: ['TÉCNICO'], isActive: false }
      ];
    }
    
    // For ADMINISTRADOR and COORDINADOR, filter out items they don't have access to
    const baseItems = this.allNavItems.filter(item => 
      item.roles.includes(userRole)
    );
    
    // Mark first item as active for non-técnico roles
    return baseItems.map((item, index) => ({
      ...item,
      isActive: index === 1 // Jobs is active by default for admin/coord
    }));
  }
}