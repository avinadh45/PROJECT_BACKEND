export const MESSAGES = {

  COMMON: {
    INTERNAL_ERROR: "Something went wrong",
    UNAUTHORIZED: "Unauthorized access",
    NOT_FOUND: "Resource not found",
    ACCOUNT_BLOCKED:"Your account is blocked ",
     
  },

  USER: {
    CREATED: "User created successfully",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    EMAIL_EXISTS: "User already exists",
    NOT_FOUND: "User not found",
    FETCH_SUCCESS: "User details fetched successfully",
    BLOCK:"User blocked successfully",
    OTP:"OTP resent. Please verify your account.",
    USER_EXIST:"user already exist",
    OTP_EXPIRED:"OTP Expired",
    INVALID_OTP:"Invalid OTP",
    INVALID_PASSWORD:"Invalid password",
    EXPIRED:"reset token expired",
    FAILED_UPDATE:"Failed to update user"
  },

  SERVICE_CENTER: {
    CREATED: "Service center created successfully",
    ALREADY_EXISTS: "Service center already exists",
    NOT_FOUND: "Service center not found",
    FETCH_SUCCESS: "ServiceCenter details fetched successfully",
    BLOCK:"ServiceCenter blocked successfully",
    FORGOT_PASSWORD:  "Reset link sent to email",
    PASSWORD_CHANGE: "Password reset successful",
    PENDING_SERVICECENTER:"Failed to fetch pending service centers",
    APPROVED:"Service center aprroved successfully",
    REJECT:"Service center rejected successfully",
    UPDATION_FAILED:"Failed to update service center",
    INVALID:"Invalid credentials",
    EXPIRED:"REST TOKEN EXpired",
    TOKEN_EXPIRED:"Refresh token required",
    NO_ACCESS:"Service Center access only"
  },

  MECHANIC: {
    CREATED: "Mechanic created successfully",
    ALREADY_EXISTS: "Mechanic already exists",
    NOT_FOUND: "Mechanic not found",
    BLOCKED: "Mechanic blocked successfully",
    UNBLOCKED: "Mechanic unblocked successfully",
    INVALID:"Invalid credentials",
    NO_TOKEN:"No token provided",
    ACCESS_DENIED:"Access denied",
    
  },

  ADMIN: {
    LOGIN_SUCCESS: "Admin login successful",
    BLOCKED_USER: "User blocked successfully",
    UNBLOCKED_USER: "User unblocked successfully",
    DELETE_CATEGORY:"Category deleted successfully",
    E_FORMAT:"Invalid email format",
    REQUIRED:"Password is required",
    INVALID:"Invalid Error",
    UNAUTHROISED:"unauthroised",
    ADMIN_ONLY:"Admin access only",
    TOKEN_REQUIRED:"Refresh token required"
  }

}