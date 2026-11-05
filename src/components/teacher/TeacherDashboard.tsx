import React, { useState } from 'react';
import { Lesson, LiveSession } from '../../types';
import { createLiveSession } from '../../services/liveSessionService';
import { saveLesson, deleteLesson } from '../../services/lessonService';
import { formatTime } from '../../services/captionParser';
import {
  Radio,
  BookOpen,
  Plus,
  Play,
  Edit,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  CheckCircle,
  BarChart,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  lessons: Lesson[];
  teacherId: string;
  teacherName: string;
  onHostLive: (session: LiveSession) => void;
  onPreviewHomework: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  onCreateLesson: () => void;
  onRefreshLessons: () => void;
}

export const TeacherDashboard: React.FC<Props> = ({
  lessons,
  teacherId,
  teacherName,
  onHostLive,
  onPreviewHomework,
  onEditLesson,
  onCreateLesson,
  onRefreshLessons
}) => {
  const [isHostingLoading, setIsHostingLoading] = useState(false);

  const handleStartHost = async (lesson: Lesson) => {
    try {
      setIsHostingLoading(true);
      const session = await createLiveSession(lesson, teacherId, teacherName);
      onHostLive(session);
    } catch (e) {
      console.error('Error starting live host:', e);
      alert('Could not start live session.');
    } finally {
      setIsHostingLoading(false);
    }
  };

  const handleToggleHomework = async (lesson: Lesson) => {
    const updated: Lesson = {
      ...lesson,
      isHomeworkAvailable: !lesson.isHomeworkAvailable
    };
    await saveLesson(updated);
    onRefreshLessons();
  };

  const handleDelete = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this listening lesson?')) {
      await deleteLesson(lessonId);
      onRefreshLessons();
    }
  };

  const totalQuestions = lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
  const totalWords = lessons.reduce((sum, l) => sum + (l.difficultWords?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Teacher Cockpit & Lesson Studio</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Welcome back, {teacherName}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Create interactive listening lessons with YouTube or custom audio, synchronize live playback with your class, reveal formative assessments in real time, and spotlight vocabulary hotspots!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateLesson}
            className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Lesson</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Lessons</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{lessons.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formative Questions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalQuestions}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vocabulary Hotspots</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalWords}</h3>
          </div>
        </div>
      </div>

      {/* Lessons List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Listening Lessons Library</h2>
            <p className="text-xs text-slate-500">Host live synchronized sessions with room codes or assign as self-paced homework</p>
          </div>
        </div>

        {/* Lessons Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                      {lesson.level}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{lesson.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(lesson.duration)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>

                {/* Badges for questions and vocabulary */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>{lesson.questions.length} Questions</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{lesson.difficultWords.length} Hotspots</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-500" />
                    <span>{lesson.captions.length} Cues</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartHost(lesson)}
                    disabled={isHostingLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Host Live Lesson</span>
                  </button>

                  <button
                    onClick={() => onPreviewHomework(lesson)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Homework Mode</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditLesson(lesson)}
                    title="Edit Lesson"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    title="Delete Lesson"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
