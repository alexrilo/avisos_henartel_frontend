import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly API_URL = 'http://localhost:8080/api';
}
