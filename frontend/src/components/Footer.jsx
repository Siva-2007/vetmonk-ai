import React from 'react';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <HeartHandshake className="w-5 h-5 text-brand-400" />
              <span>VetMonk AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Next-generation veterinary healthcare platform powered by safe clinical AI assistance, real-time RAG, and smart clinic workflow management.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/vacancies" className="hover:text-white transition">Veterinary Careers</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Clinic Portal</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Pet Owner Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Clinical Safety</h4>
            <ul className="space-y-2">
              <li><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-brand-400" /> Triage Safety Layer</span></li>
              <li><span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> Grounded RAG Knowledge</span></li>
              <li><span>RBAC & IDOR Ownership Protection</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Languages</h4>
            <p className="text-slate-400 mb-2">Supported in 6 regional languages:</p>
            <p className="text-slate-300 font-medium">English • தமிழ் • हिन्दी • తెలుగు • മലയാളം • ಕನ್ನಡ</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>&copy; {new Date().getFullYear()} VetMonk AI Platform. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 italic">
            *VetMonk AI provides educational assistance only and cannot replace professional veterinary clinical diagnosis.*
          </p>
        </div>
      </div>
    </footer>
  );
};
