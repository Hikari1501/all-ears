import React, { useState } from 'react';
import { FirebaseCustomConfig, activeConfig, isLiveFirebaseConfigured, saveFirebaseConfig, clearFirebaseConfig } from '../../services/firebase';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(activeConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(activeConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(activeConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(activeConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(activeConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(activeConfig?.appId || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      alert('Please fill in at least API Key and Project ID.');
      return;
    }
    const config: FirebaseCustomConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };
    saveFirebaseConfig(config);
  };

  const handleResetToMock = () => {
    if (confirm('Switch back to reactive Mock/Local mode?')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Firebase Connection</h3>
              <p className="text-xs text-slate-500">Cloud Firestore, Storage & Auth settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isLiveFirebaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            {isLiveFirebaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-sm">
                {isLiveFirebaseConfigured
                  ? `Connected to Firebase (${activeConfig?.projectId})`
                  : 'Operating in High-Performance Local Mock Mode'}
              </p>
              <p className="mt-1 text-slate-600">
                {isLiveFirebaseConfigured
                  ? 'All lessons, live rooms, and student submissions synchronize directly to your Firebase project.'
                  : 'The application runs with full multi-tab real-time synchronization, instant live lesson hosting, and homework grading out-of-the-box. You can also connect your own Firebase keys below.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  placeholder="all-ears-123"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={e => setAuthDomain(e.target.value)}
                  placeholder="all-ears.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={e => setStorageBucket(e.target.value)}
                  placeholder="all-ears.appspot.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  placeholder="1:123456:web:abcd..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isLiveFirebaseConfigured && (
                <button
                  type="button"
                  onClick={handleResetToMock}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Revert to Mock
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm transition-colors"
                >
                  Save & Reload
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
