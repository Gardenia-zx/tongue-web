<template>
  <section class="chat">
    <main ref="listRef" class="list">
      <article v-for="message in messages" :key="message.id" :class="['row', message.role]">
        <div class="avatar">
          <Bot v-if="message.role === 'assistant'" :size="18" />
          <User v-else :size="18" />
        </div>

        <div :class="['bubble', message.status.toLowerCase()]">
          <img v-if="message.imageUrl" :src="message.imageUrl" class="preview" alt="舌象图片" />

          <div v-if="message.thinking" class="thinking">
            <span></span>{{ message.stageText }}
          </div>

          <AnalysisProgressCard
            v-else-if="message.status === 'PENDING' && !message.typing && (message.task || message.phase)"
            :phase="message.phase"
            :task="message.task"
          />

          <p v-else>
            {{ message.display ?? message.content }}<i v-if="message.typing" class="cursor"></i>
          </p>

          <el-button
            v-if="message.status === 'COMPLETED' && message.reportId"
            class="report-btn"
            type="primary"
            plain
            @click="router.push(`/reports/${message.reportId}`)"
          >
            查看完整报告
          </el-button>
        </div>
      </article>
    </main>

    <footer class="composer">
      <div v-if="file" class="file">
        <span>{{ file.name }}</span>
        <el-button link :icon="X" @click="clearFile" />
      </div>

      <div class="input-row">
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          @change="pickFile"
        />
        <el-button class="image-upload-button" :disabled="running" @click="fileInput?.click()">
          <ImagePlus :size="18" />图片
        </el-button>
        <el-input
          v-model="draft"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          resize="none"
          maxlength="500"
          placeholder="给舌象健康助手发送消息"
          @keydown.enter.exact.prevent="send"
        />
        <el-button type="primary" :loading="running" @click="send">
          <Send v-if="!running" :size="18" />
        </el-button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Bot, ImagePlus, Send, User, X } from 'lucide-vue-next';
import {
  agentChatV2Api,
  tongueApi,
  USER_KEY,
  type AgentMessageStatus,
  type TaskStatus,
  type UserMe,
} from '@tongue/shared';
import AnalysisProgressCard from '../components/analysis/AnalysisProgressCard.vue';

type Phase =
  | 'UPLOADING'
  | 'PENDING'
  | 'MODEL_ANALYZING'
  | 'RESULT_ANALYZING'
  | 'RAG_RETRIEVING'
  | 'REPORT_GENERATING';

interface ChatMessage {
  id: string;
  requestId: string;
  role: 'assistant' | 'user';
  content: string;
  status: AgentMessageStatus;
  imageUrl?: string;
  task?: TaskStatus;
  phase?: Phase;
  typing?: boolean;
  display?: string;
  thinking?: boolean;
  stageText?: string;
  reportId?: number;
}

interface StoredChatSession {
  schemaVersion: 3;
  userId: string;
  threadId: string;
  conversationId: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const CHAT_SESSION_PREFIX = 'tongue_user_chat_session';
const MAX_STORED_MESSAGES = 80;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 240;

const router = useRouter();
const draft = ref('');
const file = ref<File | null>(null);
const previewUrl = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const running = ref(false);
const messages = ref<ChatMessage[]>([]);
const threadId = ref(`web_${createId()}`);
const conversationId = ref(`conv_${createId()}`);
const timers = new Map<string, number>();
const polls = new Set<number>();

function createId() {
  return crypto.randomUUID?.() || `${Date.now()}_${Math.random()}`;
}

function currentUserId() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return 'guest';

  try {
    const user = JSON.parse(raw) as UserMe;
    return user.userId ? String(user.userId) : 'guest';
  } catch {
    return 'guest';
  }
}

function storageKey() {
  return `${CHAT_SESSION_PREFIX}_${currentUserId()}`;
}

async function scrollToBottom() {
  await nextTick();
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
}

function stopTimer(messageId: string) {
  const timer = timers.get(messageId);
  if (timer) window.clearInterval(timer);
  timers.delete(messageId);
}

