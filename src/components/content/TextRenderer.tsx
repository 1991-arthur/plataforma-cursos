// src/components/content/TextRenderer.tsx
'use client';

import React from 'react';
import type { TextContent } from '@/types/content.types';

interface TextRendererProps {
  content: TextContent['data'];
}

export function TextRenderer({ content }: TextRendererProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      <div style={{
        padding: '24px',
        lineHeight: '1.7',
        color: '#374151',
        fontSize: '16px'
      }}>
        {/* Renderizar HTML seguro */}
        <div 
          dangerouslySetInnerHTML={{ __html: content.content }} 
          style={{
            wordBreak: 'break-word'
          }}
        />
        
        {/* Assets (imagens, etc.) */}
        {content.assets && content.assets.length > 0 && (
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Arquivos e Recursos
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {content.assets.map((asset, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '24px',
                    marginBottom: '4px'
                  }}>
                    {asset.match(/\.(pdf|doc|docx)$/i) ? '📄' : 
                     asset.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : 
                     asset.match(/\.(mp4|avi|mov)$/i) ? '🎬' : '📎'}
                  </div>
                  <a 
                    href={asset} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Arquivo {index + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}