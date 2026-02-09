/**
 * Utility functions for detecting and handling canister errors
 */

/**
 * Detects if an error is due to a stopped or unreachable canister
 */
export function isStoppedCanisterError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  // Common patterns for stopped/unreachable canister errors
  return (
    lowerMessage.includes('canister is stopped') ||
    lowerMessage.includes('canister not running') ||
    lowerMessage.includes('canister has been stopped') ||
    lowerMessage.includes('destination invalid') ||
    lowerMessage.includes('canister rejected the message') ||
    lowerMessage.includes('canister does not exist') ||
    lowerMessage.includes('unable to reach the canister') ||
    lowerMessage.includes('connection refused') ||
    lowerMessage.includes('network error') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('could not be reached')
  );
}

/**
 * Detects if an error is due to authorization/permission issues
 * Note: Dashboard and Hook Library should work without sign-in
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  // Common patterns for authorization errors
  return (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('permission denied') ||
    lowerMessage.includes('access denied') ||
    lowerMessage.includes('not authorized') ||
    lowerMessage.includes('forbidden')
  );
}

/**
 * Returns a user-friendly error message for canister errors
 */
export function getCanisterErrorMessage(error: unknown): string {
  if (isStoppedCanisterError(error)) {
    return 'The backend service is currently unavailable or stopped. Please try again or contact support if the issue persists.';
  }
  
  if (isAuthorizationError(error)) {
    return 'An unexpected authorization error occurred. Please try again or contact support if the issue persists.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
