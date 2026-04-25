import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_REPOSITORY_TOKEN } from '../../../auth/domain/port/auth.repository.port';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authRepository = inject(AUTH_REPOSITORY_TOKEN);
  const token = authRepository.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
