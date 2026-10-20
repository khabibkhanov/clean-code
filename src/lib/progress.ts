"use client";

import { useSyncExternalStore } from "react";

/**
 * Dars progressi brauzerda (localStorage) saqlanadi.
 * Kalit: `progress:<course>`, qiymat: tugatilgan dars raqamlari.
 */
const EMPTY: readonly number[] = Object.freeze([]);
const listeners = new Set<() => void>();
const cache = new Map<string, readonly number[]>();

function storageKey(course: string) {
  return `progress:${course}`;
}

function read(course: string): readonly number[] {
  const cached = cache.get(course);
  if (cached) return cached;
  let value: readonly number[] = EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(course));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      value = parsed.filter((n): n is number => Number.isInteger(n));
    }
  } catch {
    value = EMPTY;
  }
  cache.set(course, value);
  return value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("progress:")) {
      cache.clear();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCompletedLessons(course: string): readonly number[] {
  return useSyncExternalStore(
    subscribe,
    () => read(course),
    () => EMPTY,
  );
}

export function markLessonCompleted(course: string, n: number) {
  const current = read(course);
  if (current.includes(n)) return;
  const next = [...current, n].sort((a, b) => a - b);
  try {
    window.localStorage.setItem(storageKey(course), JSON.stringify(next));
  } catch {
    // Saqlab bo'lmasa ham sessiya davomida progress ishlayveradi.
  }
  cache.set(course, next);
  listeners.forEach((l) => l());
}

/** Birinchi tugatilmagan dars - "hozirgi" dars. */
export function currentLessonNumber(completed: readonly number[], total: number) {
  for (let n = 1; n <= total; n++) {
    if (!completed.includes(n)) return n;
  }
  return total;
}
