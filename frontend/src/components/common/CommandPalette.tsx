import React, { useState, useEffect } from 'react';
import { Search, FileText, Network, ShieldCheck, Bookmark, Settings, Layers, PlayCircle, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onRunDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen, onClose, onNavigate, onRunDemo
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // toggle
          onClose(); // reset state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { icon: PlayCircle, label: 'Run Example Analysis (Municipal Streetlights)', action: () => { onRunDemo(); onClose(); }, category: 'Demo' },
    { icon: FileText, label: 'New Requirement Analysis', action: () => { onNavigate('new_analysis'); onClose(); }, category: 'Navigation' },
    { icon: FileText, label: 'Audit Tender Specification', action: () => { onNavigate('audit'); onClose(); }, category: 'Navigation' },
    { icon: Layers, label: 'Browse Indian Standards Database (BIS)', action: () => { onNavigate('standards'); onClose(); }, category: 'Navigation' },
    { icon: Network, label: 'Standards Relationship Graph Explorer', action: () => { onNavigate('graph'); onClose(); }, category: 'Navigation' },
    { icon: ShieldCheck, label: 'Quality Control Orders & Regulations Registry', action: () => { onNavigate('regulations'); onClose(); }, category: 'Navigation' },
    { icon: Bookmark, label: 'Standards Watchlist & Micro-Alerts', action: () => { onNavigate('watchlists'); onClose(); }, category: 'Navigation' },
    { icon: Settings, label: 'Admin Data Control Center', action: () => { onNavigate('admin'); onClose(); }, category: 'Navigation' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or search standards (⌘K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-hidden text-slate-900 placeholder:text-slate-400 text-sm font-medium"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={cmd.action}
                  className="w-full text-left p-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-navy-900 group-hover:text-white transition-colors text-slate-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{cmd.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-4 font-mono">
          <span>Navigate with 🪟 / ⌘K</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
