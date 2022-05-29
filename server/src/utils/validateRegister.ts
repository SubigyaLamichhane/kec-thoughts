import { UsernamePasswordInput } from '../resolvers/UsernamePasswordInput';
import validator from 'validator';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.email.length <= 3) {
    return {
      errors: [
        {
          field: 'email',
          message: 'length must be greater than 2',
        },
      ],
    };
  }

  if (!validator.isEmail(options.email)) {
    return {
      errors: [
        {
          field: 'email',
          message: 'The email you entered is not a vaild email.',
        },
      ],
    };
  }

  if (options.username.length <= 2) {
    return {
      errors: [
        {
          field: 'username',
          message: 'length must be greater than 2',
        },
      ],
    };
  }

  if (validator.isEmail(options.username)) {
    return {
      errors: [
        {
          field: 'username',
          message: 'username cannot include a "@" sign.',
        },
      ],
    };
  }

  if (options.password.length <= 3) {
    return {
      errors: [
        {
          field: 'password',
          message: 'password length must be greater than 3',
        },
      ],
    };
  }

  return null;
};
