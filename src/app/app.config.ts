import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './shared/infrastructure/auth/jwt.interceptor';
import { AUTH_REPOSITORY_TOKEN } from './auth/domain/port/auth.repository.port';
import { AuthApiRepository } from './auth/infrastructure/auth-api.repository';
import { USER_REPOSITORY_TOKEN } from './user/domain/port/user.repository.port';
import { UserApiRepository } from './user/infrastructure/user-api.repository';
import { CLIENTE_REPOSITORY_TOKEN } from './cliente/domain/port/cliente.repository.port';
import { ClienteApiRepository } from './cliente/infrastructure/cliente-api.repository';
import { AVISO_REPOSITORY_TOKEN } from './aviso/domain/port/aviso.repository.port';
import { AvisoApiRepository } from './aviso/infrastructure/aviso-api.repository';
import { DASHBOARD_REPOSITORY_TOKEN } from './dashboard/domain/port/dashboard.repository.port';
import { DashboardApiRepository } from './dashboard/infrastructure/dashboard-api.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthApiRepository },
    { provide: USER_REPOSITORY_TOKEN, useClass: UserApiRepository },
    { provide: CLIENTE_REPOSITORY_TOKEN, useClass: ClienteApiRepository },
    { provide: AVISO_REPOSITORY_TOKEN, useClass: AvisoApiRepository },
    { provide: DASHBOARD_REPOSITORY_TOKEN, useClass: DashboardApiRepository }
  ]
};
