import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.css']
})
export class SettingsPageComponent {
  // General Settings
  siteName = 'Economia com História';
  siteDescription = 'Arquivo Digital do Pensamento Económico de Angola';
  contactEmail = 'admin@economiahistoria.ao';
  
  // Security Settings
  twoFactorAuth = true;
  sessionTimeout = 30;
  maxLoginAttempts = 5;
  
  // Notification Settings
  emailNotifications = true;
  systemAlerts = true;
  weeklyDigest = false;
  
  // Content Settings
  autoApproveContent = false;
  requirePeerReview = true;
  maxFileSize = 10;
  allowedFileTypes = 'pdf, jpg, png, docx';
  
  saveSettings(): void {
    console.log('Configurações guardadas');
    alert('Configurações guardadas com sucesso!');
  }
  
  resetSettings(): void {
    this.twoFactorAuth = true;
    this.sessionTimeout = 30;
    this.maxLoginAttempts = 5;
    this.emailNotifications = true;
    this.systemAlerts = true;
    this.weeklyDigest = false;
    this.autoApproveContent = false;
    this.requirePeerReview = true;
    this.maxFileSize = 10;
    alert('Configurações redefinidas!');
  }
}