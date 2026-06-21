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

// Interface alinhada com a tabela 'documents' da migration
interface ContentItem {
  id: string;                                    // UUID
  title: string;                                 // Título
  slug: string;                                  // Slug
  author: string;                                // Autor
  institution: string;                           // Instituição
  category_id: string | null;                    // FK para document_categories
  document_type: string;                         // Tipo de documento
  academic_level: 'intro' | 'intermediate' | 'advanced'; // Nível académico
  access_level_id: 'public' | 'jindungo' | 'restricted'; // Nível de acesso
  publication_date: string | null;               // Data de publicação
  period_start: number | null;                   // Período início
  period_end: number | null;                     // Período fim
  summary: string;                               // Resumo (obrigatório)
  content: string;                               // Conteúdo completo
  cover_image_url: string | null;                // Imagem de capa
  pdf_url: string | null;                        // URL do PDF
  unique_id: string | null;                      // ID único
  physical_location: string | null;              // Localização física
  record_type: string | null;                    // Tipo de registo
  status: 'published' | 'draft' | 'review';      // Status
  views_count: number;                           // Contagem de visualizações
  likes_count: number;                           // Contagem de gostos
  downloads_count: number;                       // Contagem de downloads
  comments_count: number;                        // Contagem de comentários
  created_by: string;                            // FK para users (criador)
  published_at: string | null;                   // Data de publicação
  created_at: string;                            // Data de criação
  updated_at: string;                            // Data de atualização
  // Campos calculados/não na tabela
  tags?: string[];
  mediaFiles?: MediaFile[];
  category_name?: string;
}

