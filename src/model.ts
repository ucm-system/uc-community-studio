export type PosterKind = "event" | "community";
export type PosterFormat = "portrait" | "landscape";

export const FORMATS = {
  portrait: {
    label: "竖版海报",
    width: 720,
    height: 960,
    pixels: 4,
    output: "2880 × 3840",
  },
  landscape: {
    label: "横版封面",
    width: 1280,
    height: 720,
    pixels: 3,
    output: "3840 × 2160",
  },
} as const;

export const DEFAULT_COMMUNITY = {
  name: "UC Community",
  tagline: "AI Systems · Infrastructure · Agents",
  introduction: "UC Community 是面向 AI 技术与工程的内部技术社区。",
  focus:
    "聚焦 AI Systems、AI Infrastructure、LLM Serving、Cache & Storage、AI Agent 等方向，分享前沿技术、工程实践与架构思考。",
  series: "UC Thursday Tech Talk",
  english: "Every Thursday, one topic worth going deep.",
  chinese: "每周四，聊透一个值得讨论的 AI 技术问题。",
  discussion:
    "我们关注技术原理、真实工程问题与架构取舍，也讨论那些仍然没有标准答案的问题。",
  principles: "No Marketing.\nGo Deep.\nOpen Discussion.",
  topics: "SYSTEMS, INFRA, SERVING, CACHE, AGENTS",
  origin: "UC Community 源于 UCM 技术社区，并将讨论延伸到更广泛的 AI 技术栈。",
};

export const SAMPLE_EVENT = {
  issue: "001",
  title: "从一条请求出发\n理解 KV Cache",
  subtitle: "LLM Serving 中的缓存复用与架构取舍",
  outline:
    "请求如何命中缓存\nKV 如何跨层存储与传输\n复用、延迟与资源开销的取舍",
  speaker: "李明（示例）",
  role: "AI 系统工程师（示例）",
  avatar: "",
  date: "2026-09-17",
  start: "19:00",
  end: "20:00",
  location: "线上分享 · 会议链接待补充",
  qr: "",
  qrCaption: "扫码参与讨论",
  topics: "SYSTEMS, SERVING, CACHE",
  isSample: true,
};

export interface Draft {
  id: string;
  name: string;
  updatedAt: string;
  kind: PosterKind;
  format: PosterFormat;
  titleScale: number;
  community: typeof DEFAULT_COMMUNITY;
  event: typeof SAMPLE_EVENT;
}

export function createDraft(name = "新一期技术分享（示例）"): Draft {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString(),
    kind: "event",
    format: "portrait",
    titleScale: 1,
    community: { ...DEFAULT_COMMUNITY },
    event: { ...SAMPLE_EVENT },
  };
}

export function duplicateDraft(draft: Draft): Draft {
  return {
    ...structuredClone(draft),
    id: crypto.randomUUID(),
    name: `${draft.name} · 副本`,
    updatedAt: new Date().toISOString(),
  };
}

export function splitLines(text: string) {
  return text
    .split(/\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function splitTopics(text: string) {
  return text
    .split(/[,，·\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function displayDate(date: string) {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.valueOf())) return date;
  return `${date.replaceAll("-", ".")} ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][parsed.getDay()]}`;
}

export function fileStem(draft: Draft) {
  return `UC-${draft.kind === "community" ? "Community" : `Talk-${draft.event.issue || "new"}`}-${draft.format}`;
}

export function serializeDraft(draft: Draft) {
  return JSON.stringify({ version: 1, draft }, null, 2);
}

// Imported drafts are copied, never allowed to overwrite an existing record.
// Images stay embedded so a backup cannot fetch remote resources when opened.
export function parseDraft(text: string): Draft {
  const data = JSON.parse(text);
  const d = data?.draft;
  const invalid = () => {
    throw new Error("这不是有效的 UC Poster Studio 草稿文件。");
  };
  if (data?.version !== 1 || !d || typeof d.name !== "string") return invalid();
  if (
    !["event", "community"].includes(d.kind) ||
    !["portrait", "landscape"].includes(d.format)
  )
    return invalid();
  if (
    typeof d.titleScale !== "number" ||
    d.titleScale < 0.75 ||
    d.titleScale > 1.1
  )
    return invalid();
  function fields<T extends Record<string, string | boolean>>(
    input: unknown,
    defaults: T,
  ): T {
    if (!input || typeof input !== "object") return invalid();
    const output = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const value = (input as T)[key];
      if (typeof value !== typeof defaults[key]) return invalid();
      output[key] = value;
    }
    return output;
  }
  const community = fields(d.community, DEFAULT_COMMUNITY);
  const event = fields(d.event, SAMPLE_EVENT);
  for (const image of [event.avatar, event.qr]) {
    if (
      image &&
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)
    )
      return invalid();
  }
  return {
    ...createDraft(),
    name: `${d.name}（导入）`,
    kind: d.kind,
    format: d.format,
    titleScale: d.titleScale,
    community,
    event,
  };
}
