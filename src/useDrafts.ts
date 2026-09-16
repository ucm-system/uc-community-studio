import { useEffect, useRef, useState } from "react";
import type { Draft } from "./model";
import { deleteDraft, readDrafts, saveDraft } from "./storage";

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "saving" | "saved" | "error"
  >("loading");
  const [error, setError] = useState("");
  const latest = useRef<Draft[]>([]);
  const revision = useRef(0);
  // Serialize writes to keep the newest keystroke authoritative, even across drafts.
  const pending = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let disposed = false;
    void (async () => {
      try {
        const records = await readDrafts();
        if (!disposed) {
          latest.current = records;
          setDrafts(records);
          setReady(true);
          setStatus("saved");
        }
      } catch {
        if (!disposed) {
          setError(
            "无法打开本地草稿存储，请检查浏览器是否允许存储数据后刷新。",
          );
          setStatus("error");
        }
      }
    })();
    return () => {
      disposed = true;
    };
  }, []);

  function persist(draft: Draft) {
    const version = ++revision.current;
    setStatus("saving");
    setError("");
    pending.current = pending.current
      .catch(() => {})
      .then(() => saveDraft(draft));
    void pending.current
      .then(() => {
        if (version === revision.current) setStatus("saved");
      })
      .catch(() => {
        if (version === revision.current) {
          setStatus("error");
          setError(
            "保存失败，当前修改仍在页面中。请先导出草稿备份，再重试保存。",
          );
        }
      });
  }

  function update(id: string, change: (current: Draft) => Draft) {
    const current = latest.current.find((item) => item.id === id);
    if (!current) return;
    const next = { ...change(current), updatedAt: new Date().toISOString() };
    latest.current = latest.current.map((item) =>
      item.id === id ? next : item,
    );
    setDrafts(latest.current);
    persist(next);
  }

  function add(draft: Draft) {
    latest.current = [draft, ...latest.current];
    setDrafts(latest.current);
    persist(draft);
  }

  async function remove(id: string) {
    await pending.current.catch(() => {});
    await deleteDraft(id);
    const remaining = latest.current.filter((draft) => draft.id !== id);
    latest.current = remaining;
    setDrafts(remaining);
  }

  return {
    drafts,
    ready,
    update,
    add,
    remove,
    status,
    error,
  };
}
