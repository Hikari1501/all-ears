import { LiveSession, Lesson, StudentSessionInfo, StudentResponse, DifficultWord, PlaybackState } from '../types';
import { firestoreDb, isLiveFirebaseConfigured } from './firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

const SESSIONS_STORAGE_KEY = 'all_ears_live_sessions';
const SYNC_CHANNEL_NAME = 'all_ears_live_sync_channel';

// Cross-tab broadcast channel for instant local multi-device/multi-tab simulation
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
}

function getAllLocalSessions(): Record<string, LiveSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local sessions:', e);
  }
  return {};
}

function saveLocalSession(session: LiveSession): void {
  const all = getAllLocalSessions();
  all[session.id] = session;
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(all));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'SESSION_UPDATED', session });
  }
}

/**
 * Generates an easy-to-read 6-character room code, e.g. "EARS42" or "LSTN95"
 */
export function generateRoomCode(): string {
  const prefixes = ['EAR', 'LST', 'POD', 'VOX', 'AUD'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${num}`;
}

/**
 * Creates a new live session for a teacher hosting a lesson
 */
export async function createLiveSession(
  lesson: Lesson,
  teacherId: string,
  teacherName: string
): Promise<LiveSession> {
  const code = generateRoomCode();
  const sessionId = `session-${code.toLowerCase()}-${Date.now().toString(36)}`;

  const newSession: LiveSession = {
    id: sessionId,
    code,
    lessonId: lesson.id,
    lesson,
    teacherId,
    teacherName,
    status: 'waiting',
    playback: {
      isPlaying: false,
      currentTime: 0,
      playbackRate: 1.0,
      captionsVisible: true,
      lastUpdated: Date.now()
    },
    activeQuestionId: null,
    isPausedForQuestion: false,
    isAnswerRevealed: false,
    spotlightWord: null,
    students: {},
    responses: {},
    createdAt: Date.now()
  };

  saveLocalSession(newSession);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'liveSessions', sessionId), newSession);
    } catch (e) {
      console.warn('Firestore createLiveSession error:', e);
    }
  }

  return newSession;
}

/**
 * Finds an active or waiting session by 6-character room code
 */
export async function findSessionByCode(code: string): Promise<LiveSession | null> {
  const cleanCode = code.trim().toUpperCase();

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'liveSessions'), where('code', '==', cleanCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as LiveSession;
      }
    } catch (e) {
      console.warn('Firestore findSessionByCode error:', e);
    }
  }

  const all = getAllLocalSessions();
  const found = Object.values(all).find(s => s.code.toUpperCase() === cleanCode && s.status !== 'finished');
  return found || null;
}

/**
 * Student joins a live session
 */
export async function joinLiveSession(
  sessionId: string,
  studentId: string,
  studentName: string
): Promise<void> {
  const studentInfo: StudentSessionInfo = {
    id: studentId,
    name: studentName,
    joinedAt: Date.now(),
    online: true,
    totalScore: 0
  };

  // Update local
  const all = getAllLocalSessions();
  if (all[sessionId]) {
    all[sessionId].students[studentId] = studentInfo;
    saveLocalSession(all[sessionId]);
  }

  // Update Firestore
  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        [`students.${studentId}`]: studentInfo
      });
    } catch (e) {
      console.warn('Firestore joinLiveSession error:', e);
    }
  }
}

/**
 * Subscribes to live session state changes in real time
 */
export function subscribeToLiveSession(
  sessionId: string,
  onUpdate: (session: LiveSession | null) => void
): () => void {
  // Initial check
  const all = getAllLocalSessions();
  if (all[sessionId]) {
    onUpdate(all[sessionId]);
  }

  // Listen to BroadcastChannel
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'SESSION_UPDATED' && event.data.session?.id === sessionId) {
      onUpdate(event.data.session);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Listen to window storage events (cross-tab fallback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SESSIONS_STORAGE_KEY) {
      const updated = getAllLocalSessions();
      if (updated[sessionId]) {
        onUpdate(updated[sessionId]);
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  // Firestore onSnapshot listener
  let unsubFirestore: (() => void) | null = null;
  if (isLiveFirebaseConfigured && firestoreDb) {
    unsubFirestore = onSnapshot(doc(firestoreDb, 'liveSessions', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as LiveSession;
        saveLocalSession(data);
        onUpdate(data);
      }
    });
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    if (unsubFirestore) {
      unsubFirestore();
    }
  };
}

/**
 * Teacher updates media playback state (play/pause/seek/speed/captions)
 */
export async function updatePlayback(
  sessionId: string,
  playback: Partial<PlaybackState>
): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.playback = {
    ...session.playback,
    ...playback,
    lastUpdated: Date.now()
  };

  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        playback: session.playback
      });
    } catch (e) {
      console.warn('Firestore updatePlayback error:', e);
    }
  }
}

/**
 * Teacher triggers a question (or auto-triggers when video hits timestamp)
 */
export async function triggerQuestion(
  sessionId: string,
  questionId: string | null
): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.activeQuestionId = questionId;
  session.isPausedForQuestion = Boolean(questionId);
  session.isAnswerRevealed = false;
  if (questionId) {
    session.playback.isPlaying = false; // Video pauses!
  }

  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        activeQuestionId: questionId,
        isPausedForQuestion: Boolean(questionId),
        isAnswerRevealed: false,
        'playback.isPlaying': false
      });
    } catch (e) {
      console.warn('Firestore triggerQuestion error:', e);
    }
  }
}

/**
 * Teacher presses button to reveal correct answer to all students
 */
export async function revealAnswer(sessionId: string): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.isAnswerRevealed = true;
  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        isAnswerRevealed: true
      });
    } catch (e) {
      console.warn('Firestore revealAnswer error:', e);
    }
  }
}

/**
 * Teacher clicks a difficult word in the glossary or captions to spotlight it to all students
 */
export async function spotlightWord(
  sessionId: string,
  word: DifficultWord | null
): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.spotlightWord = word;
  if (word) {
    // Pauses audio/video when spotlighting
    session.playback.isPlaying = false;
  }
  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        spotlightWord: word,
        'playback.isPlaying': false
      });
    } catch (e) {
      console.warn('Firestore spotlightWord error:', e);
    }
  }
}

/**
 * Student submits an answer to a question in a live session
 */
export async function submitStudentResponse(
  sessionId: string,
  response: Omit<StudentResponse, 'id' | 'submittedAt'>
): Promise<void> {
  const responseId = `resp-${response.studentId}-${response.questionId}`;
  const fullResponse: StudentResponse = {
    ...response,
    id: responseId,
    submittedAt: Date.now()
  };

  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (session) {
    session.responses[responseId] = fullResponse;
    saveLocalSession(session);
  }

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        [`responses.${responseId}`]: fullResponse
      });
    } catch (e) {
      console.warn('Firestore submitStudentResponse error:', e);
    }
  }
}

/**
 * Teacher starts the live session
 */
export async function startLiveSession(sessionId: string): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.status = 'active';
  session.playback.isPlaying = true;
  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        status: 'active',
        'playback.isPlaying': true
      });
    } catch (e) {
      console.warn('Firestore startLiveSession error:', e);
    }
  }
}

/**
 * Teacher ends the live session
 */
export async function endLiveSession(sessionId: string): Promise<void> {
  const all = getAllLocalSessions();
  const session = all[sessionId];
  if (!session) return;

  session.status = 'finished';
  session.endedAt = Date.now();
  session.playback.isPlaying = false;
  saveLocalSession(session);

  if (isLiveFirebaseConfigured && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'liveSessions', sessionId), {
        status: 'finished',
        endedAt: Date.now(),
        'playback.isPlaying': false
      });
    } catch (e) {
      console.warn('Firestore endLiveSession error:', e);
    }
  }
}
