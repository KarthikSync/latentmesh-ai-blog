// Dev-mode draft persistence. Guarded behind ?dev=1 query flag so real
// users never see or use this. Uses localStorage with a namespaced key
// and timestamp-based IDs (not sequential — no enumeration even in the
// local namespace). All reads and writes are SSR-safe.

import type { AnswerSet, StepId } from "../../data/eu-ai-act-classifier/types";

const STORAGE_KEY = "euaicc:drafts:v1";

export type ClassifierView = "landing" | "step" | "result";

export interface Draft {
  id: string;
  label: string;
  createdAt: number;
  answers: AnswerSet;
  currentStep: StepId;
  view: ClassifierView;
}

// ── SSR-safe storage access ──────────────────────────────────────

function getStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const g = globalThis as unknown as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    return null;
  }
}

function getLocation(): Location | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const g = globalThis as unknown as { location?: Location };
    return g.location ?? null;
  } catch {
    return null;
  }
}

// ── URL flag detection ───────────────────────────────────────────

export function isDevMode(): boolean {
  const loc = getLocation();
  if (!loc) return false;
  try {
    return new URLSearchParams(loc.search).get("dev") === "1";
  } catch {
    return false;
  }
}

export function getSeedParam(): string | null {
  const loc = getLocation();
  if (!loc) return null;
  try {
    return new URLSearchParams(loc.search).get("seed");
  } catch {
    return null;
  }
}

// ── Draft CRUD ──────────────────────────────────────────────────

function readDrafts(): Draft[] {
  const store = getStorage();
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Draft[];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: Draft[]): void {
  const store = getStorage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Quota exceeded or other storage failure — silently ignore in dev.
  }
}

export function listDrafts(): Draft[] {
  return readDrafts().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveDraft(
  label: string,
  answers: AnswerSet,
  currentStep: StepId,
  view: ClassifierView
): Draft {
  const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const draft: Draft = {
    id,
    label: label.trim() || `Draft at ${new Date().toISOString().slice(0, 19)}`,
    createdAt: Date.now(),
    answers,
    currentStep,
    view,
  };
  const drafts = readDrafts();
  drafts.push(draft);
  writeDrafts(drafts);
  return draft;
}

export function loadDraft(id: string): Draft | null {
  return readDrafts().find((d) => d.id === id) ?? null;
}

export function deleteDraft(id: string): void {
  writeDrafts(readDrafts().filter((d) => d.id !== id));
}

export function clearAllDrafts(): void {
  const store = getStorage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
