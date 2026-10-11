'use client';

import React, { useState } from 'react';
import SandboxScanner from '../components/SandboxScanner';
import TelemetryDashboard from '../components/TelemetryDashboard';
import WatchlistManager from '../components/WatchlistManager';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Crosshair, BarChart3, Lock, Zap, CheckCircle2, Database, BookmarkCheck, Download, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { setExtensionModalOpen } = useAuth();

  const handleScanCompleted = () => {
    // Trigger telemetry table update
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative py-8 px-6 sm:px-10 rounded-3xl bg-gradient-to-br from-[#0d1527] via-[#0b1220] to-[#070b14] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>PRE-DNS & PRE-SOCKET EDGE VERIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Zero-Trust Lexical <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Phishing Forensics</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            TraceX analyzes 12 static lexical, statistical, and structural features directly on the edge.
            Detect homograph spoofing, credential harvest pathing, and entropy anomalies in under 5 milliseconds—before any socket is established.
          </p>

          {/* CTA Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setExtensionModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs font-mono shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>ADD EXTENSION TO BROWSER</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>

            <a
              href="/tracex-extension.zip"
              download="tracex-extension.zip"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold text-xs font-mono border border-slate-800 hover:border-cyan-800/80 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DIRECT DOWNLOAD (.ZIP)</span>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Sub-5ms Inference SLA</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>12 Lexical Vectors</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supabase Threat Watchlist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'sandbox'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>SANDBOX SCANNER</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'watchlist'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>THREAT WATCHLIST & RULES (CRUD)</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>TELEMETRY & AUDIT LOGS</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sandbox' && (
        <div className="space-y-12">
          <SandboxScanner onScanComplete={handleScanCompleted} />
          <div className="pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-4">
              Real-Time Audit Trail
            </h3>
            <TelemetryDashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}

      {activeTab === 'watchlist' && (
        <WatchlistManager />
      )}

      {activeTab === 'telemetry' && (
        <TelemetryDashboard refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
}
