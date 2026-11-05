import { HomeworkSubmission } from '../types';
import { firestoreDb, isLiveFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

const HOMEWORK_STORAGE_KEY = 'all_ears_homework_submissions';

function getStoredSubmissions(): HomeworkSubmission[] {
  try {
    const raw = localStorage.getItem(HOMEWORK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading stored homework:', e);
  }
  return [];
}

export async function submitHomework(submission: HomeworkSubmission): Promise<void> {
  const current = getStoredSubmissions();
  const existingIdx = current.findIndex(s => s.id === submission.id);
  if (existingIdx !== -1) {
    current[existingIdx] = submission;
  } else {
    current.unshift(submission);
  }
  localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(current));

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'homeworkSubmissions', submission.id), submission);
    } catch (e) {
      console.warn('Firestore submitHomework error:', e);
    }
  }
}

export async function getHomeworkSubmissionsForStudent(studentId: string): Promise<HomeworkSubmission[]> {
  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'homeworkSubmissions'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as HomeworkSubmission);
      }
    } catch (e) {
      console.warn('Firestore getHomeworkSubmissionsForStudent error:', e);
    }
  }

  return getStoredSubmissions().filter(s => s.studentId === studentId);
}

export async function getHomeworkSubmissionsForLesson(lessonId: string): Promise<HomeworkSubmission[]> {
  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'homeworkSubmissions'), where('lessonId', '==', lessonId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as HomeworkSubmission);
      }
    } catch (e) {
      console.warn('Firestore getHomeworkSubmissionsForLesson error:', e);
    }
  }

  return getStoredSubmissions().filter(s => s.lessonId === lessonId);
}
