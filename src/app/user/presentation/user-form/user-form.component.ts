import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../application/user.service';
import { CreateUserRequest, UpdateUserRequest, User } from '../../domain/model/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userService = inject(UserService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  isEditMode = false;
  userId: number | null = null;
  
  username = '';
  password = '';
  nombre = '';
  apellido = '';
  email = '';
  role = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
    }
  }

  async loadUser(id: number) {
    try {
      const users = this.userService.users();
      const user = users.find(u => u.id === id);
      if (user) {
        this.nombre = user.nombre;
        this.apellido = user.apellido;
        this.email = user.email;
        this.role = user.role;
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }

  async onSubmit() {
    if (this.isEditMode && this.userId) {
      const updateData: UpdateUserRequest = {
        nombre: this.nombre,
        apellido: this.apellido,
        email: this.email
      };
      await this.userService.updateUser(this.userId, updateData);
    } else {
      const createData: CreateUserRequest = {
        username: this.username,
        password: this.password,
        nombre: this.nombre,
        apellido: this.apellido,
        email: this.email,
        role: this.role
      };
      await this.userService.createUser(createData);
    }
    this.router.navigate(['/dashboard/usuarios']);
  }
}
