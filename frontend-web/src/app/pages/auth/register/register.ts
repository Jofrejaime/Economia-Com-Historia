import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface RegisterFormData {
  name: string;
  email: string;
  institution: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  formData: RegisterFormData = {
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  handleSubmit(event: Event): void {
    event.preventDefault();
    // Verificar se as senhas coincidem
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('As palavras-passe não coincidem!');
      return;
    }
    // Simular criação de conta e redirecionar para login
    console.log('Dados do registo:', this.formData);
    alert('Solicitação enviada com sucesso! Aguarde aprovação.');
    this.router.navigate(['/login']);
  }

  handleChange(field: string, value: string): void {
    this.formData = {
      ...this.formData,
      [field]: value
    };
  }
}