function typeMessage(messageId: string, text: string, done: () => void) {
  const message = messages.value.find((item) => item.id === messageId);
  if (!message) return;

  message.content = text;
  message.task = undefined;
  message.phase = undefined;
  message.thinking = false;
  message.typing = true;
  message.display = '';

  let index = 0;
  const timer = window.setInterval(() => {
    index = Math.min(text.length, index + 4);
    message.display = text.slice(0, index);
    void scrollToBottom();

    if (index < text.length) return;

    window.clearInterval(timer);
    timers.delete(messageId);
    message.typing = false;
    message.display = undefined;
    done();
    saveSession();
  }, 28);
  timers.set(messageId, timer);
}

function startThinking(message: ChatMessage) {
  const stages = ['理解你的问题', '读取上下文', '整理相关信息', '生成回答'];
  let index = 0;
  message.thinking = true;
  message.stageText = stages[index];

  const timer = window.setInterval(() => {
    index = Math.min(index + 1, stages.length - 1);
    message.stageText = stages[index];
    if (index === stages.length - 1) {
      window.clearInterval(timer);
      timers.delete(message.id);
    }
  }, 1100);
  timers.set(message.id, timer);
}

function phaseOf(task: TaskStatus): Phase {
  const stage = String(task.currentStage || task.status).toUpperCase();
  if (stage === 'MODEL_ANALYZING' || stage === 'RUNNING') return 'MODEL_ANALYZING';
  if (stage === 'RESULT_ANALYZING') return 'RESULT_ANALYZING';
  if (stage === 'RAG_RETRIEVING') return 'RAG_RETRIEVING';
  if (stage === 'REPORT_GENERATING' || stage === 'REPORT_READY' || stage === 'COMPLETED') {
    return 'REPORT_GENERATING';
  }
  return 'PENDING';
}

function isTaskRunning(task?: TaskStatus) {
  return Boolean(task && !['COMPLETED', 'FAILED', 'CANCELED'].includes(task.status));
}

function normalizeStoredMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.role !== 'assistant' && raw.role !== 'user') return null;

  const task = raw.task && typeof raw.task === 'object'
    ? raw.task as TaskStatus
    : undefined;
  const legacyReportRef = raw.reportRef && typeof raw.reportRef === 'object'
    ? raw.reportRef as Record<string, unknown>
    : undefined;
  const reportId = typeof raw.reportId === 'number'
    ? raw.reportId
    : typeof legacyReportRef?.reportId === 'number'
      ? legacyReportRef.reportId
      : undefined;
  const phaseValue = typeof raw.phase === 'string'
    ? raw.phase
    : typeof raw.processPhase === 'string'
      ? raw.processPhase
      : undefined;

  let content = typeof raw.content === 'string' ? raw.content : '';
  let status: AgentMessageStatus = raw.status === 'FAILED'
    ? 'FAILED'
    : raw.status === 'PENDING'
      ? 'PENDING'
      : 'COMPLETED';

  if (status === 'PENDING' && !task && content) {
    status = 'COMPLETED';
  }
  if (status === 'PENDING' && !task && !content && raw.role === 'assistant') {
    status = 'FAILED';
    content = '上一次请求在页面切换时中断，请重新发送。';
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : `message_${createId()}`,
    requestId: typeof raw.requestId === 'string' ? raw.requestId : `request_${createId()}`,
    role: raw.role,
    content,
    status,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : undefined,
    task,
    phase: phaseValue as Phase | undefined,
    reportId,
    typing: false,
    display: undefined,
    thinking: false,
    stageText: undefined,
  };
}

function saveSession() {
  if (messages.value.some((message) => message.typing)) return;

  const storedMessages = messages.value.slice(-MAX_STORED_MESSAGES).map((message) => ({
    ...message,
    typing: false,
    display: undefined,
    thinking: false,
    stageText: undefined,
  }));
  const session: StoredChatSession = {
    schemaVersion: 3,
    userId: currentUserId(),
    threadId: threadId.value,
    conversationId: conversationId.value,
    messages: storedMessages,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(storageKey(), JSON.stringify(session));
  } catch (error) {
    console.warn('save analysis chat session failed', error);
  }
}

