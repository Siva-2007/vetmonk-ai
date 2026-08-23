import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
          <Dog className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Looks like this page took an unexpected trip to the dog park. The requested page could not be located.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
