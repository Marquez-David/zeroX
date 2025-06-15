import { validationStrings } from '@lib/strings';

export const validateEmail = (email: string): string => {
  let error = '';
  if (!email) error = validationStrings.requiredEmail;
  else if (!/\S+@\S+\.\S+/.test(email)) error = validationStrings.invalidEmail;
  return error;
};

export const validatePassword = (password: string): string => {
  let error = '';
  if (!password) error = validationStrings.requiredPassword;
  return error;
};
