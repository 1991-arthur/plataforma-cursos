// src/lib/dashboard.ts
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { EnrolledCourse, AvailableCourse, RecentLesson } from '@/types/dashboard.types';

// Converter Timestamp do Firebase para Date
function convertTimestampToDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
  }
  
  if (timestamp?.seconds !== undefined && timestamp?.nanoseconds !== undefined) {
    return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
  }
  
  return timestamp instanceof Date ? timestamp : new Date();
}

// ✅ Obter cursos matriculados do usuário FILTRANDO POR TENANT
export async function getEnrolledCourses(userId: string, tenantId: string): Promise<EnrolledCourse[]> {
  try {
    console.log('[Dashboard] Buscando cursos matriculados para usuário:', userId, 'no tenant:', tenantId);
    
    // Buscar progresso dos cursos do tenant específico
    const progressQuery = query(
      collection(db, 'course_progress'),
      where('userId', '==', userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    console.log('[Dashboard] Progressos encontrados:', progressSnapshot.size);
    
    const enrolledCourses: EnrolledCourse[] = [];
    
    // Para cada progresso, buscar dados do curso E VERIFICAR O TENANT
    for (const doc of progressSnapshot.docs) {
      const progressData = doc.data();
      const courseId = progressData.courseId;
      
      try {
        // Buscar dados do curso
        const courseDoc = await getDocs(query(
          collection(db, 'courses'),
          where('id', '==', courseId)
        ));
        
        if (!courseDoc.empty) {
          const courseData = courseDoc.docs[0].data();
          
          // ✅ VERIFICAR SE O CURSO PERTENCE AO TENANT ATUAL
          if (courseData.tenantId === tenantId) {
            enrolledCourses.push({
              id: courseId,
              title: courseData.title || 'Curso sem título',
              description: courseData.description,
              progress: progressData.progress || 0,
              totalLessons: progressData.totalLessons || 0,
              completedLessons: (progressData.completedLessons || []).length,
              lastAccessed: progressData.lastAccessed ? convertTimestampToDate(progressData.lastAccessed) : undefined,
              enrolledAt: convertTimestampToDate(progressData.enrolledAt),
              thumbnail: courseData.thumbnail
            });
          }
        }
      } catch (error) {
        console.error(`[Dashboard] Erro ao buscar dados do curso ${courseId}:`, error);
      }
    }
    
    console.log('[Dashboard] Cursos matriculados processados:', enrolledCourses.length);
    return enrolledCourses;
    
  } catch (error: any) {
    console.error('[Dashboard] Erro ao buscar cursos matriculados:', error);
    return [];
  }
}

// ✅ Obter cursos disponíveis do tenant específico
export async function getAvailableCourses(userId: string, tenantId: string): Promise<AvailableCourse[]> {
  try {
    console.log('[Dashboard] Buscando cursos disponíveis do tenant:', tenantId);
    
    // Buscar todos os cursos publicados DO TENANT ESPECÍFICO
    const coursesQuery = query(
      collection(db, 'courses'),
      where('status', '==', 'published'),
      where('tenantId', '==', tenantId) // ✅ FILTRAR POR TENANT
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    console.log('[Dashboard] Cursos publicados encontrados:', coursesSnapshot.size);
    
    // Buscar cursos em que o usuário já está matriculado
    const progressQuery = query(
      collection(db, 'course_progress'),
      where('userId', '==', userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    const enrolledCourseIds = progressSnapshot.docs.map(doc => doc.data().courseId);
    console.log('[Dashboard] Cursos onde usuário está matriculado:', enrolledCourseIds);
    
    const availableCourses: AvailableCourse[] = [];
    
    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      const courseId = doc.id;
      
      // Só incluir cursos onde o usuário não está matriculado
      if (!enrolledCourseIds.includes(courseId)) {
        availableCourses.push({
          id: courseId,
          title: courseData.title || 'Curso sem título',
          description: courseData.description,
          price: courseData.price,
          status: courseData.status || 'published',
          thumbnail: courseData.thumbnail,
          instructor: courseData.instructor
        });
      }
    });
    
    console.log('[Dashboard] Cursos disponíveis filtrados:', availableCourses.length);
    return availableCourses;
    
  } catch (error: any) {
    console.error('[Dashboard] Erro ao buscar cursos disponíveis:', error);
    return [];
  }
}

// ✅ Obter aulas recentes (mantendo a lógica existente)
export async function getRecentLessons(userId: string, limitCount: number = 5): Promise<RecentLesson[]> {
  try {
    console.log('[Dashboard] Buscando aulas recentes para usuário:', userId);
    
    const recentQuery = query(
      collection(db, 'recent_lessons'),
      where('userId', '==', userId),
      orderBy('accessedAt', 'desc'),
      limit(limitCount)
    );
    
    const recentSnapshot = await getDocs(recentQuery);
    console.log('[Dashboard] Aulas recentes encontradas:', recentSnapshot.size);
    
    const recentLessons: RecentLesson[] = [];
    
    recentSnapshot.forEach((doc) => {
      const data = doc.data();
      recentLessons.push({
        id: doc.id,
        lessonId: data.lessonId,
        courseId: data.courseId,
        courseTitle: data.courseTitle || 'Curso',
        title: data.title,
        moduleName: data.moduleName,
        accessedAt: convertTimestampToDate(data.accessedAt),
        type: data.type || 'text'
      });
    });
    
    console.log('[Dashboard] Aulas recentes processadas:', recentLessons.length);
    return recentLessons;
    
  } catch (error: any) {
    console.error('[Dashboard] Erro ao buscar aulas recentes:', error);
    return [];
  }
}

// Calcular progresso geral
export function calculateOverallProgress(enrolledCourses: EnrolledCourse[]): number {
  if (enrolledCourses.length === 0) return 0;
  
  const totalProgress = enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
  return Math.round(totalProgress / enrolledCourses.length);
}