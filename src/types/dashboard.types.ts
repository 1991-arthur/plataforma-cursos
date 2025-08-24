// src/types/dashboard.types.ts
export interface DashboardData {
  enrolledCourses: EnrolledCourse[];
  availableCourses: AvailableCourse[];
  recentLessons: RecentLesson[];
  overallProgress: number;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  description?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: Date;
  enrolledAt: Date;
  thumbnail?: string;
}

export interface AvailableCourse {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published';
  thumbnail?: string;
  instructor?: string;
}

export interface RecentLesson {
  id: string;
  lessonId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  moduleName: string;
  accessedAt: Date;
  type: 'video' | 'text' | 'code' | 'pdf';
}