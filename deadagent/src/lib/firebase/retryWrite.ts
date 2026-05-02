/**
 * Firestore write wrapper with exponential backoff retry.
 * Wraps all Firestore write operations for rate-limiting resilience.
 */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export async function firestoreWriteWithRetry<T>(
  operation: () => Promise<T>,
  label = 'Firestore write',
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on permission-denied or not-found — those won't self-resolve
      const code = (err as { code?: string })?.code;
      if (code === 'permission-denied' || code === 'not-found') {
        throw lastError;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`${label} failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`, lastError.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error(`${label} failed after ${MAX_RETRIES} retries`);
}
