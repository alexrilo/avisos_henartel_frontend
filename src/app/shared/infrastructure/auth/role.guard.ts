import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../../auth/application/auth.service';

export const roleGuard = (requiredRoles: string | string[]): CanActivateFn => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.user();
    console.log('Role guard check: Required roles', roles, 'User role', user?.role);
    if (user && roles.includes(user.role)) {
      console.log('Role guard passed: User has the required role');
      return true;
    }

    console.log('Role guard failed: User does not have the required role', user?.role);

    return router.parseUrl('/dashboard');
  };
};
