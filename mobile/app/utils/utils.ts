import { validationStrings } from '@app/utils/strings';

export const validateEmail = (email: string): string => {
  let error = '';
  if (!email) error = validationStrings.requiredEmail;
  else if (!/\S+@\S+\.\S+/.test(email)) error = validationStrings.invalidEmail;
  return error;
};

export const validatePassword = (password: string): string => {
  let error = '';
  if (!password) error = validationStrings.requiredPassword;
  else if (password.length < 14) error = validationStrings.invalidPassword;
  else if (/(.)\1{2,}/.test(password))
    error = validationStrings.repeatedCharacters;
  return error;
};
