import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  LayoutDashboard,
  Dog,
  Calendar,
  Clock,
  FileText,
  Pill,
  Syringe,
  Sparkles,
  HelpCircle,
  FolderOpen,
  Briefcase,
  ShieldCheck,
  Users,
  Building2,
  Stethoscope,
  UserCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getNavItems = () => {
    switch (user?.role) {

      // =====================================================
      // PET OWNER
      // =====================================================
      case 'PET_OWNER':
        return [
          {
            to: '/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard
          },
          {
            to: '/pets',
            label: t('myPets'),
            icon: Dog
          },
          {
            to: '/appointments',
            label: t('appointments'),
            icon: Calendar
          },
          {
            to: '/appointments/book',
            label: t('bookAppointment'),
            icon: Clock
          },
          {
            to: '/vaccinations',
            label: t('vaccinations'),
            icon: Syringe
          },
          {
            to: '/medical-records',
            label: t('medicalRecords'),
            icon: FileText
          },
          {
            to: '/documents',
            label: t('documents'),
            icon: FolderOpen
          },
          {
            to: '/queries',
            label: t('supportQueries'),
            icon: HelpCircle
          },
          {
            to: '/ai-chat',
            label: t('aiAssistant'),
            icon: Sparkles,
            highlight: true
          }
        ];


      // =====================================================
      // VETERINARIAN
      // =====================================================
      case 'VETERINARIAN':
        return [
          {
            to: '/vet/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard
          },
          {
            to: '/vet/queue',
            label: 'Patient Queue',
            icon: Clock,
            badge: 'Live'
          },
          {
            to: '/vet/appointments',
            label: "Today's Schedule",
            icon: Calendar
          },
          {
            to: '/vet/consultations',
            label: t('consultations'),
            icon: Stethoscope
          },
          {
            to: '/medicines',
            label: 'Formulary & Drugs',
            icon: Pill
          },
          {
            to: '/ai-chat',
            label: 'Clinical AI Assistant',
            icon: Sparkles,
            highlight: true
          }
        ];


      // =====================================================
      // RECEPTIONIST
      // =====================================================
      case 'RECEPTIONIST':
        return [
          {
            to: '/reception/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard
          },
          {
            to: '/reception/check-in',
            label: 'Patient Check-In',
            icon: UserCheck
          },
          {
            to: '/reception/queue',
            label: 'Live Waiting Queue',
            icon: Clock,
            badge: 'Live'
          },
          {
            to: '/reception/appointments',
            label: 'Clinic Schedule',
            icon: Calendar
          },
          {
            to: '/queries',
            label: 'Customer Queries',
            icon: HelpCircle
          },
          {
            to: '/ai-chat',
            label: t('aiAssistant'),
            icon: Sparkles
          }
        ];


      // =====================================================
      // CLINIC ADMIN
      // =====================================================
      case 'CLINIC_ADMIN':
        return [
          {
            to: '/admin/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard
          },
          {
            to: '/admin/inventory',
            label: t('inventory'),
            icon: Pill
          },
          {
            to: '/admin/vacancies',
            label: 'Clinic Vacancies',
            icon: Briefcase
          },
          {
            to: '/admin/staff',
            label: 'Staff Management',
            icon: Users
          },

          // IMPORTANT:
          // This route belongs to Clinic Admin.
          // Do NOT use /reception/queue here.
          {
            to: '/admin/live-queue',
            label: 'Live Queue Monitor',
            icon: Clock,
            badge: 'Live'
          },

          {
            to: '/queries',
            label: 'Patient Inquiries',
            icon: HelpCircle
          },
          {
            to: '/ai-chat',
            label: t('aiAssistant'),
            icon: Sparkles
          }
        ];


      // =====================================================
      // SUPER ADMIN
      // =====================================================
      case 'SUPER_ADMIN':
        return [
          {
            to: '/super-admin/dashboard',
            label: 'Platform Metrics',
            icon: LayoutDashboard
          },
          {
            to: '/super-admin/clinics',
            label: t('clinics'),
            icon: Building2
          },
          {
            to: '/super-admin/users',
            label: t('users'),
            icon: Users
          },
          {
            to: '/super-admin/audit',
            label: t('auditLogs'),
            icon: ShieldCheck
          },
          {
            to: '/admin/inventory',
            label: 'All Inventory',
            icon: Pill
          },

          // =================================================
          // SUPER ADMIN VACANCY MANAGEMENT
          // =================================================
          {
            to: '/super-admin/vacancies',
            label: 'Vacancy Management',
            icon: Briefcase
          },

          {
            to: '/ai-chat',
            label: t('aiAssistant'),
            icon: Sparkles,
            highlight: true
          }
        ];


      // =====================================================
      // DEFAULT
      // =====================================================
      default:
        return [
          {
            to: '/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard
          },
          {
            to: '/ai-chat',
            label: t('aiAssistant'),
            icon: Sparkles
          }
        ];
    }
  };

  const navItems = getNavItems();

  const dashboardPaths = [
    '/dashboard',
    '/vet/dashboard',
    '/reception/dashboard',
    '/admin/dashboard',
    '/super-admin/dashboard'
  ];

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}


      {/* =====================================================
          SIDEBAR NAVIGATION
      ===================================================== */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between py-5 px-3 overflow-y-auto`}
      >

        <div className="space-y-1">

          {/* Navigation heading */}
          <div className="px-3 pb-3 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Navigation Menu
            </span>
          </div>


          {/* Navigation items */}
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={dashboardPaths.includes(item.to)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60 shadow-xs'
                      : item.highlight
                      ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/50'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">

                  <Icon
                    className={`w-4 h-4 ${
                      item.highlight
                        ? 'text-brand-600'
                        : 'text-slate-500'
                    }`}
                  />

                  <span>
                    {item.label}
                  </span>

                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-brand-500 text-white rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}

              </NavLink>
            );
          })}

        </div>


        {/* ===================================================
            AI ASSISTANT BANNER
        =================================================== */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-brand-900 to-emerald-950 text-white border border-brand-700/40 shadow-sm">

          <div className="flex items-center gap-2 mb-1">

            <Sparkles className="w-4 h-4 text-brand-300" />

            <p className="text-xs font-bold text-brand-100">
              VetMonk Assistant
            </p>

          </div>

          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            Real-time RAG retrieval with emergency medical triage guardrails.
          </p>

          <NavLink
            to="/ai-chat"
            onClick={onClose}
            className="inline-block mt-2.5 text-xs font-bold text-brand-300 hover:text-white transition"
          >
            Launch Assistant &rarr;
          </NavLink>

        </div>

      </aside>
    </>
  );
};