function restoreSession() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return;

  try {
    const session = JSON.parse(raw) as Record<string, unknown>;
    if (typeof session.threadId === 'string') threadId.value = session.threadId;
    if (typeof session.conversationId === 'string') conversationId.value = session.conversationId;
    if (Array.isArray(session.messages)) {
      messages.value = session.messages
        .map(normalizeStoredMessage)
        .filter((message): message is ChatMessage => Boolean(message))
        .slice(-MAX_STORED_MESSAGES);
    }
  } catch (error) {
    console.warn('restore analysis chat session failed', error);
    localStorage.removeItem(storageKey());
  }
}

function clearFile() {
  file.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

function pickFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = input.files?.[0];
  if (!selected) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
    ElMessage.error('仅支持 JPG、PNG、WEBP 图片');
    return;
  }
  if (selected.size > 10 * 1024 * 1024) {
    ElMessage.error('单张图片不能超过 10MB');
    return;
  }

  clearFile();
  file.value = selected;
  previewUrl.value = URL.createObjectURL(selected);
}

async function send() {
  if (running.value) return;

  const text = draft.value.trim();
  const image = file.value;
  if (!text && !image) {
    ElMessage.warning('先输入内容，或添加一张图片');
    return;
  }

  const requestId = `req_${createId()}`;
  const content = text || '请结合这张舌象图片做一次健康分析';
  messages.value.push({
    id: `user_${createId()}`,
    requestId,
    role: 'user',
    content,
    status: 'COMPLETED',
    imageUrl: previewUrl.value || undefined,
  });

  draft.value = '';
  file.value = null;
  previewUrl.value = '';
  if (fileInput.value) fileInput.value.value = '';
  await scrollToBottom();

  if (image) await sendImage(image, content, requestId);
  else await sendText(content, requestId);
}

async function sendText(content: string, requestId: string) {
  running.value = true;
  const messageId = `assistant_${createId()}`;
  messages.value.push({
    id: messageId,
    requestId,
    role: 'assistant',
    content: '',
    status: 'PENDING',
  });

  const target = messages.value.find((message) => message.id === messageId);
  if (!target) {
    running.value = false;
    return;
  }
  startThinking(target);

  try {
    const response = await agentChatV2Api.chat({
      requestId,
      clientMessageId: `user_${createId()}`,
      threadId: threadId.value,
      conversationId: conversationId.value,
      message: { role: 'user', contentType: 'text', content },
      contextBinding: { mode: 'AUTO' },
      clientContext: { page: 'analysis', locale: 'zh-CN' },
    });

    stopTimer(messageId);
    target.thinking = false;
    threadId.value = response.threadId || threadId.value;
    conversationId.value = response.conversationId || conversationId.value;

    if (response.status === 'FAILED') {
      target.content = response.assistantMessage.content;
      target.status = 'FAILED';
      return;
    }

    target.reportId = response.assistantMessage.reportRef?.reportId;
    typeMessage(
      messageId,
      response.assistantMessage.content || '我暂时没有生成有效回复。',
      () => {
        target.status = 'COMPLETED';
      },
    );
  } catch (error) {
    stopTimer(messageId);
    target.thinking = false;
    target.status = 'FAILED';
    target.content = error instanceof Error ? error.message : '发送失败';
  } finally {
    running.value = false;
    saveSession();
  }
}

async function sendImage(image: File, description: string, requestId: string) {
  running.value = true;
  const messageId = `assistant_${createId()}`;
  messages.value.push({
    id: messageId,
    requestId,
    role: 'assistant',
    content: '',
    status: 'PENDING',
    phase: 'UPLOADING',
  });

  const target = messages.value.find(
    (message) => message.id === messageId && message.requestId === requestId,
  );
  if (!target) {
    running.value = false;
    return;
  }

  try {
    const created = await tongueApi.analyze(image, {
      clientTraceId: requestId,
      threadId: threadId.value,
      conversationId: conversationId.value,
      userDescription: description,
    });
    threadId.value = created.threadId || threadId.value;
    conversationId.value = created.conversationId || conversationId.value;
    target.phase = 'PENDING';
    target.task = {
      taskId: created.taskId,
      reportId: created.reportId,
      status: created.status,
      currentStage: 'PENDING',
      progress: 0,
    };
    saveSession();
    await pollTask(created.taskId, target);
  } catch (error) {
    target.phase = undefined;
    target.task = undefined;
    target.status = 'FAILED';
    target.content = error instanceof Error ? error.message : '创建分析任务失败';
  } finally {
    running.value = false;
    saveSession();
  }
}

