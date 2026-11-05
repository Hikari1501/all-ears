import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { DEMO_TEACHER, DEMO_STUDENT_1, DEMO_STUDENT_2, switchDemoUser } from '../../services/authService';
import { isLiveFirebaseConfigured, activeConfig } from '../../services/firebase';
import { Headphones, Database, ChevronDown, User, Sparkles, Plus, Radio, BookOpen, Layers } from 'lucide-react';

interface Props {
  currentUser: UserProfile | null;
  onOpenFirebaseConfig: () => void;
  onCreateLesson?: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onOpenFirebaseConfig,
  onCreateLesson,
  activeView,
  setActiveView
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isTeacher = currentUser?.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                All Ears
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Listening
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Interactive English Listening Pedagogy
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeView === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-extrabold'
                : 'hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {isTeacher ? 'Lesson Studio' : 'Listening Library'}
          </button>

          {isTeacher && onCreateLesson && (
            <button
              onClick={onCreateLesson}
              className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lesson</span>
            </button>
          )}
        </nav>

        {/* Right Section: Firebase Status + Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Firebase Connection Pill */}
          <button
            onClick={onOpenFirebaseConfig}
            title="Configure Cloud Firebase connection"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLiveFirebaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/80'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">
              {isLiveFirebaseConfigured ? 'Firebase Live' : 'Firebase Mock'}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              isLiveFirebaseConfigured ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />
          </button>

          {/* Quick User / Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser?.displayName}
                className="w-7 h-7 rounded-full bg-slate-200 object-cover border border-slate-300"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.displayName || 'Guest User'}
                </p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isTeacher ? 'text-purple-600' : 'text-brand-600'
                }`}>
                  {currentUser?.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-scale-up text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Profile
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Test Host (Teacher) and Join (Student) side-by-side:
                  </p>
                </div>

                <button
                  onClick={() => {
                    switchDemoUser(DEMO_TEACHER);
                    setIsUserDropdownOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                    currentUser?.uid === DEMO_TEACHER.uid ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={DEMO_TEACHER.avatar} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{DEMO_TEACHER.displayName}</div>
                    <span className="text-[10px] uppercase font-bold text-purple-600">Teacher Host</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoUser(DEMO_STUDENT_1);
                    setIsUserDropdownOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                    currentUser?.uid === DEMO_STUDENT_1.uid ? 'bg-brand-50 text-brand-900 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={DEMO_STUDENT_1.avatar} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{DEMO_STUDENT_1.displayName}</div>
                    <span className="text-[10px] uppercase font-bold text-brand-600">Student Participant</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoUser(DEMO_STUDENT_2);
                    setIsUserDropdownOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                    currentUser?.uid === DEMO_STUDENT_2.uid ? 'bg-brand-50 text-brand-900 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={DEMO_STUDENT_2.avatar} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{DEMO_STUDENT_2.displayName}</div>
                    <span className="text-[10px] uppercase font-bold text-brand-600">Student Participant #2</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
