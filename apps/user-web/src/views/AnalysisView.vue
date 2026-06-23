<template>
  <section class="chat-page">
    <main ref="messageListRef" class="chat-scroll">
      <div v-if="messages.length === 0" class="welcome">
        <div class="welcome-mark">
          <Bot :size="25" />
        </div>
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
            <div class="message-bubble">
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

              <div v-if="message.reportId" class="actions">
                <el-button type="primary" plain @click="openReport(message.reportId)">查看报告</el-button>
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

        <div class="input-row">
          <input
            ref="fileInputRef"
            class="hidden-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            tabindex="-1"
            aria-hidden="true"
            style="display: none"
            @change="onFileChange"
          />

          <el-tooltip content="添加图片" placement="top">
            <el-button class="image-upload-button" :disabled="running" @click="openFilePicker">
              <ImagePlus :size="19" />
              <span>图片</span>
            </el-button>
          </el-tooltip>

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
import { agentApi, StatusTag, tongueApi, USER_KEY, type ReportDetail, type TaskStatus, type UserMe } from "@tongue/shared";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  imageUrl?: string;
  task?: TaskStatus;
  reportId?: number;
}

interface LatestReportContext {
  reportId: number;
  summary?: string;
  featureSummary?: string;
  reportStatus?: string;
}

