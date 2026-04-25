// === Auth ===

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  msg: string;
  access_token: string;
  refresh_token: string;
}

// === User ===

export interface User {
  uuid: string;
  email: string;
  username: string;
  created_at: string;
}

// === Reports ===

export interface ReportSummary {
  uuid: string;
  date: string;
  balance: number;
  income: number;
  expenses: number;
  operations_count: number;
}

export interface ReportDetail {
  uuid: string;
  date: string;
  balance: number;
  income: number;
  expenses: number;
}

export interface ReportTotals {
  balance: number;
  income: number;
  expenses: number;
}

// === Operations ===

export interface OperationCategory {
  uuid: string;
  name: string;
}

export interface Operation {
  uuid: string;
  amount: number;
  date: string;
  concept: string;
  category: OperationCategory;
}

export interface CategoryBreakdownEntry {
  uuid: string;
  name: string;
  expenses: number;
  operations: number;
}

// === Pagination ===

export interface Page<T> {
  items: T[];
  next_cursor: string | null;
}

// === Categories ===

export interface Category {
  uuid: string;
  name: string;
  description: string;
}

// === Wallets ===

export interface Wallet {
  uuid: string;
  xpub: string;
}

export interface WalletDetail {
  uuid: string;
  total_received: number;
  total_sent: number;
  current_balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  uuid: string;
  type: 'received' | 'sent' | 'internal';
  date: number;
  confirmed: boolean;
  amount: number;
  fee: number;
  origin_address: string;
  destination_address: string;
}
