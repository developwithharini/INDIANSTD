import React, { useState } from 'react';
import { 
  FileText, Upload, Play, ShieldAlert, ArrowRight, BookOpen, 
  CheckCircle2, Clock, AlertTriangle, Layers, Sparkles, FolderKanban
} from 'lucide-react';


interface OverviewViewProps {
  onAnalyze: (text: string, title?: string) => void;
  onFileUpload: (file: File) => void;
  onRunDemo: () => void;
  onNavigate: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onAnalyze, onFileUpload, onRunDemo, onNavigate
}) => {
  const [inputText, setInputText] = useState('');

  const sampleQueries = [
    { label: '500 Outdoor LED Streetlights (IP66, Municipal)', query: 'Procurement of 500 outdoor LED streetlight luminaires for municipal roads with IP66 protection, 10kV surge protection, and high energy efficacy per IS 10322:1985.' },
    { label: 'Industrial Safety Helmets (Construction Fe 500)', query: 'Procurement of 1,000 industrial safety helmets with shock absorption, chin strap tension testing, and penetration resistance for high-risk construction sites.' },
    { label: 'High Yield Strength Steel Rebars Fe 500D', query: 'Supply of 200 metric tonnes high strength deformed steel reinforcement bars grade Fe 500D for structural bridge construction.' },
    { label: 'Ergonomic Metal Office Work Chairs', query: 'Procurement of 150 ergonomic executive work chairs with metal base, lumbar support, and durability compliance.' }
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Prompt Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy-900">Good morning. What are you procuring?</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter a product description, technical parameters, or paste specification text to generate a version-aware, evidence-backed standards map.
            </p>
          </div>
          <button
            onClick={onRunDemo}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Guided Judge Demo</span>
          </button>
        </div>

        {/* Input Text Box */}
        <div className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Procurement of 500 outdoor LED streetlight luminaires for municipal roads requiring IP66 weatherproofing and 10kV surge protection..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-navy-900 font-sans"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 font-mono">Example Presets:</span>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.query);
                  onAnalyze(sample.query, sample.label);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors border border-slate-200"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* Upload File Zone */}
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Tender Document (PDF/DOCX)</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
              />
            </label>

            <button
              disabled={!inputText.trim()}
              onClick={() => onAnalyze(inputText)}
              className="bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Analyze Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Procurements</span>
          <div className="text-2xl font-extrabold text-navy-900 font-mono">7</div>
          <span className="text-[11px] text-emerald-600 font-medium">3 ready for tender</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Standards Watched</span>
          <div className="text-2xl font-extrabold text-navy-900 font-mono">18</div>
          <span className="text-[11px] text-slate-500 font-medium">100% current version</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Issues</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">5</div>
          <span className="text-[11px] text-amber-600 font-medium">2 blocking gaps</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regulatory QCOs</span>
          <div className="text-2xl font-extrabold text-navy-900 font-mono">3</div>
          <span className="text-[11px] text-emerald-600 font-medium">All verified</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corpus Freshness</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">100%</div>
          <span className="text-[11px] text-slate-500 font-medium">Updated Sep 2026</span>
        </div>
      </div>

      {/* Main Grid: Recent Procurements & Regulatory Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Procurements */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-slate-500" />
              Recent Procurement Specifications
            </h2>
            <button
              onClick={() => onNavigate('specification')}
              className="text-xs font-semibold text-navy-900 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Municipal Street Lighting Procurement 2026', items: '500 Units LED Luminaires', score: 82, stds: 4, date: 'Today' },
              { title: 'Industrial Safety Helmet Procurement', items: '1,000 Units Safety Helmets', score: 95, stds: 3, date: 'Yesterday' },
              { title: 'Structural Steel Rebars fe 500D Tender', items: '200 MT Reinforcement Bars', score: 91, stds: 2, date: '18 Sep 2026' }
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">{p.title}</div>
                  <div className="text-[11px] text-slate-500">{p.items} • {p.stds} standards mapped</div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs font-bold text-navy-900 font-mono">{p.score}/100</div>
                    <div className="text-[10px] text-slate-400 font-mono">Readiness</div>
                  </div>
                  <button
                    onClick={onRunDemo}
                    className="text-xs font-semibold text-navy-900 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors bg-white border border-slate-200"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Regulatory QCO Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Quality Control Orders (QCO)
            </h2>
            <button
              onClick={() => onNavigate('regulations')}
              className="text-xs font-semibold text-navy-900 hover:underline"
            >
              Registry
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Electronics & IT Goods QCO
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Mandatory BIS Compulsory Registration Scheme (CRS) for LED Streetlights & Controlgear.
              </p>
              <div className="text-[10px] text-amber-700 font-mono pt-1">Effective: Sep 2014 • MeitY</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">Protective Helmets QCO 2020</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Mandatory BIS Scheme-I (ISI Mark) under MoRTH for two-wheeler motorcyclist helmets.
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1">Effective: Jun 2021 • MoRTH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
