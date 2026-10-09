import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/marketplace';

interface AuthModalProps {
  isOpen: boolean;
  demoUsers: User[];
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  demoUsers,
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regBranch, setRegBranch] = useState('Computer Science (4th Sem)');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regHostel, setRegHostel] = useState('Aryabhata Boys Hostel');
  const [regPassword, setRegPassword] = useState('');

  // Feedback states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please provide your college email/USN and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.login(loginIdentifier.trim(), loginPassword);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || regName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please enter a valid college email address.');
      return;
    }
    if (!regUsn.trim() || regUsn.trim().length < 5) {
      setError('Please enter a valid USN (e.g., 1NT22CS045).');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        usn: regUsn.trim(),
        branch: regBranch,
        phone: regPhone.trim(),
        hostelBlock: regHostel,
        password: regPassword
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.quickLogin(userId);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 leading-tight">
                NMIT Student Portal
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                Verified Campus Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100/60">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white text-stone-900 border-b-2 border-amber-600'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white text-stone-900 border-b-2 border-amber-600'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                  College Email or USN
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g., 1NT21CS045 or arjun.cse@nmit.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Sign In to NMIT Marketplace</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g., Arjun Kumar"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                    USN / Roll No. *
                  </label>
                  <input
                    type="text"
                    value={regUsn}
                    onChange={e => setRegUsn(e.target.value)}
                    placeholder="1NT22CS045"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                    College Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="student@nmit.ac.in"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                  Branch & Semester
                </label>
                <input
                  type="text"
                  value={regBranch}
                  onChange={e => setRegBranch(e.target.value)}
                  placeholder="e.g., Computer Science (4th Sem)"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                    Hostel / Residence
                  </label>
                  <input
                    type="text"
                    value={regHostel}
                    onChange={e => setRegHostel(e.target.value)}
                    placeholder="Aryabhata / Kaveri / Day Scholar"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Create Student Account</span>
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Section for Evaluation */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-mono">
                Instant Demo Student Sign-In
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-medium">
                1-Click Testing
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleDemoLogin(u.id)}
                  className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-left text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-6 h-6 rounded-full border border-stone-300"
                    />
                    <div className="truncate">
                      <span className="font-bold text-stone-900">{u.name}</span>
                      <span className="text-stone-500 text-[11px] ml-1.5 font-mono">({u.usn})</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold shrink-0">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
