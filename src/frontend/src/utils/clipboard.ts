/**
 * Robust clipboard utility with fallback mechanisms
 */

interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * Attempts to copy text to clipboard using multiple strategies
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  if (!text || !text.trim()) {
    return { success: false, error: 'Cannot copy empty text' };
  }

  // Strategy 1: Modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
      // Continue to fallback
    }
  }

  // Strategy 2: Legacy execCommand fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    } else {
      return { success: false, error: 'Copy command failed' };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to copy to clipboard',
    };
  }
}
