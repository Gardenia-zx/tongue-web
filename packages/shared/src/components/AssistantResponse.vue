<template>
  <article class="assistant-response" :class="{ pending: status === 'PENDING', failed: status === 'FAILED' }">
    <header class="response-head">
      <span class="response-icon" aria-hidden="true">
        <Sparkles :size="17" :stroke-width="1.7" />
      </span>
      <div>
        <strong>健康助手</strong>
        <small>{{ statusLabel }}</small>
      </div>
    </header>

    <div v-if="status === 'PENDING'" class="response-skeleton" aria-label="正在生成回答">
      <span />
      <span />
      <span />
    </div>

    <template v-else-if="hasStructuredContent">
      <section class="response-intro">
        <h3 v-if="structuredTitle">{{ structuredTitle }}</h3>
        <p>{{ structuredSummary || content }}</p>
      </section>

      <div v-if="structuredSections.length" class="response-sections">
        <section v-for="(section, index) in structuredSections" :key="`${section.title}-${index}`" class="response-section">
          <div class="section-title">
            <span class="section-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <h4>{{ section.title || '建议' }}</h4>
          </div>
          <p v-if="section.content">{{ section.content }}</p>
          <ul v-if="section.items.length">
            <li v-for="item in section.items" :key="item">
              <CircleCheck :size="16" :stroke-width="1.7" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>
      </div>

      <p v-if="structuredDisclaimer" class="response-disclaimer">
        <Info :size="15" :stroke-width="1.7" aria-hidden="true" />
        <span>{{ structuredDisclaimer }}</span>
      </p>
    </template>

    <template v-else>
      <div v-if="plainSegments.length > 2" class="plain-structured">
        <p class="plain-lead">{{ plainSegments[0] }}</p>
        <ul>
          <li v-for="item in plainSegments.slice(1)" :key="item">
            <span class="plain-dot" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="plain-answer">
        <p v-for="item in plainSegments" :key="item">{{ item }}</p>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleCheck, Info, Sparkles } from "lucide-vue-next";

interface StructuredSection {
  title: string;
  content: string;
  items: string[];
}

const props = defineProps<{
  content: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  structuredContent?: Record<string, unknown>;
}>();

const statusLabel = computed(() => {
  if (props.status === "PENDING") return "正在整理建议";
  if (props.status === "FAILED") return "本次回答未完成";
  return "健康管理参考";
});

const hasStructuredContent = computed(() => {
  if (!props.structuredContent) return false;
  return Boolean(
    asString(props.structuredContent.title)
      || asString(props.structuredContent.summary)
      || Array.isArray(props.structuredContent.sections),
  );
});

const structuredTitle = computed(() => asString(props.structuredContent?.title));
const structuredSummary = computed(() => asString(props.structuredContent?.summary));
const structuredDisclaimer = computed(() => asString(props.structuredContent?.disclaimer));

const structuredSections = computed<StructuredSection[]>(() => {
  const value = props.structuredContent?.sections;
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      title: asString(item.title),
      content: asString(item.content),
      items: Array.isArray(item.items) ? item.items.filter((entry): entry is string => typeof entry === "string") : [],
    }))
    .filter((item) => item.title || item.content || item.items.length);
});

const plainSegments = computed(() => {
  const content = props.content.trim();
  if (!content) return ["本次没有生成有效内容，请稍后再试。"];

  const lineSegments = content.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  if (lineSegments.length > 1) return lineSegments;
  if (content.length < 110) return [content];

  const sentenceSegments = content.match(/[^。！？；]+[。！？；]?/g)?.map((item) => item.trim()).filter(Boolean) || [];
  return sentenceSegments.length > 2 ? sentenceSegments : [content];
});

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
</script>

<style scoped>
.assistant-response {
  width: min(100%, 720px);
  padding: 22px 24px 24px;
  border: 1px solid rgba(185, 194, 184, 0.68);
  border-radius: 22px 22px 22px 8px;
  background: rgba(255, 254, 253, 0.94);
  box-shadow: var(--th-shadow-sm);
}

.assistant-response.failed {
  border-color: rgba(157, 81, 76, 0.28);
  background: #fff9f7;
}

.response-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 17px;
}

.response-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 11px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.response-head strong,
.response-head small {
  display: block;
}

.response-head strong {
  font-size: 13px;
  font-weight: 680;
  letter-spacing: -0.015em;
}

.response-head small {
  margin-top: 2px;
  color: var(--th-text-muted);
  font-size: 11px;
}

.response-intro h3 {
  margin: 0 0 9px;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 650;
  letter-spacing: -0.035em;
  line-height: 1.25;
  text-wrap: balance;
}

.response-intro p,
.plain-answer p,
.plain-lead,
.response-section p {
  margin: 0;
  color: var(--th-text-soft, #46534b);
  font-size: 15px;
  line-height: 1.85;
  text-wrap: pretty;
}

.response-sections {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.response-section {
  padding: 16px 17px;
  border-radius: 16px;
  background: var(--th-surface-soft);
}

.section-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.section-index {
  color: var(--th-accent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.section-title h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 680;
}

.response-section ul,
.plain-structured ul {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.response-section li {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  color: var(--th-text-soft, #46534b);
  font-size: 14px;
  line-height: 1.65;
}

.response-section li svg {
  margin-top: 3px;
  color: var(--th-primary);
}

.response-disclaimer {
  display: grid;
  grid-template-columns: 17px minmax(0, 1fr);
  gap: 8px;
  margin: 17px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--th-border);
  color: var(--th-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.plain-structured {
  display: grid;
  gap: 16px;
}

.plain-lead {
  color: var(--th-text) !important;
  font-size: 16px !important;
  font-weight: 560;
}

.plain-structured li {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  gap: 11px;
  align-items: start;
  color: var(--th-text-soft, #46534b);
  font-size: 14px;
  line-height: 1.75;
}

.plain-dot {
  width: 5px;
  height: 5px;
  margin-top: 10px;
  border-radius: 50%;
  background: var(--th-primary);
}

.plain-answer {
  display: grid;
  gap: 11px;
}

.response-skeleton {
  display: grid;
  gap: 10px;
}

.response-skeleton span {
  display: block;
  height: 11px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e5e9e3 20%, #f4f5f1 45%, #e5e9e3 70%);
  background-size: 240% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.response-skeleton span:nth-child(2) {
  width: 92%;
}

.response-skeleton span:nth-child(3) {
  width: 68%;
}

@keyframes shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (max-width: 640px) {
  .assistant-response {
    padding: 18px;
    border-radius: 19px 19px 19px 7px;
  }
}
</style>
