// src/components/lesson/LessonProgressButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { markLessonAsCompleted, registerRecentLesson, getCourseProgress } from '@/lib/progress';

interface LessonProgressButtonProps {
  userId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  moduleName: string;
  totalLessonsInCourse: number;
}

export default function LessonProgressButton({ 
  userId, 
  courseId, 
  lessonId, 
  lessonTitle, 
  moduleName,
  totalLessonsInCourse 
}: LessonProgressButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  // Verificar se a aula já está concluída
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const courseProgress = await getCourseProgress(userId, courseId);
        if (courseProgress) {
          setProgress(courseProgress.progress);
          setIsCompleted(courseProgress.completedLessons.includes(lessonId));
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    if (userId && courseId) {
      checkCompletionStatus();
    }
  }, [userId, courseId, lessonId]);

  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    
    try {
      // REGISTRAR AULA RECENTE
      await registerRecentLesson(
        userId,
        lessonId,
        courseId,
        lessonTitle,
        moduleName
      );
      
      // MARCAR AULA COMO CONCLUÍDA
      const result = await markLessonAsCompleted(
        userId,
        courseId,
        lessonId,
        totalLessonsInCourse
      );
      
      if (result.success) {
        setIsCompleted(true);
        // Atualizar progresso localmente
        const courseProgress = await getCourseProgress(userId, courseId);
        if (courseProgress) {
          setProgress(courseProgress.progress);
        }
      }
      
      // ✅ REMOVIDO: alert(result.message);
      // O feedback agora é apenas visual através do estado do botão
      
    } catch (error) {
      console.error('Erro:', error);
      // ✅ REMOVIDO: alert('Erro ao processar a aula. Tente novamente.');
      // O erro será visível apenas no console
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: '24px',
      padding: '16px',
      background: isCompleted ? '#dcfce7' : '#f0f9ff',
      borderRadius: '8px',
      border: `1px solid ${isCompleted ? '#bbf7d0' : '#bae6fd'}`,
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '14px',
        color: isCompleted ? '#166534' : '#0369a1',
        margin: '0 0 12px 0'
      }}>
        {isCompleted 
          ? `✅ Aula concluída! Seu progresso no curso: ${progress?.toFixed(0) || 0}%` 
          : '🎯 Marque esta aula como concluída para registrar seu progresso no curso!'}
      </p>
      <button
        onClick={handleMarkAsCompleted}
        disabled={isLoading || isCompleted}
        style={{
          background: isCompleted 
            ? '#10b981' 
            : isLoading 
              ? '#94a3b8' 
              : '#0ea5e9',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          cursor: isCompleted 
            ? 'not-allowed' 
            : isLoading 
              ? 'not-allowed' 
              : 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'background-color 0.2s'
        }}
      >
        {isCompleted 
          ? '✅ Aula Concluída' 
          : isLoading 
            ? 'Processando...' 
            : '✅ Marcar Aula como Concluída'}
      </button>
    </div>
  );
}