import React, { useState } from 'react';
import { 
  LayoutDashboard, PlusCircle, FolderKanban, BookOpen, Network, 
  FileCheck, ShieldAlert, Eye, Settings, Search, Globe, Bell, 
  Play, Sparkles, CheckCircle2, Server
} from 'lucide-react';
import { CommandPalette } from '../common/CommandPalette';

interface AppShellProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onRunDemo: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  onRunDemo,
  language,
  onLanguageChange,
  children
}) => {
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'new_analysis', label: 'New Analysis', icon: PlusCircle },
    { id: 'standards', label: 'Standards Registry', icon: BookOpen },
    { id: 'graph', label: 'Standards Graph', icon: Network },
    { id: 'audit', label: 'Tender Auditor', icon: FileCheck },
    { id: 'specification', label: 'Specification Builder', icon: FolderKanban },
    { id: 'regulations', label: 'Regulations & QCOs', icon: ShieldAlert },
    { id: 'watchlists', label: 'Watchlists & Alerts', icon: Eye },
    { id: 'admin', label: 'Data Control Center', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="bg-navy-900 text-white font-bold tracking-wider px-2.5 py-1 rounded text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            MANAK
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs text-slate-500 font-medium hidden md:block">
            Standards Intelligence & Procurement Workspace
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Command Palette Button */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search standards or commands...</span>
            <kbd className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 border border-slate-200">⌘K</kbd>
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 ml-2 text-slate-400 hidden sm:block" />
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-all ${language === 'en' ? 'bg-white text-navy-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded-md transition-all ${language === 'hi' ? 'bg-white text-navy-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-1 rounded-md transition-all ${language === 'ta' ? 'bg-white text-navy-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              தமிழ்
            </button>
          </div>

          {/* Single-Click Demo Runner */}
          <button
            onClick={onRunDemo}
            className="bg-navy-900 hover:bg-navy-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current text-emerald-400" />
            <span>Run Example</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Procurement Workbench
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Status Info */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                BIS Published Dataset
              </span>
              <span className="text-emerald-700 font-bold">2,654 Loaded</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              2,654 BIS Standards • 3 QCOs Active
            </div>
          </div>
        </aside>


        {/* Mobile Nav Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around p-2">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded-lg flex flex-col items-center text-[10px] font-medium ${
                  isActive ? 'text-navy-900 bg-slate-100' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 mb-12 md:mb-0">
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onNavigate={onNavigate}
        onRunDemo={onRunDemo}
      />
    </div>
  );
};
