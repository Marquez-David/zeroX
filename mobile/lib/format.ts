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

export function categoryColor(name: string | undefined | null): string {
  if (!name) return categoryColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

const normalizeCategory = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

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
