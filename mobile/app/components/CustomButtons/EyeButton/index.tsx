import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useIcon } from '@app/hooks/useIcon';

import { EyeIcon } from '@app/utils/icons';

import colors from '@app/utils/colors';

const EyeButton = ({ display, active, button, onPress }) => {
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
