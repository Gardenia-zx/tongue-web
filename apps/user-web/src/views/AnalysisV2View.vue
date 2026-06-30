<template>
  <section class="chat-page">
    <main ref="messageListRef" class="chat-scroll">
      <div v-if="messages.length === 0" class="welcome">
        <div class="welcome-mark"><Bot :size="25" /></div>
        <h1>舌象健康助手</h1>
        <p>可以直接描述身体情况，也可以上传舌象图片一起分析。</p>
      </div>

      <div class="thread">
        <article v-for="message in messages" :key="message.id" :class="['message-row', message.role]">
          <div class="message-avatar">
            <Bot v-if="message.role === 'assistant'" :size="18" />
            <User v-else :size="18" />
          </div>

          <div class="message-main">
            <div :class="['message-bubble', message.status.toLowerCase()]">
              <img v-if="message.imageUrl" class="message-image" :src="message.imageUrl" alt="舌象图片" />

              <div v-if="isTextThinkingMessage(message)" class="thinking-card">
                <span class="thinking-dot"></span>
                <span>{{ message.thinkingStage || "正在处理你的问题" }}</span>
              </div>

              <div v-else-if="showAnalysisProcess(message)" class="analysis-process-card">
                <div class="process-header">
                  <div>
                    <span class="process-kicker">TONGUE ANALYSIS</span>
                    <strong>{{ currentProcessLabel(message) }}</strong>
                  </div>
                  <span class="process-percent">{{ processPercent(message) }}%</span>
                </div>

                <div class="process-track">
                  <i :style="{ width: `${processPercent(message)}%` }"></i>
                </div>

                <div class="process-steps">
                  <div
                    v-for="step in analysisSteps(message)"
                    :key="step.key"
                    :class="['process-step', step.state]"
                  >
                    <span class="step-icon">
                      <Check v-if="step.state === 'done'" :size="15" />
                      <LoaderCircle v-else-if="step.state === 'active'" :size="16" class="spin" />
                      <Circle v-else :size="13" />
                    </span>
                    <div>
                      <strong>{{ step.title }}</strong>
                      <small>{{ step.description }}</small>
                    </div>
                  </div>
                </div>

                <div class="process-note">
                  <Sparkles :size="15" />
                  <span>分析完成后会自动切换为逐字生成的回复。</span>
                </div>
              </div>

              <p v-else-if="!message.structuredContent">
                {{ visibleMessageContent(message) }}<span v-if="message.typing" class="type-cursor"></span>
              </p>

              <div
                v-if="message.role === 'assistant' && message.structuredContent"
                class="structured-answer"
              >
                <h3 v-if="message.structuredContent.title">
                  {{ message.structuredContent.title }}
                </h3>
                <p v-if="message.structuredContent.summary" class="structured-summary">
                  {{ message.structuredContent.summary }}
                </p>

                <ul v-if="message.structuredContent.highlights?.length" class="structured-highlights">
                  <li
                    v-for="(item, index) in message.structuredContent.highlights"
                    :key="`highlight_${index}`"
                  >
                    {{ formatStructuredItem(item) }}
                  </li>
                </ul>

                <section
                  v-for="(section, sectionIndex) in message.structuredContent.sections || []"
                  :key="section.sectionKey || `section_${sectionIndex}`"
                  class="structured-section"
                >
                  <h4 v-if="section.title">{{ section.title }}</h4>
                  <p v-if="section.content">{{ section.content }}</p>
                  <ul v-if="section.items?.length">
                    <li v-for="(item, itemIndex) in section.items" :key="`item_${itemIndex}`">
                      {{ formatStructuredItem(item) }}
                    </li>
                  </ul>
                </section>

                <div v-if="message.structuredContent.disclaimer" class="structured-disclaimer">
                  {{ message.structuredContent.disclaimer }}
                </div>
              </div>

              <div
                v-if="message.role === 'assistant' && message.status === 'COMPLETED' && message.reportRef?.reportId"
                class="actions"
              >
                <el-button type="primary" plain @click="openReport(message.reportRef.reportId)">
                  查看完整报告
                </el-button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <footer class="composer-wrap">
      <div class="composer">
        <div v-if="selectedFile" class="attachment">
          <img v-if="selectedPreviewUrl" :src="selectedPreviewUrl" alt="待发送图片" />
          <div>
            <strong>{{ selectedFile.name }}</strong>
            <span>{{ fileSize }}</span>
          </div>
          <el-button link :icon="X" :disabled="running" @click="clearSelectedImage" />
        </div>

        <div v-if="latestReport" class="report-context-hint">
          当前可引用报告 #{{ latestReport.reportId }}。提到“报告”“刚才的分析”或要求展开时会自动绑定。
        </div>

        <div class="input-row">
          <input
            ref="fileInputRef"
            class="hidden-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="onFileChange"
          />
          <el-button class="image-upload-button" :disabled="running" @click="openFilePicker">
            <ImagePlus :size="19" />
            <span>图片</span>
          </el-button>
          <el-input
            v-model="draft"
            class="prompt-input"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 6 }"
            maxlength="500"
            resize="none"
            placeholder="给舌象健康助手发送消息"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <el-button class="send-button" type="primary" :loading="running" @click="sendMessage">
            <Send v-if="!running" :size="18" />
          </el-button>
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Bot,
  Check,
  Circle,
  ImagePlus,
  LoaderCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-vue-next";
