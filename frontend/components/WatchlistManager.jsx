'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getWatchlist,
  createWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
} from '../lib/watchlistService';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  Sparkles,
  Zap,
  Globe,
  Database,
  Lock,
} from 'lucide-react';

export default function WatchlistManager() {
  const { user, isConfigured, setAuthModalOpen } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [isDemoData, setIsDemoData] = useState(false);

  // Modal states for Create / Edit
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form states
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState('URL');
  const [formThreat, setFormThreat] = useState('HIGH');
  const [formNotes, setFormNotes] = useState('');
  const [formScore, setFormScore] = useState(0.85);
  const [formActive, setFormActive] = useState(true);
  const [formScanning, setFormScanning] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, isDemo } = await getWatchlist(user?.id);
      setItems(data || []);
      setIsDemoData(isDemo);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  // 1. CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formUrl.trim()) return;

    try {
      const newItem = {
        url: formUrl.trim(),
        target_type: formType,
        threat_level: formThreat,
        notes: formNotes,
        risk_score: formScore,
        is_active: formActive,
      };

      await createWatchlistItem(newItem, user?.id);
      setIsCreateOpen(false);
      resetForm();
      fetchItems();
    } catch (err) {
      alert('Error creating watchlist item: ' + err.message);
    }
  };

  // 2. UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateWatchlistItem(editingItem.id, {
        url: formUrl.trim(),
        target_type: formType,
        threat_level: formThreat,
        notes: formNotes,
        risk_score: formScore,
        is_active: formActive,
      });

      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (err) {
      alert('Error updating watchlist item: ' + err.message);
    }
  };

  // Quick toggle active status
  const handleToggleActive = async (item) => {
    const nextState = !item.is_active;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: nextState } : i))
    );
    await updateWatchlistItem(item.id, { is_active: nextState });
  };

  // 3. DELETE
  const handleDelete = async (id) => {
    try {
      await deleteWatchlistItem(id);
      setDeleteConfirmItem(null);
      fetchItems();
    } catch (err) {
      alert('Error deleting watchlist item: ' + err.message);
    }
  };

  // Helper: Run instant backend scan during Create / Edit to auto-populate risk score
  const handleInstantScan = async () => {
    if (!formUrl.trim()) return;
    setFormScanning(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formUrl.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setFormScore(data.riskScore);
        if (data.status === 'MALICIOUS') {
          setFormThreat(data.riskScore >= 0.85 ? 'CRITICAL' : 'HIGH');
        } else {
          setFormThreat('BENIGN');
        }
        if (!formNotes && data.features?.flaggedKeywords?.length) {
          setFormNotes(`Keywords detected: ${data.features.flaggedKeywords.join(', ')}`);
        }
      }
    } catch (err) {
      console.warn('Backend scan failed:', err);
    } finally {
      setFormScanning(false);
    }
  };

  // Rescan existing watchlist row
  const handleRowRescan = async (item) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });
      if (res.ok) {
        const data = await res.json();
        await updateWatchlistItem(item.id, {
          risk_score: data.riskScore,
          threat_level: data.status === 'MALICIOUS' ? (data.riskScore >= 0.85 ? 'CRITICAL' : 'HIGH') : 'BENIGN',
        });
        fetchItems();
      }
    } catch (e) {
      console.warn('Rescan failed:', e);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormUrl(item.url);
    setFormType(item.target_type || 'URL');
    setFormThreat(item.threat_level || 'HIGH');
    setFormNotes(item.notes || '');
    setFormScore(item.risk_score || 0.0);
    setFormActive(item.is_active ?? true);
  };

  const resetForm = () => {
    setFormUrl('');
    setFormType('URL');
    setFormThreat('HIGH');
    setFormNotes('');
    setFormScore(0.85);
    setFormActive(true);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel =
      levelFilter === 'ALL' || item.threat_level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const criticalCount = items.filter((i) => i.threat_level === 'CRITICAL').length;
  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0d1527] border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Threat Watchlist & Rule Registry
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800/80 text-cyan-300">
              SUPABASE DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persist, manage, and monitor custom high-risk lures, raw IP bypasses, and verified safe exemptions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TARGET RULE</span>
          </button>
        </div>
      </div>

      {/* Database connection status badge */}
      {isDemoData && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Operating with local demo storage. Add Supabase keys to <code className="text-amber-200">.env.local</code> to synchronize with live PostgreSQL cloud database.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-900/60 text-[10px] uppercase font-bold">
            Offline Sandbox
          </span>
        </div>
      )}

      {/* Metrics overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-xl shadow-lg">
          <div className="text-xs font-mono uppercase text-slate-400">Total Monitored Targets</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{items.length}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Stored in Supabase database</div>
        </div>

        <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-xl shadow-lg">
          <div className="text-xs font-mono uppercase text-slate-400">Active Interceptors</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Enforced at navigation edge</div>
        </div>

        <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-xl shadow-lg">
          <div className="text-xs font-mono uppercase text-slate-400">Critical Threat Rules</div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">High-confidence lure domains</div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search URL or notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Threat Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="BENIGN">Benign (Safe List)</option>
          </select>
        </div>
      </div>

      {/* CRUD Data Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">TARGET URL / ENTITY</th>
                <th className="py-3 px-4 font-semibold">TYPE</th>
                <th className="py-3 px-4 font-semibold">SEVERITY</th>
                <th className="py-3 px-4 font-semibold">RISK SCORE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">NOTES</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No watchlist records match the current filter. Click &ldquo;ADD TARGET RULE&rdquo; to insert a new entry.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.threat_level === 'CRITICAL';
                  const isHigh = item.threat_level === 'HIGH';
                  const isBenign = item.threat_level === 'BENIGN';

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-200" title={item.url}>
                        {item.url}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                          {item.target_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isCritical
                              ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                              : isHigh
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                              : isBenign
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-blue-950/80 text-blue-400 border-blue-800'
                          }`}
                        >
                          {item.threat_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={item.risk_score >= 0.6 ? 'text-rose-400' : 'text-emerald-400'}>
                          {(item.risk_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            item.is_active
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {item.is_active ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={item.notes}>
                        {item.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleRowRescan(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800"
                            title="Rescan with Spring Boot inference engine"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                            title="Edit rule"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/80"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0d1527] border border-cyan-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingItem ? 'Edit Watchlist Threat Rule' : 'Add Monitored Threat Rule'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Target stored in Supabase PostgreSQL
                </p>
              </div>
            </div>

            <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Target URL / Host / IP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://malicious-login-spoof.com/auth"
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleInstantScan}
                    disabled={formScanning || !formUrl.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 border border-slate-700 disabled:opacity-50"
                    title="Run Spring Boot ML scan to auto-fill risk score"
                  >
                    <Zap className={`w-3.5 h-3.5 ${formScanning ? 'animate-spin' : ''}`} />
                    <span>{formScanning ? 'Analyzing...' : 'Scan Now'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Target Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="URL">Full URL</option>
                    <option value="DOMAIN">Apex Domain</option>
                    <option value="IP">Raw IPv4 / IPv6</option>
                    <option value="KEYWORD">Keyword Rule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Threat Severity
                  </label>
                  <select
                    value={formThreat}
                    onChange={(e) => setFormThreat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="CRITICAL">Critical (Score &gt; 0.85)</option>
                    <option value="HIGH">High (Score &gt; 0.60)</option>
                    <option value="MEDIUM">Medium Suspicion</option>
                    <option value="LOW">Low Risk</option>
                    <option value="BENIGN">Benign Exemption</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Assigned Risk Score (0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formScore}
                    onChange={(e) => setFormScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Interception Rule
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="ruleActive"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500"
                    />
                    <label htmlFor="ruleActive" className="text-xs font-mono text-slate-300 cursor-pointer">
                      Active Edge Blocker
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Forensic Notes / Rationale
                </label>
                <textarea
                  rows="2"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Brand impersonation observed targeting banking credentials..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Commit Rule to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0d1527] border border-rose-800/60 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Delete Threat Rule</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
              Are you sure you want to remove <span className="text-rose-400 break-all">{deleteConfirmItem.url}</span> from the Supabase watchlist?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmItem.id)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-lg shadow-rose-600/30"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
