import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { detail?: string; title?: string; errors?: Record<string, string[]> } | undefined;
    if (body?.errors) {
      const first = Object.values(body.errors)[0];
      if (first?.length) {
        return first[0];
      }
    }
    return body?.detail ?? body?.title ?? null;
  }
  return null;
}
