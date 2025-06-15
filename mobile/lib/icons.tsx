import Google from '@assets/icons/Google';
import GitHub from '@assets/icons/GitHub';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

export const GoogleIcon = () => <Google width={16} height={16} />;
export const GitHubIcon = () => <GitHub width={16} height={16} />;

type GenericIconProps = {
  size: number;
  color: string;
  focused: boolean;
};

export const HomeIcon = ({ size, color, focused }: GenericIconProps) =>
  focused ? (
    <MaterialIcons name='home' size={size} color={color} />
  ) : (
    <AntDesign name='home' size={size} color={color} />
  );

export const CategoryIcon = ({ size, color, focused }: GenericIconProps) =>
  focused ? (
    <AntDesign name='appstore1' size={size} color={color} />
  ) : (
    <AntDesign name='appstore-o' size={size} color={color} />
  );

export const UploadIcon = ({ size, color, focused }: GenericIconProps) =>
  focused ? (
    <Ionicons name='cloud-upload' size={size} color={color} />
  ) : (
    <Ionicons name='cloud-upload-outline' size={size} color={color} />
  );

export const CalendarIcon = ({ size, color, focused }: GenericIconProps) =>
  focused ? (
    <Ionicons name='calendar-clear' size={size} color={color} />
  ) : (
    <Ionicons name='calendar-clear-outline' size={size} color={color} />
  );

export const UserIcon = ({ size, color, focused }: GenericIconProps) =>
  focused ? (
    <FontAwesome name='user-circle-o' size={size} color={color} />
  ) : (
    <FontAwesome name='user-circle' size={size} color={color} />
  );

type EyeIconProps = {
  type: any;
  color: string;
  size: number;
};
export const EyeIcon = ({ type, color, size }: EyeIconProps) => (
  <Entypo name={type} size={size} color={color} />
);
