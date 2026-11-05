import React, { useState, useEffect } from 'react';
import { LiveSession, DifficultWord, Question } from '../../types';
import {
  subscribeToLiveSession,
  submitStudentResponse
} from '../../services/liveSessionService';
import { MediaPlayer } from '../player/MediaPlayer';
import { CustomControls } from '../player/CustomControls';
import { SynchronizedCaptions } from '../player/SynchronizedCaptions';
import { WordSpotlightModal } from '../common/WordSpotlightModal';
import { QuestionCard, evaluateAnswer } from '../questions/QuestionCard';
import {
  Radio,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  sessionId: string;
  studentId: string;
  studentName: string;
  onExit: () => void;
  onViewReport: (session: LiveSession) => void;
}

export const StudentLiveView: React.FC<Props> = ({
  sessionId,
  studentId,
  studentName,
  onExit,
  onViewReport
}) => {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [selectedWord, setSelectedWord] = useState<DifficultWord | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isTeacherSpotlightOpen, setIsTeacherSpotlightOpen] = useState(false);

  // Student answers state: { questionId: answer }
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Set<string>>(new Set());

  // Duration
  const [duration, setDuration] = useState(180);

  // Subscribe to real-time session
  useEffect(() => {
    const unsub = subscribeToLiveSession(sessionId, (updatedSession) => {
      if (updatedSession) {
        setSession(updatedSession);

        // If teacher triggered spotlight
        if (updatedSession.spotlightWord) {
          setIsTeacherSpotlightOpen(true);
        } else {
          setIsTeacherSpotlightOpen(false);
        }

        // If session finished, alert or show report
        if (updatedSession.status === 'finished') {
          onViewReport(updatedSession);
        }

        // Pull existing submitted responses for this student
        const studentResponses = Object.values(updatedSession.responses || {}).filter(
          r => r.studentId === studentId
        );
        const submittedSet = new Set<string>();
        const answerMap: Record<string, any> = {};
        studentResponses.forEach(r => {
          submittedSet.add(r.questionId);
          answerMap[r.questionId] = r.answer;
        });
        setSubmittedQuestionIds(submittedSet);
        setUserAnswers(prev => ({ ...prev, ...answerMap }));
      }
    });

    return () => unsub();
  }, [sessionId, studentId, onViewReport]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <h3 className="text-lg font-bold text-slate-800">Connecting to Live Room...</h3>
        <p className="text-xs text-slate-500">Synchronizing audio and classroom state with teacher</p>
      </div>
    );
  }

  const { isPlaying, currentTime, playbackRate, captionsVisible } = session.playback;
  const activeQuestion = session.lesson.questions.find(q => q.id === session.activeQuestionId);

  // Handle student clicking a difficult word in captions independently
  const handleWordClick = (word: DifficultWord) => {
    setSelectedWord(word);
    setIsWordModalOpen(true);
  };

  // Handle student answering a question
  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle student submitting answer for a question
  const handleSubmitAnswer = async (question: Question) => {
    const answer = userAnswers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      alert('Please select or input your answer before submitting.');
      return;
    }

    const { isCorrect, pointsEarned } = evaluateAnswer(question, answer);

    await submitStudentResponse(session.id, {
      sessionId: session.id,
      questionId: question.id,
      studentId,
      studentName,
      answer,
      isCorrect,
      pointsEarned
    });

    setSubmittedQuestionIds(prev => new Set(prev).add(question.id));

    if (isCorrect) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
  };

  // Calculate my score
  const myResponses = Object.values(session.responses || {}).filter(r => r.studentId === studentId);
  const totalScore = myResponses.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner: Student Live Room Info */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold border border-brand-500/30">
            <Radio className="w-5 h-5 animate-pulse text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected to Live Class
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-xs text-slate-400">Teacher: {session.teacherName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white">
              {session.lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Score: {totalScore} pts</span>
          </div>

          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Leave Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Media & Synced Captions / Right = Questions List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Media & Player Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <MediaPlayer
            mediaType={session.lesson.mediaType}
            mediaUrl={session.lesson.mediaUrl}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            seekToTime={currentTime}
            volume={1}
            isMuted={false}
            onTimeUpdate={() => {}}
            onDurationLoaded={setDuration}
            onEnded={() => {}}
          />

          {/* Student Playback Controls (Locked badge) */}
          <CustomControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            captionsVisible={captionsVisible}
            volume={1}
            isMuted={false}
            disabled={true} // Controlled by Teacher!
            onPlayPause={() => {}}
            onSeek={() => {}}
            onPlaybackRateChange={() => {}}
            onToggleCaptions={() => {}}
            onVolumeChange={() => {}}
            onToggleMute={() => {}}
          />

          {/* Synchronized Captions (Clickable for student!) */}
          <SynchronizedCaptions
            captions={session.lesson.captions}
            difficultWords={session.lesson.difficultWords}
            currentTime={currentTime}
            isVisible={captionsVisible}
            onWordClick={handleWordClick}
          />

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip for Students:</strong> While listening, you can click any golden word in the captions above to view its definition, pronunciation, and an example sentence!
            </p>
          </div>
        </div>

        {/* Questions Section (5 Cols): List of all questions with active highlight */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Lesson Questions ({session.lesson.questions.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {submittedQuestionIds.size} answered
            </span>
          </div>

          {/* Notice when teacher pauses for question */}
          {activeQuestion && (
            <div className="p-4 rounded-2xl bg-brand-50 border-2 border-brand-500 text-brand-900 flex items-center justify-between shadow-md animate-bounce-short">
              <div className="flex items-center gap-2 text-xs font-bold">
                <HelpCircle className="w-5 h-5 text-brand-600 animate-spin" />
                <span>Audio paused! Answer the highlighted question below.</span>
              </div>
            </div>
          )}

          {/* All Questions rendered in scrollable container */}
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {session.lesson.questions.map((question, index) => {
              const isActive = session.activeQuestionId === question.id;
              const hasSubmitted = submittedQuestionIds.has(question.id);
              const isAnswerRevealed = isActive && session.isAnswerRevealed;

              return (
                <div
                  key={question.id}
                  id={`question-${question.id}`}
                  className={`transition-all duration-300 ${
                    isActive ? 'scale-[1.02] ring-2 ring-brand-500 rounded-3xl' : ''
                  }`}
                >
                  <QuestionCard
                    question={question}
                    userAnswer={userAnswers[question.id]}
                    isAnswerRevealed={isAnswerRevealed}
                    isActive={isActive}
                    hasSubmitted={hasSubmitted}
                    showSubmitButton={true}
                    onAnswerChange={(ans) => handleAnswerChange(question.id, ans)}
                    onSubmitAnswer={() => handleSubmitAnswer(question)}
                    disabled={hasSubmitted || isAnswerRevealed}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student independent word click modal */}
      <WordSpotlightModal
        word={selectedWord}
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        isTeacherSpotlight={false}
      />

      {/* Teacher broadcast spotlight modal */}
      <WordSpotlightModal
        word={session.spotlightWord}
        isOpen={isTeacherSpotlightOpen}
        onClose={() => setIsTeacherSpotlightOpen(false)}
        isTeacherSpotlight={true}
      />
    </div>
  );
};
