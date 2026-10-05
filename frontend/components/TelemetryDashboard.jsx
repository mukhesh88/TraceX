'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, RefreshCw, ChevronLeft, ChevronRight, BarChart3, Database } from 'lucide-react';

export default function TelemetryDashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalScans: 0,
    maliciousCount: 0,
    benignCount: 0,
    maliciousRatio: 0,
    averageLatencyMs: 0
  });
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      // Fetch stats
      const statsRes = await fetch(`${apiUrl}/api/v1/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch history page
      const historyRes = await fetch(`${apiUrl}/api/v1/history?page=${page}&size=10`);
      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistory(histData.content || []);
        setTotalPages(histData.totalPages || 1);
      }
    } catch (err) {
      console.warn('Telemetry poll failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [page, refreshTrigger]);

  const maliciousPercentage = (stats.maliciousRatio * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Total Scans</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black font-mono text-white">
            {stats.totalScans}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Ingested across sandbox & edge
          </div>
        </div>

        {/* Malicious Ratio Card */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Threat Interception</span>
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black font-mono text-rose-400">
            {maliciousPercentage}%
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            {stats.maliciousCount} malicious / {stats.benignCount} benign
          </div>
        </div>

        {/* Average Latency Card */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Avg JVM Latency</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black font-mono text-emerald-400">
            {stats.averageLatencyMs}ms
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Sub-5ms SLA strictly enforced
          </div>
        </div>

        {/* Benign Passed Card */}
        <div className="bg-[#0d1527] border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Benign Verified</span>
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black font-mono text-blue-400">
            {stats.benignCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Unimpeded zero-latency traffic
          </div>
        </div>
      </div>

      {/* Real-Time Scan History Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Audit & Forensic Scan Telemetry
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3.5 px-4 font-semibold">TARGET URL</th>
                <th className="py-3.5 px-4 font-semibold">STATUS</th>
                <th className="py-3.5 px-4 font-semibold">RISK SCORE</th>
                <th className="py-3.5 px-4 font-semibold">LATENCY</th>
                <th className="py-3.5 px-4 font-semibold">TRIGGERS & KEYWORDS</th>
                <th className="py-3.5 px-4 font-semibold">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No scan records recorded yet. Submit a URL in the sandbox above.
                  </td>
                </tr>
              ) : (
                history.map((rec) => {
                  const isMal = rec.status === 'MALICIOUS';
                  const keywords = rec.flaggedKeywords ? rec.flaggedKeywords.split(',').filter(Boolean) : [];
                  const timeFormatted = new Date(rec.timestamp).toLocaleTimeString();

                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 max-w-xs sm:max-w-md truncate font-medium text-slate-200" title={rec.url}>
                        {rec.url}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                            isMal
                              ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isMal ? 'text-rose-400' : 'text-emerald-400'}>
                          {(rec.riskScore * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className={rec.inferenceLatencyMs <= 5.0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {rec.inferenceLatencyMs}ms
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rec.isPunycode && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/80 text-[10px]">
                              punycode
                            </span>
                          )}
                          {rec.hasIpAddress && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/80 text-[10px]">
                              raw-ip
                            </span>
                          )}
                          {keywords.map((k, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/80 text-[10px]"
                            >
                              {k}
                            </span>
                          ))}
                          {!rec.isPunycode && !rec.hasIpAddress && keywords.length === 0 && (
                            <span className="text-slate-600 text-[11px]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {timeFormatted}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
