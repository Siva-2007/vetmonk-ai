import React from 'react';
import { Routes, Route } from 'react-router-dom';

// =====================================================
// LAYOUTS
// =====================================================
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// =====================================================
// PUBLIC PAGES
// =====================================================
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { PetOwnerLoginPage } from '../pages/PetOwnerLoginPage';
import { HospitalLoginPage } from '../pages/HospitalLoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { PublicVacanciesPage } from '../pages/PublicVacanciesPage';
import { ApplyVacancyPage } from '../pages/ApplyVacancyPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// =====================================================
// PET OWNER PAGES
// =====================================================
import { PetOwnerDashboard } from '../pages/PetOwnerDashboard';
import { MyPetsPage } from '../pages/MyPetsPage';
import { MyAppointmentsPage } from '../pages/MyAppointmentsPage';
import { BookAppointmentPage } from '../pages/BookAppointmentPage';
import { MyVaccinationsPage } from '../pages/MyVaccinationsPage';
import { MyMedicalRecordsPage } from '../pages/MyMedicalRecordsPage';
import { MyDocumentsPage } from '../pages/MyDocumentsPage';
import { MyQueriesPage } from '../pages/MyQueriesPage';
import { AiChatPage } from '../pages/AiChatPage';

// =====================================================
// VETERINARIAN PAGES
// =====================================================
import { VeterinarianDashboard } from '../pages/VeterinarianDashboard';
import { VetQueuePage } from '../pages/VetQueuePage';
import { VetConsultationPage } from '../pages/VetConsultationPage';
import { VetAppointmentsPage } from '../pages/VetAppointmentsPage';
import { MedicinesPage } from '../pages/MedicinesPage';

// =====================================================
// RECEPTIONIST PAGES
// =====================================================
import { ReceptionistDashboard } from '../pages/ReceptionistDashboard';
import { CheckInPage } from '../pages/CheckInPage';
import { LiveQueuePage } from '../pages/LiveQueuePage';

// =====================================================
// CLINIC ADMIN PAGES
// =====================================================
import { ClinicAdminDashboard } from '../pages/ClinicAdminDashboard';
import { ClinicInventoryPage } from '../pages/ClinicInventoryPage';
import { ClinicVacanciesPage } from '../pages/ClinicVacanciesPage';
import { ClinicStaffPage } from '../pages/ClinicStaffPage';

// =====================================================
// SUPER ADMIN PAGES
// =====================================================
import { SuperAdminDashboard } from '../pages/SuperAdminDashboard';
import { SuperAdminClinicsPage } from '../pages/SuperAdminClinicsPage';
import { SuperAdminUsersPage } from '../pages/SuperAdminUsersPage';
import { SuperAdminAuditLogsPage } from '../pages/SuperAdminAuditLogsPage';
import { SuperAdminVacanciesPage } from '../pages/SuperAdminVacanciesPage';


export const AppRoutes = () => {

  return (

    <Routes>

      {/* =====================================================
          PUBLIC PAGES
      ===================================================== */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<LandingPage />}
        />


        <Route
          path="/login"
          element={<LoginPage />}
        />


        <Route
          path="/login/pet-owner"
          element={<PetOwnerLoginPage />}
        />


        <Route
          path="/login/hospital"
          element={<HospitalLoginPage />}
        />


        <Route
          path="/register"
          element={<RegisterPage />}
        />


        {/* PUBLIC CAREERS */}

        <Route
          path="/vacancies"
          element={<PublicVacanciesPage />}
        />


        {/* APPLY FOR VACANCY */}

        <Route
          path="/vacancies/:id/apply"
          element={<ApplyVacancyPage />}
        />


        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

      </Route>


      {/* =====================================================
          AUTHENTICATED DASHBOARD
      ===================================================== */}

      <Route element={<DashboardLayout />}>


        {/* ===================================================
            UNIVERSAL AUTHENTICATED PAGES
        =================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/ai-chat"
            element={<AiChatPage />}
          />

          <Route
            path="/queries"
            element={<MyQueriesPage />}
          />

        </Route>


        {/* ===================================================
            PET OWNER
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['PET_OWNER']}
            />
          }
        >

          <Route
            path="/dashboard"
            element={<PetOwnerDashboard />}
          />

          <Route
            path="/pets"
            element={<MyPetsPage />}
          />

          <Route
            path="/appointments"
            element={<MyAppointmentsPage />}
          />

          <Route
            path="/appointments/book"
            element={<BookAppointmentPage />}
          />

          <Route
            path="/vaccinations"
            element={<MyVaccinationsPage />}
          />

          <Route
            path="/medical-records"
            element={<MyMedicalRecordsPage />}
          />

          <Route
            path="/documents"
            element={<MyDocumentsPage />}
          />

        </Route>


        {/* ===================================================
            VETERINARIAN
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['VETERINARIAN']}
            />
          }
        >

          <Route
            path="/vet/dashboard"
            element={<VeterinarianDashboard />}
          />

          <Route
            path="/vet/queue"
            element={<VetQueuePage />}
          />

          <Route
            path="/vet/consultations"
            element={<VetConsultationPage />}
          />

          <Route
            path="/vet/appointments"
            element={<VetAppointmentsPage />}
          />

          <Route
            path="/medicines"
            element={<MedicinesPage />}
          />

        </Route>


        {/* ===================================================
            RECEPTIONIST
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['RECEPTIONIST']}
            />
          }
        >

          <Route
            path="/reception/dashboard"
            element={<ReceptionistDashboard />}
          />

          <Route
            path="/reception/check-in"
            element={<CheckInPage />}
          />

          <Route
            path="/reception/queue"
            element={<LiveQueuePage />}
          />

          <Route
            path="/reception/appointments"
            element={<VetAppointmentsPage />}
          />

        </Route>


        {/* ===================================================
            CLINIC ADMIN
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['CLINIC_ADMIN']}
            />
          }
        >

          <Route
            path="/admin/dashboard"
            element={<ClinicAdminDashboard />}
          />

          <Route
            path="/admin/vacancies"
            element={<ClinicVacanciesPage />}
          />

          <Route
            path="/admin/staff"
            element={<ClinicStaffPage />}
          />

          <Route
            path="/admin/live-queue"
            element={<LiveQueuePage />}
          />

        </Route>


        {/* ===================================================
            INVENTORY
            CLINIC ADMIN + SUPER ADMIN
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'CLINIC_ADMIN',
                'SUPER_ADMIN'
              ]}
            />
          }
        >

          <Route
            path="/admin/inventory"
            element={<ClinicInventoryPage />}
          />

        </Route>


        {/* ===================================================
            SUPER ADMIN
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['SUPER_ADMIN']}
            />
          }
        >

          <Route
            path="/super-admin/dashboard"
            element={<SuperAdminDashboard />}
          />


          <Route
            path="/super-admin/clinics"
            element={<SuperAdminClinicsPage />}
          />


          <Route
            path="/super-admin/users"
            element={<SuperAdminUsersPage />}
          />


          <Route
            path="/super-admin/vacancies"
            element={<SuperAdminVacanciesPage />}
          />


          <Route
            path="/super-admin/audit"
            element={<SuperAdminAuditLogsPage />}
          />

        </Route>

      </Route>


      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>

  );

};