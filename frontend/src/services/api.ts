import {
  ProcurementAnalysisResponse, Standard, GraphData, QCO, WatchlistItem
} from '../types';

const API_BASE = '/api/v1';

export async function analyzeProcurement(requirementText: string, language: string = 'en', title?: string): Promise<ProcurementAnalysisResponse> {
  const res = await fetch(`${API_BASE}/procurements/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirement_text: requirementText, language, title })
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function uploadTenderDocument(file: File): Promise<ProcurementAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/procurements/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Upload analysis failed');
  return res.json();
}

export async function fetchStandards(query?: string, domain?: string): Promise<Standard[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (domain) params.append('domain', domain);
  const res = await fetch(`${API_BASE}/standards?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch standards');
  return res.json();
}

export async function fetchStandardDetail(id: string): Promise<Standard> {
  const res = await fetch(`${API_BASE}/standards/${id}`);
  if (!res.ok) throw new Error('Failed to fetch standard detail');
  return res.json();
}

export async function fetchGraphData(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/procurements/req_default/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

export async function fetchQCOs(): Promise<QCO[]> {
  const res = await fetch(`${API_BASE}/regulations/qcos`);
  if (!res.ok) throw new Error('Failed to fetch QCOs');
  return res.json();
}

export async function fetchWatchlists(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE}/watchlists`);
  if (!res.ok) throw new Error('Failed to fetch watchlists');
  return res.json();
}

export async function addToWatchlist(standardId: string): Promise<void> {
  await fetch(`${API_BASE}/watchlists?standard_id=${encodeURIComponent(standardId)}`, {
    method: 'POST'
  });
}

export async function generateSpecification(requestId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/procurements/${requestId}/generate-specification`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate specification');
  return res.json();
}

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) return { status: 'degraded' };
  return res.json();
}

export async function fetchMetrics(): Promise<any> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) return {};
  return res.json();
}
