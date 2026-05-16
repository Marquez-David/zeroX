import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Bitcoin } from 'lucide-react-native';

import { detectCrypto, truncateMiddle } from '@lib/format';

import styles from './styles';

type WalletRowProps = {
  index: number;
  xpub: string;
  onPress: () => void;
};

const WalletRow = ({ index, xpub, onPress }: WalletRowProps) => {
  const crypto = detectCrypto(xpub);
  const isBtc = crypto.symbol === 'BTC';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconCircle, { backgroundColor: crypto.bg }]}>
        {isBtc
          ? <Bitcoin size={20} color={crypto.color} strokeWidth={2.5} />
          : <Text style={[styles.iconText, { color: crypto.color }]}>{crypto.symbol[0]}</Text>
        }
      </View>
      <View style={styles.info}>
        <Text style={styles.xpub} numberOfLines={1}>
          {truncateMiddle(xpub, 10, 6)}
        </Text>
        <Text style={styles.sub}>Wallet {index + 1} · {crypto.name}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: crypto.bg }]}>
        <Text style={[styles.badgeText, { color: crypto.color }]}>{crypto.symbol}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default WalletRow;
