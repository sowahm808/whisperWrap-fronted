const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists for this email address. Try logging in instead.',
  'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/operation-not-allowed': 'Account creation with email and password is not enabled for this Firebase project. Ask an administrator to enable Email/Password in Firebase Authentication > Sign-in method.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
};

type AuthErrorLike = {
  code?: string;
  message?: string;
};

function isAuthErrorLike(error: unknown): error is AuthErrorLike {
  return typeof error === 'object' && error !== null;
}

export function getAuthErrorMessage(error: unknown) {
  if (isAuthErrorLike(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  if (isAuthErrorLike(error) && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
