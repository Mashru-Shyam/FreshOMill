import { Signal, computed } from '@angular/core';
import { Observable, Subject, catchError, map, merge, of, scan, shareReplay, switchMap, timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Where a polled collection currently stands, so a view can tell the three cases apart that
 * previously all rendered as an empty array:
 *
 *  - `loading` — first fetch is still in flight. Render skeletons, *not* "no results".
 *  - `ready`   — we have data (possibly a legitimately empty list).
 *  - `error`   — the first fetch failed and we have nothing to show. Offer a retry.
 *
 * Before this existed every catalog service ended in `catchError(() => of([]))`, so a cold
 * load and a dead API both rendered the Store's "No products match these filters. [Clear
 * filters]" — an empty state that was actively wrong in both cases.
 */
export type LoadStatus = 'loading' | 'ready' | 'error';

export interface PolledCollection<T> {
  /** The data itself. Same shape and semantics the callers already consumed. */
  readonly value: Signal<readonly T[]>;
  readonly status: Signal<LoadStatus>;
  /** True only while the *first* fetch is outstanding — background polls never flip this. */
  readonly isLoading: Signal<boolean>;
  /** True only when we failed and have nothing cached to fall back on. */
  readonly isError: Signal<boolean>;
  /** Refetch now, off the polling cadence. Wired to the retry button on the error state. */
  reload(): void;
}

interface InternalState<T> {
  readonly value: readonly T[];
  readonly status: LoadStatus;
}

/**
 * Wraps a repeating GET in the loading/ready/error tracking every list view needs.
 *
 * Two deliberate properties, both about not letting a background poll wreck a good screen:
 *
 *  1. A poll that fails *after* a successful load keeps the last good data and stays `ready`.
 *     The previous `catchError(() => of([]))` blanked the whole catalogue on a single dropped
 *     request — a 15-second poll blip emptied the store out from under the user.
 *  2. `loading` is only ever the initial state. Later polls resolve in the background, so
 *     skeletons never re-appear over content the user is already reading.
 *
 * Must be called from an injection context (it uses `toSignal`).
 */
export function pollCollection<T>(fetch: () => Observable<readonly T[]>, intervalMs: number): PolledCollection<T> {
  const manualReload$ = new Subject<void>();
  const seed: InternalState<T> = { value: [], status: 'loading' };

  const state$ = merge(timer(0, intervalMs), manualReload$).pipe(
    switchMap(() =>
      fetch().pipe(
        map((value) => ({ value, failed: false as const })),
        catchError(() => of({ value: [] as readonly T[], failed: true as const }))
      )
    ),
    scan<{ value: readonly T[]; failed: boolean }, InternalState<T>>(
      (previous, next) =>
        next.failed
          ? // Keep whatever we last showed. Only a failure with nothing cached is a real error.
            { value: previous.value, status: previous.status === 'ready' ? 'ready' : 'error' }
          : { value: next.value, status: 'ready' },
      seed
    ),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  const state = toSignal(state$, { initialValue: seed });

  return {
    value: computed(() => state().value),
    status: computed(() => state().status),
    isLoading: computed(() => state().status === 'loading'),
    isError: computed(() => state().status === 'error'),
    reload: () => manualReload$.next(),
  };
}
