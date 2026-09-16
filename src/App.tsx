import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ImageIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  createDraft,
  duplicateDraft,
  fileStem,
  FORMATS,
  parseDraft,
  serializeDraft,
  type Draft,
} from "./model";
import { useDrafts } from "./useDrafts";
import {
  download,
  exportPoster,
  findOverflow,
  readImage,
  waitForPoster,
} from "./export";
import { Poster } from "./Poster";
import { ActivityHome } from "./ActivityHome";

function editorIdFromHash() {
  return location.hash.startsWith("#/edit/") ? location.hash.slice(7) : "";
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={label === "分享标题" ? 2 : 3}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function Section({
  title,
  number,
  children,
  open = true,
}: {
  title: string;
  number: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="form-section" open={open}>
      <summary>
        <span>{number}</span>
        {title}
      </summary>
      <div className="section-fields">{children}</div>
    </details>
  );
}

function ImageField({
  label,
  image,
  onChange,
  onError,
}: {
  label: string;
  image: string;
  onChange: (image: string) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const [reading, setReading] = useState(false);
  return (
    <div className="image-field">
      <span className="field-label">
        {label}
        <small>可选</small>
      </span>
      <div className="image-upload">
        {image ? (
          <img src={image} alt={label} />
        ) : (
          <ImageIcon size={23} weight="light" />
        )}
        <label htmlFor={id}>
          {reading ? "正在读取图片…" : image ? "更换图片" : "选择图片"}
          <span>PNG、JPG、WebP · ≤ 8 MB</span>
        </label>
        <input
          id={id}
          disabled={reading}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={`上传${label}`}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              setReading(true);
              try {
                onChange(await readImage(file));
              } catch (error) {
                onError(
                  error instanceof Error ? error.message : "图片无法读取。",
                );
              } finally {
                setReading(false);
              }
            }
          }}
        />
        {image && (
          <button
            type="button"
            className="icon-button"
            aria-label={`移除${label}`}
            onClick={() => onChange("")}
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Editor({
  draft,
  update,
  onError,
}: {
  draft: Draft;
  update: (change: (current: Draft) => Draft) => void;
  onError: (message: string) => void;
}) {
  const e = draft.event,
    c = draft.community;
  const eventField = (key: keyof typeof e, value: string | boolean) =>
    update((current) => ({
      ...current,
      event: { ...current.event, [key]: value },
    }));
  const communityField = (key: keyof typeof c, value: string) =>
    update((current) => ({
      ...current,
      community: { ...current.community, [key]: value },
    }));
  return (
    <>
      <div className="draft-name-field">
        <Field
          label="草稿名称"
          value={draft.name}
          onChange={(name) => update((current) => ({ ...current, name }))}
        />
      </div>
      {draft.kind === "event" ? (
        <>
          <Section title="分享主题" number="01">
            <Field
              label="期数"
              value={e.issue}
              onChange={(value) => eventField("issue", value)}
            />
            <Field
              label="分享标题"
              value={e.title}
              multiline
              onChange={(value) => eventField("title", value)}
              hint="支持手动换行，建议 2–3 行。"
            />
            <Field
              label="副标题"
              value={e.subtitle}
              multiline
              onChange={(value) => eventField("subtitle", value)}
            />
            <Field
              label="简介或讨论要点"
              value={e.outline}
              multiline
              onChange={(value) => eventField("outline", value)}
              hint="每行一个要点，留空可隐藏。"
            />
            <Field
              label="技术分类"
              value={e.topics}
              onChange={(value) => eventField("topics", value)}
              hint="使用逗号分隔，例如 SYSTEMS, SERVING。"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={e.isSample}
                onChange={(event) =>
                  eventField("isSample", event.target.checked)
                }
              />
              标记为示例活动
            </label>
          </Section>
          <Section title="主讲人" number="02">
            <Field
              label="主讲人姓名"
              value={e.speaker}
              onChange={(value) => eventField("speaker", value)}
            />
            <Field
              label="身份介绍"
              value={e.role}
              onChange={(value) => eventField("role", value)}
            />
            <ImageField
              label="主讲人头像"
              image={e.avatar}
              onChange={(value) => eventField("avatar", value)}
              onError={onError}
            />
          </Section>
          <Section title="时间与参与方式" number="03">
            <Field
              label="日期"
              type="date"
              value={e.date}
              onChange={(value) => eventField("date", value)}
            />
            <div className="two-fields">
              <Field
                label="开始时间"
                type="time"
                value={e.start}
                onChange={(value) => eventField("start", value)}
              />
              <Field
                label="结束时间"
                type="time"
                value={e.end}
                onChange={(value) => eventField("end", value)}
              />
            </div>
            <Field
              label="地点或会议说明"
              value={e.location}
              multiline
              onChange={(value) => eventField("location", value)}
            />
            <ImageField
              label="参与二维码"
              image={e.qr}
              onChange={(value) => eventField("qr", value)}
              onError={onError}
            />
            {e.qr && (
              <Field
                label="二维码说明"
                value={e.qrCaption}
                onChange={(value) => eventField("qrCaption", value)}
              />
            )}
          </Section>
        </>
      ) : (
        <>
          <Section title="社区介绍" number="01">
            <Field
              label="社区名称"
              value={c.name}
              onChange={(value) => communityField("name", value)}
            />
            <Field
              label="社区定位"
              value={c.tagline}
              multiline
              onChange={(value) => communityField("tagline", value)}
            />
            <Field
              label="社区简介"
              value={c.introduction}
              multiline
              onChange={(value) => communityField("introduction", value)}
            />
            <Field
              label="关注方向"
              value={c.focus}
              multiline
              onChange={(value) => communityField("focus", value)}
            />
          </Section>
          <Section title="Thursday Tech Talk" number="02">
            <Field
              label="栏目名称"
              value={c.series}
              onChange={(value) => communityField("series", value)}
            />
            <Field
              label="英文介绍"
              value={c.english}
              multiline
              onChange={(value) => communityField("english", value)}
            />
            <Field
              label="中文介绍"
              value={c.chinese}
              multiline
              onChange={(value) => communityField("chinese", value)}
            />
            <Field
              label="讨论理念"
              value={c.discussion}
              multiline
              onChange={(value) => communityField("discussion", value)}
            />
          </Section>
          <Section title="社区主张与来源" number="03">
            <Field
              label="社区主张"
              value={c.principles}
              multiline
              onChange={(value) => communityField("principles", value)}
              hint="每行一句。"
            />
            <Field
              label="社区技术分类"
              value={c.topics}
              onChange={(value) => communityField("topics", value)}
            />
            <Field
              label="社区来源"
              value={c.origin}
              multiline
              onChange={(value) => communityField("origin", value)}
            />
          </Section>
        </>
      )}
      <Section title="标题排版" number="04">
        <div className="field">
          <label htmlFor="title-scale">
            标题字号{" "}
            <span className="range-value">
              {Math.round(draft.titleScale * 100)}%
            </span>
          </label>
          <input
            id="title-scale"
            type="range"
            min="0.75"
            max="1.1"
            step="0.05"
            value={draft.titleScale}
            onChange={(event) => {
              const titleScale = Number(event.target.value);
              update((current) => ({ ...current, titleScale }));
            }}
          />
          <small>保留可读性；内容较多时可适当缩小标题。</small>
        </div>
      </Section>
      <p className="editor-note">
        内容仅保存在此浏览器。定期导出草稿文件，即可备份文字和图片。
      </p>
    </>
  );
}

export default function App() {
  const studio = useDrafts();
  const [editId, setEditId] = useState(editorIdFromHash);
  const draft = studio.drafts.find((item) => item.id === editId);
  const poster = useRef<HTMLElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [area, setArea] = useState({ width: 900, height: 800 });
  const [actualSize, setActualSize] = useState(false);
  const [overflow, setOverflow] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const updateRoute = () => setEditId(editorIdFromHash());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  function openDraft(id: string) {
    setMessage("");
    location.hash = `/edit/${id}`;
  }

  function addDraft(next: Draft) {
    studio.add(next);
    openDraft(next.id);
  }

  async function removeDraft(item: Draft) {
    if (
      !window.confirm(`删除“${item.name}”？此操作无法撤销，请先确认已有备份。`)
    )
      return;
    try {
      await studio.remove(item.id);
    } catch {
      setMessage("删除失败，请重试。");
    }
  }

  useEffect(() => {
    if (!workspace.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setArea({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(workspace.current);
    return () => observer.disconnect();
  }, [Boolean(draft)]);

  useEffect(() => {
    let disposed = false;
    if (poster.current) {
      const element = poster.current;
      void waitForPoster(element)
        .then(() => {
          if (!disposed) setOverflow(findOverflow(element));
        })
        .catch(() => {
          if (!disposed)
            setMessage("海报素材尚未加载完整，请刷新或重新上传图片。");
        });
    }
    return () => {
      disposed = true;
    };
  }, [draft]);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(timeout);
  }, [success]);

  async function exportPng() {
    if (!draft || !poster.current || exporting) return;
    setExporting(true);
    setMessage("");
    try {
      download(
        await exportPoster(poster.current, draft),
        `${fileStem(draft)}-4K.png`,
      );
      setSuccess(`已导出 ${FORMATS[draft.format].output} PNG`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "导出失败，请再次尝试。",
      );
    } finally {
      setExporting(false);
    }
  }

  function exportBackup() {
    if (!draft) return;
    download(
      new Blob([serializeDraft(draft)], { type: "application/json" }),
      `${fileStem(draft)}.ucposter.json`,
    );
    setSuccess("草稿已导出，包含上传的图片。");
  }

  async function importBackup(file: File) {
    try {
      if (file.size > 30 * 1024 * 1024)
        throw new Error("草稿文件超过 30 MB，请检查文件。");
      const imported = parseDraft(await file.text());
      await Promise.all(
        [imported.event.avatar, imported.event.qr]
          .filter(Boolean)
          .map(async (src) => {
            const image = new Image();
            image.src = src;
            await image.decode();
          }),
      );
      addDraft(imported);
      setSuccess("已导入为新的草稿。");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法读取草稿文件。");
    }
  }

  const notice = message || studio.error;
  const notices = (
    <>
      {notice && (
        <div className="toast error" role="alert">
          <WarningCircleIcon size={20} />
          <span>{notice}</span>
          {studio.status === "error" && draft && (
            <button
              onClick={() => studio.update(draft.id, (current) => current)}
            >
              重试保存
            </button>
          )}
          <button
            className="icon-button"
            aria-label="关闭提示"
            onClick={() => setMessage("")}
          >
            <XIcon size={18} />
          </button>
        </div>
      )}
      {success && (
        <div className="toast success" role="status">
          <CheckCircleIcon size={20} weight="fill" />
          {success}
        </div>
      )}
    </>
  );
  const importField = (
    <input
      ref={importInput}
      className="hidden-file"
      type="file"
      accept=".json,.ucposter.json,application/json"
      aria-label="导入草稿文件"
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) void importBackup(file);
      }}
    />
  );

  if (!studio.ready)
    return (
      <main className="loading-screen">
        <img
          src={`${import.meta.env.BASE_URL}assets/ucm-symbol.png`}
          width="60"
          alt="UC"
        />
        <h1>UC Poster Studio</h1>
        <p>{studio.error || "正在打开你的海报工作室…"}</p>
        {studio.error && (
          <button onClick={() => location.reload()}>重新加载</button>
        )}
      </main>
    );

  if (!draft)
    return (
      <>
        <ActivityHome
          drafts={studio.drafts}
          onCreate={() => addDraft(createDraft())}
          onOpen={openDraft}
          onDuplicate={(item) => {
            addDraft(duplicateDraft(item));
            setSuccess("已创建副本，原活动保持不变。");
          }}
          onRemove={removeDraft}
          onImport={() => importInput.current?.click()}
        >
          {editId && (
            <div className="toast error" role="alert">
              此浏览器中没有这条活动。请导入原草稿，或新建活动。
              <button
                className="icon-button"
                aria-label="关闭提示"
                onClick={() => {
                  location.hash = "";
                }}
              >
                <XIcon size={18} />
              </button>
            </div>
          )}
          {notices}
        </ActivityHome>
        {importField}
      </>
    );

  const format = FORMATS[draft.format];
  const fit = Math.min(
    (area.width - 80) / format.width,
    (area.height - 110) / format.height,
    1,
  );
  const scale = actualSize ? 1 : Math.max(0.12, fit);
  return (
    <div className="studio">
      <header className="app-header">
        <div className="app-brand">
          <img
            src={`${import.meta.env.BASE_URL}assets/ucm-symbol.png`}
            alt=""
          />
          <div>
            UC Poster Studio<span>COMMUNITY, IN GOOD FORM.</span>
          </div>
        </div>
        <span className={`save-state ${studio.status}`} aria-live="polite">
          {studio.status === "saved" && (
            <CheckCircleIcon size={15} weight="fill" />
          )}
          {studio.status === "saved"
            ? "已保存到本地"
            : studio.status === "saving"
              ? "正在保存…"
              : "尚未保存"}
        </span>
        <div className="header-actions">
          <button
            className="quiet-button"
            disabled={exporting}
            onClick={() => {
              location.hash = "";
            }}
          >
            <ArrowLeftIcon size={18} />
            活动首页
          </button>
          <button
            className="primary-button"
            onClick={exportPng}
            disabled={exporting || overflow.length > 0}
          >
            <ArrowDownIcon size={18} />
            {exporting ? "正在生成 4K 图片…" : "导出 4K PNG"}
          </button>
        </div>
      </header>
      <aside className="editor" inert={exporting}>
        <div className="editor-heading">
          <div>
            <span className="eyebrow">YOUR NEXT THURSDAY</span>
            <h1>让好问题，被看见。</h1>
          </div>
          <span className="edition-label">STUDIO / 01</span>
        </div>
        <div className="editor-scroll">
          <Editor
            key={draft.id}
            draft={draft}
            update={(change) => studio.update(draft.id, change)}
            onError={setMessage}
          />
        </div>
        <div className="editor-bottom">
          <button onClick={exportBackup}>
            <ArrowDownIcon size={16} />
            导出草稿
          </button>
          <button onClick={() => importInput.current?.click()}>
            <ArrowUpIcon size={16} />
            导入草稿
          </button>
        </div>
      </aside>
      <main className="preview-panel">
        <div className="preview-toolbar" inert={exporting}>
          <div className="segmented" aria-label="海报模板">
            <button
              aria-pressed={draft.kind === "community"}
              onClick={() =>
                studio.update(draft.id, (current) => ({
                  ...current,
                  kind: "community",
                }))
              }
            >
              社区介绍
            </button>
            <button
              aria-pressed={draft.kind === "event"}
              onClick={() =>
                studio.update(draft.id, (current) => ({
                  ...current,
                  kind: "event",
                }))
              }
            >
              每期活动
            </button>
          </div>
          <div className="preview-options">
            <div className="segmented compact" aria-label="海报方向">
              <button
                aria-pressed={draft.format === "portrait"}
                onClick={() =>
                  studio.update(draft.id, (current) => ({
                    ...current,
                    format: "portrait",
                  }))
                }
              >
                竖版 <span>3:4</span>
              </button>
              <button
                aria-pressed={draft.format === "landscape"}
                onClick={() =>
                  studio.update(draft.id, (current) => ({
                    ...current,
                    format: "landscape",
                  }))
                }
              >
                横版 <span>16:9</span>
              </button>
            </div>
            <button
              className="zoom-button"
              onClick={() => setActualSize(!actualSize)}
              title="切换适应窗口与原始预览尺寸"
            >
              {actualSize ? "适应窗口" : `${Math.round(scale * 100)}%`}
              <ArrowSquareOutIcon size={14} />
            </button>
          </div>
        </div>
        <div
          className={`workspace ${actualSize ? "actual-size" : ""}`}
          ref={workspace}
        >
          <div className="canvas-caption">
            <span>OPEN COMMONS</span>
            <span>
              {draft.kind === "event" ? "TECH TALK" : "COMMUNITY"} /{" "}
              {draft.format === "portrait" ? "PORTRAIT" : "LANDSCAPE"}
            </span>
          </div>
          <div
            className="canvas-shell"
            style={{
              width: format.width * scale,
              height: format.height * scale,
            }}
          >
            <div
              className="canvas-transform"
              style={{ transform: `scale(${scale})` }}
            >
              <Poster draft={draft} ref={poster} />
            </div>
          </div>
          <div className="canvas-footer">
            <span className="preview-live">
              <span />
              实时预览
            </span>
            <span>{format.output} PX · PNG</span>
          </div>
        </div>
        {overflow.length > 0 && (
          <div className="overflow-notice" role="alert">
            <WarningCircleIcon size={19} />
            <div>
              <strong>内容超出排版空间</strong>
              <p>{overflow.join("、")}：请精简文字或调整标题字号后导出。</p>
            </div>
          </div>
        )}
      </main>
      {notices}
      {importField}
    </div>
  );
}
