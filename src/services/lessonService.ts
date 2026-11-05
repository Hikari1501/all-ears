import { Lesson } from '../types';
import { SAMPLE_LESSONS } from '../data/sampleLessons';
import { firestoreDb, isLiveFirebaseConfigured } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_LESSONS_KEY = 'all_ears_local_lessons';

function getStoredLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LOCAL_LESSONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored lessons:', e);
  }
  // Initialize with sample lessons
  localStorage.setItem(LOCAL_LESSONS_KEY, JSON.stringify(SAMPLE_LESSONS));
  return SAMPLE_LESSONS;
}

export async function getAllLessons(): Promise<Lesson[]> {
  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'lessons'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Lesson));
        return list;
      } else {
        // Seed default sample lessons to firestore
        for (const lesson of SAMPLE_LESSONS) {
          await setDoc(doc(firestoreDb, 'lessons', lesson.id), lesson);
        }
        return SAMPLE_LESSONS;
      }
    } catch (e) {
      console.warn('Firestore fetch failed, falling back to local storage:', e);
    }
  }

  return getStoredLessons();
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      const d = await getDoc(doc(firestoreDb, 'lessons', id));
      if (d.exists()) {
        return { ...d.data(), id: d.id } as Lesson;
      }
    } catch (e) {
      console.warn('Firestore getDoc failed:', e);
    }
  }

  const list = getStoredLessons();
  return list.find(l => l.id === id) || null;
}

export async function saveLesson(lesson: Lesson): Promise<Lesson> {
  const currentList = getStoredLessons();
  const existingIdx = currentList.findIndex(l => l.id === lesson.id);

  if (existingIdx !== -1) {
    currentList[existingIdx] = lesson;
  } else {
    currentList.unshift(lesson);
  }

  localStorage.setItem(LOCAL_LESSONS_KEY, JSON.stringify(currentList));

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'lessons', lesson.id), lesson);
    } catch (e) {
      console.warn('Firestore saveLesson failed:', e);
    }
  }

  return lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  const currentList = getStoredLessons().filter(l => l.id !== id);
  localStorage.setItem(LOCAL_LESSONS_KEY, JSON.stringify(currentList));

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'lessons', id));
    } catch (e) {
      console.warn('Firestore deleteDoc failed:', e);
    }
  }
}
