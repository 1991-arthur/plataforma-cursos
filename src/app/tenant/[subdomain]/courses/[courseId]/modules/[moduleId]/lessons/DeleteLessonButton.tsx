// src/app/tenant/[subdomain]/courses/[courseId]/modules/[moduleId]/lessons/DeleteLessonButton.tsx
'use client';

import React from 'react';
import { deleteLessonAction } from '@/app/actions/lessonActions';

interface DeleteLessonButtonProps {
  lessonId: string;
  moduleId: string;
  courseId: string;
  subdomain: string;
  lessonTitle: string;
}

export default function DeleteLessonButton({ lessonId, moduleId, courseId, subdomain, lessonTitle }: DeleteLessonButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    const confirmMessage = `Tem certeza que deseja excluir a aula "${lessonTitle}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteLessonAction} style={{ display: 'inline' }}>
      <input type="hidden" name="lessonId" value={lessonId} />
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