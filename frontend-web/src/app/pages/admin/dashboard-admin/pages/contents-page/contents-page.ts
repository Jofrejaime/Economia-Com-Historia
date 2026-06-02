import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MediaFile {
  id: number;
  type: 'image' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
  file?: File;
}

interface ContentItem {
  id: number;
  title: string;
  type: string;
  category: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'review';
  views: number;
  description?: string;
  tags?: string[];
  mediaFiles?: MediaFile[];
  featuredImage?: string;
}

@Component({
  selector: 'app-contents-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contents-page.html',
  styleUrls: ['./contents-page.css']
})
export class ContentsPageComponent {
  @ViewChild('fileImageInput') fileImageInput!: ElementRef;
  @ViewChild('fileAudioInput') fileAudioInput!: ElementRef;
  @ViewChild('fileVideoInput') fileVideoInput!: ElementRef;

  searchQuery = '';
  filterStatus = 'todos';
  filterCategory = 'todos';
  
  // Modal control
  showContentModal = false;
  editingContent: ContentItem | null = null;
  activeTab: 'info' | 'media' = 'info';
  
  // Media modal
  showMediaModal = false;
  currentMediaType: 'image' | 'audio' | 'video' = 'image';
  mediaUrl = '';
  mediaName = '';
  mediaFile: File | null = null;
  editingMediaIndex: number | null = null;
  mediaPreviewUrl: string | null = null;
  
  // Tag input
  newTag = '';
  
  // Form data for new/edit content
  contentForm: ContentItem = {
    id: 0,
    title: '',
    type: 'Artigo Académico',
    category: 'Economia Colonial',
    author: '',
    date: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'draft',
    views: 0,
    description: '',
    tags: [],
    mediaFiles: [],
    featuredImage: ''
  };
  
  // Available options
  contentTypes = [
    'Artigo Académico',
    'Documento Histórico',
    'Relatório',
    'Tese',
    'Manuscrito',
    'Fotografia',
    'Mapa',
    'Correspondência',
    'Vídeo',
    'Áudio'
  ];
  
  categoriesList = [
    'Economia Colonial',
    'Sistema Monetário',
    'Infraestrutura',
    'Rotas Comerciais',
    'História Fiscal',
    'Política Económica',
    'Agricultura',
    'Mineração',
    'Cultura',
    'Educação'
  ];
  
  tagOptions = [
    'História', 'Economia', 'Colonial', 'Pós-independência',
    'Moeda', 'Comércio', 'Agricultura', 'Infraestrutura',
    'Fiscal', 'Banco', 'Exportação', 'Importação',
    'Vídeo', 'Áudio', 'Imagem', 'Documentário'
  ];

  contents: ContentItem[] = [
    {
      id: 1,
      title: 'O Ciclo do Café em Angola (1950-1975)',
      type: 'Artigo Académico',
      category: 'Economia Colonial',
      author: 'Dr. Manuel Costa',
      date: '15 Mar 2024',
      status: 'published',
      views: 1245,
      description: 'Análise detalhada da produção e exportação do café durante o período colonial.',
      tags: ['Café', 'Agricultura', 'Colonial'],
      mediaFiles: []
    },
    {
      id: 2,
      title: 'Análise da Reforma Monetária de 1976',
      type: 'Documento Histórico',
      category: 'Sistema Monetário',
      author: 'Dra. Ana Silva',
      date: '10 Fev 2024',
      status: 'published',
      views: 892,
      description: 'Documentos oficiais sobre a transição do Escudo para o Kwanza.',
      tags: ['Moeda', 'Reforma', '1976']
    }
  ];

