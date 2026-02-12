export default {
  network: {
    noConnection: "No internet connection",
    timeout: "Request timed out",
    serverError: "Server error. Please try again later",
  },
  validation: {
    required: "This field is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least {{min}} characters",
    passwordMismatch: "Passwords do not match",
    invalidPhone: "Invalid phone number",
    invalidDate: "Invalid date",
  },
  auth: {
    invalidCredentials: "Invalid email or password",
    userNotFound: "User not found",
    emailInUse: "Email already in use",
    weakPassword: "Password is too weak",
    sessionExpired: "Session expired. Please sign in again",
  },
  generic: {
    somethingWrong: "Something went wrong",
    tryAgain: "Please try again",
    contactSupport: "If the problem persists, contact support",
  },
} as const;
