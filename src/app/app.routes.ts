import { Routes } from '@angular/router';
import { authGuard } from './shared/infrastructure/auth/auth.guard';
import { roleGuard } from './shared/infrastructure/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/presentation/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/presentation/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'usuarios',
        canActivate: [roleGuard('ADMINISTRADOR')],
        loadComponent: () => import('./user/presentation/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'usuarios/new',
        canActivate: [roleGuard('ADMINISTRADOR')],
        loadComponent: () => import('./user/presentation/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'usuarios/:id',
        canActivate: [roleGuard('ADMINISTRADOR')],
        loadComponent: () => import('./user/presentation/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'clientes',
        canActivate: [roleGuard(['ADMINISTRADOR', 'COORDINADOR'])],
        loadComponent: () => import('./cliente/presentation/cliente-list/cliente-list.component').then(m => m.ClienteListComponent)
      },
      {
        path: 'clientes/nuevo',
        canActivate: [roleGuard(['ADMINISTRADOR', 'COORDINADOR'])],
        loadComponent: () => import('./cliente/presentation/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id/editar',
        canActivate: [roleGuard(['ADMINISTRADOR', 'COORDINADOR'])],
        loadComponent: () => import('./cliente/presentation/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'avisos',
        canActivate: [roleGuard(['ADMINISTRADOR', 'COORDINADOR'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./aviso/presentation/aviso-list/aviso-list.component').then(m => m.AvisoListComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () => import('./aviso/presentation/aviso-form/aviso-form.component').then(m => m.AvisoFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./aviso/presentation/cambio-estado/cambio-estado.component').then(m => m.CambioEstadoComponent)
          },
          {
            path: ':id/editar',
            loadComponent: () => import('./aviso/presentation/aviso-form/aviso-form.component').then(m => m.AvisoFormComponent)
          },
          {
            path: ':id/asignar',
            loadComponent: () => import('./aviso/presentation/asignar-tecnico/asignar-tecnico.component').then(m => m.AsignarTecnicoComponent)
          },
          {
            path: ':id/reprogramar',
            loadComponent: () => import('./aviso/presentation/reprogramar/reprogramar.component').then(m => m.ReprogramarComponent)
          }
        ]
      },
      {
        path: 'home',
        canActivate: [roleGuard(['ADMINISTRADOR', 'COORDINADOR'])],
        loadComponent: () => import('./dashboard/presentation/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'mis-trabajos',
        canActivate: [roleGuard('TECNICO')],
        loadComponent: () => import('./aviso/presentation/mis-trabajos/mis-trabajos.component').then(m => m.MisTrabajosComponent)
      },
      {
        path: 'panel-tecnico',
        canActivate: [authGuard, roleGuard('TECNICO')],
        children: [
          {
            path: '',
            loadComponent: () => import('./panel-tecnico/presentation/panel-tecnico/panel-tecnico.component').then(m => m.PanelTecnicoComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./panel-tecnico/presentation/trabajo-detail/trabajo-detail.component').then(m => m.TrabajoDetailComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
