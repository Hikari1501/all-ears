import React, { useState, useEffect } from 'react';
import { LiveSession, Question, DifficultWord } from '../../types';
import {
  updatePlayback,
  triggerQuestion,
  revealAnswer,
  spotlightWord,
  endLiveSession
} from '../../services/liveSessionService';
import { MediaPlayer } from '../player/MediaPlayer';
import { CustomControls } from '../player/CustomControls';
import { SynchronizedCaptions } from '../player/SynchronizedCaptions';
import { WordSpotlightModal } from '../common/WordSpotlightModal';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Eye,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  LogOut,
  Radio
} from 'lucide-react';

interface Props {
  session: LiveSession;
  onExit: () => void;
  onViewReport: (session: LiveSession) => void;
}

export const LiveHostView: React.FC<Props> = ({ session, onExit, onViewReport }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedWordForModal, setSelectedWordForModal] = useState<DifficultWord | null>(null);
  const [isSpotlightModalOpen, setIsSpotlightModalOpen] = useState(false);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  // Audio/video playback state
  const { isPlaying, currentTime, playbackRate, captionsVisible } = session.playback;
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(session.lesson.duration || 180);

  // Active question info
  const activeQuestion = session.lesson.questions.find(q => q.id === session.activeQuestionId);

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Playback control handlers
  const handlePlayPause = () => {
    const nextState = !isPlaying;
    updatePlayback(session.id, { isPlaying: nextState });
  };

  const handleSeek = (newTime: number) => {
    setSeekTarget(newTime);
    updatePlayback(session.id, { currentTime: newTime });
  };

  const handlePlaybackRateChange = (rate: number) => {
    updatePlayback(session.id, { playbackRate: rate });
  };

  const handleToggleCaptions = () => {
    updatePlayback(session.id, { captionsVisible: !captionsVisible });
  };

  // When MediaPlayer hits a question timestamp automatically
  const handleQuestionTriggered = (question: Question) => {
    // Automatically trigger question and pause audio!
    triggerQuestion(session.id, question.id);
  };

  // Reveal answer action
  const handleRevealAnswer = () => {
    revealAnswer(session.id);
  };

  // Resume playback after question
  const handleResumePlayback = () => {
    triggerQuestion(session.id, null);
    updatePlayback(session.id, { isPlaying: true });
  };

  // Spotlight word to entire class
  const handleSpotlightWord = (word: DifficultWord) => {
    spotlightWord(session.id, word);
    setSelectedWordForModal(word);
    setIsSpotlightModalOpen(true);
  };

  const handleDismissSpotlight = () => {
    spotlightWord(session.id, null);
    setIsSpotlightModalOpen(false);
    setSelectedWordForModal(null);
  };

  // End session handler
  const handleEndSession = async () => {
    if (confirm('End this live session and generate the final classroom report?')) {
      await endLiveSession(session.id);
      onViewReport(session);
    }
  };

  // Calculate live responses for the active question
  const studentList = Object.values(session.students || {});
  const responsesForActiveQuestion = Object.values(session.responses || {}).filter(
    r => r.questionId === session.activeQuestionId
  );
  const submissionRatio = `${responsesForActiveQuestion.length} / ${studentList.length || 0}`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Cockpit Header */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black border border-brand-500/30">
            <Radio className="w-6 h-6 animate-pulse text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Hosting Live Lesson
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-xs font-medium text-slate-400">{session.lesson.title}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Room Code: <span className="font-mono text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-xl border border-amber-400/30">{session.code}</span>
              <button
                onClick={handleCopyCode}
                title="Copy Room Code for Students"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </h1>
          </div>
        </div>

        {/* Right Header: Connected Students Counter & End Session */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-slate-200">
              {studentList.length} Student{studentList.length === 1 ? '' : 's'} Connected
            </span>
          </div>

          <button
            onClick={handleEndSession}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Media & Question / Right = Vocabulary & Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Media Player, Controls, Captions, Active Question */}
        <div className="lg:col-span-2 space-y-5">
          {/* Media Player */}
          <MediaPlayer
            mediaType={session.lesson.mediaType}
            mediaUrl={session.lesson.mediaUrl}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            seekToTime={seekTarget}
            volume={volume}
            isMuted={isMuted}
            questions={session.lesson.questions}
            onTimeUpdate={(time) => {
              // Update local time and sync occasionally
              updatePlayback(session.id, { currentTime: time });
            }}
            onDurationLoaded={setDuration}
            onEnded={() => {
              updatePlayback(session.id, { isPlaying: false });
            }}
            onQuestionTriggered={handleQuestionTriggered}
          />

          {/* Teacher Controls */}
          <CustomControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            captionsVisible={captionsVisible}
            volume={volume}
            isMuted={isMuted}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleCaptions={handleToggleCaptions}
            onVolumeChange={setVolume}
            onToggleMute={() => setIsMuted(!isMuted)}
          />

          {/* Synchronized Captions */}
          <SynchronizedCaptions
            captions={session.lesson.captions}
            difficultWords={session.lesson.difficultWords}
            currentTime={currentTime}
            isVisible={captionsVisible}
            onWordClick={handleSpotlightWord}
            onToggleCaptions={handleToggleCaptions}
          />

          {/* Active Question Teacher Cockpit */}
          {activeQuestion && (
            <div className="p-6 rounded-3xl bg-white border-2 border-brand-500 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-black text-sm uppercase tracking-wider text-rose-600">
                    Active Question &bull; Video Paused for Class
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    Submissions: <span className="text-brand-600 font-mono font-bold">{submissionRatio}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeQuestion.prompt}</h3>
                {activeQuestion.explanation && (
                  <p className="text-xs text-slate-500 mt-1">Context: {activeQuestion.explanation}</p>
                )}
              </div>

              {/* Real-Time Live Responses List / Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-brand-600" />
                    Real-Time Student Submissions ({responsesForActiveQuestion.length})
                  </span>
                  <span>{session.isAnswerRevealed ? 'Answers Revealed' : 'Hidden from students'}</span>
                </div>

                {responsesForActiveQuestion.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Waiting for students to submit their answers on their devices...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {responsesForActiveQuestion.map((resp) => (
                      <div
                        key={resp.id}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">{resp.studentName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600">
                            {typeof resp.answer === 'object' ? JSON.stringify(resp.answer) : String(resp.answer)}
                          </span>
                          {session.isAnswerRevealed && (
                            <span className={resp.isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                              {resp.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Reveal Answer / Resume */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!session.isAnswerRevealed ? (
                  <button
                    onClick={handleRevealAnswer}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Answer to All Students</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Answers are now visible on all student devices!</span>
                  </div>
                )}

                <button
                  onClick={handleResumePlayback}
                  className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transition-all ml-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Listening & Proceed</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Difficult Words List & Spotlight + Connected Students */}
        <div className="space-y-5">
          {/* Difficult Words Hotspot Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Difficult Words Spotlight
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {session.lesson.difficultWords.length} words
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Click <strong className="text-slate-800">Spotlight to Class</strong> to pause playback and broadcast the word card across all student devices!
            </p>

            {/* Active Spotlight banner if active */}
            {session.spotlightWord && (
              <div className="p-3.5 rounded-2xl bg-amber-500 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Spotlighting: "{session.spotlightWord.word}"</span>
                </div>
                <button
                  onClick={handleDismissSpotlight}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {session.lesson.difficultWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 bg-slate-50/70 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 capitalize">{word.word}</span>
                      {word.phonetic && (
                        <span className="text-xs font-mono text-slate-400 ml-2">{word.phonetic}</span>
                      )}
                    </div>
                    {word.partOfSpeech && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{word.definition}</p>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => handleSpotlightWord(word)}
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Spotlight to Class</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Students Roster */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Joined Students ({studentList.length})
              </h4>
            </div>

            {studentList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                <p>No students joined yet.</p>
                <p className="mt-1">Give students code: <strong className="font-mono text-slate-700">{session.code}</strong></p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {studentList.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-slate-800">{st.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Online</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Word Spotlight Modal (for teacher preview) */}
      <WordSpotlightModal
        word={selectedWordForModal}
        isOpen={isSpotlightModalOpen}
        onClose={handleDismissSpotlight}
        isTeacherSpotlight={true}
      />
    </div>
  );
};
