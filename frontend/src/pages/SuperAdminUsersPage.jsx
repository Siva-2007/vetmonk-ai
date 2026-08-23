import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const SuperAdminUsersPage = () => {
  const { error } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // =========================================================
  // GET ALL PLATFORM USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      // IMPORTANT:
      // Super Admin User Directory must use /users
      // NOT /users/staff
      const res = await api.get('/users');

      console.log('========== USER DIRECTORY ==========');
      console.log('Total users:', res.data.length);
      console.log('Users:', res.data);
      console.log(
        'Roles:',
        res.data.map((user) => ({
          id: user.id,
          name: user.name,
          role: user.role,
        }))
      );
      console.log('====================================');

      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
      error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // SEARCH + ROLE FILTER
  // =========================================================

  const filtered = users.filter((u) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      u.name?.toLowerCase().includes(searchText) ||
      u.email?.toLowerCase().includes(searchText) ||
      u.phone?.includes(searchText);

    const matchesRole =
      roleFilter === 'ALL' ||
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // =========================================================
  // DISPLAY ROLE NAME
  // =========================================================

  const getRoleLabel = (role) => {
    switch (role) {
      case 'PET_OWNER':
        return 'Pet Owner';

      case 'VETERINARIAN':
        return 'Veterinarian';

      case 'RECEPTIONIST':
        return 'Receptionist';

      case 'CLINIC_ADMIN':
        return 'Clinic Admin';

      case 'SUPER_ADMIN':
        return 'Super Admin';

      default:
        return role || 'Unknown';
    }
  };

  // =========================================================
  // ROLE BADGE STYLE
  // =========================================================

  const getRoleClass = (role) => {
    switch (role) {
      case 'PET_OWNER':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'VETERINARIAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'RECEPTIONIST':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'CLINIC_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'SUPER_ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

            <Users className="w-8 h-8 text-brand-600" />

            <span>
              Platform User Directory
            </span>

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global directory of all registered platform accounts across all roles.
          </p>
        </div>

        {/* =================================================
            SEARCH + ROLE FILTER
        ================================================= */}

        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}

          <div className="relative">

            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or email..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />

          </div>

          {/* Role Filter */}

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none shadow-xs"
          >

            <option value="ALL">
              All Roles
            </option>

            <option value="PET_OWNER">
              Pet Owner
            </option>

            <option value="VETERINARIAN">
              Veterinarian
            </option>

            <option value="RECEPTIONIST">
              Receptionist
            </option>

            <option value="CLINIC_ADMIN">
              Clinic Admin
            </option>

            <option value="SUPER_ADMIN">
              Super Admin
            </option>

          </select>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (

        <LoadingSpinner
          message="Querying platform users..."
        />

      ) : filtered.length === 0 ? (

        /* ===================================================
           EMPTY STATE
        =================================================== */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            No Users Match Filter
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or role filters.
          </p>

        </div>

      ) : (

        /* ===================================================
           USER TABLE
        =================================================== */

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs text-slate-600">

              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">

                <tr>

                  <th className="px-6 py-4">
                    User
                  </th>

                  <th className="px-6 py-4">
                    Email
                  </th>

                  <th className="px-6 py-4">
                    Role
                  </th>

                  <th className="px-6 py-4">
                    Phone
                  </th>

                  <th className="px-6 py-4">
                    Language
                  </th>

                  <th className="px-6 py-4">
                    Created Date
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody className="divide-y divide-slate-100 font-medium">

                {filtered.map((u) => (

                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/60 transition"
                  >

                    {/* USER */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">

                          {u.name
                            ? u.name.substring(0, 2)
                            : 'US'}

                        </div>

                        <div>

                          <div className="font-bold text-slate-900">
                            {u.name}
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: #{u.id}
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td className="px-6 py-4 text-slate-700">
                      {u.email}
                    </td>

                    {/* ROLE */}

                    <td className="px-6 py-4">

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getRoleClass(
                          u.role
                        )}`}
                      >
                        {getRoleLabel(u.role)}
                      </span>

                    </td>

                    {/* PHONE */}

                    <td className="px-6 py-4 text-slate-500">
                      {u.phone || 'N/A'}
                    </td>

                    {/* LANGUAGE */}

                    <td className="px-6 py-4 uppercase font-bold text-slate-500">
                      {u.preferredLanguage || 'en'}
                    </td>

                    {/* CREATED DATE */}

                    <td className="px-6 py-4 text-slate-400">

                      {u.createdAt
                        ? u.createdAt.split('T')[0]
                        : 'Seeded'}

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <Badge
                        status={
                          u.enabled === false
                            ? 'INACTIVE'
                            : 'ACTIVE'
                        }
                      />

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