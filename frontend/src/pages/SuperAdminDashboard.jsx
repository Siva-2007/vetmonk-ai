import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Dog,
  Calendar,
  Stethoscope,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/super-admin');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load super admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Aggregating platform telemetry and security metrics..." />;
  }

  const roleChartData = data?.usersByRole
    ? Object.entries(data.usersByRole).map(([role, count]) => ({
        name: role.replace('_', ' '),
        value: count,
      }))
    : [
        { name: 'PET OWNER', value: 12 },
        { name: 'VETERINARIAN', value: 4 },
        { name: 'RECEPTIONIST', value: 2 },
        { name: 'CLINIC ADMIN', value: 2 },
        { name: 'SUPER ADMIN', value: 1 },
      ];

  const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#0f172a'];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/30">
            Super Administrator Control Plane
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Live global oversight of hospital clinics, platform user distribution, security audit events, and AI model health.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/super-admin/clinics"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Clinics</span>
          </Link>
          <Link
            to="/super-admin/audit"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Clinics"
          value={data?.totalClinics || 0}
          subtitle="Registered hospital branches"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Platform Users"
          value={data?.totalUsers || 0}
          subtitle="All roles combined"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Registered Pets"
          value={data?.totalPets || 0}
          subtitle="Patients under care"
          icon={Dog}
          color="purple"
        />
        <StatCard
          title="Total Consultations"
          value={data?.totalConsultations || 0}
          subtitle="Completed clinical visits"
          icon={Stethoscope}
          color="amber"
        />
      </div>

      {/* Analytics & Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Role Distribution Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">User Role Distribution</h3>
              <Link to="/super-admin/users" className="text-xs font-bold text-brand-600">
                Directory &rarr;
              </Link>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
              {roleChartData.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {r.name}
                  </span>
                  <span className="font-bold text-slate-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Security Audit Log Trail (Right 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Live Security & Action Audit Stream</h3>
            </div>
            <Link
              to="/super-admin/audit"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {(!data?.recentAuditLogs || data.recentAuditLogs.length === 0) ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No audit records generated yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-700">{log.userEmail || 'System'}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">{log.details}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 block">{log.ipAddress || '127.0.0.1'}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp ? log.timestamp.substring(11, 19) : 'Just now'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
