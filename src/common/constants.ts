export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_ALREADY_REGISTERED: 'Email is already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_SUSPENDED: 'Your account has been suspended',
    ACCOUNT_NOT_FOUND: 'Account not found',
    EMAIL_NOT_FOUND: 'User with this email does not exist',
    INVALID_OR_EXPIRED_RESET_TOKEN: 'Invalid or expired password reset token',
    INVALID_TOKEN_TYPE: 'Invalid token type',
    UNAUTHORIZED_OR_INVALID_TOKEN: 'Unauthorized or invalid token',
    ROLE_NOT_FOUND: 'Specified role does not exist',
  },
  USER: {
    NOT_FOUND: 'User not found',
  },
  VALIDATION: {
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Must be a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
    RESET_TOKEN_REQUIRED: 'Reset token is required',
    NEW_PASSWORD_REQUIRED: 'New password is required',
    ROLE_REQUIRED: 'Role is required',
  },
};

export const RESPONSE_MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'User logged in successfully',
    FORGOT_PASSWORD_SUCCESS: 'Password reset token generated successfully',
    RESET_PASSWORD_SUCCESS: 'Password reset successfully',
  },
};
