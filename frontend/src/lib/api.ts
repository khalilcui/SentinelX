import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export const api = axios.create({
  baseURL: `${apiBaseUrl}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinelx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface SecurityHeadersResult {
  present: Record<string, string>;
  missing: { header: string; description: string }[];
  score: number;
}

export interface CookieSecurityResult {
  cookies_found: number;
  issues: { cookie: string; missing_flags: string[] }[];
  note?: string;
}

export interface TextResourceResult {
  found: boolean;
  status_code?: number;
  url: string;
  preview?: string | null;
  error?: string;
}

export interface SslInfoResult {
  valid: boolean;
  issuer?: string;
  expires?: string;
  days_remaining?: number;
  expiring_soon?: boolean;
  error?: string;
}

export interface WebsiteAssessmentResult {
  id: string;
  target_url: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  ssl_info: SslInfoResult;
  security_headers: SecurityHeadersResult;
  cookie_security: CookieSecurityResult;
  robots_txt: TextResourceResult;
  sitemap_xml: TextResourceResult;
  tech_stack: Record<string, string>;
  recommendations: string[];
  created_at: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  assessment_id: string;
  target_url: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface OpenPort {
  port: number;
  service: string;
  state: string;
  response_time_ms: number;
  banner: string | null;
}

export interface OsGuess {
  guess: string;
  confidence: 'none' | 'low' | 'medium' | 'high';
  basis: string;
}

export interface NetworkAssessmentResult {
  id: string;
  target_host: string;
  resolved_ip: string | null;
  host_up: 'up' | 'down';
  response_time_ms: number | null;
  open_ports: OpenPort[];
  os_guess: OsGuess;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  created_at: string;
}
