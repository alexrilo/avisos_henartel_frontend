import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../application/user.service';
import { User } from '../../domain/model/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);

  ngOnInit() {
    this.userService.loadUsers();
  }

  async toggleUserActive(user: User) {
    await this.userService.toggleUserActive(user.id);
  }
}