async function pollTask(taskId: number, target: ChatMessage) {
  if (polls.has(taskId)) return;
  polls.add(taskId);

  try {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      if (attempt > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      }

      const task = await tongueApi.task(taskId);
      target.task = task;
      target.phase = phaseOf(task);
      await scrollToBottom();

      if (task.status === 'COMPLETED') {
        const report = await tongueApi.report(task.reportId);
        target.reportId = task.reportId;
        typeMessage(
          target.id,
          report.summary || report.featureSummary || '报告已生成。',
          () => {
            target.status = 'COMPLETED';
          },
        );
        ElMessage.success('报告已生成');
        return;
      }

      if (task.status === 'FAILED' || task.status === 'CANCELED') {
        target.phase = undefined;
        target.task = undefined;
        target.status = 'FAILED';
        target.content = task.errorMessage || '分析任务失败';
        return;
      }
    }

    target.status = 'FAILED';
    target.phase = undefined;
    target.task = undefined;
    target.content = '分析等待时间较长，请稍后查看报告中心。';
  } finally {
    polls.delete(taskId);
    saveSession();
  }
}

onMounted(async () => {
  restoreSession();

  const activeMessages = messages.value.filter((message) => isTaskRunning(message.task));
  if (activeMessages.length > 0) {
    running.value = true;
    await Promise.allSettled(
      activeMessages.map((message) => pollTask(message.task!.taskId, message)),
    );
    running.value = false;
  }

  await scrollToBottom();
});

onBeforeUnmount(() => {
  for (const message of messages.value) {
    if (message.typing) {
      stopTimer(message.id);
      message.typing = false;
      message.display = undefined;
      if (message.content) message.status = 'COMPLETED';
    }
    if (message.thinking && !message.task) {
      stopTimer(message.id);
      message.thinking = false;
      if (!message.content) {
        message.status = 'FAILED';
        message.content = '上一次请求在页面切换时中断，请重新发送。';
      }
    }
  }

  saveSession();
  for (const timer of timers.values()) window.clearInterval(timer);
  timers.clear();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

watch([messages, threadId, conversationId], saveSession, { deep: true });
</script>

<style scoped>
.chat{position:relative;min-height:620px;background:#f4f7fb}.list{height:680px;overflow-y:auto;padding:24px 18px 160px}.row{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;width:min(900px,100%);margin:0 auto 18px}.row.user{grid-template-columns:minmax(0,1fr) 36px}.row.user .avatar{grid-column:2}.row.user .bubble{grid-column:1;grid-row:1;justify-self:end;background:#e8f3ff}.avatar{display:grid;width:36px;height:36px;place-items:center;border-radius:50%;background:#fff;color:#28684a}.bubble{width:fit-content;max-width:720px;padding:14px 16px;border:1px solid #e1e9f0;border-radius:16px;background:#fff}.bubble.failed{border-color:#f5c2c7;background:#fff7f7}.bubble p{margin:0;white-space:pre-wrap;line-height:1.75}.preview{width:min(280px,100%);max-height:280px;object-fit:contain;margin-bottom:12px;border-radius:12px}.thinking{display:flex;align-items:center;gap:8px;color:#738078}.thinking span{width:8px;height:8px;border-radius:50%;background:#2f704d;animation:pulse 1s infinite}.cursor{display:inline-block;width:1px;height:1em;margin-left:2px;background:currentColor;animation:blink .8s infinite}.report-btn{margin-top:12px}.composer{position:absolute;right:0;bottom:0;left:0;width:min(900px,calc(100% - 24px));margin:auto;padding:10px;border:1px solid #d4e1ec;border-radius:16px;background:#fff}.input-row{display:grid;grid-template-columns:auto minmax(0,1fr) 44px;gap:8px;align-items:end}.file{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px;border-radius:10px;background:#f2f7fb}.image-upload-button{height:42px}@keyframes pulse{50%{opacity:.35}}@keyframes blink{50%{opacity:0}}@media(max-width:760px){.list{height:620px}.row{grid-template-columns:32px minmax(0,1fr)}.row.user{grid-template-columns:minmax(0,1fr) 32px}}
</style>
