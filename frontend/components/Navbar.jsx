'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { Shield, User, LogIn, LogOut, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, signOut, setAuthModalOpen, setAuthMode, isConfigured } = useAuth();

  return (
    <>
      <header className="border-b border-slate-800/80 bg-[#0d1527]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <span className="text-white font-black text-lg tracking-wider">TX</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Trace<span className="text-cyan-400">X</span>
              </span>
              <span className="ml-2 text-xs font-mono uppercase tracking-widest text-cyan-500/80 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                Lexical Forensics
              </span>
            </div>
          </div>

          {/* Engine & Auth Indicators */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs font-mono">
            {/* Supabase status indicator */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isConfigured ? 'Supabase Cloud DB' : 'Supabase (Demo DB)'}</span>
            </div>

            {/* Engine Online */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-semibold">ENGINE ONLINE</span>
            </div>

            <span className="hidden sm:inline text-slate-700">|</span>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-200 font-bold max-w-[120px] sm:max-w-[160px] truncate">
                    {user.email || user.user_metadata?.name || 'Operator'}
                  </span>
                  {user.isDemo && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/60">
                      demo
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/80 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN / LOGIN</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
}
