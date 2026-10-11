'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, ArrowRight, Sparkles, AlertTriangle, ExternalLink, BookmarkPlus, Check } from 'lucide-react';
import RiskGauge from './RiskGauge';
import FeatureMatrix from './FeatureMatrix';
import { createWatchlistItem } from '../lib/watchlistService';
import { useAuth } from '../context/AuthContext';

const SAMPLE_PRESETS = [
  {
    name: 'Apple Phishing Lure',
    url: 'https://secure-login.apple-support-verify.com/auth',
    type: 'phishing'
  },
  {
    name: 'Punycode Homograph',
    url: 'https://xn--pple-43d.com/login',
    type: 'phishing'
  },
  {
    name: 'Raw IP Credential Stealer',
    url: 'http://192.168.1.100/paypal/login.php',
    type: 'phishing'
  },
  {
    name: 'Abuse TLD Banking',
    url: 'http://account-update-banking.xyz/session/verify',
    type: 'phishing'
  },
  {
    name: 'Google Search (High Entropy Query)',
    url: 'https://www.google.com/search?q=scamadvisor&oq=&gs_lcrp=EgZjaHJvbUqCQgAEEUYOxjCAzIJ',
    type: 'benign'
  },
  {
    name: 'Groww Login Portal',
    url: 'https://groww.in/login/enter',
    type: 'benign'
  },
  {
    name: 'Legitimate GitHub',
    url: 'https://github.com/microsoft/onnxruntime',
    type: 'benign'
  }
];

export default function SandboxScanner({ onScanComplete }) {
  const [url, setUrl] = useState('https://secure-login.apple-support-verify.com/auth');
  const { user, setExtensionModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  const handleAddToWatchlist = async () => {
    if (!scanResult) return;
    setAddingToWatchlist(true);
    try {
      await createWatchlistItem({
        url: scanResult.url,
        threat_level: scanResult.status === 'MALICIOUS' ? (scanResult.riskScore >= 0.85 ? 'CRITICAL' : 'HIGH') : 'BENIGN',
        notes: `Scanned via Sandbox (${scanResult.status} with ${(scanResult.riskScore * 100).toFixed(1)}% score)`,
        risk_score: scanResult.riskScore,
        is_active: true,
      }, user?.id);
      setAddedToWatchlist(true);
    } catch (e) {
      console.warn('Failed to add to watchlist:', e);
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl || !targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setAddedToWatchlist(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      setScanResult(data);
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to scan target URL. Is the backend running on :8080?');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetUrl) => {
    setUrl(presetUrl);
    handleScan(presetUrl);
  };

  return (
    <div className="space-y-8">
      {/* Search & URL Input Sandbox Bar */}
      <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Lexical Forensics Sandbox Scanner
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/40 px-4 py-2.5 rounded-xl text-xs">
          <span className="text-slate-300">
            Want zero-day protection while browsing in Chrome or Edge?
          </span>
          <button
            type="button"
            onClick={() => setExtensionModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <span>Add Browser Extension</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste target URL to inspect (e.g. https://secure-login.apple-support-verify.com/auth)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Running ONNX Inference...</span>
              </>
            ) : (
              <>
                <span>Scan URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Preset Sample Links */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>QUICK-TEST REPUTATION SAMPLES:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset.url)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  preset.type === 'phishing'
                    ? 'bg-rose-950/30 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-6">
          {/* Action Bar: URL summary & Save to Supabase Watchlist */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0d1527] border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-2 truncate">
              <span className="text-xs font-mono uppercase text-slate-400">Scanned Target:</span>
              <span className="text-xs font-mono font-bold text-cyan-400 truncate max-w-sm sm:max-w-md">
                {scanResult.url}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddToWatchlist}
              disabled={addedToWatchlist || addingToWatchlist}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center space-x-1.5 ${
                addedToWatchlist
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {addedToWatchlist ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Supabase Watchlist</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{addingToWatchlist ? 'Saving...' : 'Add to Supabase Watchlist'}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: SVG Gauge & Assessment */}
            <div className="lg:col-span-1">
              <RiskGauge
                score={scanResult.riskScore}
                status={scanResult.status}
                latency={scanResult.inferenceLatencyMs}
                isFallback={Boolean(scanResult.fallbackUsed)}
              />
            </div>

            {/* Right: Feature Matrix Diagnostics */}
            <div className="lg:col-span-2">
              <FeatureMatrix features={scanResult.features} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
