import { supabase } from "@/integrations/supabase/client";

interface InvokeOptions {
  body?: Record<string, unknown>;
  maxRetries?: number;
  baseDelay?: number;
}

/**
 * Invokes a Supabase edge function with automatic retry on WORKER_LIMIT (546) errors.
 * Uses exponential backoff: 2s, 4s, 8s by default.
 */
export async function invokeWithRetry<T = unknown>(
  functionName: string,
  { body, maxRetries = 3, baseDelay = 2000 }: InvokeOptions = {}
): Promise<{ data: T; error: null } | { data: null; error: Error }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { data, error } = await supabase.functions.invoke(functionName, { body });

    if (!error) {
      return { data: data as T, error: null };
    }

    // Check if it's a retryable resource limit error (546)
    const isWorkerLimit =
      error?.message?.includes("WORKER_LIMIT") ||
      error?.message?.includes("546") ||
      (typeof error === "object" && (error as any)?.status === 546);

    if (!isWorkerLimit || attempt === maxRetries) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }

    lastError = error instanceof Error ? error : new Error(String(error));
    const delay = baseDelay * Math.pow(2, attempt);
    console.warn(`Edge function "${functionName}" hit resource limit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
    await new Promise((r) => setTimeout(r, delay));
  }

  return { data: null, error: lastError! };
}
