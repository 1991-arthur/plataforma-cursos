// src/app/tenant/[subdomain]/courses/DeleteButton.tsx
'use client';

import React from 'react';

interface DeleteButtonProps {
  courseId: string;
  subdomain: string;
  action: (formData: FormData) => Promise<any>;
}

export default function DeleteButton({ courseId, subdomain, action }: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} style={{ display: 'inline' }}>
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