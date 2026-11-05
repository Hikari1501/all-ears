import React, { useState, useEffect } from 'react';
import { Lesson, LiveSession, HomeworkSubmission } from '../../types';
import { findSessionByCode, joinLiveSession } from '../../services/liveSessionService';
import { getHomeworkSubmissionsForStudent } from '../../services/homeworkService';
import { formatTime } from '../../services/captionParser';
import {
  Radio,
  Play,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  lessons: Lesson[];
  studentId: string;
  studentName: string;
  onJoinLiveSession: (session: LiveSession) => void;
  onStartHomework: (lesson: Lesson) => void;
  onViewHomeworkReport: (submission: HomeworkSubmission, lesson: Lesson) => void;
}

export const StudentDashboard: React.FC<Props> = ({
  lessons,
  studentId,
  studentName,
  onJoinLiveSession,
  onStartHomework,
  onViewHomeworkReport
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);

  useEffect(() => {
    getHomeworkSubmissionsForStudent(studentId).then(setSubmissions);
  }, [studentId]);

  const handleJoinLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a 6-character room code from your teacher.');
      return;
    }

    try {
      setIsJoining(true);
      const session = await findSessionByCode(cleanCode);
      if (!session) {
        setJoinError(`Room "${cleanCode}" not found or session has ended. Check with your teacher!`);
        return;
      }

      await joinLiveSession(session.id, studentId, studentName);
      onJoinLiveSession(session);
    } catch (err) {
      console.error('Error joining live session:', err);
      setJoinError('Connection error while joining room.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Student Welcome & Live Join Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero (7 cols) */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Listening Portal</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hi {studentName}, ready to train your ears?
            </h1>
            <p className="text-brand-100 text-sm leading-relaxed max-w-lg">
              Listen to native English conversations, pause for formative questions, and discover vocabulary definitions and pronunciation in real time.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-brand-200 pt-2 border-t border-white/10">
            <span>&bull; Instant feedback</span>
            <span>&bull; Clickable vocabulary</span>
            <span>&bull; Audio speed controls</span>
          </div>
        </div>

        {/* Right: Join Live Lesson Card (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl bg-white border-2 border-rose-200/90 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600">
                Live Classroom Session
              </h2>
            </div>
            <h3 className="text-xl font-black text-slate-900">Join Teacher's Class</h3>
            <p className="text-xs text-slate-500">
              Enter the 6-character room code displayed on your teacher's screen:
            </p>
          </div>

          <form onSubmit={handleJoinLive} className="space-y-3">
            <div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. EAR42 or POD95"
                maxLength={8}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-mono text-center text-lg font-black tracking-widest uppercase placeholder:text-slate-300"
              />
            </div>

            {joinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>{isJoining ? 'Connecting...' : 'Join Live Class'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Available Listening Lessons (Homework Mode) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Self-Paced Listening Lessons & Homework
          </h2>
          <p className="text-xs text-slate-500">
            Practice at your own pace with full playback speed, subtitles, and instant question corrections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => {
            const existingSub = submissions.find(s => s.lessonId === lesson.id);

            return (
              <div
                key={lesson.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                      {lesson.level}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(lesson.duration)}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lesson.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-600" />
                      <span>{lesson.questions.length} Questions</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lesson.difficultWords.length} Hotspots</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {existingSub ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed: {existingSub.totalScore}/{existingSub.maxScore} pts</span>
                      </span>
                      <button
                        onClick={() => onViewHomeworkReport(existingSub, lesson)}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not yet completed</span>
                  )}

                  <button
                    onClick={() => onStartHomework(lesson)}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all ml-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{existingSub ? 'Retake Lesson' : 'Start Lesson'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
