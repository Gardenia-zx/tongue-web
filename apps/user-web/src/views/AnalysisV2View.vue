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
              <p>{{ message.content }}</p>

              <div v-if="message.task" class="task-card">
                <div class="task-line">
                  <span>任务 {{ message.task.taskId }}</span>
                  <StatusTag :status="message.task.status" />
                </div>
                <el-progress
                  :percentage="progressPercent(message.task)"
                  :status="message.task.status === 'FAILED' ? 'exception' : undefined"
                />
                <span class="stage">{{ message.task.currentStage || message.task.status }}</span>
              </div>

              <div
                v-if="message.role === 'assistant' && message.status === 'COMPLETED' && message.reportRef?.reportId"
                class="actions"
              >
                <el-button type="primary" plain @click="openReport(message.reportRef.reportId)">查看报告</el-button>
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
          当前可引用报告 #{{ latestReport.reportId }}。只有明确提到“报告”或“刚才的分析”时才会绑定。
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
import { Bot, ImagePlus, Send, User, X } from "lucide-vue-next";
import {
  agentChatV2Api,
  StatusTag,
  tongueApi,
  USER_KEY,
  type AgentContextBinding,
  type AgentMessageStatus,
  type AgentReportRef,
  type ReportDetail,
  type TaskStatus,
  type UserMe,
} from "@tongue/shared";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  requestId: string;
  turnId?: string;
  serverMessageId?: string;
  role: ChatRole;
  contentType: "text" | "structured";
  content: string;
  structuredContent?: Record<string, unknown>;
  status: AgentMessageStatus;
  imageUrl?: string;
  task?: TaskStatus;
  reportRef?: AgentReportRef;
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

