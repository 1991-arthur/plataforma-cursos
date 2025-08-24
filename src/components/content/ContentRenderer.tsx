// src/components/content/ContentRenderer.tsx
'use client';

import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { TextRenderer } from './TextRenderer';
import { CodeRenderer } from './CodeRenderer';
import { PDFRenderer } from './PDFRenderer';
import type { LessonContent } from '@/types/content.types';

interface ContentRendererProps {
  content: LessonContent;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  switch (content.type) {
    case 'video':
      return <VideoPlayer content={content.data} />;
    
    case 'text':
      return <TextRenderer content={content.data} />;
    
    case 'code':
      return <CodeRenderer content={content.data} />;
    
    case 'pdf':
      return <PDFRenderer content={content.data} />;
    
    default:
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Tipo de conteúdo não suportado: {content.type}
        </div>
      );
  }
}