// src/types/content.types.ts
export type ContentType = 'video' | 'text' | 'quiz' | 'code' | 'pdf' | 'assignment';

// Função utilitária para converter timestamps do Firebase
export function convertFirebaseTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  // Se for um objeto do Firebase Timestamp
  if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
    return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
  }
  
  // Se já for uma data
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Se for uma string de data
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

export interface BaseContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoContent extends BaseContent {
  type: 'video';
  data: {
    url: string;
    provider: 'youtube' | 'vimeo' | 'local' | 'external';
    duration?: number;
    thumbnail?: string;
    captions?: string;
  };
}

export interface TextContent extends BaseContent {
  type: 'text';
  data: {
    content: string;
    assets: string[];
    wordCount?: number;
  };
}

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

export interface PDFContent extends BaseContent {
  type: 'pdf';
  data: {
    url: string;
    pageCount?: number;
    thumbnail?: string;
  };
}

export type LessonContent = 
  | VideoContent 
  | TextContent 
  | CodeContent 
  | PDFContent;