import {
  agentChatV2Api,
  healthPlanApi,
  tongueApi,
  USER_KEY,
  type AgentContextBinding,
  type AgentMessageStatus,
  type AgentReportRef,
  type ReportDetail,
  type TaskStatus,
  type UserMe,
} from "@tongue/shared";
import {
  formatStructuredItem as formatAssistantStructuredItem,
  normalizeAssistantMessage,
  resolveContextBinding,
  sanitizeStructuredContent as sanitizeAssistantStructuredContent,
} from "../utils/assistant-response";

type ChatRole = "assistant" | "user";
type ProcessPhase = "UPLOADING" | "PENDING" | "MODEL_ANALYZING" | "RESULT_ANALYZING" | "RAG_RETRIEVING" | "REPORT_GENERATING";
type ProcessStepState = "done" | "active" | "waiting";

interface StructuredSection {
  sectionKey?: string;
  title?: string;
  content?: string;
  items?: unknown[];
  metadata?: Record<string, unknown>;
}

interface StructuredAnswer {
  answerType?: string;
  title?: string;
  summary?: string;
  highlights?: unknown[];
  sections?: StructuredSection[];
  disclaimer?: string;
}

interface ChatMessage {
  id: string;
  requestId: string;
  turnId?: string;
  serverMessageId?: string;
  role: ChatRole;
  contentType: "text" | "structured";
  content: string;
  structuredContent?: StructuredAnswer;
  status: AgentMessageStatus;
  imageUrl?: string;
  task?: TaskStatus;
  reportRef?: AgentReportRef;
  thinkingStage?: string;
  typing?: boolean;
  displayContent?: string;
  processPhase?: ProcessPhase;
}

interface ProcessStep {
  key: string;
  title: string;
  description: string;
  state: ProcessStepState;
}

interface LatestReportContext {
  reportId: number;
  summary?: string;
  featureSummary?: string;
  reportStatus?: string;
}

interface StoredChatSessionV2 {
  schemaVersion: 2;
  userId: string;
  threadId: string;
  conversationId: string;
  messages: ChatMessage[];
  latestReport?: LatestReportContext | null;
  updatedAt: number;
}

const CHAT_SESSION_PREFIX = "tongue_user_chat_session";
const MAX_POLL_ATTEMPTS = 240;
const POLL_INTERVAL_MS = 1500;
const router = useRouter();
const draft = ref("");
const running = ref(false);
const selectedFile = ref<File | null>(null);
const selectedPreviewUrl = ref("");
const fileInputRef = ref<HTMLInputElement | null>(null);
const messageListRef = ref<HTMLElement | null>(null);
const chatThreadId = ref(`web_chat_${createId()}`);
const conversationId = ref(`conversation_${createId()}`);
const messages = ref<ChatMessage[]>([]);
const latestReport = ref<LatestReportContext | null>(null);
const pollingTaskIds = new Set<number>();
const thinkingTimers = new Map<string, number>();
const typingTimers = new Map<string, number>();

const THINKING_STAGES = ["理解你的问题", "读取上下文", "整理相关信息", "生成回答"];
const PROCESS_STAGE_LABELS: Record<string, string> = {
  UPLOADING: "正在上传并校验舌象图片",
  PENDING: "图片已接收，等待开始分析",
  MODEL_ANALYZING: "舌象模型正在识别图像特征",
  RESULT_ANALYZING: "正在分析识别结果和用户描述",
  RAG_RETRIEVING: "正在检索相关健康知识",
  REPORT_GENERATING: "正在生成饮食、睡眠和运动建议",
  REPORT_READY: "报告已经生成",
  COMPLETED: "分析已经完成",
};

