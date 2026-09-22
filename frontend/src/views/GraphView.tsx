import React, { useState, useEffect } from 'react';
import { Network, Filter, Info, ShieldCheck, Layers, RefreshCw } from 'lucide-react';
import { GraphData, GraphNode } from '../types';
import { fetchGraphData } from '../services/api';

export const GraphView: React.FC = () => {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [depth, setDepth] = useState<number>(2);

  useEffect(() => {
    fetchGraphData().then(data => {
      setGraph(data);
      if (data.nodes.length > 0) setSelectedNode(data.nodes[0]);
    }).catch(console.error);
  }, []);

  if (!graph) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-mono">
        Loading Standards Relationship Knowledge Graph...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-navy-900" />
            Standards Relationship Knowledge Graph
          </h1>
          <p className="text-xs text-slate-500">
            Visualizing normative references, mandatory test methods, and QCO regulatory governance links across the Indian Standards corpus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-500">Depth Hops:</span>
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`px-2 py-0.5 rounded font-bold ${depth === d ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchGraphData().then(setGraph)}
            className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Reset Canvas Layout"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Node Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Visual Graph Canvas Container */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[11px] font-mono bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-2xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-900"></span> Standard Node
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> QCO Regulatory Node
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Test Method
            </span>
          </div>

          {/* Interactive Graph Node Grid / Canvas Representation */}
          <div className="my-auto grid grid-cols-2 sm:grid-cols-3 gap-6 p-4">
            {graph.nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isQCO = node.type === 'QCO';
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-navy-900 shadow-md scale-102 bg-white' 
                      : 'hover:border-slate-300 shadow-2xs'
                  } ${
                    isQCO ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      isQCO ? 'bg-amber-100 text-amber-900' : 'bg-navy-900 text-white'
                    }`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{node.domain}</span>
                  </div>

                  <div className="font-bold text-slate-900 text-sm font-mono mt-2">
                    {node.label}
                  </div>

                  {/* Connected edges summary */}
                  <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200/60 flex justify-between">
                    <span>
                      {graph.edges.filter(e => e.source === node.id || e.target === node.id).length} Connected Links
                    </span>
                    <span className="text-navy-900 font-semibold">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center pt-4 border-t border-slate-100">
            Click any node to inspect relationship edges, normative test procedures, and governing gazette notices.
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4 h-fit sticky top-20">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Graph Inspector</span>
                <h2 className="text-base font-bold text-navy-900 font-mono">{selectedNode.label}</h2>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  Domain: {selectedNode.domain} • Type: {selectedNode.type}
                </div>
              </div>

              {/* Connected Relationships List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Outbound & Inbound Relationship Edges
                </h3>
                <div className="space-y-2 text-xs">
                  {graph.edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, idx) => {
                      const isSource = edge.source === selectedNode.id;
                      const connectedId = isSource ? edge.target : edge.source;
                      return (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-navy-900">
                              {isSource ? `→ ${edge.relationship}` : `← ${edge.relationship}`}
                            </span>
                            <span className="bg-white px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                              {connectedId}
                            </span>
                          </div>
                          {edge.evidence && (
                            <p className="text-[11px] text-slate-600 leading-snug italic">
                              "{edge.evidence}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a graph node to view detailed relationship edges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
