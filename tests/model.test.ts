import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDraft,
  displayDate,
  duplicateDraft,
  parseDraft,
  serializeDraft,
} from "../src/model.ts";
import { readDrafts, saveDraft, deleteDraft } from "../src/storage.ts";

test("backup preserves editable content and images while creating an independent draft", () => {
  const original = createDraft();
  original.event.avatar = "data:image/png;base64,iVBORw0KGgo=";
  original.event.qr = original.event.avatar;
  original.community.discussion = "用户编辑后的社区理念";
  const imported = parseDraft(serializeDraft(original));
  assert.notEqual(imported.id, original.id);
  assert.deepEqual(imported.event, original.event);
  assert.deepEqual(imported.community, original.community);
  const copy = duplicateDraft(original);
  copy.event.title = "新主题";
  assert.notEqual(original.event.title, copy.event.title);
});

test("invalid imports do not introduce remote image URLs or unknown format versions", () => {
  const draft = createDraft();
  draft.event.qr = "https://example.com/remote-image.png";
  assert.throws(() => parseDraft(serializeDraft(draft)));
  assert.throws(() => parseDraft(JSON.stringify({ version: 2, draft })));
  assert.throws(() => parseDraft("{invalid"));
});

test("IndexedDB keeps the last edit and separates independent drafts", async () => {
  const first = createDraft(),
    second = duplicateDraft(first);
  await saveDraft(first);
  await saveDraft(second);
  first.event.title = "已修改的主题";
  await saveDraft(first);
  const records = await readDrafts();
  assert.equal(
    records.find((draft) => draft.id === first.id)?.event.title,
    "已修改的主题",
  );
  assert.equal(
    records.find((draft) => draft.id === second.id)?.event.title,
    second.event.title,
  );
  await deleteDraft(first.id);
  assert.equal(
    (await readDrafts()).some((draft) => draft.id === first.id),
    false,
  );
});

test("date display derives the weekday from the selected calendar date", () => {
  assert.equal(displayDate("2026-09-17"), "2026.09.17 THU");
  assert.equal(displayDate("2026-09-18"), "2026.09.18 FRI");
  assert.equal(displayDate(""), "");
});
