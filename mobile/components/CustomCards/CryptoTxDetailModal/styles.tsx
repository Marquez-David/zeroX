import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const BACKDROP_COLOR = 'rgba(0,0,0,0.45)';
const NOTCH_SIZE = 22;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
  },
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
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

  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  typePillText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  heroType: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  heroAmount: {
    fontSize: 30,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },

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
  notchLeft: {
    left: -NOTCH_SIZE / 2,
  },
  notchRight: {
    right: -NOTCH_SIZE / 2,
  },
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

  details: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    fontFamily: 'Inter-Medium',
    color: colors.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  detailValueMono: {
    fontFamily: 'Inter-Medium',
    letterSpacing: 1.2,
    color: colors.text.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
});

export default styles;
