import { KpiCsRecord, KpiFosRecord, MonitoringRecord, TemplateRecord, KnowledgeRecord, ActivityLog, SystemSettings, User } from '../types';

// Read session headers for auditing on backend
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const stored = localStorage.getItem('grapari_session');
  if (stored) {
    try {
      const session = JSON.parse(stored);
      if (session?.user) {
        headers['X-User-Name'] = session.user.name || 'Unknown';
        headers['X-User-Role'] = session.user.role || 'Customer Service';
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
}

export async function loginApi(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Server rejected credentials');
  }
  return res.json();
}

export async function fetchSheetData<T>(sheetName: string): Promise<T[]> {
  const res = await fetch(`/api/data/${sheetName}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch sheet ${sheetName}`);
  return res.json();
}

export async function createRecord(sheetName: string, data: any): Promise<any> {
  const res = await fetch(`/api/data/${sheetName}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to create record in ${sheetName}`);
  return res.json();
}

export async function updateRecord(sheetName: string, id: string, data: any): Promise<any> {
  const res = await fetch(`/api/data/${sheetName}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to update record ${id} in ${sheetName}`);
  return res.json();
}

export async function deleteRecord(sheetName: string, id: string): Promise<any> {
  const res = await fetch(`/api/data/${sheetName}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete record ${id} in ${sheetName}`);
  return res.json();
}

export async function bulkImportRecords(sheetName: string, data: any[]): Promise<any> {
  const res = await fetch(`/api/data/import/${sheetName}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data })
  });
  if (!res.ok) throw new Error(`Failed to bulk import into ${sheetName}`);
  return res.json();
}

export async function askSpotlightAi(prompt: string, chatHistory: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await fetch('/api/ai-assistant', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, chatHistory })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI Assistant communication failed');
  }
  const data = await res.json();
  return data.response;
}

export const apiService = {
  login: loginApi,
  fetchSheetData,
  createRecord,
  updateRecord,
  deleteRecord,
  bulkImportRecords,
  askSpotlightAi,
  askAiAssistant: async (prompt: string, role: string) => {
    return askSpotlightAi(prompt, [{ role: 'user', content: `Current user role is: ${role}` }]);
  }
};

