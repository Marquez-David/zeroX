import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import {
  Bitcoin,
  Camera,
  Lock,
  LogOut,
  Trash2,
  User,
} from 'lucide-react-native';

import SettingsRow from '@components/CustomCards/SettingsRow';
import { useLogoutMutation } from '@hooks/queries/auth';
import { useSession } from '@contexts/auth';
import { useDeleteAccountMutation, useUploadAvatarMutation } from '@hooks/queries/users';
import { useModal } from '@contexts/modal';
import { useWallets } from '@hooks/queries/wallets';
import { formatMonthYear } from '@lib/format';
import {
  deleteAccountStrings,
  profileStrings,
} from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

const initialsFromUser = (username?: string, email?: string): string => {
  const source = (username && username.trim()) || (email && email.split('@')[0]) || '?';
  const clean = source.replace(/[^A-Za-z0-9]/g, '');
  if (clean.length === 0) return '?';
  if (clean.length === 1) return clean[0].toUpperCase();
  return (clean[0] + clean[1]).toUpperCase();
};

const Profile = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useSession();
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  const logoutMutation = useLogoutMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const { confirm, toast } = useModal();

  const uploadMutation = useUploadAvatarMutation();

  const onAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(profileStrings.photoLibraryPermission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 256, height: 256 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );

    const formData = new FormData();
    formData.append('image', {
      uri: compressed.uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as unknown as Blob);

    uploadMutation.mutate(formData);
  };

  const onDeleteAccountPress = () => {
    confirm({
      title: deleteAccountStrings.title,
      body: deleteAccountStrings.body,
      confirmLabel: deleteAccountStrings.confirm,
      cancelLabel: deleteAccountStrings.cancel,
      variant: 'destructive',
      onConfirm: () => {
        toast({ message: 'Deleting account…', type: 'loading' });
        deleteAccountMutation.mutate(undefined, {
          onError: () => toast({ message: 'Could not delete account', type: 'error' }),
        });
      },
    });
  };

  const username = user?.username ?? '';
  const email = user?.email ?? '';
  const createdAt = user?.created_at;

  const walletCount = wallets.length;
  const walletCountLabel = walletsLoading
    ? '…'
    : `${walletCount} ${walletCount === 1 ? profileStrings.wallet : profileStrings.walletsPlural}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{profileStrings.title}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={onAvatarPress}
            activeOpacity={0.7}
            disabled={uploadMutation.isPending}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initialsFromUser(username, email)}</Text>
            )}
            <View style={styles.avatarOverlay}>
              {uploadMutation.isPending ? (
                <ActivityIndicator size='small' color={colors.white} />
              ) : (
                <Camera size={16} color={colors.white} strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.username} numberOfLines={1}>
            {username || email}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          {createdAt ? (
            <Text style={styles.memberSince}>
              {profileStrings.memberSince} {formatMonthYear(createdAt)}
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>{profileStrings.sectionAccount}</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={User}
            label={profileStrings.username}
            value={username}
            first
            onPress={() => router.push('/settings/username')}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={Lock}
            label={profileStrings.changePassword}
            last
            onPress={() => router.push('/settings/password')}
          />
        </View>

        <Text style={styles.sectionLabel}>{profileStrings.sectionWallets}</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={Bitcoin}
            label={profileStrings.wallets}
            value={walletCountLabel}
            first
            last
            onPress={() => router.push('/settings/wallets')}
          />
        </View>

        <Text style={styles.sectionLabel}>{profileStrings.sectionDanger}</Text>
        <View style={styles.section}>
          <SettingsRow
            icon={LogOut}
            label={profileStrings.logout}
            tint='danger'
            showChevron={false}
            first
            onPress={() => logoutMutation.mutate()}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={Trash2}
            label={profileStrings.deleteAccount}
            tint='danger'
            showChevron={false}
            last
            onPress={onDeleteAccountPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  scroll: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 34,
    fontFamily: 'Inter-Bold',
    color: colors.primary[600],
    letterSpacing: -0.5,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  username: {
    ...typography.sectionTitle,
  },
  email: {
    ...typography.small,
    color: colors.text.secondary,
  },
  memberSince: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  section: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
  },
  rowDivider: {
    height: 1,
    marginLeft: spacing.lg + 36 + spacing.md,
    backgroundColor: colors.border,
  },
});

export default Profile;
