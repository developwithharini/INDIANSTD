import React, { useState, useRef } from 'react';
import { Upload, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text?: string, title?: string, file?: File) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleQueries = [
    { label: 'Outdoor LED Streetlights', query: 'Procurement of 500 outdoor LED streetlight luminaires for municipal roads. They should be weather resistant (IP66), energy efficient and suitable for outdoor use with 10kV surge protection.' },
    { label: 'Industrial Safety Helmet', query: 'Procurement of 1,000 industrial safety helmets with shock absorption, chin strap tension testing, and penetration resistance for high-risk construction sites.' },
    { label: 'Steel Rebar', query: 'Supply of 200 metric tonnes high strength deformed steel reinforcement bars grade Fe 500D for structural bridge construction.' },
    { label: 'Office Work Chair', query: 'Procurement of 150 ergonomic executive work chairs with metal base, lumbar support, and durability compliance.' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onAnalyze(undefined, selectedFile.name, selectedFile);
    } else if (inputText.trim()) {
      onAnalyze(inputText.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">MANAK</h1>
        <p className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
          Indian Standards Recommendation Engine
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">What are you procuring?</h2>
          <p className="text-xs text-slate-500">
            Describe a requirement or upload a specification to identify relevant Indian Standards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (selectedFile) setSelectedFile(null);
            }}
            placeholder="Describe product parameters (e.g. I need 500 outdoor LED street lights for municipal roads requiring IP66 weather resistance and 10kV surge protection)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all font-sans leading-relaxed"
          />

          {/* Selected File Indicator */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-navy-50 border border-navy-200 rounded-lg px-3.5 py-2.5 text-xs text-navy-900 font-mono">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-navy-700" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-slate-200"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF / Document</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedFile}
              className="bg-navy-900 hover:bg-navy-800 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-xs shrink-0"
            >
              <span>Analyze requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Try an Example */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Try an example:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample.query);
                setSelectedFile(null);
                onAnalyze(sample.query, sample.label);
              }}
              className="bg-white hover:bg-slate-50 hover:border-navy-900 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-2xs"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
