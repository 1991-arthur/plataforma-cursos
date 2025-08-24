// src/components/content/PDFRenderer.tsx
'use client';

import React from 'react';
import type { PDFContent } from '@/types/content.types';

interface PDFRendererProps {
  content: PDFContent['data'];
}

export function PDFRenderer({ content }: PDFRendererProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Documento PDF
            </h3>
            {content.pageCount && (
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {content.pageCount} páginas
              </p>
            )}
          </div>
          
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Baixar PDF
          </a>
        </div>
      </div>
      
      {/* Visualizador */}
      <div style={{
        padding: '24px',
        textAlign: 'center'
      }}>
        {content.thumbnail ? (
          <div>
            <img
              src={content.thumbnail}
              alt="Thumbnail do PDF"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            />
            <p style={{
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Pré-visualização do documento
            </p>
          </div>
        ) : (
          <div style={{
            padding: '40px 20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📄
            </div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Visualizador de PDF
            </h4>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Clique no botão abaixo para abrir o documento PDF.
            </p>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👁️ Visualizar PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}