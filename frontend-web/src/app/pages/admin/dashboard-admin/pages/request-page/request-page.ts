import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AccessRequest {
  id: number;
  name: string;
  institution: string;
  email: string;
  category: string;
  type: 'jindungo' | 'restrito';
  date: string;
  timeAgo: string;
  avatarInitials: string;
  avatarColor: string;
}

interface HistoryItem {
  id: number;
  name: string;
  institution: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  category: string;
  type: 'jindungo' | 'restrito';
  date: string;
  decision: 'aprovado' | 'rejeitado';
  processedBy: string;
  note?: string;
}

@Component({
  selector: 'app-request-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-page.html',
  styleUrls: ['./request-page.css']
})
export class RequestsPageComponent implements OnInit {
  activeTab: 'pending' | 'history' = 'pending';
  pending: AccessRequest[] = [];
  history: HistoryItem[] = [];
  search = '';
  filterDecision: 'todos' | 'aprovado' | 'rejeitado' = 'todos';
  filterType: 'todos' | 'jindungo' | 'restrito' = 'todos';

  // Note state management
  noteOpenStates: { [key: number]: boolean } = {};
  noteTexts: { [key: number]: string } = {};
  confirmActionStates: { [key: number]: 'approved' | 'rejected' | null } = {};
  historyNoteOpenStates: { [key: number]: boolean } = {};

  ngOnInit(): void {
    this.initMockData();
  }

  initMockData(): void {
    this.pending = [
      {
        id: 1,
        name: 'Dr. Amadeu Belo',
        institution: 'Universidade do Namibe',
        email: 'a.belo@unamibe.ao',
        category: 'Acervo Colonial Premium',
        type: 'jindungo',
        date: '10 Mai 2026',
        timeAgo: 'Há 5 min',
        avatarInitials: 'AB',
        avatarColor: '#6b0119',
      },
      {
        id: 2,
        name: 'Sofia Martins',
        institution: 'Universidade Agostinho Neto',
        email: 's.martins@uan.ao',
        category: 'Economia Jindungo',
        type: 'jindungo',
        date: '09 Mai 2026',
        timeAgo: 'Há 1 dia',
        avatarInitials: 'SM',
        avatarColor: '#1d4ed8',
      },
      {
        id: 3,
        name: 'Carlos Tavares',
        institution: 'ISCED Huíla',
        email: 'c.tavares@isced.ao',
        category: 'Rotas Comerciais Premium',
        type: 'jindungo',
        date: '09 Mai 2026',
        timeAgo: 'Há 1 dia',
        avatarInitials: 'CT',
        avatarColor: '#0891b2',
      },
    ];

    this.history = [
      {
        id: 101,
        name: 'Maria João Ferreira',
        institution: 'Univ. de Coimbra',
        email: 'mj.ferreira@uc.pt',
        avatarInitials: 'MF',
        avatarColor: '#6b0119',
        category: 'Economia Colonial',
        type: 'jindungo',
        date: '09 Mai 2026',
        decision: 'aprovado',
        processedBy: 'Dr. Manuel Costa',
      },
      {
        id: 103,
        name: 'Luísa Carvalho',
        institution: 'Faculdade de Letras — UL',
        email: 'l.carvalho@letras.ulisboa.pt',
        avatarInitials: 'LC',
        avatarColor: '#0891b2',
        category: 'História Fiscal',
        type: 'jindungo',
        date: '07 Mai 2026',
        decision: 'rejeitado',
        processedBy: 'Dr. Manuel Costa',
      },
      {
        id: 105,
        name: 'Filipa Costa',
        institution: 'Nova School of Business',
        email: 'f.costa@novasbe.pt',
        avatarInitials: 'FC',
        avatarColor: '#7c3aed',
        category: 'Economia Jindungo',
        type: 'jindungo',
        date: '05 Mai 2026',
        decision: 'aprovado',
        processedBy: 'Dr. Manuel Costa',
      },
    ];
  }

  get jindungoPending(): AccessRequest[] {
    return this.pending.filter(r => r.type === 'jindungo');
  }