const fileSize = computed(() => {
  const size = selectedFile.value?.size || 0;
  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / 1024 / 1024).toFixed(2)} MB`;
});

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function currentUserId() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return "guest";
  try {
    const user = JSON.parse(raw) as UserMe;
    return user.userId ? String(user.userId) : "guest";
  } catch {
    return "guest";
  }
}

function chatStorageKey() {
  return `${CHAT_SESSION_PREFIX}_${currentUserId()}`;
}

function visibleMessageContent(message: ChatMessage) {
  return message.displayContent ?? message.content;
}

function isTextThinkingMessage(message: ChatMessage) {
  return message.role === "assistant"
    && message.status === "PENDING"
    && !message.task
    && !message.processPhase
    && !message.typing;
}

function showAnalysisProcess(message: ChatMessage) {
  return message.role === "assistant"
    && message.status === "PENDING"
    && !message.typing
    && Boolean(message.task || message.processPhase);
}

function currentProcessStage(message: ChatMessage) {
  return String(
    message.processPhase
    || message.task?.currentStage
    || message.task?.status
    || "PENDING",
  ).toUpperCase();
}

function currentProcessLabel(message: ChatMessage) {
  const stage = currentProcessStage(message);
  return PROCESS_STAGE_LABELS[stage] || "正在处理舌象分析任务";
}

function processRank(message: ChatMessage) {
  const stage = currentProcessStage(message);
  if (stage === "UPLOADING" || stage === "PENDING") return 0;
  if (stage === "MODEL_ANALYZING" || stage === "RUNNING") return 1;
  if (stage === "RESULT_ANALYZING" || stage === "RAG_RETRIEVING") return 2;
  if (stage === "REPORT_GENERATING") return 3;
  if (stage === "REPORT_READY" || stage === "COMPLETED") return 4;
  return 0;
}

function processPercent(message: ChatMessage) {
  const taskProgress = message.task?.progress;
  if (typeof taskProgress === "number" && taskProgress > 0) {
    return Math.min(96, Math.max(8, Math.round(taskProgress * 100)));
  }
  return [8, 28, 58, 82, 100][processRank(message)] || 8;
}

function analysisSteps(message: ChatMessage): ProcessStep[] {
  const current = processRank(message);
  const definitions = [
    { key: "upload", title: "图片上传与校验", description: "检查格式、大小和分析任务上下文" },
    { key: "model", title: "舌象模型分析", description: "识别舌质、舌苔和局部特征" },
    { key: "result", title: "结果分析", description: "结合识别特征、用户描述和知识信息" },
    { key: "report", title: "健康建议生成", description: "整理饮食、睡眠、运动和观察计划" },
  ];
  return definitions.map((step, index) => ({
    ...step,
    state: index < current ? "done" : index === current ? "active" : "waiting",
  }));
}

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function stopThinking(messageId: string) {
  const timer = thinkingTimers.get(messageId);
  if (timer) window.clearInterval(timer);
  thinkingTimers.delete(messageId);
}

function startThinking(message: ChatMessage) {
  stopThinking(message.id);
  let index = 0;
  message.thinkingStage = THINKING_STAGES[index];
  const timer = window.setInterval(() => {
    index = Math.min(index + 1, THINKING_STAGES.length - 1);
    message.thinkingStage = THINKING_STAGES[index];
    if (index === THINKING_STAGES.length - 1) stopThinking(message.id);
  }, 1100);
  thinkingTimers.set(message.id, timer);
}

function stopTyping(message: ChatMessage) {
  const timer = typingTimers.get(message.id);
  if (timer) window.clearInterval(timer);
  typingTimers.delete(message.id);
  message.typing = false;
  message.displayContent = undefined;
}

function typeAssistantMessage(message: ChatMessage, finalText: string, done?: () => void) {
  stopThinking(message.id);
  stopTyping(message);
  message.content = finalText;
  message.processPhase = undefined;
  message.task = undefined;

  if (prefersReducedMotion() || finalText.length < 2) {
    message.displayContent = undefined;
    done?.();
    saveChatSession();
    return;
  }

  let index = 0;
  message.typing = true;
  message.displayContent = "";
  const timer = window.setInterval(() => {
    const step = finalText.length > 500 ? 8 : finalText.length > 180 ? 5 : 3;
    index = Math.min(finalText.length, index + step);
    message.displayContent = finalText.slice(0, index);
    void scrollToBottom();
    if (index < finalText.length) return;

    const currentTimer = typingTimers.get(message.id);
    if (currentTimer) window.clearInterval(currentTimer);
    typingTimers.delete(message.id);
    message.typing = false;
    message.displayContent = undefined;
    done?.();
    saveChatSession();
    void scrollToBottom();
  }, 24);
  typingTimers.set(message.id, timer);
}

function clearTransientTimers() {
  for (const timer of thinkingTimers.values()) window.clearInterval(timer);
  for (const timer of typingTimers.values()) window.clearInterval(timer);
  thinkingTimers.clear();
  typingTimers.clear();
  for (const message of messages.value) {
    message.thinkingStage = undefined;
    if (!message.typing) continue;
    message.typing = false;
    message.displayContent = undefined;
    if (message.status === "PENDING" && message.content) message.status = "COMPLETED";
  }
}

function sanitizeStructuredContent(value: unknown): StructuredAnswer | undefined {
  return sanitizeAssistantStructuredContent(value) as StructuredAnswer | undefined;
}

function sanitizeMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const role = raw.role === "assistant" ? "assistant" : raw.role === "user" ? "user" : null;
  if (!role || typeof raw.content !== "string") return null;

  const message: ChatMessage = {
    id: typeof raw.id === "string" ? raw.id : createId(),
    requestId: typeof raw.requestId === "string" ? raw.requestId : createId(),
    turnId: typeof raw.turnId === "string" ? raw.turnId : undefined,
    serverMessageId: typeof raw.serverMessageId === "string" ? raw.serverMessageId : undefined,
    role,
    contentType: raw.contentType === "structured" ? "structured" : "text",
    content: raw.content,
    structuredContent: sanitizeStructuredContent(raw.structuredContent),
    status: raw.status === "PENDING" || raw.status === "FAILED" ? raw.status : "COMPLETED",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    task: raw.task as TaskStatus | undefined,
    processPhase: typeof raw.processPhase === "string" ? raw.processPhase as ProcessPhase : undefined,
  };

  if (role === "assistant") {
    const reportRef = raw.reportRef as AgentReportRef | undefined;
    const legacyReportId = typeof raw.reportId === "number" ? raw.reportId : undefined;
    if (reportRef?.reportId) message.reportRef = reportRef;
    else if (legacyReportId) message.reportRef = { reportId: legacyReportId, relation: "GENERATED" };
  }
  return message;
}

function latestReportIdFromMessages() {
  for (let index = messages.value.length - 1; index >= 0; index -= 1) {
    const reportId = messages.value[index]?.reportRef?.reportId;
    if (reportId) return reportId;
  }
  return undefined;
}

function latestKnownReportId() {
  return latestReport.value?.reportId || latestReportIdFromMessages();
}

function restoreChatSession() {
  const raw = localStorage.getItem(chatStorageKey());
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.threadId === "string") chatThreadId.value = parsed.threadId;
    if (typeof parsed.conversationId === "string") conversationId.value = parsed.conversationId;
    if (Array.isArray(parsed.messages)) {
      messages.value = parsed.messages
        .map(sanitizeMessage)
        .filter((item): item is ChatMessage => Boolean(item))
        .slice(-80);
    }
    latestReport.value = (parsed.latestReport as LatestReportContext | null) || null;
    if (!latestReport.value) {
      const reportId = latestReportIdFromMessages();
      if (reportId) latestReport.value = { reportId };
    }
    saveChatSession();
  } catch {
    localStorage.removeItem(chatStorageKey());
  }
}

function saveChatSession() {
  const session: StoredChatSessionV2 = {
    schemaVersion: 2,
    userId: currentUserId(),
    threadId: chatThreadId.value,
    conversationId: conversationId.value,
    messages: messages.value.slice(-80).map(toStoredMessage),
    latestReport: latestReport.value,
    updatedAt: Date.now(),
  };
  localStorage.setItem(chatStorageKey(), JSON.stringify(session));
}

function toStoredMessage(message: ChatMessage) {
  const stored = { ...message };
  delete stored.thinkingStage;
  delete stored.typing;
  delete stored.displayContent;
  if (message.role === "user") {
    delete stored.reportRef;
    delete stored.structuredContent;
  }
  return stored;
}

function rememberLatestReport(report: ReportDetail) {
  latestReport.value = {
    reportId: report.reportId,
    summary: report.summary,
    featureSummary: report.featureSummary,
    reportStatus: report.reportStatus,
  };
}

function contextBindingFor(content: string): AgentContextBinding {
  return resolveContextBinding(content, latestKnownReportId());
}

function isDailyPlanRequest(content: string) {
  const compact = content.replace(/\s+/g, "");
  return /(每天|每日|今日|今天).*(安排|计划|打卡|怎么做|做什么)|健康计划|执行计划|日常计划/.test(compact);
}

function formatStructuredItem(value: unknown) {
  return formatAssistantStructuredItem(value);
}

function openFilePicker() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    ElMessage.error("仅支持 JPG、PNG、WEBP 图片");
    input.value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error("单张图片不能超过 10MB");
    input.value = "";
    return;
  }
  clearSelectedImage();
  selectedFile.value = file;
  selectedPreviewUrl.value = URL.createObjectURL(file);
}

function clearSelectedImage() {
  selectedFile.value = null;
  if (selectedPreviewUrl.value) URL.revokeObjectURL(selectedPreviewUrl.value);
  selectedPreviewUrl.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
}

async function sendMessage() {
  if (running.value) return;
  const text = draft.value.trim();
  const image = selectedFile.value;
  const imageUrl = selectedPreviewUrl.value;
  if (!text && !image) {
    ElMessage.warning("先输入内容，或添加一张图片");
    return;
  }

  const requestId = `req_${createId()}`;
  const userMessageId = `msg_user_${createId()}`;
  const userContent = text || "请结合这张舌象图片做一次健康分析";
  messages.value.push({
    id: userMessageId,
    requestId,
    role: "user",
    contentType: "text",
    content: userContent,
    status: "COMPLETED",
    imageUrl: imageUrl || undefined,
  });

  draft.value = "";
  selectedFile.value = null;
  selectedPreviewUrl.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
  await scrollToBottom();

  if (image) await sendImageAnalysis(image, userContent, requestId);
  else await sendTextChat(userContent, requestId, userMessageId);
}

async function sendTextChat(content: string, requestId: string, userMessageId: string) {
  running.value = true;
  const placeholderId = `local_assistant_${createId()}`;
  messages.value.push({
    id: placeholderId,
    requestId,
    role: "assistant",
    contentType: "text",
    content: "",
    status: "PENDING",
  });
  const placeholder = messages.value[messages.value.length - 1];
  if (placeholder) startThinking(placeholder);
  await scrollToBottom();

  try {
    if (isDailyPlanRequest(content)) {
      const currentPlan = await healthPlanApi.current();
      if (currentPlan) {
        const target = messages.value.find((item) => item.id === placeholderId && item.requestId === requestId);
        if (!target) return;
        stopThinking(placeholderId);
        target.status = "PENDING";
        typeAssistantMessage(target, "你的每日健康计划已经整理好了，包含饮食、睡眠、运动和今日观察项。可以进入“健康计划”页面完成今日打卡，并查看下一次复拍提醒。", () => {
          target.status = "COMPLETED";
        });
        return;
      }
    }

    const response = await agentChatV2Api.chat({
      requestId,
      clientMessageId: userMessageId,
      threadId: chatThreadId.value,
      conversationId: conversationId.value,
      message: { role: "user", contentType: "text", content },
      contextBinding: contextBindingFor(content),
      clientContext: { page: "analysis", locale: "zh-CN" },
    });
    if (response.requestId !== requestId) throw new Error("服务端返回了不属于当前请求的响应");

    const target = messages.value.find((item) => item.id === placeholderId && item.requestId === requestId);
    if (!target) return;
    stopThinking(placeholderId);
    chatThreadId.value = response.threadId || chatThreadId.value;
    conversationId.value = response.conversationId || conversationId.value;
    const normalized = normalizeAssistantMessage(response.assistantMessage);
    const finalContent = normalized.content || "我暂时没有生成有效回复。";
    const structuredContent = normalized.structuredContent as StructuredAnswer | undefined;
    const reportRef = normalized.reportRef;
    target.turnId = response.turnId;
    target.serverMessageId = response.assistantMessage.messageId;
    target.id = response.assistantMessage.messageId || target.id;
    target.contentType = response.assistantMessage.contentType;

    if (response.status === "FAILED") {
      target.content = finalContent;
      target.structuredContent = structuredContent;
      target.reportRef = reportRef;
      target.status = "FAILED";
      return;
    }

    target.content = finalContent;
    target.structuredContent = structuredContent;
    target.reportRef = reportRef;
    if (structuredContent) {
      target.status = "COMPLETED";
      if (target.reportRef?.reportId) latestReport.value = { reportId: target.reportRef.reportId };
      saveChatSession();
      await scrollToBottom();
      return;
    }

    target.status = "PENDING";
    typeAssistantMessage(target, finalContent, () => {
      target.structuredContent = structuredContent;
      target.reportRef = reportRef;
      target.status = "COMPLETED";
      if (target.reportRef?.reportId) latestReport.value = { reportId: target.reportRef.reportId };
    });
  } catch (error) {
    console.error("chat v2 failed", error);
    stopThinking(placeholderId);
    const target = messages.value.find((item) => item.id === placeholderId && item.requestId === requestId);
    if (target) {
      stopTyping(target);
      target.status = "FAILED";
      target.content = error instanceof Error ? error.message : "发送失败，请稍后再试。";
      target.reportRef = undefined;
    }
  } finally {
    running.value = false;
    saveChatSession();
    await scrollToBottom();
  }
}

async function sendImageAnalysis(file: File, userDescription: string, requestId: string) {
  running.value = true;
  const placeholderId = `local_assistant_${createId()}`;
  const assistantMessage: ChatMessage = {
    id: placeholderId,
    requestId,
    role: "assistant",
    contentType: "text",
    content: "",
    status: "PENDING",
    processPhase: "UPLOADING",
  };
  messages.value.push(assistantMessage);
  await scrollToBottom();

  try {
    const created = await tongueApi.analyze(file, {
      clientTraceId: requestId,
      threadId: chatThreadId.value,
      conversationId: conversationId.value,
      userDescription,
    });
    if (created.threadId) chatThreadId.value = created.threadId;
    if (created.conversationId) conversationId.value = created.conversationId;
    assistantMessage.processPhase = "PENDING";
    assistantMessage.task = {
      taskId: created.taskId,
      reportId: created.reportId,
      status: created.status,
      currentStage: "PENDING",
      progress: 0,
    };
    await pollAnalysisTask(created.taskId, assistantMessage);
  } catch (error) {
    console.error("analyze failed", error);
    assistantMessage.processPhase = undefined;
    assistantMessage.task = undefined;
    assistantMessage.status = "FAILED";
    assistantMessage.content = error instanceof Error ? error.message : "创建分析任务失败，请稍后再试。";
  } finally {
    running.value = false;
    saveChatSession();
    await scrollToBottom();
  }
}

async function pollAnalysisTask(taskId: number, assistantMessage: ChatMessage) {
  if (pollingTaskIds.has(taskId)) return;
  pollingTaskIds.add(taskId);
  try {
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      if (attempts > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      }
      attempts += 1;
      const task = await tongueApi.task(taskId);
      assistantMessage.task = task;
      assistantMessage.processPhase = normalizeProcessPhase(task);
      await scrollToBottom();

      if (task.status === "COMPLETED") {
        const report = await tongueApi.report(task.reportId);
        rememberLatestReport(report);
        const finalContent = report.summary || report.featureSummary || "报告已生成，可以查看完整报告。";
        assistantMessage.reportRef = undefined;
        assistantMessage.status = "PENDING";
        assistantMessage.processPhase = undefined;
        assistantMessage.task = undefined;
        typeAssistantMessage(assistantMessage, finalContent, () => {
          assistantMessage.reportRef = { reportId: task.reportId, relation: "GENERATED" };
          assistantMessage.status = "COMPLETED";
        });
        ElMessage.success("报告已生成");
        return;
      }

      if (["FAILED", "CANCELED"].includes(task.status)) {
        stopTyping(assistantMessage);
        assistantMessage.processPhase = undefined;
        assistantMessage.task = undefined;
        assistantMessage.status = "FAILED";
        assistantMessage.content = task.errorMessage || "分析任务未完成，请稍后重试。";
        return;
      }
    }

    assistantMessage.processPhase = undefined;
    assistantMessage.task = undefined;
    assistantMessage.status = "FAILED";
    assistantMessage.content = "分析等待时间较长，请稍后在报告中心查看结果或重新尝试。";
  } finally {
    pollingTaskIds.delete(taskId);
    saveChatSession();
  }
}

function normalizeProcessPhase(task: TaskStatus): ProcessPhase {
  const stage = String(task.currentStage || task.status || "PENDING").toUpperCase();
  if (stage === "MODEL_ANALYZING" || stage === "RUNNING") return "MODEL_ANALYZING";
  if (stage === "RESULT_ANALYZING") return "RESULT_ANALYZING";
  if (stage === "RAG_RETRIEVING") return "RAG_RETRIEVING";
  if (stage === "REPORT_GENERATING" || stage === "REPORT_READY" || stage === "COMPLETED") {
    return "REPORT_GENERATING";
  }
  return "PENDING";
}

function isTaskRunning(task?: TaskStatus) {
  return Boolean(task && !["COMPLETED", "FAILED", "CANCELED"].includes(task.status));
}

function openReport(reportId?: number) {
  if (reportId) router.push(`/reports/${reportId}`);
}

async function scrollToBottom() {
  await nextTick();
  const list = messageListRef.value;
  if (list) list.scrollTop = list.scrollHeight;
}

onMounted(async () => {
  restoreChatSession();
  for (const message of messages.value) {
    if (message.task && isTaskRunning(message.task)) {
      message.status = "PENDING";
      message.processPhase = normalizeProcessPhase(message.task);
      void pollAnalysisTask(message.task.taskId, message);
    }
  }
  await scrollToBottom();
});

onBeforeUnmount(() => {
  clearTransientTimers();
  saveChatSession();
});

watch([messages, chatThreadId, conversationId, latestReport], saveChatSession, { deep: true });
</script>

<style scoped>
.chat-page {
  position: relative;
  min-height: calc(100vh - 118px);
  margin: -18px -24px 0;
  background: #f4f7fb;
}

.chat-scroll {
  height: calc(100vh - 118px);
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 34px 22px 190px;
}

.thread {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: min(920px, 100%);
  margin: 0 auto;
}

.welcome {
  display: flex;
  min-height: 54vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 18px;
  border: 1px solid #dce7ef;
  border-radius: 18px;
  color: var(--th-primary);
  background: #fff;
}

.welcome h1 { margin: 0; font-size: 30px; }
.welcome p { margin: 12px 0 0; color: var(--th-text-muted); }
.message-row { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; }
.message-row.user { grid-template-columns: minmax(0, 1fr) 38px; }
.message-row.user .message-avatar { grid-column: 2; grid-row: 1; color: #fff; border-color: #409eff; background: #409eff; }
.message-row.user .message-main { grid-column: 1; justify-self: end; }
.message-avatar { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid #dce7ef; border-radius: 999px; color: var(--th-primary); background: #fff; }
.message-main { min-width: 0; max-width: min(720px, 100%); }
.message-bubble { width: fit-content; max-width: 100%; padding: 14px 16px; border: 1px solid #e1e9f0; border-radius: 18px 18px 18px 6px; background: #fff; box-shadow: 0 10px 28px rgba(15, 23, 42, .06); }
.message-row.user .message-bubble { margin-left: auto; border-color: #cfe5ff; border-radius: 18px 18px 6px 18px; background: #e8f3ff; box-shadow: none; }
.message-bubble.failed { border-color: #f5c2c7; background: #fff7f7; }
.message-bubble p { margin: 0; white-space: pre-wrap; word-break: break-word; line-height: 1.75; font-size: 15px; }
.message-image { display: block; width: min(280px, 100%); max-height: 280px; object-fit: contain; margin-bottom: 12px; border-radius: 14px; background: #edf2f7; }

.thinking-card {
  display: inline-flex;
  min-width: 190px;
  align-items: center;
  gap: 10px;
  color: var(--th-text-muted);
  font-size: 14px;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--th-primary);
  animation: thinking-pulse 1s ease-in-out infinite;
}

.analysis-process-card {
  display: grid;
  gap: 16px;
  width: min(590px, calc(100vw - 92px));
  padding: 18px;
  border: 1px solid #d9e7df;
  border-radius: 16px;
  background: linear-gradient(145deg, #fbfdfc, #f3f8f5);
}

.process-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.process-header > div { display: grid; gap: 5px; }
.process-kicker { color: #56806a; font-size: 9px; font-weight: 750; letter-spacing: .14em; }
.process-header strong { color: #294638; font-size: 15px; line-height: 1.45; }
.process-percent { color: #347253; font-size: 22px; font-weight: 750; }
.process-track { overflow: hidden; height: 6px; border-radius: 999px; background: #e0eae4; }
.process-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #347253, #7caf8d); transition: width .35s ease; }
.process-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.process-step { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 8px; min-width: 0; padding: 10px 8px; border-radius: 12px; color: #8a948e; }
.process-step.active { background: #eaf4ed; color: #2f6d4c; }
.process-step.done { color: #4c765f; }
.step-icon { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; background: #e7ece8; }
.process-step.active .step-icon { background: #d8ebdd; color: #2f704d; }
.process-step.done .step-icon { background: #dcecdf; color: #337251; }
.process-step strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
.process-step small { display: block; margin-top: 4px; color: inherit; font-size: 9px; line-height: 1.45; }
.process-note { display: flex; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid #dfe9e2; color: #748179; font-size: 11px; }
.spin { animation: spin 1s linear infinite; }

.type-cursor {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: currentColor;
  animation: cursor-blink .9s steps(1) infinite;
}

.structured-answer { display: grid; gap: 12px; width: min(620px, 100%); margin-top: 16px; padding: 16px; border: 1px solid #dce7df; border-radius: 14px; background: #f8fbf9; }
.structured-answer h3 { margin: 0; color: var(--th-primary-dark); font-size: 18px; line-height: 1.45; }
.structured-summary { color: var(--th-text-muted); }
.structured-highlights,
.structured-section ul { display: grid; gap: 7px; margin: 0; padding-left: 20px; }
.structured-section { display: grid; gap: 8px; padding-top: 12px; border-top: 1px solid #dfe8e2; }
.structured-section:first-of-type { padding-top: 0; border-top: 0; }
.structured-section h4 { margin: 0; color: #254d3f; font-size: 15px; }
.structured-section p { color: #43564d; }
.structured-disclaimer { padding: 10px 12px; border-radius: 10px; background: #fff8e8; color: #795c21; font-size: 13px; line-height: 1.65; }
.actions { margin-top: 12px; }

.composer-wrap { position: absolute; right: 0; bottom: 0; left: 0; display: grid; justify-items: center; padding: 18px 22px 24px; background: linear-gradient(180deg, rgba(244,247,251,0), #f4f7fb 28%); }
.composer { width: min(920px, 100%); padding: 10px; border: 1px solid #d4e1ec; border-radius: 18px; background: #fff; box-shadow: 0 18px 54px rgba(15,23,42,.12); }
.attachment { display: grid; grid-template-columns: 46px minmax(0,1fr) auto; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; border-radius: 14px; background: #f2f7fb; }
.attachment img { width: 46px; height: 46px; object-fit: cover; border-radius: 10px; }
.attachment strong,
.attachment span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment span { color: var(--th-text-muted); font-size: 12px; }
.report-context-hint { margin: 0 4px 8px; color: var(--th-text-muted); font-size: 12px; }
.input-row { display: grid; grid-template-columns: auto minmax(0,1fr) 44px; align-items: end; gap: 10px; }
.hidden-file-input { display: none; }
.image-upload-button { height: 42px; border-radius: 14px; color: #20604f; border-color: #b9ded2; background: #f0faf6; }
.send-button { width: 44px; height: 42px; padding: 0; border-radius: 14px; }
.prompt-input :deep(.el-textarea__inner) { min-height: 42px !important; padding: 10px 4px; border: 0; box-shadow: none; line-height: 1.55; font-size: 15px; }

@keyframes thinking-pulse {
  0%, 100% { opacity: .35; transform: scale(.82); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes cursor-blink { 50% { opacity: 0; } }
@keyframes spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .thinking-dot,
  .type-cursor,
  .spin { animation: none; }
}

@media (max-width: 760px) {
  .chat-page { min-height: calc(100vh - 92px); margin: -14px -14px 0; }
  .chat-scroll { height: calc(100vh - 92px); padding: 24px 12px 180px; }
  .message-row { grid-template-columns: 32px minmax(0,1fr); }
  .message-row.user { grid-template-columns: minmax(0,1fr) 32px; }
  .message-avatar { width: 32px; height: 32px; }
  .composer-wrap { padding: 14px 12px 18px; }
  .input-row { grid-template-columns: 92px minmax(0,1fr) 42px; gap: 8px; }
  .analysis-process-card { width: min(100%, calc(100vw - 76px)); padding: 14px; }
  .process-steps { grid-template-columns: 1fr; }
  .process-step { grid-template-columns: 28px 1fr; }
  .process-step strong { white-space: normal; }
}
</style>
