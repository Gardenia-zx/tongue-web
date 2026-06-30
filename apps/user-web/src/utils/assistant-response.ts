import type {
  AgentAssistantMessage,
  AgentContextBinding,
  AgentReportRef,
} from "@tongue/shared";

export interface StructuredSection {
  sectionKey?: string;
  title?: string;
  content?: string;
  items?: string[];
  metadata?: Record<string, unknown>;
}

export interface StructuredAnswer {
  answerType?: string;
  title?: string;
  summary?: string;
  highlights?: string[];
  sections?: StructuredSection[];
  disclaimer?: string;
}

const INTERNAL_JSON_MARKERS = [
  '"structured_content"',
  '"structuredContent"',
  '"tool_decision"',
  '"tool_calls"',
  '"quality_review"',
  '"next_action"',
  '"state_snapshot"',
  '"agent_loop"',
  '"final_answer"',
];

export function looksLikeInternalJson(text: string) {
  const compact = text.trim();
  if (!compact.startsWith("{") && !compact.startsWith("```json") && !compact.startsWith("```") && !compact.includes("```json")) {
    return false;
  }
  return INTERNAL_JSON_MARKERS.some((marker) => compact.includes(marker));
}

export function formatStructuredItem(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(formatStructuredItem).filter(Boolean).join("、");
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    for (const key of ["content", "text", "summary", "label", "title", "description", "advice", "action"]) {
      if (typeof item[key] === "string") return item[key] as string;
    }
    return Object.entries(item)
      .filter(([, itemValue]) => typeof itemValue === "string" || typeof itemValue === "number")
      .map(([key, itemValue]) => `${key}：${itemValue}`)
      .join("；");
  }
  return "";
}

export function sanitizeStructuredContent(value: unknown): StructuredAnswer | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => {
          const items = Array.isArray(item.items)
            ? item.items.map(formatStructuredItem).filter(Boolean)
            : undefined;
          return {
            sectionKey: typeof item.section_key === "string"
              ? item.section_key
              : typeof item.sectionKey === "string"
                ? item.sectionKey
                : undefined,
            title: typeof item.title === "string" ? item.title : undefined,
            content: typeof item.content === "string" ? item.content : undefined,
            items,
            metadata: item.metadata && typeof item.metadata === "object"
              ? item.metadata as Record<string, unknown>
              : undefined,
          };
        })
        .filter((item) => item.title || item.content || item.items?.length)
    : undefined;
  return {
    answerType: typeof raw.answer_type === "string"
      ? raw.answer_type
      : typeof raw.answerType === "string"
        ? raw.answerType
        : undefined,
    title: typeof raw.title === "string" ? raw.title : undefined,
    summary: typeof raw.summary === "string" ? raw.summary : undefined,
    highlights: Array.isArray(raw.highlights) ? raw.highlights.map(formatStructuredItem).filter(Boolean) : undefined,
    sections,
    disclaimer: typeof raw.disclaimer === "string" ? raw.disclaimer : undefined,
  };
}

export function structuredContentToText(value?: StructuredAnswer): string {
  if (!value) return "";
  const parts: string[] = [];
  if (value.summary) parts.push(value.summary);
  else if (value.title) parts.push(value.title);
  for (const section of value.sections || []) {
    if (section.title) parts.push(`${section.title}：`);
    if (section.content) parts.push(section.content);
    for (const [index, item] of (section.items || []).entries()) {
      parts.push(`${index + 1}. ${item}`);
    }
  }
  if (value.disclaimer) parts.push(value.disclaimer);
  return parts.filter(Boolean).join("\n");
}

export function normalizeAssistantMessage(message: AgentAssistantMessage) {
  const structuredContent = sanitizeStructuredContent(message.structuredContent);
  const rawContent = (message.content || "").trim();
  let content = rawContent;
  if (looksLikeInternalJson(rawContent)) {
    content = structuredContentToText(structuredContent) || "回答生成格式异常，请重新发送问题。";
  }
  return {
    content,
    structuredContent,
    reportRef: message.reportRef as AgentReportRef | undefined,
    contentType: structuredContent ? "structured" as const : message.contentType,
  };
}

export function resolveContextBinding(content: string, reportId?: number): AgentContextBinding {
  const compact = content.replace(/\s+/g, "");
  if (/(不要结合报告|不参考报告|不用报告|这是新问题|单独问一下)/.test(compact)) {
    return { mode: "NONE" };
  }
  const mentionsReport = /(报告|舌象结果|分析结果|识别结果|上一份舌象|刚才的舌象)/.test(compact);
  const detailedReport = /((详细|完整|展开|太简单|不够详细).*?(报告|分析))|((报告|分析).*?(详细|完整|展开|太简单|不够详细))/.test(compact);
  const dietOrCare = /(饮食|吃什么|怎么吃|每天吃|食谱|忌口|食物|早餐|午餐|晚餐|调理|规划|运动|锻炼)/.test(compact);
  if ((mentionsReport || detailedReport || dietOrCare) && reportId) {
    return { mode: "ACTIVE_REPORT", reportId };
  }
  if (/^(继续|再详细|详细一点|展开说说|刚才|上面|这个|那这个|具体一点|再具体点|多说一点|不够详细|太简单|讲清楚一点|说一下原因|应该怎么做)/.test(compact)) {
    return { mode: "LAST_ANSWER" };
  }
  return { mode: "AUTO" };
}