  get restritoPending(): AccessRequest[] {
    return this.pending.filter(r => r.type === 'restrito');
  }

  get todayProcessedCount(): number {
    const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    return this.history.filter(h => h.date === today).length || 5;
  }

  get filteredHistory(): HistoryItem[] {
    return this.history.filter(item => {
      const matchSearch = this.search === '' ||
        item.name.toLowerCase().includes(this.search.toLowerCase()) ||
        item.category.toLowerCase().includes(this.search.toLowerCase()) ||
        item.institution.toLowerCase().includes(this.search.toLowerCase());
      const matchDecision = this.filterDecision === 'todos' || item.decision === this.filterDecision;
      const matchType = this.filterType === 'todos' || item.type === this.filterType;
      return matchSearch && matchDecision && matchType;
    });
  }

  setActiveTab(tab: 'pending' | 'history'): void {
    this.activeTab = tab;
  }

  toggleNoteOpen(id: number): void {
    this.noteOpenStates[id] = !this.noteOpenStates[id];
  }

  toggleHistoryNoteOpen(id: number): void {
    this.historyNoteOpenStates[id] = !this.historyNoteOpenStates[id];
  }

  updateNoteText(id: number, value: string): void {
    this.noteTexts[id] = value;
  }

  handleApprove(id: number): void {
    const req = this.pending.find(r => r.id === id);
    if (!req) return;

    const isRestrito = req.type === 'restrito';
    const hasNoteOpen = this.noteOpenStates[id];
    const note = this.noteTexts[id];

    if (isRestrito && hasNoteOpen && !note?.trim()) {
      return;
    }

    // Show confirmation
    this.confirmActionStates[id] = 'approved';
    
    setTimeout(() => {
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        name: req.name,
        institution: req.institution,
        email: req.email,
        avatarInitials: req.avatarInitials,
        avatarColor: req.avatarColor,
        category: req.category,
        type: req.type,
        date: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
        decision: 'aprovado',
        processedBy: 'Dr. Manuel Costa',
        note: note || undefined,
      };
      
      this.pending = this.pending.filter(r => r.id !== id);
      this.history = [newHistoryItem, ...this.history];
      this.confirmActionStates[id] = null;
      delete this.noteOpenStates[id];
      delete this.noteTexts[id];
    }, 900);
  }

  handleReject(id: number): void {
    const req = this.pending.find(r => r.id === id);
    if (!req) return;

    this.confirmActionStates[id] = 'rejected';
    
    setTimeout(() => {
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        name: req.name,
        institution: req.institution,
        email: req.email,
        avatarInitials: req.avatarInitials,
        avatarColor: req.avatarColor,
        category: req.category,
        type: req.type,
        date: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
        decision: 'rejeitado',
        processedBy: 'Dr. Manuel Costa',
      };
      
      this.pending = this.pending.filter(r => r.id !== id);
      this.history = [newHistoryItem, ...this.history];
      this.confirmActionStates[id] = null;
    }, 900);
  }

  getTypeBadgeClass(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? 'badge-jindungo' : 'badge-restrito';
  }

  getTypeIcon(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? '🔥' : '🔒';
  }

  getTypeLabel(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? 'Jindungo' : 'Restrito';
  }

  getDecisionBadgeClass(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? 'badge-approved' : 'badge-rejected';
  }

  getDecisionIcon(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? '✓' : '✗';
  }

  getDecisionLabel(decision: 'aprovado' | 'rejeitado'): string {
    return decision === 'aprovado' ? 'Aprovado' : 'Rejeitado';
  }

  isConfirmAction(id: number, action: 'approved' | 'rejected'): boolean {
    return this.confirmActionStates[id] === action;
  }

  getAccentColor(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? '#ea580c' : '#7c3aed';
  }

  getAccentBg(type: 'jindungo' | 'restrito'): string {
    return type === 'jindungo' ? '#fff7ed' : '#fdf4ff';
  }

  exportCSV(): void {
    // Implement CSV export
    console.log('Exportar CSV');
  }
}