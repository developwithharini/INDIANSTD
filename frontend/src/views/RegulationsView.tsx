import React, { useState, useEffect } from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { QCO } from '../types';
import { fetchQCOs } from '../services/api';

export const RegulationsView: React.FC = () => {
  const [qcos, setQcos] = useState<QCO[]>([]);

  useEffect(() => {
    fetchQCOs().then(setQcos).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <h1 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          Quality Control Orders (QCO) & Mandatory Certifications Registry
        </h1>
        <p className="text-xs text-slate-500">
          Deterministic regulatory database mapping products subject to compulsory BIS certification, ministry gazette notifications, and enforcement dates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qcos.map(qco => (
          <div key={qco.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                  {qco.mandatory_certification_type}
                </span>
                <h3 className="text-sm font-bold text-navy-900">{qco.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                {qco.ministry}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 font-mono">
              <div>Order Number: {qco.order_number}</div>
              <div>Enforcement Effective Date: {qco.effective_date}</div>
              <div>Governed Standard IDs: {qco.target_standard_ids?.join(', ') || 'IS 10322 (Part 5/Sec 3)'}</div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Active Regulation
              </span>
              {qco.source_url && (
                <a
                  href={qco.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy-900 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Gazette Notice</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
