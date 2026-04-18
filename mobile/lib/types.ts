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
}

export interface ReportDetail {
  uuid: string;
  date: string;
  balance: number;
  operations: Operation[];
}

// === Operations ===

export interface Operation {
  uuid: string;
  amount: number;
  date: string;
  concept: string;
  category: string;
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
