import React, { useState } from 'react';
import { 
  FileCheck, Upload, AlertOctagon, AlertTriangle, Info, CheckCircle2, 
  FileText, Plus, X, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { TenderFinding, SpecificationReadiness } from '../types';
import { uploadTenderDocument } from '../services/api';

interface TenderAuditorViewProps {
  onAuditComplete: (results: any) => void;
  onFileUpload: (file: File) => void;
}

export const TenderAuditorView: React.FC<TenderAuditorViewProps> = ({
  onAuditComplete, onFileUpload
}) => {
  const [tenderText, setTenderText] = useState(
    "TECHNICAL SPECIFICATION FOR MUNICIPAL LED STREET LIGHTS:\n" +
    "1. Scope: Supply of 500 units outdoor LED luminaires for city arterial roads.\n" +
    "2. Technical Norms: Luminaires shall strictly comply with IS 10322:1985.\n" +
    "3. Quality: Products must be high quality, durable, and heavy duty.\n" +
    "4. Efficacy: Minimum efficacy shall be 120 lm/W."
  );

  const [findings, setFindings] = useState<TenderFinding[]>([
    {
      id: 'find_outdated_10322',
      category: 'OUTDATED_REF',
      severity: 'BLOCKING',
      title: 'Outdated Standard Reference (IS 10322:1985)',
      description: 'The tender references IS 10322:1985 which was SUPERSEDED by IS 10322 (Part 5/Sec 1): 2012.',
      evidence_text: 'Clause 2 text: "strictly comply with IS 10322:1985"',
      suggested_fix: 'Update standard reference to IS 10322 (Part 5/Sec 1): 2012.',
      related_standard_id: 'IS_10322_5_1_2012',
      status: 'OPEN'
    },
    {
      id: 'find_missing_test_16106',
      category: 'MISSING_TEST',
      severity: 'HIGH',
      title: 'Missing Photometric Test Method Standard (IS 16106:2012)',
      description: 'Lumen output and photometric efficacy are specified without referencing the normative test method IS 16106:2012.',
      evidence_text: 'Clause 4 text: "Minimum efficacy shall be 120 lm/W"',
      suggested_fix: 'Insert clause: "Electrical and photometric measurements shall be tested in accordance with IS 16106:2012."',
      related_standard_id: 'IS_16106_2012',
      status: 'OPEN'
    },
    {
      id: 'find_qco_gap_led',
      category: 'REGULATORY_GAP',
      severity: 'BLOCKING',
      title: 'Missing Mandatory BIS QCO CRS Certification Requirement',
      description: 'LED Luminaires are subject to mandatory MeitY Quality Control Order CRS registration.',
      evidence_text: 'Missing compulsory registration schedule clause',
      suggested_fix: 'Mandate: "Bidders must possess valid BIS CRS registration under Electronics and IT Goods QCO."',
      related_standard_id: 'IS_10322_5_3_2012',
      status: 'OPEN'
    },
    {
      id: 'find_ambiguous_words',
      category: 'AMBIGUOUS_PHRASE',
      severity: 'MEDIUM',
      title: 'Ambiguous Subjective Terms ("High Quality", "Heavy Duty")',
      description: 'Phrasing like "high quality" and "heavy duty" introduces inspection risk.',
      evidence_text: 'Clause 3 text: "Products must be high quality, durable, and heavy duty"',
      suggested_fix: 'Replace subjective words with measurable standard metrics (e.g. IP66 rating, IK08 impact resistance).',
      status: 'OPEN'
    }
  ]);

  const [readiness, setReadiness] = useState<SpecificationReadiness>({
    overall_score: 58.5,
    standard_coverage: 60.0,
    version_currency: 40.0,
    normative_coverage: 85.0,
    testing_coverage: 50.0,
    safety_coverage: 60.0,
    certification_coverage: 30.0,
    requirement_completeness: 70.0
  });

  const handleAction = (id: string, action: 'ACCEPT' | 'DISMISS') => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DISMISSED' } : f));
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'BLOCKING':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">BLOCKING</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded font-mono">HIGH RISK</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">{severity}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-navy-900" />
              Tender Document Specification Auditor
            </h1>
            <p className="text-xs text-slate-500">
              Audits tender text and PDF schedules for superseded standards, missing normative test methods, QCO regulatory gaps, and ambiguous phrasing.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-amber-600 font-mono">{readiness.overall_score}/100</div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Tender Readiness Score</div>
          </div>
        </div>

        {/* Input Text / Upload Controls */}
        <div className="space-y-2">
          <textarea
            rows={4}
            value={tenderText}
            onChange={(e) => setTenderText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-navy-900"
          />

          <div className="flex items-center justify-between">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF/DOCX Tender Document</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
              />
            </label>

            <button
              onClick={() => {
                // Re-run audit
                setReadiness({
                  overall_score: 74.0,
                  standard_coverage: 85.0,
                  version_currency: 80.0,
                  normative_coverage: 90.0,
                  testing_coverage: 80.0,
                  safety_coverage: 80.0,
                  certification_coverage: 70.0,
                  requirement_completeness: 85.0
                });
              }}
              className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Re-run Audit Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Findings & Readiness Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Audit Findings List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-navy-900 font-mono uppercase tracking-wider">
              Audit Findings & Recommended Clause Fixes ({findings.length})
            </h2>
          </div>

          <div className="space-y-3">
            {findings.map(finding => {
              const isResolved = finding.status !== 'OPEN';
              return (
                <div
                  key={finding.id}
                  className={`p-4 rounded-xl border bg-white space-y-3 transition-all ${
                    isResolved ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(finding.severity)}
                        <span className="text-xs font-bold text-slate-900">{finding.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{finding.description}</p>
                    </div>

                    {isResolved && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0">
                        {finding.status}
                      </span>
                    )}
                  </div>

                  {finding.evidence_text && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidence Excerpt:</span>
                      "{finding.evidence_text}"
                    </div>
                  )}

                  {finding.suggested_fix && (
                    <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block font-mono">Suggested Corrective Clause:</span>
                      <p className="font-medium">{finding.suggested_fix}</p>
                    </div>
                  )}

                  {!isResolved && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleAction(finding.id, 'DISMISS')}
                        className="px-3 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
                      >
                        Dismiss Finding
                      </button>
                      <button
                        onClick={() => handleAction(finding.id, 'ACCEPT')}
                        className="px-3 py-1 rounded text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert Fix into Tender</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Specification Readiness Dashboard */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 h-fit sticky top-20">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Readiness Breakdown</span>
            <h2 className="text-base font-bold text-navy-900 font-mono">Readiness Metrics</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Standard Coverage (20%)</span>
                <span className="font-mono font-bold">{readiness.standard_coverage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-navy-900 h-full" style={{ width: `${readiness.standard_coverage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Version Currency (20%)</span>
                <span className="font-mono font-bold">{readiness.version_currency}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-amber-500 h-full" style={{ width: `${readiness.version_currency}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Test Method Coverage (15%)</span>
                <span className="font-mono font-bold">{readiness.testing_coverage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-navy-900 h-full" style={{ width: `${readiness.testing_coverage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>QCO Regulatory Coverage (10%)</span>
                <span className="font-mono font-bold">{readiness.certification_coverage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-red-500 h-full" style={{ width: `${readiness.certification_coverage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
