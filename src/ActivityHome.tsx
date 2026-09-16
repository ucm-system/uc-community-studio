import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CalendarBlankIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import {
  DEFAULT_COMMUNITY,
  displayDate,
  splitTopics,
  type Draft,
} from "./model";
import { Poster } from "./Poster";
import { CommunityName, SeriesTitle } from "./BrandText";
import "./home.css";

function PosterThumbnail({ draft }: { draft: Draft }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="activity-thumbnail" ref={container} aria-hidden="true">
      <div
        className="activity-thumbnail-scale"
        style={{ transform: `scale(${width / 1280})` }}
      >
        <Poster draft={{ ...draft, kind: "event", format: "landscape" }} />
      </div>
    </div>
  );
}

export function ActivityHome({
  drafts,
  onCreate,
  onOpen,
  onDuplicate,
  onRemove,
  onImport,
  children,
}: {
  drafts: Draft[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (draft: Draft) => void;
  onRemove: (draft: Draft) => void;
  onImport: () => void;
  children: ReactNode;
}) {
  return (
    <div className="activity-home">
      <header className="home-header app-header">
        <div className="app-brand">
          <img
            src={`${import.meta.env.BASE_URL}assets/ucm-symbol.png`}
            alt=""
          />
          <div>
            UC Poster Studio<span>COMMUNITY, IN GOOD FORM.</span>
          </div>
        </div>
        <span className="home-storage-label">我的活动 · 本地保存</span>
        <button className="quiet-button" onClick={onImport}>
          <ArrowUpIcon size={18} />
          导入草稿
        </button>
      </header>
      <main className="home-content">
        <section className="home-intro">
          <div>
            <p className="home-eyebrow">AI SYSTEMS · INFRASTRUCTURE · AGENTS</p>
            <h1 className="home-community">
              <CommunityName text={DEFAULT_COMMUNITY.name} />
            </h1>
            <h2 className="home-series">
              <SeriesTitle text={DEFAULT_COMMUNITY.series} />
            </h2>
            <p className="home-description">{DEFAULT_COMMUNITY.chinese}</p>
          </div>
          <button className="primary-button home-new" onClick={onCreate}>
            <PlusIcon size={21} weight="bold" />
            新建活动
          </button>
        </section>
        <section aria-labelledby="activity-heading">
          <div className="activity-list-heading">
            <h2 id="activity-heading">
              每期活动 <span>{drafts.length}</span>
            </h2>
            <p>从一个好问题，到一场好讨论。</p>
          </div>
          {drafts.length ? (
            <div className="activity-grid">
              {[...drafts]
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .map((draft) => (
                  <article
                    className="activity-card"
                    key={draft.id}
                    data-testid="activity-card"
                  >
                    <button
                      className="activity-preview-button"
                      onClick={() => onOpen(draft.id)}
                      aria-label={`打开活动 ${draft.name}`}
                    >
                      <PosterThumbnail draft={draft} />
                    </button>
                    <div className="activity-card-content">
                      <div className="activity-meta">
                        <span>
                          {draft.event.issue
                            ? `第 ${draft.event.issue} 期`
                            : "新一期"}
                        </span>
                        {draft.event.isSample && (
                          <span className="sample-label">示例活动</span>
                        )}
                      </div>
                      <h3>{draft.event.title || draft.name || "未命名活动"}</h3>
                      <p className="activity-draft-name">{draft.name}</p>
                      <div className="activity-details">
                        <span>
                          <UserIcon size={16} />
                          {draft.event.speaker || "主讲人待定"}
                        </span>
                        <span>
                          <CalendarBlankIcon size={16} />
                          {draft.event.date
                            ? displayDate(draft.event.date)
                            : "时间待定"}
                          {draft.event.start && ` · ${draft.event.start}`}
                        </span>
                      </div>
                      <div className="activity-topics">
                        {splitTopics(draft.event.topics).map((topic, index) => (
                          <span key={index}>{topic}</span>
                        ))}
                      </div>
                      <div className="activity-card-actions">
                        <button
                          className="activity-edit"
                          onClick={() => onOpen(draft.id)}
                        >
                          编辑活动
                          <ArrowRightIcon size={17} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`复制 ${draft.name}`}
                          title="复制为新一期"
                          onClick={() => onDuplicate(draft)}
                        >
                          <CopyIcon size={19} />
                        </button>
                        <button
                          className="icon-button delete-button"
                          aria-label={`删除 ${draft.name}`}
                          title="删除活动"
                          onClick={() => onRemove(draft)}
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <div className="activity-empty">
              <CalendarBlankIcon size={42} weight="light" />
              <h3>下一次分享，从这里开始。</h3>
              <p>点击“新建活动”填写主题和主讲人，或导入已有草稿。</p>
            </div>
          )}
        </section>
        <footer className="home-footer">
          <span>No Marketing. Go Deep. Open Discussion.</span>
          <p>
            活动保存在当前浏览器。更换设备或从本地工具迁移时，请使用草稿导入 /
            导出。
          </p>
        </footer>
      </main>
      {children}
    </div>
  );
}
