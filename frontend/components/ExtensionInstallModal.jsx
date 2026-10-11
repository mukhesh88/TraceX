'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldAlert,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  FolderArchive,
  ToggleRight,
  ArrowRight
} from 'lucide-react';

export default function ExtensionInstallModal() {
  const { extensionModalOpen, setExtensionModalOpen } = useAuth();
  const [copiedLink, setCopiedLink] = useState(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');

  if (!extensionModalOpen) return null;

  const browserUrls = {
    chrome: 'chrome://extensions',
    edge: 'edge://extensions',
    brave: 'brave://extensions',
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    // Trigger download of the extension zip packaged in public/
    const link = document.createElement('a');
    link.href = '/tracex-extension.zip';
    link.download = 'tracex-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setExtensionModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0b1220] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden z-10 text-slate-200 my-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0d1627]/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Add TraceX Extension
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  MANIFEST V3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-socket zero-DNS link interception & real-time phishing defense
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExtensionModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Download Banner */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FolderArchive className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Extension Package Ready</span>
              </div>
              <p className="text-xs text-slate-400">
                Includes service worker, ONNX cloud hooks, and high-impact warning page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadStarted ? 'DOWNLOAD AGAIN (.ZIP)' : 'DOWNLOAD EXTENSION (.ZIP)'}</span>
            </button>
          </div>

          {/* 3-Step Installation Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Direct 3-Step Browser Setup</span>
            </h4>

            {/* Step 1 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  Extract the downloaded ZIP package
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Right-click <code className="text-cyan-300 font-mono">tracex-extension.zip</code> and select <span className="text-white font-medium">"Extract All"</span> to extract the folder.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-2 w-full">
                <p className="text-xs font-bold text-slate-200">
                  Open Extensions Manager in your browser
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {['chrome', 'edge', 'brave'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrowser(b)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-all ${
                        selectedBrowser === b
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-black/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="text-cyan-400 truncate">{browserUrls[selectedBrowser]}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(browserUrls[selectedBrowser], selectedBrowser)}
                    className="ml-2 text-slate-400 hover:text-white flex items-center space-x-1 shrink-0"
                    title="Copy URL"
                  >
                    {copiedLink === selectedBrowser ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px]">{copiedLink === selectedBrowser ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste the address into a new tab's URL bar and press Enter.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  Enable Developer Mode & Click "Load unpacked"
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle on <span className="text-cyan-300 font-medium">Developer mode</span> in the top-right corner, click <span className="text-white font-medium">"Load unpacked"</span> in the top-left, and select the extracted folder.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-3 text-emerald-300 text-xs">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Connected to <strong>TraceX Cloud Engine</strong> (<code className="font-mono text-[11px]">tracex-backend-s6kq.onrender.com</code>). Zero local configuration needed!
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d1627]/80 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Extension Version 1.0.0
          </span>
          <button
            type="button"
            onClick={() => setExtensionModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
