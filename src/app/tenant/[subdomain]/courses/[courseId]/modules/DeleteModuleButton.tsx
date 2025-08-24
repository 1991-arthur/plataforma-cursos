// src/app/tenant/[subdomain]/courses/[courseId]/modules/DeleteModuleButton.tsx
'use client';

import React from 'react';
import { deleteModuleAction } from '@/app/actions/moduleActions';

interface DeleteModuleButtonProps {
  moduleId: string;
  courseId: string;
  subdomain: string;
  moduleTitle: string;
}

export default function DeleteModuleButton({ moduleId, courseId, subdomain, moduleTitle }: DeleteModuleButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    const confirmMessage = `Tem certeza que deseja excluir o módulo "${moduleTitle}"?\n\nEsta ação também excluirá todas as aulas deste módulo e não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteModuleAction} style={{ display: 'inline' }}>
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="subdomain" value={subdomain} />
      <button
        type="submit"
        onClick={handleClick}
        style={{
          color: '#ef4444',
          fontWeight: '500',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: '14px'
        }}
      >
        Excluir
      </button>
    </form>
  );
}