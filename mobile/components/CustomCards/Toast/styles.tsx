import { StyleSheet } from 'react-native';
import { radii, spacing } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  containerLoading: { backgroundColor: '#6D28D9' },
  containerSuccess: { backgroundColor: '#064E3B' },
  containerError:   { backgroundColor: '#7F1D1D' },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxLoading: { backgroundColor: 'rgba(255,255,255,0.2)' },
  iconBoxSuccess: { backgroundColor: 'rgba(16,185,129,0.3)' },
  iconBoxError:   { backgroundColor: 'rgba(239,68,68,0.3)' },
  iconText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  textBlock: { flex: 1 },
  message: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
  },
  sub: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },
});

export default styles;
