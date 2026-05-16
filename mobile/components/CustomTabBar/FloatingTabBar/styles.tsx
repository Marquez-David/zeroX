import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@lib/theme';

export const ADD_BUTTON_SIZE = 36;

const styles = StyleSheet.create({
  // Wrapper sits at the bottom of the screen and reserves the safe-area
  // height so the home indicator / gesture area doesn't overlap the bar.
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  labelActive: {
    color: colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
  labelInactive: {
    color: colors.text.secondary,
  },

  // Add button lives in the center column. Same `flex: 1` as the other tabs
  // so the row stays evenly spaced; the visual emphasis comes from the
  // gradient circle, not from breaking the layout.
  addTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  addCircle: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addPressed: {
    transform: [{ scale: 0.94 }],
  },
  addDisabled: {
    opacity: 0.6,
  },
});

export default styles;
