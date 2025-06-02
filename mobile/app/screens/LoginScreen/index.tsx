import React from 'react';
import { View, Text, Image } from 'react-native';

import Logo from '@app/assets/icons/Logo';

import LoginForm from '@app/components/CustomForms/LoginForm';
import StandardButton from '@app/components/CustomButtons/StandardButton';

import { loginStrings } from '@app/utils/strings';
import { GoogleIcon, GitHubIcon } from '@app/utils/icons';

import styles from './styles';

const LoginScreen = () => {
  const loginImage = require('@app/assets/images/loginImage.webp');
  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <Logo width={250} height={35} />
      </View>
      <View style={{ flex: 0.55, alignItems: 'center' }}>
        <Image source={loginImage} style={{ width: '85%', height: '100%' }} />
      </View>
      <View style={{ flex: 1 }}>
        <LoginForm />
        <Text style={styles.whiteBoldText}>{loginStrings.or}</Text>
        <View style={styles.fade}>
          <StandardButton
            button={{ logo: <GoogleIcon />, style: styles.whiteButton }}
            title={{ text: loginStrings.googleSignUp, style: styles.blackText }}
            onPress={null}
          />
        </View>
        <StandardButton
          button={{ logo: <GitHubIcon />, style: styles.blackButton }}
          title={{ text: loginStrings.githubSignUp, style: styles.whiteText }}
          onPress={null}
        />
        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 20 }}>
          <Text style={styles.grayText}>{loginStrings.register}</Text>
        </View>
      </View>
    </>
  );
};

export default LoginScreen;