// Interface para categorias (document_categories)
interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
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
    id: '',
    title: '',
    slug: '',
    author: '',
    institution: '',
    category_id: null,
    document_type: 'Artigo Académico',
    academic_level: 'intro',
    access_level_id: 'public',
    publication_date: null,
    period_start: null,
    period_end: null,
    summary: '',
    content: '',
    cover_image_url: null,
    pdf_url: null,
    unique_id: null,
    physical_location: null,
    record_type: null,
    status: 'draft',
    views_count: 0,
    likes_count: 0,
    downloads_count: 0,
    comments_count: 0,
    created_by: '',
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [],
    mediaFiles: []
  };
  
  // Available document types (alinhado com migration)
  documentTypes = [
    'Artigo Académico',
    'Documento Histórico',
    'Relatório',
    'Tese',
    'Manuscrito',
    'Fotografia',
    'Mapa',
    'Correspondência',
    'Vídeo',
    'Áudio',
    'Decreto',
    'Carta',
    'Livro'
  ];
  
  // Categories list (from document_categories)
  categoriesList: DocumentCategory[] = [
    { id: '1', name: 'Economia Colonial', slug: 'economia-colonial' },
    { id: '2', name: 'Sistema Monetário', slug: 'sistema-monetario' },
    { id: '3', name: 'Infraestrutura', slug: 'infraestrutura' },
    { id: '4', name: 'Rotas Comerciais', slug: 'rotas-comerciais' },
    { id: '5', name: 'História Fiscal', slug: 'historia-fiscal' },
    { id: '6', name: 'Política Económica', slug: 'politica-economica' }
  ];
  
  tagOptions = [
    'História', 'Economia', 'Colonial', 'Pós-independência',
    'Moeda', 'Comércio', 'Agricultura', 'Infraestrutura',
    'Fiscal', 'Banco', 'Exportação', 'Importação',
    'Vídeo', 'Áudio', 'Imagem', 'Documentário'
  ];

  contents: ContentItem[] = [
    {
      id: '1',
      title: 'O Ciclo do Café em Angola (1950-1975)',
      slug: 'ciclo-cafe-angola-1950-1975',
      author: 'Dr. Manuel Costa',
      institution: 'Universidade Agostinho Neto',
      category_id: '1',
      document_type: 'Artigo Académico',
      academic_level: 'advanced',
      access_level_id: 'public',
      publication_date: '2024-03-15',
      period_start: 1950,
      period_end: 1975,
      summary: 'Análise detalhada da produção e exportação do café durante o período colonial.',
      content: 'Conteúdo completo do artigo...',
      cover_image_url: null,
      pdf_url: null,
      unique_id: 'DOC-2024-001',
      physical_location: null,
      record_type: null,
      status: 'published',
      views_count: 1245,
      likes_count: 89,
      downloads_count: 234,
      comments_count: 12,
      created_by: 'user-1',
      published_at: '2024-03-15T10:00:00Z',
      created_at: '2024-03-10T08:00:00Z',
      updated_at: '2024-03-15T10:00:00Z',
      tags: ['Café', 'Agricultura', 'Colonial'],
      mediaFiles: [],
      category_name: 'Economia Colonial'
    },
    {
      id: '2',
      title: 'Análise da Reforma Monetária de 1976',
      slug: 'reforma-monetaria-1976',
      author: 'Dra. Ana Silva',
      institution: 'Universidade Católica de Angola',
      category_id: '2',
      document_type: 'Documento Histórico',
      academic_level: 'intermediate',
      access_level_id: 'restricted',
      publication_date: '2024-02-10',
      period_start: 1976,
      period_end: 1976,
      summary: 'Documentos oficiais sobre a transição do Escudo para o Kwanza.',
      content: 'Conteúdo completo do documento...',
      cover_image_url: null,
      pdf_url: null,
      unique_id: 'DOC-2024-002',
      physical_location: 'Arquivo Central, Prateleira 3',
      record_type: 'Decreto',
      status: 'published',
      views_count: 892,
      likes_count: 56,
      downloads_count: 178,
      comments_count: 8,
      created_by: 'user-2',
      published_at: '2024-02-10T14:30:00Z',
      created_at: '2024-02-05T09:00:00Z',
      updated_at: '2024-02-10T14:30:00Z',
      tags: ['Moeda', 'Reforma', '1976'],
      mediaFiles: [],
      category_name: 'Sistema Monetário'
    }
  ];

  get filteredContents(): ContentItem[] {
    return this.contents.filter(content => {
      const matchSearch = this.searchQuery === '' ||
        content.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        content.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (content.summary && content.summary.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus = this.filterStatus === 'todos' || content.status === this.filterStatus;
      const matchCategory = this.filterCategory === 'todos' || content.category_id === this.filterCategory;
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
      review: this.contents.filter(c => c.status === 'review').length
    };
  }

  getCategories(): string[] {
    return this.categoriesList.map(c => c.name);
  }

  // Handle file selection for upload
  onFileSelected(event: Event, type: 'image' | 'audio' | 'video'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.mediaFile = file;
      this.mediaName = file.name;
      
      if (this.mediaPreviewUrl) {
        URL.revokeObjectURL(this.mediaPreviewUrl);
      }
      this.mediaPreviewUrl = URL.createObjectURL(file);
      this.mediaUrl = this.mediaPreviewUrl;
    }
  }

  triggerFileInput(type: 'image' | 'audio' | 'video'): void {
    if (type === 'image') {
      this.fileImageInput?.nativeElement.click();
    } else if (type === 'audio') {
      this.fileAudioInput?.nativeElement.click();
    } else if (type === 'video') {
      this.fileVideoInput?.nativeElement.click();
    }
  }

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
    
    if (this.currentMediaType === 'image' && !this.contentForm.cover_image_url) {
      this.contentForm.cover_image_url = finalUrl;
    }
    
    this.closeMediaModal();
  }

  removeMedia(index: number): void {
    if (this.contentForm.mediaFiles) {
      const removed = this.contentForm.mediaFiles[index];
      if (removed.url === this.contentForm.cover_image_url) {
        this.contentForm.cover_image_url = null;
      }
      this.contentForm.mediaFiles.splice(index, 1);
    }
  }

  setFeaturedImage(url: string): void {
    this.contentForm.cover_image_url = url;
  }

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

  openAddContentModal(): void {
    this.editingContent = null;
    this.activeTab = 'info';
    this.contentForm = {
      id: '',
      title: '',
      slug: '',
      author: '',
      institution: '',
      category_id: null,
      document_type: 'Artigo Académico',
      academic_level: 'intro',
      access_level_id: 'public',
      publication_date: null,
      period_start: null,
      period_end: null,
      summary: '',
      content: '',
      cover_image_url: null,
      pdf_url: null,
      unique_id: null,
      physical_location: null,
      record_type: null,
      status: 'draft',
      views_count: 0,
      likes_count: 0,
      downloads_count: 0,
      comments_count: 0,
      created_by: '',
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      mediaFiles: []
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
    
    if (!this.contentForm.summary.trim()) {
      alert('Por favor, insira o resumo do conteúdo');
      return;
    }
    
    // Gerar slug
    if (!this.contentForm.slug) {
      this.contentForm.slug = this.generateSlug(this.contentForm.title);
    }
    
    if (this.editingContent) {
      const index = this.contents.findIndex(c => c.id === this.editingContent!.id);
      if (index !== -1) {
        this.contents[index] = { ...this.contentForm, id: this.editingContent.id };
      }
    } else {
      this.contentForm.id = Date.now().toString();
      this.contents.push({ ...this.contentForm });
    }
    
    this.closeContentModal();
  }

  deleteContent(id: string): void {
    if (confirm('Tem certeza que deseja eliminar este conteúdo? Esta ação não pode ser desfeita.')) {
      this.contents = this.contents.filter(c => c.id !== id);
    }
  }

  publishContent(id: string): void {
    const content = this.contents.find(c => c.id === id);
    if (content) {
      content.status = 'published';
      content.published_at = new Date().toISOString();
    }
  }

  archiveContent(id: string): void {
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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}