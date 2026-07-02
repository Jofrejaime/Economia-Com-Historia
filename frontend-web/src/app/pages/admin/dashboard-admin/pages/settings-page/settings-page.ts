import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, SettingRecord } from '../../../../../services/admin-api.service';

interface EditableSetting extends SettingRecord {
  /** valor de trabalho no formulário (pode divergir do persistido até guardar) */
  draftValue: any;
  /** valor original, guardado à parte para comparação sem recalcular a toda a hora */
  originalValue: any;
}

interface SettingsGroup {
  group: string;
  label: string;
  items: EditableSetting[];
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.css']
})
export class SettingsPageComponent implements OnInit {
  settings: EditableSetting[] = [];

  /** Propriedade normal (NÃO getter) — calculada uma única vez após carregar
   *  os dados, para evitar recomputação a cada ciclo de detecção de mudanças
   *  do Angular, que causava recriação contínua do DOM e travava a página. */
  groupedSettings: SettingsGroup[] = [];

  /** Idem: booleano guardado, actualizado manualmente em vez de getter. */
  hasAnyChanges = false;

  loading = false;
  saving = false;
  error: string | null = null;

  private readonly groupLabels: Record<string, string> = {
    general: 'Geral',
    system: 'Sistema',
    security: 'Segurança',
    gamification: 'Gamificação',
    content: 'Conteúdos',
  };

  private readonly groupOrder: string[] = ['general', 'system', 'security', 'content', 'gamification'];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.error = null;

    this.adminApi.listSettings().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.ok && res.data) {
          this.settings = res.data.map(s => {
            const value = this.coerceValueForInput(s);
            return { ...s, draftValue: value, originalValue: value };
          });
          this.rebuildGroups();
          this.hasAnyChanges = false;
        } else {
          this.error = res.message || 'Erro ao carregar configurações.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao carregar configurações.';
      }
    });
  }

  /** Recalcula groupedSettings — chamado apenas explicitamente (após carregar
   *  ou repor), nunca no template. */
  private rebuildGroups(): void {
    const groups = new Map<string, EditableSetting[]>();

    for (const setting of this.settings) {
      const groupKey = setting.group || 'general';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(setting);
    }

    const knownGroups = this.groupOrder.filter(g => groups.has(g));
    const unknownGroups = Array.from(groups.keys()).filter(g => !this.groupOrder.includes(g));
    const orderedKeys = [...knownGroups, ...unknownGroups];

    this.groupedSettings = orderedKeys.map(group => ({
      group,
      label: this.groupLabels[group] || this.humanize(group),
      items: groups.get(group)!,
    }));
  }

  private humanize(key: string): string {
    const spaced = key.replace(/_/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  private coerceValueForInput(setting: SettingRecord): any {
    if (setting.type === 'boolean') {
      return setting.value === true || setting.value === 'true' || setting.value === '1' || setting.value === 1;
    }
    if (setting.type === 'integer' || setting.type === 'float') {
      return Number(setting.value);
    }
    return setting.value;
  }

  /**
   * Chamado a partir do (ngModelChange) de cada input — NUNCA a partir de uma
   * leitura de template incondicional — para actualizar hasAnyChanges sem
   * recalcular tudo a cada ciclo de detecção de mudanças.
   */
  onFieldChanged(setting: EditableSetting): void {
    this.hasAnyChanges = this.settings.some(s => s.draftValue !== s.originalValue);
  }

  async saveSettings(): Promise<void> {
    const changed = this.settings.filter(s => s.draftValue !== s.originalValue);

    if (changed.length === 0) {
      alert('Não há alterações por guardar.');
      return;
    }

    this.saving = true;

    try {
      await Promise.all(
        changed.map(s => this.updateSettingPromise(s.key, s.draftValue))
      );

      alert('Configurações guardadas com sucesso!');
      this.loadSettings();
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
      alert('Ocorreu um erro ao guardar as configurações. Verifique os valores introduzidos.');
    } finally {
      this.saving = false;
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

  resetChanges(): void {
    if (!confirm('Descartar todas as alterações não guardadas?')) {
      return;
    }
    for (const s of this.settings) {
      s.draftValue = s.originalValue;
    }
    this.hasAnyChanges = false;
  }

  trackByGroup(_index: number, group: SettingsGroup): string {
    return group.group;
  }

  trackBySettingKey(_index: number, setting: EditableSetting): string {
    return setting.key;
  }
}