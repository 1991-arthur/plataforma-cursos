// src/types/progress.types.ts
export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[]; // array de lessonIds
  totalLessons: number;
  progress: number; // 0-100%
  lastAccessed: Date;
  enrolledAt: Date;
}

export interface RecentLesson {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  title: string;
  moduleName: string;
  accessedAt: Date;
}

// Função utilitária para calcular progresso
export function calculateProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

// Função para gerar ID do progresso
export function generateProgressId(userId: string, courseId: string): string {
  return `${userId}_${courseId}`;
}

// Função para gerar ID da aula recente
export function generateRecentLessonId(userId: string, lessonId: string): string {
  return `${userId}_${lessonId}`;
}