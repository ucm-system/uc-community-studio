import { forwardRef, type CSSProperties } from "react";
import { displayDate, splitLines, splitTopics, type Draft } from "./model";
import { CommunityName, SeriesTitle } from "./BrandText";

function Principles({ text }: { text: string }) {
  return (
    <div className="principles" data-check="社区主张">
      {splitLines(text).map((line, index) => (
        <strong key={index}>{line}</strong>
      ))}
    </div>
  );
}

function Topics({ text }: { text: string }) {
  return (
    <div className="topics" data-check="技术分类">
      {splitTopics(text).map((topic, index) => (
        <span key={index}>{topic}</span>
      ))}
    </div>
  );
}

function Brand({ draft }: { draft: Draft }) {
  return (
    <header className="poster-brand">
      <img
        className="brand-symbol"
        src={`${import.meta.env.BASE_URL}assets/ucm-symbol.png`}
        alt="UC 图形标志"
      />
      <div>
        <div className="brand-name" data-check="社区名称">
          <CommunityName text={draft.community.name} />
        </div>
        <div className="brand-tagline" data-check="社区定位">
          {draft.community.tagline}
        </div>
      </div>
    </header>
  );
}

function Participation({ draft }: { draft: Draft }) {
  const e = draft.event;
  const hasSpeaker = e.speaker || e.role || e.avatar;
  const hasTime = e.date || e.start || e.end;
  if (!hasSpeaker && !hasTime && !e.location && !e.qr) return null;
  return (
    <section
      className={`participation ${e.qr ? "with-qr" : ""}`}
      data-check="主讲人、时间与参与信息"
    >
      {hasSpeaker && (
        <div className="speaker-block">
          {e.avatar && (
            <img className="speaker-avatar" src={e.avatar} alt="主讲人头像" />
          )}
          <div className="speaker-copy">
            <div className="small-label">主讲人</div>
            {e.speaker && (
              <div className="speaker-name" data-check="主讲人姓名">
                {e.speaker}
              </div>
            )}
            {e.role && (
              <div className="speaker-role" data-check="主讲人身份">
                {e.role}
              </div>
            )}
          </div>
        </div>
      )}
      {(hasTime || e.location) && (
        <div className="schedule-block">
          {hasTime && (
            <>
              <div className="small-label">时间</div>
              <div className="schedule-date">{displayDate(e.date)}</div>
              <div className="schedule-time">
                {[e.start, e.end].filter(Boolean).join("–")}
              </div>
            </>
          )}
          {e.location && (
            <>
              <div className="small-label location-label">地点</div>
              <div className="schedule-location" data-check="地点或会议说明">
                {e.location}
              </div>
            </>
          )}
        </div>
      )}
      {e.qr && (
        <div className="qr-block">
          <img src={e.qr} alt="参与二维码" />
          {e.qrCaption && <div data-check="二维码说明">{e.qrCaption}</div>}
        </div>
      )}
    </section>
  );
}

function EventPoster({ draft }: { draft: Draft }) {
  const c = draft.community;
  const e = draft.event;
  const points = splitLines(e.outline);
  return (
    <>
      <Brand draft={draft} />
      <section className="event-heading">
        <div className="event-series" data-check="栏目名称">
          <SeriesTitle text={c.series} />
        </div>
        {(e.issue || e.isSample) && (
          <div className="event-issue">
            {e.issue && `第 ${e.issue} 期`}
            {e.issue && e.isSample && " · "}
            {e.isSample && "示例活动"}
          </div>
        )}
        <h1 className="topic-title" data-check="分享标题">
          {e.title}
        </h1>
        {e.subtitle && (
          <p className="event-subtitle" data-check="副标题">
            {e.subtitle}
          </p>
        )}
      </section>
      <Participation draft={draft} />
      {points.length > 0 && (
        <section className="discussion-points" data-check="简介或讨论要点">
          <h2>分享要点</h2>
          <ol>
            {points.map((point, index) => (
              <li key={index}>
                <span className="point-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      <div className="event-footnote">
        <Topics text={e.topics} />
        <div className="weekly-copy" data-check="栏目介绍">
          <p>{c.english}</p>
          <p>{c.chinese}</p>
        </div>
      </div>
      <Principles text={c.principles} />
    </>
  );
}

function CommunityPoster({ draft }: { draft: Draft }) {
  const c = draft.community;
  return (
    <>
      <Brand draft={draft} />
      <section className="community-intro" data-check="社区介绍">
        <p className="intro-lead">{c.introduction}</p>
        <p>{c.focus}</p>
      </section>
      <section className="community-series" data-check="栏目名称与介绍">
        <div className="section-rule" />
        <h1>
          <SeriesTitle text={c.series} />
        </h1>
        <p className="series-english">{c.english}</p>
        <p className="series-chinese">{c.chinese}</p>
      </section>
      <p className="community-discussion" data-check="讨论理念">
        {c.discussion}
      </p>
      <div className="community-footer">
        <Principles text={c.principles} />
        <Topics text={c.topics} />
        <p className="community-origin" data-check="社区来源">
          {c.origin}
        </p>
      </div>
    </>
  );
}

export const Poster = forwardRef<HTMLElement, { draft: Draft }>(function Poster(
  { draft },
  ref,
) {
  return (
    <article
      ref={ref}
      className={`poster ${draft.kind} ${draft.format}`}
      style={{ "--title-scale": draft.titleScale } as CSSProperties}
      data-testid="poster"
      aria-label={draft.kind === "event" ? "活动海报预览" : "社区介绍海报预览"}
    >
      <img
        className="poster-art"
        src={`${import.meta.env.BASE_URL}assets/open-commons-motif.png`}
        alt=""
      />
      <img
        className="poster-edge-art edge-right"
        src={`${import.meta.env.BASE_URL}assets/open-commons-motif.png`}
        alt=""
      />
      <img
        className="poster-edge-art edge-left"
        src={`${import.meta.env.BASE_URL}assets/open-commons-motif.png`}
        alt=""
      />
      <div className="poster-content" data-check="整体版式">
        {draft.kind === "event" ? (
          <EventPoster draft={draft} />
        ) : (
          <CommunityPoster draft={draft} />
        )}
      </div>
    </article>
  );
});
