import {
  DEFAULT_COMMUNITY,
  SAMPLE_EVENT,
  splitLines,
  splitTopics,
} from "./model";

// Share the editor's example so the form and the guest-facing reference agree.
export const GUEST_BRIEF = `你好！欢迎参加 ${DEFAULT_COMMUNITY.series}。
为了准备活动海报，请填写下面的信息，填写示例附在后面。

【待填写】
分享主题：
副标题（可选）：
讨论要点（建议 3 项）：
1.
2.
3.
主讲人姓名（用于海报展示）：
身份介绍（一句话）：
技术方向（可选 ${splitTopics(DEFAULT_COMMUNITY.topics).join(" / ")}）：
可分享日期：
开始时间：
结束时间：
地点或线上会议说明（可选，可由组织者补充）：
头像（可选，请另附清晰图片）：
参与二维码（可选，可由组织者补充）：

【填写示例 · 以下为示例信息，并非已确认安排】
分享主题：${SAMPLE_EVENT.title.replaceAll("\n", "，")}
副标题：${SAMPLE_EVENT.subtitle}
讨论要点：
${splitLines(SAMPLE_EVENT.outline)
  .map((line, index) => `${index + 1}. ${line}`)
  .join("\n")}
主讲人姓名：${SAMPLE_EVENT.speaker}
身份介绍：${SAMPLE_EVENT.role}
技术方向：${splitTopics(SAMPLE_EVENT.topics).join(" / ")}
可分享日期：${SAMPLE_EVENT.date}
开始时间：${SAMPLE_EVENT.start}
结束时间：${SAMPLE_EVENT.end}
地点或线上会议说明：${SAMPLE_EVENT.location}
头像：可另附 PNG 或 JPG 图片
参与二维码：由组织者补充

${DEFAULT_COMMUNITY.chinese}
No Marketing. Go Deep. Open Discussion.`;
