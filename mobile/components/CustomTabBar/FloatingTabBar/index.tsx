import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Bitcoin, House, LayoutGrid, Plus, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useUploadReportMutation } from '@hooks/queries/reports';
import { colors } from '@lib/theme';

import styles, { ADD_BUTTON_SIZE } from './styles';

type TabSpec = {
  /** Route name registered in `(tabs)/_layout.tsx`. */
  name: string;
  /** Visible label under the icon. */
  label: string;
  icon: LucideIcon;
};

// Order on the bar: home / categories / [Add] / crypto / profile.
// The middle slot is the upload trigger (file picker), not a navigable route.
const NAV_TABS: TabSpec[] = [
  { name: 'home', label: 'Home', icon: House },
  { name: 'categories', label: 'Categories', icon: LayoutGrid },
  { name: 'crypto', label: 'Crypto', icon: Bitcoin },
  { name: 'profile', label: 'Profile', icon: User },
];

const FloatingTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const uploadMutation = useUploadReportMutation();

  const handleNavigate = (routeName: string) => {
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    if (routeIndex < 0 || state.index === routeIndex) return;
    navigation.navigate(routeName as never);
  };

  const handleUpload = async () => {
    if (uploadMutation.isPending) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/octet-stream',
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await uploadMutation.mutateAsync({ uri: asset.uri, name: asset.name });
      Alert.alert('Report uploaded');
    } catch {
      Alert.alert(
        'Could not upload report',
        'Please try again or pick a different file.',
      );
    }
  };

  const renderTab = (tab: TabSpec) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
    const isFocused = routeIndex >= 0 && state.index === routeIndex;
    const Icon = tab.icon;
    const tint = isFocused ? colors.primary[600] : colors.text.secondary;
    return (
      <Pressable
        key={tab.name}
        style={styles.tab}
        onPress={() => handleNavigate(tab.name)}
        hitSlop={4}
      >
        <Icon size={20} color={tint} strokeWidth={isFocused ? 2.5 : 2} />
        <Text
          style={[
            styles.label,
            isFocused ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  const [left1, left2, right1, right2] = NAV_TABS;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 4) }]}
    >
      <View style={styles.bar}>
        {renderTab(left1)}
        {renderTab(left2)}

        <Pressable
          onPress={handleUpload}
          disabled={uploadMutation.isPending}
          style={({ pressed }) => [
            styles.addTab,
            uploadMutation.isPending && styles.addDisabled,
            pressed && styles.addPressed,
          ]}
          hitSlop={4}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addCircle}
          >
            <Plus
              size={ADD_BUTTON_SIZE - 18}
              color={colors.white}
              strokeWidth={2.5}
            />
          </LinearGradient>
        </Pressable>

        {renderTab(right1)}
        {renderTab(right2)}
      </View>
    </View>
  );
};

export default FloatingTabBar;
