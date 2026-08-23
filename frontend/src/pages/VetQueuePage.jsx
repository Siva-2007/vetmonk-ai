import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Stethoscope,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const VetQueuePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      /*
       * Backend endpoint:
       * GET /api/queue/vet/{vetId}
       *
       * api already contains /api as its base URL.
       */
      const response = await api.get(`/queue/vet/${user.id}`);

      setQueue(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error('Failed to load veterinarian queue:', err);

      error('Failed to load waiting room queue');

      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user?.id]);


  const handleUpdateStatus = async (queueId, newStatus) => {
    try {

      /*
       * Backend expects:
       *
       * PATCH /api/queue/{id}/status
       *
       * Request body:
       * {
       *   "status": "WITH_VET"
       * }
       */

      await api.patch(
        `/queue/${queueId}/status`,
        {
          status: newStatus,
        }
      );

      success(
        `Patient queue status updated to ${newStatus}`
      );

      await fetchQueue();

    } catch (err) {
      console.error(
        'Failed to update queue status:',
        err
      );

      error('Failed to update status');
    }
  };


  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

            <Clock className="w-8 h-8 text-sky-700" />

            <span>
              Assigned Patient Waiting Queue
            </span>

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time patients checked in by reception for your
            examination room.
          </p>

        </div>


        <button
          onClick={fetchQueue}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition self-start sm:self-auto disabled:opacity-50"
        >

          <RefreshCw
            className={`w-3.5 h-3.5 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          <span>
            Refresh Queue
          </span>

        </button>

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <LoadingSpinner
          message="Refreshing live waiting tokens..."
        />

      ) : queue.length === 0 ? (

        /* ===================================================
           EMPTY QUEUE
        ==================================================== */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            Waiting Room Clear
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            No patients are currently queued for your
            examination room. New check-ins will appear here
            automatically.
          </p>

        </div>

      ) : (

        /* ===================================================
           LIVE QUEUE
        ==================================================== */

        <div className="space-y-4">

          {queue.map((q) => (

            <div
              key={q.id}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition ${
                q.status === 'WITH_VET'
                  ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200/80'
              }`}
            >

              {/* =================================================
                  PATIENT INFORMATION
              ================================================== */}

              <div className="flex items-start gap-4">

                {/* QUEUE NUMBER */}

                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-900 flex flex-col items-center justify-center font-black shrink-0 border border-sky-200">

                  <span className="text-[10px] uppercase font-bold text-sky-600">
                    Token
                  </span>

                  <span className="text-xl leading-none">
                    #{q.queueNumber ?? '-'}
                  </span>

                </div>


                {/* PATIENT DETAILS */}

                <div>

                  <div className="flex flex-wrap items-center gap-2 mb-1">

                    <h3 className="text-lg font-bold text-slate-900">
                      {q.petName || 'Unknown Pet'}
                    </h3>

                    <Badge status={q.status} />

                  </div>


                  <p className="text-xs text-slate-600 font-medium">

                    Owner:{' '}

                    {q.ownerName || 'Unknown Owner'}

                    {' ('}

                    {q.ownerPhone || 'No phone'}

                    {')'}

                  </p>


                  <p className="text-xs text-slate-500 mt-1">

                    Check-In Time:{' '}

                    {q.checkInTime
                      ? q.checkInTime.substring(11, 16)
                      : 'Just now'}

                    {' • '}

                    Reason:{' '}

                    {q.reason || 'Not specified'}

                  </p>


                  {/* RECEPTION NOTE */}

                  {q.notes && (

                    <p className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md mt-2">

                      <strong>
                        Reception Note:
                      </strong>{' '}

                      {q.notes}

                    </p>

                  )}

                </div>

              </div>


              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">

                {/* CALL PATIENT */}

                {q.status === 'WAITING' && (

                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        q.id,
                        'WITH_VET'
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >

                    <PhoneCall className="w-3.5 h-3.5" />

                    <span>
                      Call In Patient
                    </span>

                  </button>

                )}


                {/* START CONSULTATION */}

                {(q.status === 'WAITING' ||
                  q.status === 'WITH_VET') && (

                  <Link
                    to={`/vet/consultations?appointmentId=${q.appointmentId}&petId=${q.petId}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >

                    <Stethoscope className="w-3.5 h-3.5" />

                    <span>
                      Start Consultation & SOAP →
                    </span>

                  </Link>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};