interface StoredChatSession {
  threadId: string;
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
const chatThreadId = ref(`web_chat_${Date.now()}`);
const messages = ref<ChatMessage[]>([]);
const latestReport = ref<LatestReportContext | null>(null);

const fileSize = computed(() => {
  const size = selectedFile.value?.size || 0;
  return size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(2)} MB`;
});

function createId() {
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

function restoreChatSession() {
  const raw = localStorage.getItem(chatStorageKey());
  if (!raw) return;

  try {
    const session = JSON.parse(raw) as StoredChatSession;
    if (session.threadId) {
      chatThreadId.value = session.threadId;
    }
    if (Array.isArray(session.messages)) {
      messages.value = session.messages.slice(-80);
    }
    latestReport.value = session.latestReport || null;
  } catch {
    localStorage.removeItem(chatStorageKey());
  }
}

function saveChatSession() {
  const session: StoredChatSession = {
    threadId: chatThreadId.value,
    messages: messages.value.slice(-80),
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
  saveChatSession();
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

  const userContent = text || "请结合这张舌象图片做一次健康分析";
  messages.value.push({
    id: createId(),
    role: "user",
    content: userContent,
    imageUrl: imageUrl || undefined,
  });

  draft.value = "";
  selectedFile.value = null;
  selectedPreviewUrl.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
  await scrollToBottom();

  if (image) {
    await sendImageAnalysis(image, userContent);
  } else {
    await sendTextChat(userContent);
  }
}

async function sendTextChat(content: string) {
  running.value = true;
  const assistantMessage: ChatMessage = {
    id: createId(),
    role: "assistant",
    content: "正在思考...",
  };
  messages.value.push(assistantMessage);
  await scrollToBottom();

  try {
    const response = await agentApi.chat(content, { threadId: chatThreadId.value });
    if (response.threadId) chatThreadId.value = response.threadId;
    assistantMessage.content = response.content || "我暂时没有生成有效回复。";
  } catch (error) {
    console.error("chat failed", error);
    const message = error instanceof Error ? error.message : "发送失败，请稍后再试。";
    assistantMessage.content = message.includes("404") ? "聊天接口还没有生效，请重启 Java 后端后再试。" : message;
  } finally {
    running.value = false;
    await scrollToBottom();
  }
}

async function sendImageAnalysis(file: File, userDescription: string) {
  running.value = true;
  const assistantMessage: ChatMessage = {
    id: createId(),
    role: "assistant",
    content: "已收到图片，正在创建分析任务...",
  };
  messages.value.push(assistantMessage);
  await scrollToBottom();

  try {
    const created = await tongueApi.analyze(file, {
      clientTraceId: `trace_web_${Date.now()}`,
      threadId: `web_tongue_${Date.now()}`,
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
    assistantMessage.content = error instanceof Error ? error.message : "创建分析任务失败，请稍后再试。";
  } finally {
    running.value = false;
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
      assistantMessage.reportId = task.reportId;
      assistantMessage.content = report.summary || report.featureSummary || "报告已生成，可以查看完整报告。";
      ElMessage.success("报告已生成");
      return;
    }

    if (["FAILED", "CANCELED"].includes(task.status)) {
      assistantMessage.content = task.errorMessage || "分析任务未完成，请稍后重试。";
      return;
    }
  }

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

onBeforeUnmount(() => {
  saveChatSession();
});

watch(
  [messages, chatThreadId, latestReport],
  () => {
    saveChatSession();
  },
  { deep: true },
);
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
  padding: 34px 22px 170px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 54vh;
  text-align: center;
  color: var(--th-text);
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
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
}

.welcome h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 760;
  letter-spacing: 0;
}

.welcome p {
  max-width: 520px;
  margin: 12px 0 0;
  color: var(--th-text-muted);
  font-size: 15px;
  line-height: 1.7;
}

.message-row {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  align-items: start;
}

.message-row.user {
  grid-template-columns: minmax(0, 1fr) 38px;
}

.message-row.user .message-avatar {
  grid-column: 2;
  grid-row: 1;
}

.message-row.user .message-main {
  grid-column: 1;
  justify-self: end;
}

.message-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #dce7ef;
  border-radius: 999px;
  color: var(--th-primary);
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.message-row.user .message-avatar {
  color: #ffffff;
  border-color: #409eff;
  background: #409eff;
}

.message-main {
  min-width: 0;
  max-width: min(710px, 100%);
  color: var(--th-text);
}

.message-row.user .message-main {
  max-width: min(640px, 100%);
}

.message-bubble {
  width: fit-content;
  max-width: 100%;
  padding: 14px 16px;
  border: 1px solid #e1e9f0;
  border-radius: 18px;
  border-top-left-radius: 6px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.message-row.user .message-bubble {
  margin-left: auto;
  color: #0f2744;
  border-color: #cfe5ff;
  border-top-left-radius: 18px;
  border-top-right-radius: 6px;
  background: #e8f3ff;
  box-shadow: none;
}

.message-bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.75;
  font-size: 15px;
}

.message-image {
  display: block;
  width: min(280px, 100%);
  max-height: 280px;
  object-fit: contain;
  margin-bottom: 12px;
  border-radius: 14px;
  background: #edf2f7;
}

.task-card {
  display: grid;
  gap: 10px;
  width: min(520px, 100%);
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #dce7ef;
  border-radius: 12px;
  background: #ffffff;
}

.task-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--th-text-muted);
  font-size: 13px;
}

.stage {
  color: var(--th-text-muted);
  font-size: 13px;
}

.actions {
  margin-top: 12px;
}

.composer-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  justify-items: center;
  padding: 18px 22px 24px;
  background: linear-gradient(180deg, rgba(244, 247, 251, 0) 0%, #f4f7fb 28%, #f4f7fb 100%);
}

.composer {
  width: min(920px, 100%);
  padding: 10px;
  border: 1px solid #d4e1ec;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 54px rgba(15, 23, 42, 0.12);
}

.attachment {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  padding: 8px;
  border-radius: 14px;
  background: #f2f7fb;
}

.attachment img {
  width: 46px;
  height: 46px;
  object-fit: cover;
  border-radius: 10px;
}

.attachment strong,
.attachment span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment strong {
  font-size: 14px;
}

.attachment span {
  margin-top: 2px;
  color: var(--th-text-muted);
  font-size: 12px;
}

.input-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 44px;
  align-items: end;
  gap: 10px;
}

.hidden-file-input {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  display: none !important;
}

.image-upload-button {
  height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  color: #20604f;
  border-color: #b9ded2;
  background: #f0faf6;
  font-weight: 650;
}

.image-upload-button :deep(span) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.image-upload-button:hover {
  color: #12775f;
  border-color: #8ecdbb;
  background: #e6f7f1;
}

.send-button {
  width: 44px;
  height: 42px;
  padding: 0;
  border-radius: 14px;
}

.prompt-input :deep(.el-textarea__inner) {
  min-height: 42px !important;
  padding: 10px 4px;
  border: 0;
  box-shadow: none;
  line-height: 1.55;
  font-size: 15px;
  letter-spacing: 0;
}

.prompt-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

@media (max-width: 760px) {
  .chat-page {
    min-height: calc(100vh - 92px);
    margin: -14px -14px 0;
  }

  .chat-scroll {
    height: calc(100vh - 92px);
    padding: 24px 12px 160px;
  }

  .thread {
    gap: 18px;
  }

  .message-row,
  .message-row.user {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .message-row.user {
    grid-template-columns: minmax(0, 1fr) 32px;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }

  .message-bubble {
    padding: 12px 13px;
  }

  .composer-wrap {
    padding: 14px 12px 18px;
  }

  .composer {
    border-radius: 16px;
  }

  .input-row {
    grid-template-columns: 92px minmax(0, 1fr) 42px;
    gap: 8px;
  }

  .image-upload-button {
    padding: 0 10px;
  }
}
</style>
