import type { ApiResponse } from "../types";

export const TOKEN_KEY = "tongue_access_token";
export const USER_KEY = "tongue_current_user";
export const API_BASE_KEY = "tongue_api_base";
export const DEFAULT_API_BASE = "http://127.0.0.1:8080";

export class ApiError extends Error {
  code: number;
  traceId?: string;

  constructor(message: string, code = -1, traceId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.traceId = traceId;
  }
}

export function getApiBase() {
  const saved = localStorage.getItem(API_BASE_KEY);
  if (!saved || !saved.trim()) return DEFAULT_API_BASE;
  const normalized = normalizeApiBase(saved);
  if (normalized !== saved.trim()) {
    localStorage.setItem(API_BASE_KEY, normalized);
  }
  return normalized;
}

export function setApiBase(baseUrl: string) {
  const normalized = normalizeApiBase(baseUrl);
  localStorage.setItem(API_BASE_KEY, normalized || DEFAULT_API_BASE);
}

function normalizeApiBase(baseUrl: string) {
  const normalized = baseUrl.trim().replace(/\/$/, "");
  if (!normalized) return DEFAULT_API_BASE;
  if (/^https?:\/\/(127\.0\.0\.1|localhost):51(73|74|75)$/i.test(normalized)) {
    return DEFAULT_API_BASE;
  }
  return normalized;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  let requestBody: BodyInit | undefined;
  if (options.body instanceof FormData) {
    requestBody = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(options.body);
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const requestUrl = `${getApiBase()}${path}`;
  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: options.method || "GET",
      headers,
      body: requestBody,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "网络请求被浏览器拦截或后端不可达";
    throw new ApiError(`无法连接后端：${requestUrl}。请确认 Java 后端已启动，且后端地址为 ${DEFAULT_API_BASE}。原始错误：${message}`);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (payload && payload.code !== 0) {
    throw new ApiError(`${payload.message || "接口返回错误"}（HTTP ${response.status}，地址：${requestUrl}）`, payload.code, payload.traceId);
  }
  if (!response.ok || !payload) {
    const frontendPortHint = /:51(73|74|75)\b/.test(requestUrl)
      ? " 当前请求地址像是前端 Vite 服务，请把登录页后端地址改为 http://127.0.0.1:8080。"
      : "";
    throw new ApiError(`请求失败：HTTP ${response.status}，地址：${requestUrl}。${frontendPortHint}`);
  }
  return normalizeResponseData(payload.data) as T;
}

function normalizeResponseData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeResponseData(item));
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const normalized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    const normalizedValue = normalizeResponseData(item);
    normalized[key] = normalizedValue;
    const camelKey = toCamelCase(key);
    if (camelKey !== key) {
      normalized[camelKey] = normalizedValue;
    }
  }
  return normalized;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toCamelCase(key: string) {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}
