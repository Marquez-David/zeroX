import Google from '@app/assets/icons/Google';
import GitHub from '@app/assets/icons/GitHub';
import Entypo from '@expo/vector-icons/Entypo';

export const GoogleIcon = () => <Google width={16} height={16} />;
export const GitHubIcon = () => <GitHub width={16} height={16} />;

export const EyeIcon = ({ type, color, size }) => (
  <Entypo name={type} size={size} color={color} />
);
