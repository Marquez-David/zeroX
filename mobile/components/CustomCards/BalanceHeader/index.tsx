import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff } from 'lucide-react-native';

import Logo from '@assets/icons/Logo';
import { colors } from '@lib/theme';
import { formatCurrency, getInitials } from '@lib/format';
import { homeStrings } from '@lib/strings';

import styles from './styles';

type BalanceHeaderProps = {
  userName: string;
  totalBalance: number;
};

const Avatar = ({ name }: { name: string }) => (
  <LinearGradient
    colors={[colors.primary[500], colors.primary[700]]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.avatar}
  >
    <Text style={styles.avatarText}>{getInitials(name)}</Text>
  </LinearGradient>
);

const BalanceHeader = ({ userName, totalBalance }: BalanceHeaderProps) => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.logoBadge}>
          <Logo width={160} height={34} />
        </View>
        <Avatar name={userName} />
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.label}>{homeStrings.totalBalance}</Text>
        <TouchableOpacity onPress={() => setVisible(!visible)} hitSlop={8}>
          {visible ? (
            <Eye size={18} color={colors.text.muted} />
          ) : (
            <EyeOff size={18} color={colors.text.muted} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.balance}>
        {visible ? formatCurrency(totalBalance) : '••••••'}
      </Text>
    </View>
  );
};

export default BalanceHeader;
