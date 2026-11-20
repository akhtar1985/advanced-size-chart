import { apiFetch } from './session.js';

export async function fetchFeedback() {
  try {
    const data = await apiFetch('/api/feedback');
    return { total: Number(data?.total) || 0, charts: data?.charts ?? {}, error: '' };
  } catch (error) {
    return { total: 0, charts: {}, error: error instanceof Error ? error.message : 'Could not load feedback.' };
  }
}
