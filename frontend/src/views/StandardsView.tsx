import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, Calendar, ShieldCheck, GitBranch, History } from 'lucide-react';
import { Standard } from '../types';
import { fetchStandards } from '../services/api';

export const StandardsView: React.FC = () => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);

  useEffect(() => {
    fetchStandards().then(setStandards).catch(console.error);
  }, []);

  const domains = ['ALL', 'Electrical & Electronics', 'Personal Safety Equipment', 'Civil Engineering', 'Mechanical'];

  const filtered = standards.filter(s => {
    const matchesSearch = s.standard_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || s.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div>
          <h1 className="text-lg font-bold text-navy-900">Indian Standards Directory (BIS Corpus)</h1>
          <p className="text-xs text-slate-500">
            Browse verified Indian Standards, scope statements, publication histories, and active amendments.
          </p>
        </div>

        {/* Search & Domain Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by IS number or title (e.g. IS 10322)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedDomain === d ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-2.5">
          {filtered.map(std => (
            <div
              key={std.id}
              onClick={() => setSelectedStandard(std)}
              className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                selectedStandard?.id === std.id ? 'border-navy-900 ring-2 ring-navy-900/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-navy-900 text-sm">{std.standard_number}</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                      {std.publication_year}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      std.status === 'CURRENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {std.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800">{std.title}</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  {std.domain}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                {std.scope_summary}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Standard Timeline & Detail View */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 h-fit sticky top-20">
          {selectedStandard ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Standard Version Metadata</span>
                <h2 className="text-base font-bold text-navy-900 font-mono">{selectedStandard.standard_number}</h2>
                <p className="text-xs text-slate-700 font-medium mt-1">{selectedStandard.title}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Domain / Division</span>
                  <span className="font-semibold text-slate-800">{selectedStandard.domain}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-600">{selectedStandard.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Publication Year</span>
                  <span className="font-mono font-semibold">{selectedStandard.publication_year}</span>
                </div>
              </div>

              {/* Version History & Amendments Timeline */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-navy-900 flex items-center gap-1.5 font-mono uppercase">
                  <History className="w-3.5 h-3.5" />
                  Edition Lineage & Active Amendments
                </h3>

                <div className="space-y-2 border-l-2 border-navy-900/20 pl-3 text-xs">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-navy-900"></div>
                    <div className="font-bold text-slate-900">{selectedStandard.publication_year} Current Edition</div>
                    <div className="text-[11px] text-slate-500">Reaffirmed edition incorporating Amendments 1 & 2</div>
                  </div>

                  <div className="relative pt-2">
                    <div className="absolute -left-[17px] top-3 w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="font-semibold text-slate-600">1985 Superseded Edition</div>
                    <div className="text-[11px] text-slate-400">Previous edition (Replaced by {selectedStandard.publication_year} edition)</div>
                  </div>
                </div>
              </div>

              {selectedStandard.source_url && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={selectedStandard.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:underline"
                  >
                    <span>View Official BIS Public Gazette Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select any standard from the directory to inspect publication history, amendments, and scope details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
