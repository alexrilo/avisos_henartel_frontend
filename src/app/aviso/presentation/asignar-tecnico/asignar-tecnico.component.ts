import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { Aviso } from '../../domain/model/aviso.model';
import { UserService } from '../../../user/application/user.service';
import { User } from '../../../user/domain/model/user.model';

@Component({
  selector: 'app-asignar-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './asignar-tecnico.component.html'
})
export class AsignarTecnicoComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  avisoId: number | null = null;
  aviso = signal<Aviso | null>(null);
  tecnicoId = signal<number | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  tecnicosLoading = signal(true);

  // Cargar usuarios y filtrar solo técnicos (case-insensitive)
  tecnicos = computed(() => {
    const users = this.userService.users();
    console.log('[AsignarTecnico] Users loaded:', users.length);
    console.log('[AsignarTecnico] User roles:', users.map(u => u.role));
    const filtered = users.filter((user: User) => 
      user.role?.toUpperCase() === 'TECNICO'
    );
    console.log('[AsignarTecnico] Tecnicos filtered:', filtered.length);
    return filtered;
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.avisoId = +idParam;
      this.loadAviso();
    }
    this.loadTecnicos();
  }

  private async loadTecnicos() {
    this.tecnicosLoading.set(true);
    try {
      await this.userService.loadUsers();
      console.log('[AsignarTecnico] loadUsers completed, users:', this.userService.users().length);
    } catch (err: any) {
      console.error('Error al cargar técnicos:', err);
      this.error.set('Error al cargar la lista de técnicos');
    } finally {
      this.tecnicosLoading.set(false);
    }
  }

  private async loadAviso() {
    if (!this.avisoId) return;
    this.loading.set(true);
    try {
      const data: Aviso = await this.avisoService.getAviso(this.avisoId);
      this.aviso.set(data);
    } catch {
      this.error.set('Error al cargar aviso');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (!this.tecnicoId()) {
      this.error.set('El técnico es obligatorio');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.avisoService.assignTecnico(this.avisoId!, { tecnicoId: this.tecnicoId()! });
      this.router.navigate(['/dashboard/avisos']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al asignar técnico');
    } finally {
      this.loading.set(false);
    }
  }
}