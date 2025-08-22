export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  createdAt: Date;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: Date;
  settings: {
    logo?: string;
    primaryColor?: string;
    description?: string;
  };
}

export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'published';
  modules: Module[];
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  content: string;
  duration?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  tenantId: string;
  purchaseDate: Date;
  completedLessons: string[];
  progress: number;
}
