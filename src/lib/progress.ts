// src/lib/progress.ts
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  arrayUnion, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { CourseProgress, RecentLesson, calculateProgress, generateProgressId, generateRecentLessonId } from '@/types/progress.types';

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

// Marcar aula como concluída
export async function markLessonAsCompleted(
  userId: string,
  courseId: string,
  lessonId: string,
  totalLessonsInCourse: number
): Promise<{ success: boolean; message: string; progress?: number }> {
  try {
    const progressId = generateProgressId(userId, courseId);
    const progressRef = doc(db, 'course_progress', progressId);
    
    // Verificar se já existe progresso
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      // Atualizar progresso existente
      const currentData = progressSnap.data();
      const currentCompletedLessons = currentData.completedLessons || [];
      
      // Verificar se a aula já está marcada como concluída
      if (!currentCompletedLessons.includes(lessonId)) {
        const newCompletedLessons = [...currentCompletedLessons, lessonId];
        const newProgress = calculateProgress(newCompletedLessons.length, totalLessonsInCourse);
        
        await updateDoc(progressRef, {
          completedLessons: arrayUnion(lessonId),
          progress: newProgress,
          lastAccessed: new Date()
        });
        
        console.log(`✅ Aula ${lessonId} marcada como concluída para o usuário ${userId}`);
        return { 
          success: true, 
          message: 'Aula marcada como concluída!', 
          progress: newProgress 
        };
      } else {
        // Retornar progresso atual se já estiver concluída
        const currentProgress = currentData.progress || 0;
        return { 
          success: true, 
          message: 'Aula já estava marcada como concluída.', 
          progress: currentProgress 
        };
      }
    } else {
      // Criar novo registro de progresso
      const newProgress = calculateProgress(1, totalLessonsInCourse);
      
      await setDoc(progressRef, {
        id: progressId,
        userId,
        courseId,
        completedLessons: [lessonId],
        totalLessons: totalLessonsInCourse,
        progress: newProgress,
        lastAccessed: new Date(),
        enrolledAt: new Date()
      });
      
      console.log(`✅ Novo progresso criado e aula ${lessonId} marcada como concluída para o usuário ${userId}`);
      return { 
        success: true, 
        message: 'Aula marcada como concluída!', 
        progress: newProgress 
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao marcar aula como concluída:', error);
    return { success: false, message: 'Erro ao marcar aula como concluída. Tente novamente.' };
  }
}

// Registrar aula recente
export async function registerRecentLesson(
  userId: string,
  lessonId: string,
  courseId: string,
  lessonTitle: string,
  moduleName: string
): Promise<void> {
  try {
    const recentLessonId = generateRecentLessonId(userId, lessonId);
    const recentRef = doc(db, 'recent_lessons', recentLessonId);
    
    await setDoc(recentRef, {
      id: recentLessonId,
      userId,
      lessonId,
      courseId,
      title: lessonTitle,
      moduleName,
      accessedAt: new Date()
    }, { merge: true });
    
    console.log(`✅ Aula ${lessonId} registrada como recente para o usuário ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao registrar aula recente:', error);
    throw error;
  }
}

// Obter progresso do curso
export async function getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
  try {
    const progressId = generateProgressId(userId, courseId);
    const progressRef = doc(db, 'course_progress', progressId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      return {
        id: data.id,
        userId: data.userId,
        courseId: data.courseId,
        completedLessons: data.completedLessons || [],
        totalLessons: data.totalLessons || 0,
        progress: data.progress || 0,
        lastAccessed: convertTimestampToDate(data.lastAccessed),
        enrolledAt: convertTimestampToDate(data.enrolledAt)
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro ao obter progresso do curso:', error);
    return null;
  }
}

// Obter aulas recentes
export async function getRecentLessons(userId: string, limitCount: number = 5): Promise<RecentLesson[]> {
  try {
    const recentQuery = query(
      collection(db, 'recent_lessons'),
      where('userId', '==', userId),
      orderBy('accessedAt', 'desc'),
      limit(limitCount)
    );
    
    const recentSnapshot = await getDocs(recentQuery);
    const recentLessons: RecentLesson[] = [];
    
    recentSnapshot.forEach((doc) => {
      const data = doc.data();
      recentLessons.push({
        id: data.id,
        userId: data.userId,
        lessonId: data.lessonId,
        courseId: data.courseId,
        title: data.title,
        moduleName: data.moduleName,
        accessedAt: convertTimestampToDate(data.accessedAt)
      });
    });
    
    return recentLessons;
  } catch (error) {
    console.error('❌ Erro ao obter aulas recentes:', error);
    return [];
  }
}

// Obter todos os cursos com progresso
export async function getAllCoursesWithProgress(userId: string): Promise<CourseProgress[]> {
  try {
    const progressQuery = query(
      collection(db, 'course_progress'),
      where('userId', '==', userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    const coursesProgress: CourseProgress[] = [];
    
    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      coursesProgress.push({
        id: data.id,
        userId: data.userId,
        courseId: data.courseId,
        completedLessons: data.completedLessons || [],
        totalLessons: data.totalLessons || 0,
        progress: data.progress || 0,
        lastAccessed: convertTimestampToDate(data.lastAccessed),
        enrolledAt: convertTimestampToDate(data.enrolledAt)
      });
    });
    
    return coursesProgress;
  } catch (error) {
    console.error('❌ Erro ao obter cursos com progresso:', error);
    return [];
  }
}

// Obter total de aulas em um curso
export async function getTotalLessonsInCourse(courseId: string): Promise<number> {
  try {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('courseId', '==', courseId)
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);
    return lessonsSnapshot.size;
  } catch (error) {
    console.error('❌ Erro ao obter total de aulas:', error);
    return 0;
  }
}