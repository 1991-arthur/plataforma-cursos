// src/types/content.types.ts
export type ContentType = 'video' | 'text' | 'quiz' | 'code' | 'pdf' | 'assignment';

export interface BaseContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Conteúdo de Vídeo
export interface VideoContent extends BaseContent {
  type: 'video';
  data: {
    url: string;
    provider: 'youtube' | 'vimeo' | 'local' | 'external';
    duration?: number; // em segundos
    thumbnail?: string;
    captions?: string; // URL para arquivo de legendas
  };
}

// Conteúdo de Texto
export interface TextContent extends BaseContent {
  type: 'text';
  data: {
    content: string; // HTML formatado
    assets: string[]; // URLs de imagens, etc.
    wordCount?: number;
  };
}

// Conteúdo de Código
export interface CodeContent extends BaseContent {
  type: 'code';
  data: {
    language: string;
    code: string;
    editable: boolean;
    readOnly?: boolean;
    theme?: string;
  };
}

// Conteúdo de PDF
export interface PDFContent extends BaseContent {
  type: 'pdf';
  data: {
    url: string;
    pageCount?: number;
    thumbnail?: string;
  };
}

// Tipo unificado para qualquer conteúdo
export type LessonContent = 
  | VideoContent 
  | TextContent 
  | CodeContent 
  | PDFContent;

// Estrutura da Aula com conteúdo
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  moduleId: string;
  courseId: string;
  status: 'draft' | 'published';
  content: LessonContent;
  duration?: number; // em segundos
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}