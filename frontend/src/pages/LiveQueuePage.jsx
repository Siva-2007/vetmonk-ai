import React, { useState, useEffect } from 'react';
import {
  Clock,
  RefreshCw,
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const LiveQueuePage = () => {
  const { success, error } = useToast();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current test clinic
  const CLINIC_ID = 1;

  const fetchLiveQueue = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/queue/live?clinicId=${CLINIC_ID}`
      );

      setQueue(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error(
        'Failed to load live waiting queue:',
        err.response?.data || err.message
      );

      setQueue([]);

      error('Failed to load live waiting queue');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();

    // Refresh every 15 seconds
    const interval = setInterval(
      fetchLiveQueue,
      15000
    );

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    queueId,
    newStatus
  ) => {
    try {

      /*
       * Backend expects:
       *
       * {
       *   "status": "WITH_VET"
       * }
       *
       * NOT:
       * /queue/{id}/status?status=WITH_VET
       */

      await api.patch(
        `/queue/${queueId}/status`,
        {
          status: newStatus,
        }
      );

      success(
        `Queue status updated to ${newStatus}`
      );

      await fetchLiveQueue();

    } catch (err) {

      console.error(
        'Failed to update queue status:',
        err.response?.data || err.message
      );

      error(
        'Failed to update queue status'
      );
    }
  };

  const waitingCount = queue.filter(
    q => q.status === 'WAITING'
  ).length;

  const inConsultCount = queue.filter(
    q => q.status === 'WITH_VET'
  ).length;

  const completedCount = queue.filter(
    q => q.status === 'COMPLETED'
  ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

              <Clock className="w-8 h-8 text-purple-700" />

              <span>
                Live Reception Queue Display Board
              </span>

            </h1>

            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />

              Live Feed

            </span>

          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status board displaying patient queue
            tokens and examination room assignments.
          </p>

        </div>

        <button
          onClick={fetchLiveQueue}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
        >

          <RefreshCw className="w-3.5 h-3.5" />

          <span>
            Refresh Now
          </span>

        </button>

      </div>


      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">

          <p className="text-[11px] font-bold uppercase text-slate-400">
            Total Checked-In
          </p>

          <p className="text-2xl font-black text-slate-900 mt-1">
            {queue.length}
          </p>

        </div>


        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">

          <p className="text-[11px] font-bold uppercase text-amber-700">
            Currently Waiting
          </p>

          <p className="text-2xl font-black text-amber-900 mt-1">
            {waitingCount}
          </p>

        </div>


        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 shadow-sm">

          <p className="text-[11px] font-bold uppercase text-sky-700">
            In Consultation
          </p>

          <p className="text-2xl font-black text-sky-900 mt-1">
            {inConsultCount}
          </p>

        </div>


        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">

          <p className="text-[11px] font-bold uppercase text-emerald-700">
            Completed Today
          </p>

          <p className="text-2xl font-black text-emerald-900 mt-1">
            {completedCount}
          </p>

        </div>

      </div>


      {/* LOADING */}
      {loading ? (

        <LoadingSpinner
          message="Connecting to live queue stream..."
        />

      ) : queue.length === 0 ? (

        /* EMPTY QUEUE */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            Queue is Currently Empty
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            No patients in the waiting area.
            Check in arriving appointments to issue
            live tokens.
          </p>

        </div>

      ) : (

        /* QUEUE CARDS */

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {queue.map((q) => (

            <div
              key={q.id}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition duration-200 ${
                q.status === 'WITH_VET'
                  ? 'bg-gradient-to-br from-sky-50 via-white to-sky-50/40 border-sky-300'
                  : q.status === 'WAITING'
                  ? 'bg-white border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >

              <div>

                {/* PATIENT HEADER */}

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border ${
                        q.status === 'WITH_VET'
                          ? 'bg-sky-600 text-white border-sky-700'
                          : q.status === 'WAITING'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >

                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                        Token
                      </span>

                      {/* IMPORTANT:
                          Backend returns queueNumber
                      */}

                      <span className="text-2xl leading-none font-black">
                        #{q.queueNumber ?? '-'}
                      </span>

                    </div>


                    <div>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {q.petName || 'Unknown Pet'}
                      </h3>

                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {q.ownerName || 'Unknown Owner'}
                      </p>

                    </div>

                  </div>


                  <Badge status={q.status} />

                </div>


                {/* DETAILS */}

                <div className="py-3 border-y border-slate-100 text-xs space-y-1.5 mb-4">

                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      Attending Vet:
                    </span>

                    <span className="font-bold text-slate-900">
                      {q.veterinarianName
                        ? `Dr. ${q.veterinarianName}`
                        : 'First Available'}
                    </span>

                  </div>


                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      Check-In Time:
                    </span>

                    <span>
                      {q.checkInTime
                        ? q.checkInTime.substring(11, 16)
                        : 'Recently'}
                    </span>

                  </div>


                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      Reason:
                    </span>

                    <span className="truncate max-w-[150px]">
                      {q.reason || 'General consultation'}
                    </span>

                  </div>

                </div>


                {q.notes && (

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-3">

                    <strong>
                      Note:
                    </strong>{' '}

                    {q.notes}

                  </p>

                )}

              </div>


              {/* ACTIONS */}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">

                {q.status === 'WAITING' && (

                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        q.id,
                        'WITH_VET'
                      )
                    }
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-bold transition"
                  >
                    Call In (With Vet)
                  </button>

                )}


                {q.status === 'WITH_VET' && (

                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        q.id,
                        'COMPLETED'
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition"
                  >
                    Mark Finished
                  </button>

                )}


                {q.status !== 'COMPLETED' &&
                  q.status !== 'CANCELLED' && (

                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        q.id,
                        'SKIPPED'
                      )
                    }
                    className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    Skip
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};