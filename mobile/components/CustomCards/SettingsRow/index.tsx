import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import { colors } from '@lib/theme';

import styles from './styles';

type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  tint?: 'default' | 'danger';
  showChevron?: boolean;
  first?: boolean;
  last?: boolean;
  onPress?: () => void;
};

const SettingsRow = ({
  icon: Icon,
  label,
  value,
  tint = 'default',
  showChevron = true,
  first = false,
  last = false,
  onPress,
}: SettingsRowProps) => {
  const isDanger = tint === 'danger';
  const iconColor = isDanger ? colors.error[500] : colors.primary[600];
  const chevronColor = colors.text.muted;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.container, first && styles.first, last && styles.last]}
    >
      <View style={[styles.iconCircle, isDanger && styles.iconCircleDanger]}>
        <Icon size={18} color={iconColor} strokeWidth={2.5} />
      </View>
      <Text style={[styles.label, isDanger && styles.labelDanger]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {showChevron && onPress ? (
        <ChevronRight size={18} color={chevronColor} />
      ) : null}
    </TouchableOpacity>
  );
};

export default SettingsRow;
