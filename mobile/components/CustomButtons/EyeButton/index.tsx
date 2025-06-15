import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { useIcon } from '@hooks/useIcon';

import { EyeIcon } from '@lib/icons';

import colors from '@lib/colors';

type EyeButtonProps = {
  display: boolean;
  active: boolean;
  button: {
    style: ViewStyle;
  };
  onPress: () => void;
};

const EyeButton = ({ display, active, button, onPress }: EyeButtonProps) => {
  const { icon } = useIcon(active, 'eye', 'eye-with-line');
  return (
    <>
      {display && (
        <TouchableOpacity style={button.style} onPress={onPress}>
          <EyeIcon type={icon} color={colors.gray100} size={20} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default EyeButton;