const fileSize = computed(() => {
  const size = selectedFile.value?.size || 0;
  return size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(2)} MB`;
});

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
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
    structuredContent: raw.structuredContent as Record<string, unknown> | undefined,
    status: raw.status === "PENDING" || raw.status === "FAILED" ? raw.status : "COMPLETED",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    task: raw.task as TaskStatus | undefined,
  };

  if (role === "assistant") {
    const reportRef = raw.reportRef as AgentReportRef | undefined;
    const legacyReportId = typeof raw.reportId === "number" ? raw.reportId : undefined;
    if (reportRef?.reportId) message.reportRef = reportRef;
    else if (legacyReportId) message.reportRef = { reportId: legacyReportId, relation: "GENERATED" };
  }
  return message;
}

function restoreChatSession() {
  const raw = localStorage.getItem(chatStorageKey());
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.threadId === "string") chatThreadId.value = parsed.threadId;
    if (typeof parsed.conversationId === "string") conversationId.value = parsed.conversationId;
    if (Array.isArray(parsed.messages)) {
      messages.value = parsed.messages.map(sanitizeMessage).filter((item): item is ChatMessage => Boolean(item)).slice(-80);
    }
    latestReport.value = (parsed.latestReport as LatestReportContext | null) || null;
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
    messages: messages.value.slice(-80).map((message) => {
      if (message.role === "user") return { ...message, reportRef: undefined, structuredContent: undefined };
      return message;
    }),
    latestReport: latestReport.value,
    updatedAt: Date.now(),
  };
  localStorage.setItem(chatStorageKey(), JSON.stringify(session));
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
  const compact = content.replace(/\s+/g, "");
  const explicitlyMentionsReport = /(报告|舌象结果|分析结果|识别结果|上一份舌象|刚才的舌象)/.test(compact);
  if (explicitlyMentionsReport && latestReport.value?.reportId) {
    return { mode: "ACTIVE_REPORT", reportId: latestReport.value.reportId };
  }
  if (/^(继续|再详细|详细一点|展开说说|刚才|上面|这个|那这个)/.test(compact)) {
    return { mode: "LAST_ANSWER" };
  }
  return { mode: "NONE" };
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
    content: "正在思考...",
    status: "PENDING",
  });
  await scrollToBottom();

  try {
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
    chatThreadId.value = response.threadId || chatThreadId.value;
    conversationId.value = response.conversationId || conversationId.value;
    target.turnId = response.turnId;
    target.serverMessageId = response.assistantMessage.messageId;
    target.id = response.assistantMessage.messageId || target.id;
    target.contentType = response.assistantMessage.contentType;
    target.content = response.assistantMessage.content || "我暂时没有生成有效回复。";
    target.structuredContent = response.assistantMessage.structuredContent;
    target.reportRef = response.assistantMessage.reportRef;
    target.status = response.status === "FAILED" ? "FAILED" : "COMPLETED";
    if (target.reportRef?.reportId) latestReport.value = { reportId: target.reportRef.reportId };
  } catch (error) {
    console.error("chat v2 failed", error);
    const target = messages.value.find((item) => item.id === placeholderId && item.requestId === requestId);
    if (target) {
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
    content: "已收到图片，正在创建分析任务...",
    status: "PENDING",
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
    assistantMessage.content = "分析任务已创建，正在调用模型和知识库。";
    assistantMessage.task = {
      taskId: created.taskId,
      reportId: created.reportId,
      status: created.status,
      progress: 0,
    };
    await pollAnalysisTask(created.taskId, assistantMessage);
  } catch (error) {
    console.error("analyze failed", error);
    assistantMessage.status = "FAILED";
    assistantMessage.content = error instanceof Error ? error.message : "创建分析任务失败，请稍后再试。";
  } finally {
    running.value = false;
    saveChatSession();
    await scrollToBottom();
  }
}

async function pollAnalysisTask(taskId: number, assistantMessage: ChatMessage) {
  for (let i = 0; i < 90; i += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    const task = await tongueApi.task(taskId);
    assistantMessage.task = task;
    if (task.status === "COMPLETED") {
      const report = await tongueApi.report(task.reportId);
      rememberLatestReport(report);
      assistantMessage.reportRef = { reportId: task.reportId, relation: "GENERATED" };
      assistantMessage.content = report.summary || report.featureSummary || "报告已生成，可以查看完整报告。";
      assistantMessage.status = "COMPLETED";
      ElMessage.success("报告已生成");
      return;
    }
    if (["FAILED", "CANCELED"].includes(task.status)) {
      assistantMessage.status = "FAILED";
      assistantMessage.content = task.errorMessage || "分析任务未完成，请稍后重试。";
      return;
    }
  }
  assistantMessage.status = "FAILED";
  assistantMessage.content = "任务仍在执行，你可以稍后到历史报告中查看结果。";
}

function progressPercent(task?: TaskStatus) {
  return Math.round((task?.progress || 0) * 100);
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
  await scrollToBottom();
});

onBeforeUnmount(saveChatSession);
watch([messages, chatThreadId, conversationId, latestReport], saveChatSession, { deep: true });
</script>

<style scoped>
.chat-page { position: relative; min-height: calc(100vh - 118px); margin: -18px -24px 0; background: #f4f7fb; }
.chat-scroll { height: calc(100vh - 118px); overflow-y: auto; scroll-behavior: smooth; padding: 34px 22px 190px; }
.thread { display: flex; flex-direction: column; gap: 22px; width: min(920px, 100%); margin: 0 auto; }
.welcome { display: flex; min-height: 54vh; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.welcome-mark { display: grid; place-items: center; width: 54px; height: 54px; margin-bottom: 18px; border: 1px solid #dce7ef; border-radius: 18px; color: var(--th-primary); background: #fff; }
.welcome h1 { margin: 0; font-size: 30px; }
.welcome p { margin: 12px 0 0; color: var(--th-text-muted); }
.message-row { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; }
.message-row.user { grid-template-columns: minmax(0, 1fr) 38px; }
.message-row.user .message-avatar { grid-column: 2; grid-row: 1; color: #fff; border-color: #409eff; background: #409eff; }
.message-row.user .message-main { grid-column: 1; justify-self: end; }
.message-avatar { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid #dce7ef; border-radius: 999px; color: var(--th-primary); background: #fff; }
.message-main { min-width: 0; max-width: min(710px, 100%); }
.message-bubble { width: fit-content; max-width: 100%; padding: 14px 16px; border: 1px solid #e1e9f0; border-radius: 18px 18px 18px 6px; background: #fff; box-shadow: 0 10px 28px rgba(15, 23, 42, .06); }
.message-row.user .message-bubble { margin-left: auto; border-color: #cfe5ff; border-radius: 18px 18px 6px 18px; background: #e8f3ff; box-shadow: none; }
.message-bubble.failed { border-color: #f5c2c7; background: #fff7f7; }
.message-bubble p { margin: 0; white-space: pre-wrap; word-break: break-word; line-height: 1.75; font-size: 15px; }
.message-image { display: block; width: min(280px, 100%); max-height: 280px; object-fit: contain; margin-bottom: 12px; border-radius: 14px; background: #edf2f7; }
.task-card { display: grid; gap: 10px; width: min(520px, 100%); margin-top: 12px; padding: 12px; border: 1px solid #dce7ef; border-radius: 12px; background: #fff; }
.task-line { display: flex; justify-content: space-between; gap: 12px; color: var(--th-text-muted); font-size: 13px; }
.stage { color: var(--th-text-muted); font-size: 13px; }
.actions { margin-top: 12px; }
.composer-wrap { position: absolute; right: 0; bottom: 0; left: 0; display: grid; justify-items: center; padding: 18px 22px 24px; background: linear-gradient(180deg, rgba(244,247,251,0), #f4f7fb 28%); }
.composer { width: min(920px, 100%); padding: 10px; border: 1px solid #d4e1ec; border-radius: 18px; background: #fff; box-shadow: 0 18px 54px rgba(15,23,42,.12); }
.attachment { display: grid; grid-template-columns: 46px minmax(0,1fr) auto; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; border-radius: 14px; background: #f2f7fb; }
.attachment img { width: 46px; height: 46px; object-fit: cover; border-radius: 10px; }
.attachment strong, .attachment span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment span { color: var(--th-text-muted); font-size: 12px; }
.report-context-hint { margin: 0 4px 8px; color: var(--th-text-muted); font-size: 12px; }
.input-row { display: grid; grid-template-columns: auto minmax(0,1fr) 44px; align-items: end; gap: 10px; }
.hidden-file-input { display: none; }
.image-upload-button { height: 42px; border-radius: 14px; color: #20604f; border-color: #b9ded2; background: #f0faf6; }
.send-button { width: 44px; height: 42px; padding: 0; border-radius: 14px; }
.prompt-input :deep(.el-textarea__inner) { min-height: 42px !important; padding: 10px 4px; border: 0; box-shadow: none; line-height: 1.55; font-size: 15px; }
@media (max-width: 760px) {
  .chat-page { min-height: calc(100vh - 92px); margin: -14px -14px 0; }
  .chat-scroll { height: calc(100vh - 92px); padding: 24px 12px 180px; }
  .message-row { grid-template-columns: 32px minmax(0,1fr); }
  .message-row.user { grid-template-columns: minmax(0,1fr) 32px; }
  .message-avatar { width: 32px; height: 32px; }
  .composer-wrap { padding: 14px 12px 18px; }
  .input-row { grid-template-columns: 92px minmax(0,1fr) 42px; gap: 8px; }
}
</style>
