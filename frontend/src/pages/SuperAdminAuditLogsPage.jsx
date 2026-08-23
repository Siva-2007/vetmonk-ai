import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RefreshCw, Clock, Globe, User, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const SuperAdminAuditLogsPage = () => {
  const { error } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit/recent');
      setLogs(res.data);
    } catch (err) {
      error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchesSearch =
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress?.includes(search);
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>Security & Operational Audit Log Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log stream recording authentication, CRUD mutations, queue updates, and clinical events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by IP, email, action..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <button
            onClick={() => { setLoading(true); fetchAuditLogs(); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {uniqueActions.map((act) => (
          <button
            key={act}
            onClick={() => setActionFilter(act)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              actionFilter === act
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Decrypting and verifying audit trail entries..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Audit Events Logged</h3>
          <p className="text-xs text-slate-500 mt-1">
            Audit events are generated on authentication attempts, medical record creation, and queue updates.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource Target</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {l.timestamp ? l.timestamp.replace('T', ' ').substring(0, 19) : 'Now'}
                    </td>
                    <td className="px-6 py-4 font-sans font-bold text-slate-900">
                      {l.userEmail || 'Unauthenticated'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{l.resourceType} {l.resourceId && `#${l.resourceId}`}</td>
                    <td className="px-6 py-4 font-sans text-slate-600 max-w-xs truncate" title={l.details}>
                      {l.details || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{l.ipAddress || '127.0.0.1'}</td>
                    <td className="px-6 py-4 font-sans">
                      <Badge status={l.status || 'SUCCESS'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
