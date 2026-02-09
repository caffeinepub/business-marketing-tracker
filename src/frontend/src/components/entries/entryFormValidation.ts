export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();
  
  // Basic URL format check
  try {
    new URL(trimmed);
    return { valid: true };
  } catch {
    // If URL constructor fails, check if it's a relative URL or missing protocol
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function validateNonNegative(value: string): ValidationResult {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Cannot be negative' };
  }
  
  return { valid: true };
}
