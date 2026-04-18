export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F7',
  border: '#ECECEF',
  primary: {
    700: '#5B21B6',
    600: '#6D28D9',
    500: '#8B5CF6',
    100: '#EDE9FE',
    50: '#F5F3FF',
  },
  success: {
    500: '#10B981',
    50: '#ECFDF5',
  },
  error: {
    500: '#EF4444',
    50: '#FEF2F2',
  },
  warning: {
    500: '#F59E0B',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
  white: '#FFFFFF',
};

export const typography = {
  largeTitle: {
    fontSize: 44,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
    lineHeight: 50,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text.primary,
  },
  bodyRegular: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
  },
  small: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.text.muted,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screenPadding: 24,
  sectionGap: 24,
  cardGap: 12,
  scrollBottom: 96,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 32,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingButton: {
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
} as const;

export const categoryColors = [
  '#6D28D9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#3B82F6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
] as const;
