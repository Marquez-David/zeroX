import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { loginStrings } from '@lib/strings';
import { GoogleIcon, GitHubIcon } from '@lib/icons';
import colors from '@lib/colors';

import LoginForm from '@components/CustomForms/LoginForm';
import StandardButton from '@components/CustomButtons/StandardButton';

import { useSession } from '@contexts/auth';

const LoginScreen = () => {
  const loginImage = require('@assets/images/loginImage.webp');
  const { signIn } = useSession();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 0.55, alignItems: 'center' }}>
        <Image source={loginImage} style={{ width: '85%', height: '100%' }} />
      </View>
      <View style={{ flex: 1 }}>
        <LoginForm
          onSubmit={() => {
            signIn();
            router.replace('/home');
          }}
        />
        <Text style={styles.whiteBoldText}>{loginStrings.or}</Text>
        <View style={styles.fade}>
          <StandardButton
            button={{ logo: <GoogleIcon />, style: styles.whiteButton }}
            label={{ text: loginStrings.googleSignUp, style: styles.blackText }}
            onPress={() => null}
          />
        </View>
        <StandardButton
          button={{ logo: <GitHubIcon />, style: styles.blackButton }}
          label={{ text: loginStrings.githubSignUp, style: styles.whiteText }}
          onPress={() => null}
        />
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Text style={styles.grayText}>{loginStrings.register}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fade: {
    borderRadius: 50,
    shadowColor: colors.gray800,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  whiteButton: {
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  blackButton: {
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.gray950,
    borderTopWidth: 0.1,
    borderLeftWidth: 0.25,
    borderColor: colors.gray700,
  },
  blackText: {
    color: colors.gray900,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  whiteText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  whiteBoldText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  grayText: {
    textAlign: 'center',
    color: colors.gray100,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default LoginScreen;
