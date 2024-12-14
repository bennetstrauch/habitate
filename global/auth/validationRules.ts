export const validationRules = {
    name: {
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9]+$/, 
      errorMessage: 'name must be 3-20 characters and alphanumeric.',
    },
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      errorMessage: 'Email is invalid.',
    },
    password: {
      minLength: 5,
      maxLength: 30,
      errorMessage: 'Password must be at least 5 and at most 30 characters.',
    },
  };