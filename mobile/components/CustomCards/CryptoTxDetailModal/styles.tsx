import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const BACKDROP_COLOR = 'rgba(0,0,0,0.45)';
const NOTCH_SIZE = 22;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BACKDROP_COLOR },
  flex: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center' },
  cardShadow: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.xl,
    ...shadows.cardHover,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  heroAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  heroType: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.secondary,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  typePillText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },

  // Seam
  seam: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  notch: {
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    backgroundColor: BACKDROP_COLOR,
    position: 'absolute',
    top: '50%',
    marginTop: -NOTCH_SIZE / 2,
  },
  notchLeft:  { left: -NOTCH_SIZE / 2 },
  notchRight: { right: -NOTCH_SIZE / 2 },
  dashed: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: NOTCH_SIZE / 2 + spacing.sm,
  },
  dashedDot: {
    width: 6,
    height: 1.5,
    backgroundColor: colors.gray[300],
  },

  // Detail rows
  details: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: {
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.muted,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  detailValueMono: {
    fontFamily: 'Inter-Medium',
    letterSpacing: 1.0,
    color: colors.text.secondary,
    fontSize: 11,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radii.full,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  statusChipText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
});

export default styles;
