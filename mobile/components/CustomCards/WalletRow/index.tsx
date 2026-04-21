import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Bitcoin, ChevronRight } from 'lucide-react-native';

import { truncateMiddle } from '@lib/format';
import { walletsSettingsStrings } from '@lib/strings';
import { colors } from '@lib/theme';

import styles from './styles';

type WalletRowProps = {
  index: number;
  xpub: string;
  onPress: () => void;
  onDelete: () => void;
};

const WalletRow = ({ index, xpub, onPress, onDelete }: WalletRowProps) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={onDelete}
      activeOpacity={0.7}
    >
      <Text style={styles.deleteText}>{walletsSettingsStrings.confirm}</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Bitcoin size={20} color={colors.primary[600]} strokeWidth={2.5} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Wallet {index + 1}</Text>
          <Text style={styles.xpub} numberOfLines={1}>
            {truncateMiddle(xpub, 6, 4)}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.text.muted} />
      </TouchableOpacity>
    </Swipeable>
  );
};

export default WalletRow;
