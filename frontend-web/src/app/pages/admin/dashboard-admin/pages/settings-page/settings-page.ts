import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, SettingRecord } from '../../../../../services/admin-api.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.css']
})
export class SettingsPageComponent implements OnInit {
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

  // Backend settings state
  backendSettings: SettingRecord[] = [];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.adminApi.listSettings().subscribe({
      next: (res) => {
        if (res.ok && res.data) {
          this.backendSettings = res.data;
          this.mapBackendSettingsToFields();
        }
      },
      error: (err) => console.error('Erro ao carregar configurações:', err)
    });
  }

  mapBackendSettingsToFields(): void {
    const siteNameSetting = this.backendSettings.find(s => s.key === 'site_name');
    if (siteNameSetting) this.siteName = siteNameSetting.value;

    const supportEmailSetting = this.backendSettings.find(s => s.key === 'support_email');
    if (supportEmailSetting) this.contactEmail = supportEmailSetting.value;

    const maxFileSizeSetting = this.backendSettings.find(s => s.key === 'max_upload_size');
    if (maxFileSizeSetting) this.maxFileSize = Number(maxFileSizeSetting.value);
  }

  async saveSettings(): Promise<void> {
    try {
      const updates: Promise<any>[] = [];

      const siteNameSetting = this.backendSettings.find(s => s.key === 'site_name');
      if (siteNameSetting && siteNameSetting.value !== this.siteName) {
        updates.push(this.updateSettingPromise('site_name', this.siteName));
      }

      const supportEmailSetting = this.backendSettings.find(s => s.key === 'support_email');
      if (supportEmailSetting && supportEmailSetting.value !== this.contactEmail) {
        updates.push(this.updateSettingPromise('support_email', this.contactEmail));
      }

      const maxFileSizeSetting = this.backendSettings.find(s => s.key === 'max_upload_size');
      if (maxFileSizeSetting && Number(maxFileSizeSetting.value) !== this.maxFileSize) {
        updates.push(this.updateSettingPromise('max_upload_size', this.maxFileSize));
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      alert('Configurações guardadas com sucesso!');
      this.loadSettings();
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
      alert('Ocorreu um erro ao guardar as configurações.');
    }
  }

  private updateSettingPromise(key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.adminApi.updateSetting(key, value).subscribe({
        next: (res) => res.ok ? resolve(res.data) : reject(res.message),
        error: (err) => reject(err)
      });
    });
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
    this.siteName = 'Economia com História';
    this.contactEmail = 'admin@economiahistoria.ao';
    alert('Configurações redefinidas localmente! Clique em Guardar para persistir.');
  }
}