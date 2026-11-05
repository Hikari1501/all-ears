import React from 'react';
import { LiveSession, StudentResponse } from '../../types';
import { formatTime } from '../../services/captionParser';
import { ArrowLeft, Award, Users, BarChart3, CheckCircle2, XCircle, Download } from 'lucide-react';

interface Props {
  session: LiveSession;
  onBack: () => void;
}

export const TeacherReportView: React.FC<Props> = ({ session, onBack }) => {
  const students = Object.values(session.students || {});
  const responses = Object.values(session.responses || {});

  // Calculate per-student total points
  const studentScores: Record<string, { name: string; score: number; totalAnswered: number }> = {};
  students.forEach(st => {
    studentScores[st.id] = { name: st.name, score: 0, totalAnswered: 0 };
  });

  responses.forEach(r => {
    if (!studentScores[r.studentId]) {
      studentScores[r.studentId] = { name: r.studentName, score: 0, totalAnswered: 0 };
    }
    studentScores[r.studentId].score += r.pointsEarned || 0;
    studentScores[r.studentId].totalAnswered++;
  });

  const studentRankList = Object.entries(studentScores).sort((a, b) => b[1].score - a[1].score);
  const maxPossibleScore = session.lesson.questions.reduce((sum, q) => sum + q.points, 0);

  const averageScore = studentRankList.length > 0
    ? Math.round(studentRankList.reduce((sum, s) => sum + s[1].score, 0) / studentRankList.length)
    : 0;

  // Export report to CSV
  const handleExportCSV = () => {
    let csv = 'Student Name,Score,Max Possible,Questions Answered\n';
    studentRankList.forEach(([_, s]) => {
      csv += `"${s.name}",${s.score},${maxPossibleScore},${s.totalAnswered}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AllEars_Report_${session.code}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                Session Analytics Report
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs font-mono font-bold text-slate-600">Room Code: {session.code}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{session.lesson.title}</h1>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Participated</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{students.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {averageScore} / {maxPossibleScore} pts
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{responses.length}</h3>
          </div>
        </div>
      </div>

      {/* Breakdown per question */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Question-by-Question Breakdown</h3>
        <div className="space-y-3">
          {session.lesson.questions.map((q, idx) => {
            const qResponses = responses.filter(r => r.questionId === q.id);
            const correctCount = qResponses.filter(r => r.isCorrect).length;
            const accuracy = qResponses.length > 0 ? Math.round((correctCount / qResponses.length) * 100) : 0;

            return (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="font-bold text-xs uppercase px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                      {q.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">@{formatTime(q.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">{correctCount} of {qResponses.length} correct</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      accuracy >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {accuracy}% Accuracy
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-800">{q.prompt}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Leaderboard */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Student Participation & Scores</h3>
        {studentRankList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No student submissions recorded for this session.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Questions Answered</th>
                  <th className="py-3 px-4">Total Points</th>
                  <th className="py-3 px-4">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRankList.map(([id, info], rank) => {
                  const percent = maxPossibleScore > 0 ? Math.round((info.score / maxPossibleScore) * 100) : 0;
                  return (
                    <tr key={id} className="hover:bg-slate-50 font-medium">
                      <td className="py-3.5 px-4 font-bold text-slate-400">#{rank + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{info.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{info.totalAnswered} / {session.lesson.questions.length}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600">{info.score} pts</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
