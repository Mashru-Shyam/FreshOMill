import { HttpErrorResponse } from '@angular/common/http';
export function extractErrorMessage(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { detail?: string; title?: string } | undefined;
    return body?.detail ?? body?.title ?? null;
  }
  return null;
}
