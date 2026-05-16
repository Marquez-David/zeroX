import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const BACKDROP_COLOR = 'rgba(0,0,0,0.45)';
const NOTCH_SIZE = 22;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
  },
  flex: {
    flex: 1,
  },
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },

  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroConcept: {
    ...typography.sectionTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  heroAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },

  seam: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -spacing.lg,
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
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    fontFamily: 'Inter-Medium',
    color: colors.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  detailValueBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
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
    letterSpacing: 1.5,
    color: colors.text.secondary,
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

  // Category picker (nested modal)
  pickerBackdrop: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '75%',
  },
  pickerHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.gray[300],
    marginBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.md,
  },
  pickerList: {
    flexGrow: 0,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  pickerIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
});

export default styles;
