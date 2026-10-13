import { API_BASE } from './config';

export type Status = 'likely_eligible' | 'needs_verification' | 'not_eligible';

export interface Source {
  short_description?: string;
  benefit_details?: string;
  docs?: string[];
  contact?: string[];
  url?: string;
}

export interface Benefit {
  slug?: string;
  name: string;
  status: Status;
  explanation: string;
  missing_information?: string[];
  sources?: Source[];
}

export interface Analysis {
  summary?: string;
  benefits?: Benefit[];
  follow_up_questions?: string[];
  additional_benefits?: { slug: string; name?: string }[];
  coverage_warning?: string;
}

export interface Stats {
  total_inquiries?: number;
  avg_ai_response_sec?: number;
  top_benefits?: { benefit: string; count: number }[];
  category_breakdown?: { category: string; count: number }[];
}

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`;
}

async function postJson<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`การวิเคราะห์ใช้เวลานานเกิน ${Math.round((timeoutMs ?? 0) / 1000)} วินาที`);
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// POST /analyze-rights — timeout 60 วินาที (Render ฟรีอาจต้องปลุกเซิร์ฟเวอร์ก่อน)
export const analyzeRights = (text: string) =>
  postJson<Analysis>('/analyze-rights', { text }, 60000);

// POST /analyze-more-rights — วิเคราะห์สิทธิที่เหลือ
export const analyzeMoreRights = (text: string, benefit_slugs: string[]) =>
  postJson<Analysis>('/analyze-more-rights', { text, benefit_slugs }, 60000);

// POST /suggest-input — ตัวช่วยแนะนำข้อมูลระหว่างพิมพ์
export const suggestInput = (text: string) =>
  postJson<{ status?: string; suggestion?: string }>('/suggest-input', { text }, 30000);

// GET /stats — สถิติสำหรับแดชบอร์ด
export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('stats failed');
  return (await res.json()) as Stats;
}