  get filteredContents(): ContentItem[] {
    return this.contents.filter(content => {
      const matchSearch = this.searchQuery === '' ||
        content.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        content.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (content.description && content.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus = this.filterStatus === 'todos' || content.status === this.filterStatus;
      const matchCategory = this.filterCategory === 'todos' || content.category === this.filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      published: 'Publicado',
      draft: 'Rascunho',
      review: 'Em Revisão'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      published: 'status-published',
      draft: 'status-draft',
      review: 'status-review'
    };
    return classes[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      published: '✓',
      draft: '📝',
      review: '🔄'
    };
    return icons[status] || '📄';
  }

  getStats() {
    return {
      total: this.contents.length,
      published: this.contents.filter(c => c.status === 'published').length,
      draft: this.contents.filter(c => c.status === 'draft').length,
      review: this.contents.filter(c => c.status === 'review').length,
      totalViews: this.contents.reduce((sum, c) => sum + c.views, 0)
    };
  }

  getCategories(): string[] {
    return [...new Set(this.contents.map(c => c.category))];
  }

  // Handle file selection for upload
  onFileSelected(event: Event, type: 'image' | 'audio' | 'video'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.mediaFile = file;
      this.mediaName = file.name;
      
      // Create preview URL
      if (this.mediaPreviewUrl) {
        URL.revokeObjectURL(this.mediaPreviewUrl);
      }
      this.mediaPreviewUrl = URL.createObjectURL(file);
      this.mediaUrl = this.mediaPreviewUrl;
    }
  }

  // Trigger file input
  triggerFileInput(type: 'image' | 'audio' | 'video'): void {
    if (type === 'image') {
      this.fileImageInput?.nativeElement.click();
    } else if (type === 'audio') {
      this.fileAudioInput?.nativeElement.click();
    } else if (type === 'video') {
      this.fileVideoInput?.nativeElement.click();
    }
  }

  // Media management
  openMediaModal(type: 'image' | 'audio' | 'video', index?: number): void {
    this.currentMediaType = type;
    this.editingMediaIndex = index ?? null;
    this.mediaFile = null;
    this.mediaUrl = '';
    this.mediaName = '';
    
    if (this.mediaPreviewUrl) {
      URL.revokeObjectURL(this.mediaPreviewUrl);
      this.mediaPreviewUrl = null;
    }
    
    if (index !== undefined && this.contentForm.mediaFiles && this.contentForm.mediaFiles[index]) {
      const media = this.contentForm.mediaFiles[index];
      this.mediaUrl = media.url;
      this.mediaName = media.name;
    }
    
    this.showMediaModal = true;
  }

  closeMediaModal(): void {
    this.showMediaModal = false;
    if (this.mediaPreviewUrl) {
      URL.revokeObjectURL(this.mediaPreviewUrl);
      this.mediaPreviewUrl = null;
    }
    this.mediaFile = null;
    this.mediaUrl = '';
    this.mediaName = '';
    this.editingMediaIndex = null;
  }

  saveMedia(): void {
    if (!this.mediaName.trim()) {
      alert('Por favor, insira um nome para o ficheiro');
      return;
    }
    
    let finalUrl = this.mediaUrl;
    
    // If we have a file uploaded, use the preview URL (in production, you would upload to server)
    if (this.mediaFile) {
      finalUrl = this.mediaPreviewUrl || URL.createObjectURL(this.mediaFile);
    }
    
    if (!finalUrl) {
      alert('Por favor, selecione um ficheiro ou insira uma URL');
      return;
    }
    
    const newMedia: MediaFile = {
      id: Date.now(),
      type: this.currentMediaType,
      url: finalUrl,
      name: this.mediaName,
      file: this.mediaFile || undefined
    };
    
    if (!this.contentForm.mediaFiles) {
      this.contentForm.mediaFiles = [];
    }
    
    if (this.editingMediaIndex !== null) {
      this.contentForm.mediaFiles[this.editingMediaIndex] = newMedia;
    } else {
      this.contentForm.mediaFiles.push(newMedia);
    }
    
    // If it's an image and first media, set as featured image
    if (this.currentMediaType === 'image' && !this.contentForm.featuredImage) {
      this.contentForm.featuredImage = finalUrl;
    }
    
    this.closeMediaModal();
  }

  removeMedia(index: number): void {
    if (this.contentForm.mediaFiles) {
      const removed = this.contentForm.mediaFiles[index];
      if (removed.url === this.contentForm.featuredImage) {
        this.contentForm.featuredImage = '';
      }
      this.contentForm.mediaFiles.splice(index, 1);
    }
  }

  setFeaturedImage(url: string): void {
    this.contentForm.featuredImage = url;
  }

  // Tag management
  addTag(): void {
    if (this.newTag.trim() && !this.contentForm.tags?.includes(this.newTag.trim())) {
      this.contentForm.tags = [...(this.contentForm.tags || []), this.newTag.trim()];
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.contentForm.tags = this.contentForm.tags?.filter(t => t !== tag) || [];
  }

  selectTag(tag: string): void {
    if (!this.contentForm.tags?.includes(tag)) {
      this.contentForm.tags = [...(this.contentForm.tags || []), tag];
    }
  }

  // Content CRUD
  openAddContentModal(): void {
    this.editingContent = null;
    this.activeTab = 'info';
    this.contentForm = {
      id: 0,
      title: '',
      type: 'Artigo Académico',
      category: 'Economia Colonial',
      author: '',
      date: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'draft',
      views: 0,
      description: '',
      tags: [],
      mediaFiles: [],
      featuredImage: ''
    };
    this.newTag = '';
    this.showContentModal = true;
  }

  openEditContentModal(content: ContentItem): void {
    this.editingContent = { ...content };
    this.contentForm = { ...content, mediaFiles: content.mediaFiles ? [...content.mediaFiles] : [] };
    this.activeTab = 'info';
    this.newTag = '';
    this.showContentModal = true;
  }

  closeContentModal(): void {
    this.showContentModal = false;
    this.editingContent = null;
    this.newTag = '';
    this.closeMediaModal();
  }

  saveContent(): void {
    if (!this.contentForm.title.trim()) {
      alert('Por favor, insira o título do conteúdo');
      return;
    }
    
    if (!this.contentForm.author.trim()) {
      alert('Por favor, insira o nome do autor');
      return;
    }
    
    if (this.editingContent) {
      const index = this.contents.findIndex(c => c.id === this.editingContent!.id);
      if (index !== -1) {
        this.contents[index] = { ...this.contentForm, id: this.editingContent.id };
      }
    } else {
      const newId = Math.max(...this.contents.map(c => c.id), 0) + 1;
      this.contentForm.id = newId;
      this.contents.push({ ...this.contentForm });
    }
    
    this.closeContentModal();
  }

  deleteContent(id: number): void {
    if (confirm('Tem certeza que deseja eliminar este conteúdo? Esta ação não pode ser desfeita.')) {
      this.contents = this.contents.filter(c => c.id !== id);
    }
  }

  publishContent(id: number): void {
    const content = this.contents.find(c => c.id === id);
    if (content) {
      content.status = 'published';
    }
  }

  archiveContent(id: number): void {
    const content = this.contents.find(c => c.id === id);
    if (content && content.status === 'published') {
      content.status = 'draft';
    }
  }

  getMediaIcon(type: string): string {
    switch(type) {
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📄';
    }
  }
}