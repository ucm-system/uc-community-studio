import { openDB, type DBSchema } from "idb";
import { createDraft, type Draft } from "./model";

interface StudioDatabase extends DBSchema {
  drafts: { key: string; value: Draft };
}

const database = openDB<StudioDatabase>("uc-poster-studio", 1, {
  upgrade(db) {
    const store = db.createObjectStore("drafts", { keyPath: "id" });
    void store.add(createDraft(true));
  },
});

export async function readDrafts() {
  return (await (await database).getAll("drafts")).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function saveDraft(draft: Draft) {
  const db = await database;
  const tx = db.transaction("drafts", "readwrite");
  await tx.store.put(draft);
  await tx.done;
}

export async function deleteDraft(id: string) {
  await (await database).delete("drafts", id);
}
