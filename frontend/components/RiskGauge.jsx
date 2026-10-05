'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function RiskGauge({ score = 0, status = 'BENIGN', latency = 0, isFallback = false }) {
  const percentage = Math.round(score * 100);
  const isMalicious = status === 'MALICIOUS' || score >= 0.60;

  // SVG Gauge calculations (circumference for radius = 80)
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  // Semicircle gauge: arc of 270 degrees
  const strokeDashoffset = circumference - (score * (circumference * 0.75));

  const strokeColor = isMalicious
    ? '#f43f5e' // Crimson
    : percentage > 35
    ? '#f59e0b' // Amber
    : '#10b981'; // Emerald

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0d1527] border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          isMalicious ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />

      {/* Title & SLA Header */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            ML Forensic Assessment
          </span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-slate-300">Inference: </span>
          <span className={`font-bold ${latency <= 5.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {latency}ms
          </span>
          <span className="text-slate-500 text-[9px]">(SLA &lt;5ms)</span>
        </div>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#1e293b"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
          />

          {/* Value Arc with transition */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={strokeColor}
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${strokeColor}80)`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-white font-mono">
            {percentage}%
          </span>
          <span className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
            Risk Score ({score.toFixed(3)})
          </span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-md ${
                isMalicious
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800/80 danger-glow'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 safe-glow'
              }`}
            >
              {isMalicious ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>MALICIOUS</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BENIGN</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Engine Breakdown */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs font-mono">
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-[10px]">THRESHOLD</div>
          <div className="text-slate-300 font-semibold">&ge; 0.60 MALICIOUS</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-[10px]">ENGINE MODE</div>
          <div className="text-cyan-400 font-semibold">
            {isFallback ? 'HEURISTIC FALLBACK' : 'ONNX RUNTIME'}
          </div>
        </div>
      </div>
    </div>
  );
}
