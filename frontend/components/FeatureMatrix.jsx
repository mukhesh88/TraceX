'use client';

import React from 'react';
import { Tag, Hash, Globe, AlertCircle, Cpu, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function FeatureMatrix({ features = {} }) {
  const flaggedKeywords = features.flaggedKeywords || [];
  const shannonEntropy = features.shannonEntropy || 0;
  const isPunycode = Boolean(features.isPunycode);
  const subdomainCount = features.subdomainCount || 0;
  const hasIpAddress = Boolean(features.hasIpAddress);
  const urlLength = features.urlLength || 0;
  const hostnameLength = features.hostnameLength || 0;
  const pathLength = features.pathLength || 0;
  const symbolCountAt = features.symbolCountAt || 0;
  const symbolCountHyphen = features.symbolCountHyphen || 0;
  const tldRiskWeight = features.tldRiskWeight || 0;
  const digitToLetterRatio = features.digitToLetterRatio || 0;

  const metricCards = [
    { label: 'Shannon Entropy', value: shannonEntropy.toFixed(3), alert: shannonEntropy > 3.8, hint: '> 3.8 is high randomness' },
    { label: 'Punycode (xn--)', value: isPunycode ? 'DETECTED' : 'CLEAN', alert: isPunycode, hint: 'Homograph spoofing indicator' },
    { label: 'Subdomains', value: subdomainCount, alert: subdomainCount > 2, hint: 'Excessive subdomain depth' },
    { label: 'Raw IP Address', value: hasIpAddress ? 'DETECTED' : 'NONE', alert: hasIpAddress, hint: 'Direct IP host bypass' },
    { label: 'Total URL Length', value: `${urlLength} chars`, alert: urlLength > 75, hint: 'Obfuscated length marker' },
    { label: 'Host Length', value: `${hostnameLength} chars`, alert: hostnameLength > 30, hint: 'Long hostname masquerade' },
    { label: 'Path Length', value: `${pathLength} chars`, alert: pathLength > 50, hint: 'Deep nested payload path' },
    { label: '@ Symbol Count', value: symbolCountAt, alert: symbolCountAt > 0, hint: 'Credential injection token' },
    { label: 'Hyphens in Host', value: symbolCountHyphen, alert: symbolCountHyphen >= 3, hint: 'Multi-hyphen spoofing' },
    { label: 'TLD Risk Weight', value: tldRiskWeight.toFixed(2), alert: tldRiskWeight >= 0.70, hint: 'Abuse-prone registry score' },
    { label: 'Digit-to-Letter', value: digitToLetterRatio.toFixed(3), alert: digitToLetterRatio > 0.35, hint: 'Excessive digit ratio' },
    { label: 'Keywords Flagged', value: flaggedKeywords.length, alert: flaggedKeywords.length > 0, hint: 'Phishing lure tokens found' },
  ];

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">
            Extracted Lexical Features (12 Static Vectors)
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-500 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
          Pure Zero-Network Heuristics
        </span>
      </div>

      {/* Flagged Keywords Alert Banner */}
      {flaggedKeywords.length > 0 ? (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>SUSPICIOUS SECURITY & AUTHENTICATION TOKENS IDENTIFIED:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {flaggedKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-900/60 text-rose-200 border border-rose-700/80 uppercase tracking-wide"
              >
                &ldquo;{kw}&rdquo;
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-2 text-slate-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No sensitive phishing lure tokens detected in URL segments.</span>
        </div>
      )}

      {/* 12-Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metricCards.map((metric, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all ${
              metric.alert
                ? 'bg-rose-950/20 border-rose-800/50 shadow-sm shadow-rose-950/40'
                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {metric.label}
              </span>
              {metric.alert ? (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40"></span>
              )}
            </div>
            <div
              className={`text-lg font-bold font-mono ${
                metric.alert ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {metric.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {metric.hint}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
