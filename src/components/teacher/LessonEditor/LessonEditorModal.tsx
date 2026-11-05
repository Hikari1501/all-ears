import React, { useState } from 'react';
import { Lesson, Question, DifficultWord, CaptionCue, QuestionType, MediaType } from '../../../types';
import { parseCaptions, formatTime } from '../../../services/captionParser';
import { X, Plus, Trash2, Youtube, Music, Video, FileText, HelpCircle, BookOpen, Save, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  lesson?: Lesson | null;
  teacherId: string;
  teacherName: string;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
}

export const LessonEditorModal: React.FC<Props> = ({
  isOpen,
  lesson,
  teacherId,
  teacherName,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'captions' | 'questions' | 'vocabulary'>('info');

  // Form states
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(lesson?.level || 'Intermediate');
  const [topic, setTopic] = useState(lesson?.topic || 'General Listening');
  const [mediaType, setMediaType] = useState<MediaType>(lesson?.mediaType || 'youtube');
  const [mediaUrl, setMediaUrl] = useState(lesson?.mediaUrl || 'https://www.youtube.com/watch?v=0x2_kWRB8-A');
  const [duration, setDuration] = useState(lesson?.duration || 180);

  // Captions state
  const [captions, setCaptions] = useState<CaptionCue[]>(lesson?.captions || []);
  const [rawCaptionInput, setRawCaptionInput] = useState('');

  // Questions state
  const [questions, setQuestions] = useState<Question[]>(lesson?.questions || []);

  // Difficult words state
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>(lesson?.difficultWords || []);

  if (!isOpen) return null;

  // Caption parser handler
  const handleImportRawCaptions = () => {
    if (!rawCaptionInput.trim()) return;
    const parsed = parseCaptions(rawCaptionInput);
    if (parsed.length > 0) {
      setCaptions(parsed);
      setRawCaptionInput('');
      alert(`Successfully imported ${parsed.length} caption cues!`);
    } else {
      alert('Could not parse captions. Please make sure they follow VTT or SRT timestamp format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCaptions(text);
        if (parsed.length > 0) {
          setCaptions(parsed);
          alert(`Imported ${parsed.length} cues from ${file.name}`);
        } else {
          alert('Could not parse caption file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Add sample question
  const handleAddQuestion = (type: QuestionType) => {
    const baseId = `q-${Date.now().toString(36)}`;
    let newQ: Question;

    if (type === 'multiple_choice') {
      newQ = {
        id: baseId,
        type: 'multiple_choice',
        prompt: 'What was the main topic discussed in this segment?',
        timestamp: Math.min(30, duration - 10),
        points: 10,
        options: ['First possibility', 'Second possibility', 'Third possibility', 'Fourth possibility'],
        correctAnswerIndex: 0,
        explanation: 'The speaker states this clearly in the passage.'
      };
    } else if (type === 'matching') {
      newQ = {
        id: baseId,
        type: 'matching',
        prompt: 'Match the key phrase with its meaning:',
        timestamp: Math.min(50, duration - 10),
        points: 15,
        pairs: [
          { id: 'p1', left: 'First term', right: 'Definition of first term' },
          { id: 'p2', left: 'Second term', right: 'Definition of second term' }
        ]
      };
    } else if (type === 'close_ended') {
      newQ = {
        id: baseId,
        type: 'close_ended',
        prompt: 'Which exact word did the speaker say after mentioning the deadline?',
        timestamp: Math.min(70, duration - 10),
        points: 10,
        acceptableAnswers: ['urgent', 'urgently'],
        caseSensitive: false
      };
    } else if (type === 'open_ended') {
      newQ = {
        id: baseId,
        type: 'open_ended',
        prompt: 'Why do you think the speaker chose this analogy? Explain in your own words.',
        timestamp: Math.min(90, duration - 10),
        points: 10,
        sampleAnswer: 'The analogy highlights how daily micro-habits compound over time.',
        evaluationRubric: 'Student articulates the connection between the analogy and habit building.'
      };
    } else if (type === 'drag_and_drop') {
      newQ = {
        id: baseId,
        type: 'drag_and_drop',
        prompt: 'Order the chronological steps described in the listening track:',
        timestamp: Math.min(110, duration - 10),
        points: 20,
        instruction: 'Slot the steps in sequence:',
        slots: [
          { id: 's1', label: 'Step 1' },
          { id: 's2', label: 'Step 2' }
        ],
        items: [
          { id: 'i1', text: 'Gather ideas', targetSlotId: 's1' },
          { id: 'i2', text: 'Write draft', targetSlotId: 's2' }
        ]
      };
    } else {
      newQ = {
        id: baseId,
        type: 'fill_in_blanks',
        prompt: 'Fill in the blanks as you listen to the conversation:',
        timestamp: Math.min(130, duration - 10),
        points: 15,
        template: 'The speaker was [blank_1] to realize how [blank_2] English really is.',
        blanks: [
          { id: 'blank_1', correctWord: 'delighted', hint: 'Emotion word' },
          { id: 'blank_2', correctWord: 'practical', hint: 'Useful synonym' }
        ],
        wordBank: ['delighted', 'practical', 'surprised', 'difficult']
      };
    }

    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Difficult words handler
  const handleAddWord = () => {
    const newWord: DifficultWord = {
      id: `w-${Date.now().toString(36)}`,
      word: 'articulate',
      phonetic: '/ɑːˈtɪk.jə.lət/',
      partOfSpeech: 'adjective',
      definition: 'Able to express thoughts and ideas clearly and effectively in speech or writing.',
      exampleSentence: 'She gave an articulate and persuasive presentation.',
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80',
      timestamp: 15
    };
    setDifficultWords([...difficultWords, newWord]);
  };

  const handleDeleteWord = (id: string) => {
    setDifficultWords(difficultWords.filter(w => w.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please provide a lesson title.');
      return;
    }

    const newLesson: Lesson = {
      id: lesson?.id || `lesson-${Date.now().toString(36)}`,
      title: title.trim(),
      description: description.trim(),
      level,
      topic: topic.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim(),
      duration: Number(duration) || 180,
      captions,
      questions,
      difficultWords,
      teacherId,
      teacherName,
      createdAt: lesson?.createdAt || new Date().toISOString(),
      isHomeworkAvailable: true
    };

    onSave(newLesson);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {lesson ? 'Edit Listening Lesson' : 'Create New Listening Lesson'}
            </h2>
            <p className="text-xs text-slate-500">
              Set up media, interactive captions, vocabulary hotspots, and formative assessments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Media & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('captions')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'captions'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>2. Captions & Timings ({captions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'vocabulary'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Difficult Words Hotspots ({difficultWords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'questions'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. Formative Assessments ({questions.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INFO & MEDIA */}
          {activeTab === 'info' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Secrets of Fast Natural English"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will students listen to and learn from this session?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Proficiency Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="Beginner">Beginner (A1-A2)</option>
                    <option value="Intermediate">Intermediate (B1-B2)</option>
                    <option value="Advanced">Advanced (C1-C2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Travel, Business, Everyday Speech"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Media Source
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('youtube')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      mediaType === 'youtube'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span>YouTube Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('audio')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      mediaType === 'audio'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Music className="w-4 h-4 text-emerald-500" />
                    <span>Direct Audio / MP3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      mediaType === 'video'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Direct Video / MP4</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {mediaType === 'youtube' ? 'YouTube Video URL' : 'Direct Audio or Video URL'}
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={mediaType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://.../audio.mp3'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAPTIONS */}
          {activeTab === 'captions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-brand-900 uppercase tracking-wider">Upload / Import Captions</h4>
                  <p className="text-xs text-brand-700 mt-0.5">
                    Upload WebVTT (.vtt) or SubRip (.srt) caption files, or paste timed transcript cues below.
                  </p>
                </div>
                <div>
                  <label className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-block">
                    Upload .VTT / .SRT
                    <input
                      type="file"
                      accept=".vtt,.srt,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Paste raw box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Raw Subtitles / VTT Block
                </label>
                <textarea
                  rows={3}
                  value={rawCaptionInput}
                  onChange={(e) => setRawCaptionInput(e.target.value)}
                  placeholder="00:00:05.000 --> 00:00:10.000&#10;Hello everyone, welcome to today's English listening session."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleImportRawCaptions}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Parse & Append Cues
                </button>
              </div>

              {/* Current Cues List */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Parsed Caption Cues ({captions.length})
                  </h4>
                  {captions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCaptions([])}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      Clear all cues
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {captions.map((cue, index) => (
                    <div
                      key={cue.id || index}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 shrink-0 font-mono font-bold text-brand-600">
                        <span>{formatTime(cue.start)}</span>
                        <span>&rarr;</span>
                        <span>{formatTime(cue.end)}</span>
                      </div>
                      <div className="flex-1 text-slate-800 font-medium">
                        {cue.text}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCaptions(captions.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIFFICULT WORDS */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">
                    Difficult Vocabulary Hotspots
                  </h4>
                  <p className="text-xs text-slate-500">
                    Students can click these words in the captions. Teachers can also spotlight them to freeze the class and teach.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWord}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Word
                </button>
              </div>

              <div className="space-y-3">
                {difficultWords.map((word, index) => (
                  <div
                    key={word.id || index}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-sm text-slate-900 capitalize">
                          {word.word || 'New word'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteWord(word.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Word</label>
                        <input
                          type="text"
                          value={word.word}
                          onChange={(e) => {
                            const updated = [...difficultWords];
                            updated[index].word = e.target.value;
                            setDifficultWords(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Phonetic</label>
                        <input
                          type="text"
                          value={word.phonetic || ''}
                          onChange={(e) => {
                            const updated = [...difficultWords];
                            updated[index].phonetic = e.target.value;
                            setDifficultWords(updated);
                          }}
                          placeholder="/.../"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Part of Speech</label>
                        <select
                          value={word.partOfSpeech || 'noun'}
                          onChange={(e) => {
                            const updated = [...difficultWords];
                            updated[index].partOfSpeech = e.target.value as any;
                            setDifficultWords(updated);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        >
                          <option value="noun">Noun</option>
                          <option value="verb">Verb</option>
                          <option value="adjective">Adjective</option>
                          <option value="adverb">Adverb</option>
                          <option value="idiom">Idiom</option>
                          <option value="phrasal_verb">Phrasal Verb</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Definition</label>
                      <input
                        type="text"
                        value={word.definition}
                        onChange={(e) => {
                          const updated = [...difficultWords];
                          updated[index].definition = e.target.value;
                          setDifficultWords(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Example Sentence</label>
                        <input
                          type="text"
                          value={word.exampleSentence}
                          onChange={(e) => {
                            const updated = [...difficultWords];
                            updated[index].exampleSentence = e.target.value;
                            setDifficultWords(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Illustrative Image URL</label>
                        <input
                          type="text"
                          value={word.imageUrl || ''}
                          onChange={(e) => {
                            const updated = [...difficultWords];
                            updated[index].imageUrl = e.target.value;
                            setDifficultWords(updated);
                          }}
                          placeholder="https://...jpg"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">
                    Formative Assessment Questions ({questions.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Embed questions at precise points in the audio/video. When playback reaches this point, the media auto-pauses!
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('multiple_choice')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Multiple Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('matching')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Matching
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('close_ended')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Short Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('open_ended')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Open Ended
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('drag_and_drop')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Drag & Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('fill_in_blanks')}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200"
                  >
                    + Fill Blanks
                  </button>
                </div>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div
                    key={q.id || index}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {q.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Question Prompt</label>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[index].prompt = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Timestamp (Sec)</label>
                        <input
                          type="number"
                          value={q.timestamp}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[index].timestamp = Number(e.target.value);
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Specific preview/configs */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Explanation / Clue</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[index].explanation = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder="Context revealed after student answers..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Lesson</span>
          </button>
        </div>
      </div>
    </div>
  );
};
