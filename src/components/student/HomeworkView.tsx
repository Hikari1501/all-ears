import React, { useState } from 'react';
import { Lesson, DifficultWord, Question, HomeworkSubmission } from '../../types';
import { submitHomework } from '../../services/homeworkService';
import { MediaPlayer } from '../player/MediaPlayer';
import { CustomControls } from '../player/CustomControls';
import { SynchronizedCaptions } from '../player/SynchronizedCaptions';
import { WordSpotlightModal } from '../common/WordSpotlightModal';
import { QuestionCard, evaluateAnswer } from '../questions/QuestionCard';
import { Award, ArrowLeft, CheckCircle2, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  lesson: Lesson;
  studentId: string;
  studentName: string;
  onExit: () => void;
  onCompleteHomework: (submission: HomeworkSubmission) => void;
}

export const HomeworkView: React.FC<Props> = ({
  lesson,
  studentId,
  studentName,
  onExit,
  onCompleteHomework
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.duration || 180);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  // Vocabulary hotspot
  const [selectedWord, setSelectedWord] = useState<DifficultWord | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  // Questions and feedback states
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<Set<string>>(new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Auto-pause when hitting question timestamp
  const handleQuestionTriggered = (question: Question) => {
    setIsPlaying(false); // Pause audio!
    setActiveQuestionId(question.id);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Instant Feedback in homework mode!
  const handleCheckAnswer = (question: Question) => {
    const ans = userAnswers[question.id];
    if (ans === undefined || ans === null || ans === '') {
      alert('Please select or write an answer before checking.');
      return;
    }

    const { isCorrect } = evaluateAnswer(question, ans);
    setRevealedQuestionIds(prev => new Set(prev).add(question.id));

    if (isCorrect) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }
  };

  // Submit all homework
  const handleSubmitHomework = async () => {
    let earnedPoints = 0;
    const maxPoints = lesson.questions.reduce((sum, q) => sum + q.points, 0);
    const responsesRecord: HomeworkSubmission['responses'] = {};

    lesson.questions.forEach(q => {
      const ans = userAnswers[q.id];
      const { isCorrect, pointsEarned } = evaluateAnswer(q, ans);
      earnedPoints += pointsEarned;
      responsesRecord[q.id] = {
        answer: ans,
        isCorrect,
        pointsEarned
      };
    });

    const submission: HomeworkSubmission = {
      id: `hw-${studentId}-${lesson.id}-${Date.now().toString(36)}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      studentId,
      studentName,
      responses: responsesRecord,
      totalScore: earnedPoints,
      maxScore: maxPoints,
      submittedAt: Date.now()
    };

    await submitHomework(submission);
    onCompleteHomework(submission);
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const totalQuestions = lesson.questions.length;
  const progressPercent = Math.round((totalAnswered / (totalQuestions || 1)) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                Self-Paced Homework Mode
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">{lesson.level}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-0.5">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500">Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{totalAnswered}/{totalQuestions}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitHomework}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Finish Homework</span>
          </button>
        </div>
      </div>

      {/* Grid: Player & Controls (Left) + Questions List with Instant Feedback (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Media Player Column */}
        <div className="lg:col-span-7 space-y-4">
          <MediaPlayer
            mediaType={lesson.mediaType}
            mediaUrl={lesson.mediaUrl}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            seekToTime={seekTarget}
            volume={volume}
            isMuted={isMuted}
            questions={lesson.questions}
            onTimeUpdate={(t) => setCurrentTime(t)}
            onDurationLoaded={setDuration}
            onEnded={() => setIsPlaying(false)}
            onQuestionTriggered={handleQuestionTriggered}
          />

          {/* Full Custom Controls enabled for Homework */}
          <CustomControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            captionsVisible={captionsVisible}
            volume={volume}
            isMuted={isMuted}
            disabled={false} // Full playback controls!
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={(newTime) => {
              setSeekTarget(newTime);
              setCurrentTime(newTime);
            }}
            onPlaybackRateChange={setPlaybackRate}
            onToggleCaptions={() => setCaptionsVisible(!captionsVisible)}
            onVolumeChange={setVolume}
            onToggleMute={() => setIsMuted(!isMuted)}
          />

          {/* Captions with clickable vocabulary */}
          <SynchronizedCaptions
            captions={lesson.captions}
            difficultWords={lesson.difficultWords}
            currentTime={currentTime}
            isVisible={captionsVisible}
            onWordClick={(w) => {
              setSelectedWord(w);
              setIsWordModalOpen(true);
            }}
            onToggleCaptions={() => setCaptionsVisible(!captionsVisible)}
          />
        </div>

        {/* Questions with Instant Feedback Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Formative Assessments
            </h3>
            <span className="text-xs text-slate-500">Instant feedback enabled</span>
          </div>

          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {lesson.questions.map((question) => {
              const isRevealed = revealedQuestionIds.has(question.id);
              const isActive = activeQuestionId === question.id;

              return (
                <div
                  key={question.id}
                  className={`transition-all duration-300 ${
                    isActive ? 'scale-[1.01] ring-2 ring-brand-500 rounded-3xl' : ''
                  }`}
                >
                  <QuestionCard
                    question={question}
                    userAnswer={userAnswers[question.id]}
                    isAnswerRevealed={isRevealed}
                    isActive={isActive}
                    showSubmitButton={!isRevealed}
                    hasSubmitted={isRevealed}
                    onAnswerChange={(ans) => handleAnswerChange(question.id, ans)}
                    onSubmitAnswer={() => handleCheckAnswer(question)}
                    disabled={isRevealed}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vocabulary Modal */}
      <WordSpotlightModal
        word={selectedWord}
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        isTeacherSpotlight={false}
      />
    </div>
  );
};
