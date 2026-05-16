import * as SecureStore from 'expo-secure-store';
import type {
  CategoryBreakdownEntry,
  LoginResponse,
  User,
  Operation,
  Category,
  ReportDetail,
  ReportSummary,
  ReportTotals,
  Wallet,
  WalletDetail,
} from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

const TOKEN_KEY = 'zerox_access_token';
const REFRESH_KEY = 'zerox_refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;

// --- Token Management ---

export async function loadTokens(): Promise<boolean> {
  accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  return !!accessToken;
}

async function saveTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  refreshToken = refresh;
  await SecureStore.setItemAsync(TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// --- HTTP Layer ---

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    await saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.msg || 'Request failed', res.status);
  }
  return data;
}

// --- Auth Endpoints ---

export const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await saveTokens(data.access_token, data.refresh_token);
    return data;
  },

  register: (email: string, password: string, confirmPassword: string) =>
    request<{ msg: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        confirm_password: confirmPassword,
      }),
    }),

  verifyEmail: async (_email: string, _code: string): Promise<{ msg: string }> => {
    // TODO: enable once the API exposes /users/verify.
    // return request<{ msg: string }>('/users/verify', {
    //   method: 'POST',
    //   body: JSON.stringify({ email: _email, code: _code }),
    // });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { msg: 'OK' };
  },

  resendVerification: async (_email: string): Promise<{ msg: string }> => {
    // TODO: enable once the API exposes /users/verify/resend.
    // return request<{ msg: string }>('/users/verify/resend', {
    //   method: 'POST',
    //   body: JSON.stringify({ email: _email }),
    // });
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { msg: 'OK' };
  },

  logout: async (): Promise<void> => {
    try {
      await request('/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } finally {
      await clearTokens();
    }
  },
};

// --- User Endpoints ---

export const users = {
  me: () => request<{ msg: string; user: User }>('/users/me'),

  changePassword: (oldPw: string, newPw: string, confirmPw: string) =>
    request<{ msg: string }>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({
        old_password: oldPw,
        new_password: newPw,
        confirm_password: confirmPw,
      }),
    }),

  changeUsername: (username: string) =>
    request<{ msg: string }>('/users/me/username', {
      method: 'PATCH',
      body: JSON.stringify({ username }),
    }),

  deleteAccount: () =>
    request<{ msg: string }>('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  uploadAvatar: (formData: FormData) =>
    request<{ msg: string }>('/users/me/avatar', {
      method: 'PATCH',
      body: formData,
    }),
};

// --- Report Endpoints ---

export type ReportListParams = {
  cursor?: string | null;
  limit?: number;
  year?: number | null;
};

export type ReportListResponse = {
  msg: string;
  reports: ReportSummary[];
  next_cursor: string | null;
  totals: ReportTotals;
};

export type ReportDetailResponse = {
  msg: string;
  report: ReportDetail;
  operations: Operation[];
  next_cursor: string | null;
};

function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${qs}`;
}

export const reports = {
  list: (params: ReportListParams = {}) =>
    request<ReportListResponse>(
      `/reports${buildQuery({
        cursor: params.cursor,
        limit: params.limit,
        year: params.year,
      })}`,
    ),

  get: (
    uuid: string,
    params: { cursor?: string | null; limit?: number } = {},
  ) =>
    request<ReportDetailResponse>(
      `/reports/${uuid}${buildQuery({
        cursor: params.cursor,
        limit: params.limit,
      })}`,
    ),

  upload: async (fileUri: string, fileName: string) => {
    const formData = new FormData();
    const mimeType = fileName.endsWith('.csv')
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
    return request<{ msg: string }>('/reports', {
      method: 'POST',
      body: formData,
    });
  },

  delete: (uuid: string) =>
    request<{ msg: string }>(`/reports/${uuid}`, { method: 'DELETE' }),
};

// --- Operation Endpoints ---

export type OperationListParams = {
  cursor?: string | null;
  limit?: number;
  year?: number | null;
  categoryUuid?: string;
};

export type OperationListResponse = {
  msg: string;
  operations: Operation[];
  next_cursor: string | null;
};

export type OperationsByCategoryResponse = {
  msg: string;
  categories: CategoryBreakdownEntry[];
  total_expenses: number;
  total_operation_count: number;
};

export const operations = {
  list: (params: OperationListParams = {}) =>
    request<OperationListResponse>(
      `/operations${buildQuery({
        cursor: params.cursor,
        limit: params.limit,
        year: params.year,
        category_uuid: params.categoryUuid,
      })}`,
    ),

  byCategory: (params: { year?: number | null } = {}) =>
    request<OperationsByCategoryResponse>(
      `/operations/by-category${buildQuery({ year: params.year })}`,
    ),

  get: (uuid: string) =>
    request<{ msg: string; operation: Operation }>(`/operations/${uuid}`),

  changeCategory: (uuid: string, categoryUuid: string) =>
    request<{ msg: string }>(`/operations/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify({ category: categoryUuid }),
    }),
};

// --- Category Endpoints ---

export const categories = {
  list: () =>
    request<{ msg: string; categories: Category[] }>('/categories'),
};

// --- Wallet Endpoints ---

export const wallets = {
  list: () => request<{ msg: string; wallets: Wallet[] }>('/wallets'),

  get: (uuid: string) =>
    request<{ msg: string; wallet: WalletDetail }>(`/wallets/${uuid}`),

  add: (xpub: string) =>
    request<{ msg: string }>('/wallets', {
      method: 'POST',
      body: JSON.stringify({ xpub }),
    }),

  delete: (uuid: string) =>
    request<{ msg: string }>(`/wallets/${uuid}`, { method: 'DELETE' }),
};
