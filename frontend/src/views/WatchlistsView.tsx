import React, { useState, useEffect } from 'react';
import { Eye, Bell, ShieldCheck, AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';
import { WatchlistItem } from '../types';
import { fetchWatchlists } from '../services/api';

export const WatchlistsView: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    fetchWatchlists().then(setItems).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <h1 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-navy-900" />
          Standards Watchlist & Section Micro-Alerts
        </h1>
        <p className="text-xs text-slate-500">
          Real-time tracking of standard status changes, published amendments, and QCO enforcement notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-navy-900 font-mono uppercase">Monitored Indian Standards ({items.length})</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-navy-900">{item.standard_number}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">{item.title}</div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  Last verified: {item.last_verified}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-navy-900 font-mono uppercase flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-600" />
            Recent Gazette Micro-Alerts
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900">IS 10322 (Part 5/Sec 1) Amendment 2</div>
              <p className="text-amber-800 text-[11px]">Added mandatory IP66 surge protection class II requirements.</p>
              <div className="text-[10px] text-amber-700 font-mono">20 Sep 2026</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">MoRTH Helmet QCO Audit</div>
              <p className="text-slate-600 text-[11px]">Reaffirmed mandatory ISI marking on all protective helmets.</p>
              <div className="text-[10px] text-slate-500 font-mono">18 Sep 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
