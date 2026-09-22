import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2, Edit3, Share2, Layers } from 'lucide-react';

export const SpecificationView: React.FC = () => {
  const [title, setTitle] = useState("Technical Specification: Municipal Outdoor LED Street Lighting Luminaires");
  const [sections, setSections] = useState([
    {
      num: "1.0",
      title: "Scope & Product Overview",
      content: "This specification governs technical, safety, testing, and quality parameters for supply of 500 Outdoor LED Streetlight Luminaires for municipal arterial roads."
    },
    {
      num: "2.0",
      title: "Mandatory Indian Standards (BIS)",
      content: "Supplied luminaires shall strictly comply with the following latest published Indian Standards:\n• IS 10322 (Part 5/Sec 1): 2012 — Luminaires: Particular Requirements - Fixed General Purpose Luminaires.\n• IS 10322 (Part 5/Sec 3): 2012 — Luminaires for Road and Street Lighting."
    },
    {
      num: "3.0",
      title: "Testing & Quality Norms",
      content: "• Electrical and photometric performance shall be tested in accordance with IS 16106:2012.\n• Photobiological optical hazard safety compliance shall conform to IS 16108:2012."
    },
    {
      num: "4.0",
      title: "Regulatory Compliance (QCO)",
      content: "Bidders must possess valid BIS Compulsory Registration Scheme (CRS) registration under Electronics and IT Goods Quality Control Order."
    }
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-navy-900">Procurement Specification Builder</h1>
          <p className="text-xs text-slate-500">
            Export ready-to-publish, evidence-backed procurement schedules compliant with BIS standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={() => alert("Specification exported as formatted DOCX file.")}
            className="bg-navy-900 hover:bg-navy-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* Specification Document Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
        <div className="border-b-2 border-navy-900 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">OFFICIAL PROCUREMENT SCHEDULE</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold text-navy-900 bg-transparent border-none focus:outline-hidden"
            />
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            <div>Doc Ref: SPEC-2026-LED-001</div>
            <div>Date: Sep 21, 2026</div>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-navy-900 text-sm">{sec.num}</span>
                <h3 className="font-bold text-slate-900 text-sm">{sec.title}</h3>
              </div>
              <textarea
                rows={3}
                value={sec.content}
                onChange={(e) => {
                  const updated = [...sections];
                  updated[idx].content = e.target.value;
                  setSections(updated);
                }}
                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-navy-900"
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Validated against BIS Corpus Snapshot 2026</span>
          <span>MANAK Procurement Workspace</span>
        </div>
      </div>
    </div>
  );
};
