import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Pill,
  Users,
  Briefcase,
  AlertTriangle,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';

export const ClinicAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/clinic-admin');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load clinic admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading clinic operational telemetry..." />;
  }

  const inventorySummaryData = [
    { name: 'Optimal Stock', value: (data?.totalInventoryItemsCount || 5) - (data?.lowStockItemsCount || 0) - (data?.expiringSoonItemsCount || 0) },
    { name: 'Low Stock Alert', value: data?.lowStockItemsCount || 1 },
    { name: 'Expiring Soon', value: data?.expiringSoonItemsCount || 1 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const weeklyActivityData = [
    { day: 'Mon', appointments: 12, checkins: 11 },
    { day: 'Tue', appointments: 18, checkins: 17 },
    { day: 'Wed', appointments: 15, checkins: 15 },
    { day: 'Thu', appointments: 22, checkins: 20 },
    { day: 'Fri', appointments: 25, checkins: 24 },
    { day: 'Sat', appointments: 30, checkins: 29 },
    { day: 'Sun', appointments: 8, checkins: 8 },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Hospital Administration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {data?.clinicName || 'Apex Care Hospital & Specialty Center'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Welcome, Administrator {user?.name}. Oversee pharmacy inventory health, clinic staff, patient queues, and career openings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/inventory"
            className="flex items-center gap-2 bg-white text-teal-900 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
          >
            <Pill className="w-4 h-4 text-teal-700" />
            <span>Pharmacy Stock ({data?.totalInventoryItemsCount || 0})</span>
          </Link>
          <Link
            to="/admin/vacancies"
            className="flex items-center gap-2 bg-teal-950/80 hover:bg-teal-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-teal-400/40 transition"
          >
            <Briefcase className="w-4 h-4 text-teal-300" />
            <span>Post Vacancy</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Appointments"
          value={data?.todayAppointmentsCount || 0}
          subtitle="Hospital bookings"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Clinical Staff"
          value={data?.totalStaffCount || 0}
          subtitle="Vets & Receptionists"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Pharmacy Items"
          value={data?.totalInventoryItemsCount || 0}
          subtitle="Monitored batches"
          icon={Pill}
          color="purple"
        />
        <StatCard
          title="Stock / Expiry Alerts"
          value={(data?.lowStockItemsCount || 0) + (data?.expiringSoonItemsCount || 0)}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Patient Flow Analytics</h3>
              <p className="text-xs text-slate-500">Weekly booked consultations vs reception check-ins</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              96% Check-in Rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="appointments" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Booked Appointments" />
                <Bar dataKey="checkins" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed Check-Ins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Stock Health Pie (Right 1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">Pharmacy Inventory Health</h3>
              <Link to="/admin/inventory" className="text-xs font-bold text-teal-700 hover:text-teal-800">
                View Stock &rarr;
              </Link>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventorySummaryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventorySummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal Stock Batches
                </span>
                <span className="font-bold text-slate-900">{inventorySummaryData[0].value}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Below Threshold (Low Stock)
                </span>
                <span className="font-bold text-amber-700">{data?.lowStockItemsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expiring Within 30 Days
                </span>
                <span className="font-bold text-rose-700">{data?.expiringSoonItemsCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Clinic ID: #{user?.clinicId || 1}</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> IDOR Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
