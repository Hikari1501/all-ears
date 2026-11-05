import React, { useState, useEffect } from 'react';
import { UserProfile, Lesson, LiveSession, HomeworkSubmission, Question } from './types';
import { subscribeToAuth, getCurrentUser } from './services/authService';
import { getAllLessons, saveLesson } from './services/lessonService';
import { Navbar } from './components/common/Navbar';
import { FirebaseConfigModal } from './components/common/FirebaseConfigModal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { LessonEditorModal } from './components/teacher/LessonEditor/LessonEditorModal';
import { LiveHostView } from './components/teacher/LiveHostView';
import { TeacherReportView } from './components/teacher/TeacherReportView';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentLiveView } from './components/student/StudentLiveView';
import { HomeworkView } from './components/student/HomeworkView';
import { StudentReportView } from './components/student/StudentReportView';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'live_host' | 'student_live' | 'homework' | 'teacher_report' | 'student_report'>('dashboard');

  // Modals
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Active Session states
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);
  const [activeHomeworkLesson, setActiveHomeworkLesson] = useState<Lesson | null>(null);
  const [teacherReportSession, setTeacherReportSession] = useState<LiveSession | null>(null);

  // Student Report State
  const [studentReportData, setStudentReportData] = useState<{
    title: string;
    questions: Question[];
    responses: Record<string, { answer: any; isCorrect: boolean | null; pointsEarned: number }>;
    totalScore: number;
    maxScore: number;
  } | null>(null);

  // Load lessons
  const refreshLessons = async () => {
    const list = await getAllLessons();
    setLessons(list);
  };

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    refreshLessons();
    return () => unsub();
  }, []);

  // Teacher Handlers
  const handleHostLive = (session: LiveSession) => {
    setActiveLiveSession(session);
    setActiveView('live_host');
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setIsLessonEditorOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsLessonEditorOpen(true);
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    await saveLesson(lesson);
    await refreshLessons();
    setIsLessonEditorOpen(false);
  };

  const handleTeacherViewReport = (session: LiveSession) => {
    setTeacherReportSession(session);
    setActiveView('teacher_report');
  };

  // Student Handlers
  const handleJoinLive = (session: LiveSession) => {
    setActiveLiveSession(session);
    setActiveView('student_live');
  };

  const handleStartHomework = (lesson: Lesson) => {
    setActiveHomeworkLesson(lesson);
    setActiveView('homework');
  };

  const handleCompleteHomework = (submission: HomeworkSubmission) => {
    if (!activeHomeworkLesson) return;
    setStudentReportData({
      title: activeHomeworkLesson.title,
      questions: activeHomeworkLesson.questions,
      responses: submission.responses,
      totalScore: submission.totalScore,
      maxScore: submission.maxScore
    });
    setActiveView('student_report');
  };

  const handleViewExistingHomeworkReport = (submission: HomeworkSubmission, lesson: Lesson) => {
    setStudentReportData({
      title: lesson.title,
      questions: lesson.questions,
      responses: submission.responses,
      totalScore: submission.totalScore,
      maxScore: submission.maxScore
    });
    setActiveView('student_report');
  };

  const handleStudentLiveReport = (session: LiveSession) => {
    if (!currentUser) return;
    const myResponses = Object.values(session.responses || {}).filter(r => r.studentId === currentUser.uid);
    const respMap: Record<string, { answer: any; isCorrect: boolean | null; pointsEarned: number }> = {};
    let totalScore = 0;
    myResponses.forEach(r => {
      respMap[r.questionId] = {
        answer: r.answer,
        isCorrect: r.isCorrect,
        pointsEarned: r.pointsEarned
      };
      totalScore += r.pointsEarned || 0;
    });

    const maxScore = session.lesson.questions.reduce((sum, q) => sum + q.points, 0);

    setStudentReportData({
      title: `${session.lesson.title} (Live Session ${session.code})`,
      questions: session.lesson.questions,
      responses: respMap,
      totalScore,
      maxScore
    });
    setActiveView('student_report');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        onCreateLesson={currentUser?.role === 'teacher' ? handleCreateLesson : undefined}
        activeView={activeView}
        setActiveView={(v) => setActiveView(v as any)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* VIEW 1: Teacher Dashboard */}
        {activeView === 'dashboard' && currentUser?.role === 'teacher' && (
          <TeacherDashboard
            lessons={lessons}
            teacherId={currentUser.uid}
            teacherName={currentUser.displayName}
            onHostLive={handleHostLive}
            onPreviewHomework={handleStartHomework}
            onEditLesson={handleEditLesson}
            onCreateLesson={handleCreateLesson}
            onRefreshLessons={refreshLessons}
          />
        )}

        {/* VIEW 2: Student Dashboard */}
        {activeView === 'dashboard' && currentUser?.role === 'student' && (
          <StudentDashboard
            lessons={lessons}
            studentId={currentUser.uid}
            studentName={currentUser.displayName}
            onJoinLiveSession={handleJoinLive}
            onStartHomework={handleStartHomework}
            onViewHomeworkReport={handleViewExistingHomeworkReport}
          />
        )}

        {/* VIEW 3: Teacher Live Host View */}
        {activeView === 'live_host' && activeLiveSession && (
          <LiveHostView
            session={activeLiveSession}
            onExit={() => setActiveView('dashboard')}
            onViewReport={handleTeacherViewReport}
          />
        )}

        {/* VIEW 4: Student Live Participant View */}
        {activeView === 'student_live' && activeLiveSession && currentUser && (
          <StudentLiveView
            sessionId={activeLiveSession.id}
            studentId={currentUser.uid}
            studentName={currentUser.displayName}
            onExit={() => setActiveView('dashboard')}
            onViewReport={handleStudentLiveReport}
          />
        )}

        {/* VIEW 5: Student Homework Mode */}
        {activeView === 'homework' && activeHomeworkLesson && currentUser && (
          <HomeworkView
            lesson={activeHomeworkLesson}
            studentId={currentUser.uid}
            studentName={currentUser.displayName}
            onExit={() => setActiveView('dashboard')}
            onCompleteHomework={handleCompleteHomework}
          />
        )}

        {/* VIEW 6: Teacher Report View */}
        {activeView === 'teacher_report' && teacherReportSession && (
          <TeacherReportView
            session={teacherReportSession}
            onBack={() => setActiveView('dashboard')}
          />
        )}

        {/* VIEW 7: Student Report View */}
        {activeView === 'student_report' && studentReportData && (
          <StudentReportView
            title={studentReportData.title}
            questions={studentReportData.questions}
            responses={studentReportData.responses}
            totalScore={studentReportData.totalScore}
            maxScore={studentReportData.maxScore}
            onBack={() => setActiveView('dashboard')}
          />
        )}
      </main>

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        isOpen={isLessonEditorOpen}
        lesson={editingLesson}
        teacherId={currentUser?.uid || 'teacher'}
        teacherName={currentUser?.displayName || 'Teacher'}
        onClose={() => setIsLessonEditorOpen(false)}
        onSave={handleSaveLesson}
      />

      {/* Firebase Configuration Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
}
