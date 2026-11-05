export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export type MediaType = 'youtube' | 'audio' | 'video';

export interface CaptionCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface DifficultWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom' | 'phrasal_verb' | 'other';
  definition: string;
  exampleSentence: string;
  imageUrl?: string;
  timestamp?: number; // timestamp in audio/video
}

export type QuestionType =
  | 'multiple_choice'
  | 'matching'
  | 'close_ended'
  | 'open_ended'
  | 'drag_and_drop'
  | 'fill_in_blanks';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface DragAndDropItem {
  id: string;
  text: string;
  targetSlotId: string;
}

export interface DragSlot {
  id: string;
  label: string;
}

export interface FillBlankItem {
  id: string;
  correctWord: string;
  hint?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  timestamp: number; // point in audio/video where it triggers
  points: number;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface CloseEndedQuestion extends BaseQuestion {
  type: 'close_ended';
  acceptableAnswers: string[]; // exact matches or acceptable synonyms
  caseSensitive?: boolean;
}

export interface OpenEndedQuestion extends BaseQuestion {
  type: 'open_ended';
  sampleAnswer?: string;
  evaluationRubric?: string;
}

export interface DragAndDropQuestion extends BaseQuestion {
  type: 'drag_and_drop';
  instruction: string;
  slots: DragSlot[];
  items: DragAndDropItem[];
}

export interface FillInBlanksQuestion extends BaseQuestion {
  type: 'fill_in_blanks';
  template: string; // e.g. "The speaker mentions that she was feeling [blank_1] before giving her [blank_2]."
  blanks: FillBlankItem[];
  wordBank?: string[];
}

export type Question =
  | MultipleChoiceQuestion
  | MatchingQuestion
  | CloseEndedQuestion
  | OpenEndedQuestion
  | DragAndDropQuestion
  | FillInBlanksQuestion;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  mediaType: MediaType;
  mediaUrl: string; // YouTube URL or direct audio/video URL
  duration: number; // in seconds
  captions: CaptionCue[];
  questions: Question[];
  difficultWords: DifficultWord[];
  teacherId: string;
  teacherName: string;
  createdAt: string;
  isHomeworkAvailable?: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  captionsVisible: boolean;
  lastUpdated: number;
}

export interface StudentSessionInfo {
  id: string;
  name: string;
  joinedAt: number;
  online: boolean;
  totalScore?: number;
}

export interface StudentResponse {
  id: string;
  sessionId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  answer: any;
  isCorrect: boolean | null; // null for open-ended before teacher review
  submittedAt: number;
  pointsEarned: number;
}

export interface LiveSession {
  id: string;
  code: string; // e.g. "EARS-49"
  lessonId: string;
  lesson: Lesson;
  teacherId: string;
  teacherName: string;
  status: 'waiting' | 'active' | 'finished';
  playback: PlaybackState;
  activeQuestionId: string | null;
  isPausedForQuestion: boolean;
  isAnswerRevealed: boolean;
  spotlightWord: DifficultWord | null;
  students: Record<string, StudentSessionInfo>;
  responses: Record<string, StudentResponse>;
  createdAt: number;
  endedAt?: number;
}

export interface HomeworkSubmission {
  id: string;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  responses: Record<string, {
    answer: any;
    isCorrect: boolean | null;
    pointsEarned: number;
  }>;
  totalScore: number;
  maxScore: number;
  submittedAt: number;
}
