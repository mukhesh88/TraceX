'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, ArrowRight, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import RiskGauge from './RiskGauge';
import FeatureMatrix from './FeatureMatrix';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl || !targetUrl.trim()) return;
    setLoading(true);
    setError(null);

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
        <p className="text-xs text-slate-400 mb-6">
          Inspects structural, statistical, and lexical indicators without making any DNS requests or HTTP connections.
        </p>

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
