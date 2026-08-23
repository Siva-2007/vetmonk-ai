import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogOut, User, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = ({ onMenuToggle }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'CLINIC_ADMIN': return 'Clinic Admin';
      case 'VETERINARIAN': return 'Veterinarian';
      case 'RECEPTIONIST': return 'Receptionist';
      case 'PET_OWNER': return 'Pet Owner';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  VetMonk<span className="text-brand-600">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Right Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector variant="compact" />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/vacancies"
                  className="hidden md:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-2"
                >
                  Careers
                </Link>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 px-3 py-2 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {t('register')}
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name ? user.name.substring(0, 2) : 'VM'}
                  </div>
                  <div className="hidden sm:block text-left pr-2">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
                    <p className="text-[10px] font-semibold text-brand-600 mt-0.5 uppercase tracking-wider leading-none">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {getRoleLabel(user?.role)}
                        </span>
                      </div>
                      <Link
                        to="/ai-chat"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition"
                      >
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        VetMonk AI Assistant
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
