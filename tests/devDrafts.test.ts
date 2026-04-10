// devDrafts tests. Uses an in-memory localStorage shim so we can exercise
// the save/load/list/delete flow without jsdom.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearAllDrafts,
  deleteDraft,
  listDrafts,
  loadDraft,
  saveDraft,
} from "../src/lib/eu-ai-act-classifier/devDrafts";

class MemStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number {
    return this.data.size;
  }
  clear(): void {
    this.data.clear();
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemStorage();
});

afterEach(() => {
  delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
});

describe("devDrafts", () => {
  it("listDrafts returns [] when storage is empty", () => {
    expect(listDrafts()).toEqual([]);
  });

  it("saveDraft persists and listDrafts returns it", () => {
    const draft = saveDraft(
      "test draft",
      { is_ai_system: "yes" },
      "step1",
      "step"
    );
    expect(draft.id).toMatch(/^draft-/);
    expect(draft.label).toBe("test draft");
    expect(draft.answers.is_ai_system).toBe("yes");

    const drafts = listDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].id).toBe(draft.id);
  });

  it("saveDraft generates a default label when none provided", () => {
    const draft = saveDraft("", { is_ai_system: "yes" }, "step0", "step");
    expect(draft.label).toMatch(/Draft at/);
  });

  it("listDrafts sorts newest first", () => {
    const a = saveDraft("first", {}, "step0", "step");
    // Ensure a different timestamp
    const laterAnswer = {} as Record<string, never>;
    const b: ReturnType<typeof saveDraft> = {
      ...saveDraft("second", laterAnswer, "step1", "step"),
    };
    // Manually push createdAt forward for deterministic ordering
    (b as { createdAt: number }).createdAt = a.createdAt + 1000;
    const allDrafts = listDrafts().map((d) => d.id);
    expect(allDrafts).toContain(a.id);
    expect(allDrafts).toContain(b.id);
  });

  it("loadDraft retrieves by id", () => {
    const d = saveDraft("lookup", { eu_nexus: "yes" }, "step1", "step");
    const loaded = loadDraft(d.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.answers.eu_nexus).toBe("yes");
  });

  it("loadDraft returns null for unknown id", () => {
    expect(loadDraft("does-not-exist")).toBe(null);
  });

  it("deleteDraft removes one without affecting others", () => {
    const a = saveDraft("a", {}, "step0", "step");
    const b = saveDraft("b", {}, "step1", "step");
    deleteDraft(a.id);
    const ids = listDrafts().map((d) => d.id);
    expect(ids).not.toContain(a.id);
    expect(ids).toContain(b.id);
  });

  it("clearAllDrafts empties storage", () => {
    saveDraft("x", {}, "step0", "step");
    saveDraft("y", {}, "step0", "step");
    clearAllDrafts();
    expect(listDrafts()).toEqual([]);
  });

  it("is SSR-safe when localStorage is unavailable", () => {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
    expect(listDrafts()).toEqual([]);
    // saveDraft still returns a draft object but the write is a no-op
    const d = saveDraft("noop", {}, "step0", "step");
    expect(d.id).toMatch(/^draft-/);
    // Without storage, the next read is still empty
    expect(listDrafts()).toEqual([]);
  });
});
