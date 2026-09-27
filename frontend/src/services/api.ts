import { AnalysisResponse, StandardDetail } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function analyzeRequirement(
  text?: string,
  title?: string,
  file?: File
): Promise<AnalysisResponse> {
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (title) formData.append('title', title);
  if (file) formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Analysis request failed.');
  }

  return res.json();
}

export async function getStandardDetail(id: string): Promise<StandardDetail> {
  const res = await fetch(`${API_BASE_URL}/standards/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch standard details.');
  }
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
