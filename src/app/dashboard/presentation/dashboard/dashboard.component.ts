import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import { UrgentListComponent } from '../urgent-list/urgent-list.component';
import { TechnicianWorkloadComponent } from '../technician-workload/technician-workload.component';
import { DashboardService } from '../../application/dashboard.service';
import { AuthService } from '../../../auth/application/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, UrgentListComponent, TechnicianWorkloadComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  authService = inject(AuthService);

  ngOnInit() {
    this.dashboardService.loadDashboard();
  }

  onDateChange(field: 'dateFrom' | 'dateTo', value: string) {
    this.dashboardService.updateFilters({ [field]: value });
  }
}