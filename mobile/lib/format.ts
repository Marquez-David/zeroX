import {
  ArrowLeftRight,
  Car,
  Coins,
  Film,
  GraduationCap,
  HeartPulse,
  Package,
  Plane,
  Plug,
  Receipt,
  Shirt,
  ShoppingBag,
  Sofa,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';

import { categoryColors } from './theme';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatMonthYear(isoDate: string): string {
  return MONTH_YEAR_FORMATTER.format(new Date(isoDate));
}

export function formatDate(isoDate: string): string {
  return DATE_FORMATTER.format(new Date(isoDate));
}

export function formatFullDate(isoDate: string): string {
  return FULL_DATE_FORMATTER.format(new Date(isoDate));
}

export function shortId(uuid: string): string {
  return uuid.split('-')[0].toUpperCase();
}

/**
 * Render a BTC amount with up to 8 decimals and no trailing zeros.
 * The ₿ prefix stays separate from the number so consumers can style them
 * independently if needed.
 */
export function formatBTC(value: number): string {
  if (!Number.isFinite(value)) return '₿ 0';
  const fixed = value.toFixed(8);
  const trimmed = parseFloat(fixed).toString();
  return `₿ ${trimmed}`;
}

export function truncateMiddle(text: string, prefix = 8, suffix = 6): string {
  if (text.length <= prefix + suffix + 1) return text;
  return `${text.slice(0, prefix)}…${text.slice(-suffix)}`;
}

const UNIX_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatUnixDate(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  // Blockstream returns UNIX seconds; guard in case the backend switches to ms.
  const ms = seconds > 1e12 ? seconds : seconds * 1000;
  return UNIX_DATE_FORMATTER.format(new Date(ms));
}

const normalizeCategory = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Explicit palette for the 13 known categories so each gets a distinctive
// colour (hash modulo 8 would collide). Falls back to hash for anything not
// in the map.
const CATEGORY_COLOR_MAP: Record<string, string> = {
  vivienda: '#6D28D9',
  'servicios basicos': '#F59E0B',
  alimentacion: '#10B981',
  transporte: '#3B82F6',
  salud: '#EF4444',
  educacion: '#8B5CF6',
  'ahorro e inversion': '#F97316',
  'entretenimiento y ocio': '#EC4899',
  'ropa y cuidado personal': '#06B6D4',
  'gastos varios': '#64748B',
  transferencias: '#84CC16',
  'viajes y billetes': '#22D3EE',
  'compras online': '#A855F7',
};

export function categoryColor(name: string | undefined | null): string {
  if (!name) return categoryColors[0];
  const key = normalizeCategory(name);
  const mapped = CATEGORY_COLOR_MAP[key];
  if (mapped) return mapped;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

export function withOpacity(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  vivienda: Sofa,
  'servicios basicos': Plug,
  alimentacion: UtensilsCrossed,
  transporte: Car,
  salud: HeartPulse,
  educacion: GraduationCap,
  'ahorro e inversion': Coins,
  'entretenimiento y ocio': Film,
  'ropa y cuidado personal': Shirt,
  'gastos varios': Receipt,
  transferencias: ArrowLeftRight,
  'viajes y billetes': Plane,
  'compras online': ShoppingBag,
};

export function categoryIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Package;
  return CATEGORY_ICONS[normalizeCategory(name)] ?? Package;
}

export function getInitials(nameOrEmail: string): string {
  const source = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0]
    : nameOrEmail;
  const parts = source.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
