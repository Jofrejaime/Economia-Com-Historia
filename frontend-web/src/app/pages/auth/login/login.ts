import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    // Simular login e redirecionar para início
    this.router.navigate(['/home']);
  }

  forgotPassword(): void {
    // Implementar lógica de recuperação de senha
    console.log('Esqueceu a senha');
  }
}