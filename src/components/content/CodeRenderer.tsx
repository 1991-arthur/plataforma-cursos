// src/components/content/CodeRenderer.tsx
'use client';

import React, { useState } from 'react';
import type { CodeContent } from '@/types/content.types';

interface CodeRendererProps {
  content: CodeContent['data'];
}

export function CodeRenderer({ content }: CodeRendererProps) {
  const [code, setCode] = useState(content.code);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (content.editable && !content.readOnly) {
      setCode(e.target.value);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px',
      fontFamily: 'monospace'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {content.language}
          </span>
          {content.editable && (
            <span style={{
              fontSize: '10px',
              color: '#6b7280',
              backgroundColor: '#e5e7eb',
              padding: '2px 6px',
              borderRadius: '8px'
            }}>
              Editável
            </span>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            {isCopied ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>
      </div>
      
      {/* Área de Código */}
      <div style={{
        position: 'relative'
      }}>
        {content.editable && !content.readOnly ? (
          <textarea
            value={code}
            onChange={handleCodeChange}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '16px',
              border: 'none',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              resize: 'vertical'
            }}
            placeholder="Digite seu código aqui..."
          />
        ) : (
          <pre style={{
            margin: 0,
            padding: '16px',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
      
      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        {content.editable && !content.readOnly 
          ? 'Modo de edição - você pode modificar o código' 
          : 'Modo de visualização - código não editável'}
      </div>
    </div>
  );
}