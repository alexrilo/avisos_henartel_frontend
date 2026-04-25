import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../application/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  authService = inject(AuthService);
  email = '';
  password = '';

  async onSubmit() {
    await this.authService.login({
      email: this.email,
      password: this.password
    });
  }
}
