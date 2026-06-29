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

          <div v-else-if="message.stateForm" class="state-card">
            <span class="state-kicker">近 3 天状态补充</span>
            <template v-if="stateQuestion(message)">
              <strong>{{ stateQuestion(message)?.title }}</strong>
              <p>{{ stateQuestion(message)?.description }}</p>
              <div class="option-grid">
                <button
                  v-for="option in stateQuestion(message)?.options"
                  :key="option.value"
                  type="button"
                  :class="{ active: optionSelected(message, option.value) }"
                  @click="selectStateOption(message, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
              <div v-if="stateQuestion(message)?.multi" class="state-actions">
                <button type="button" @click="nextStateQuestion(message)">下一题</button>
              </div>
            </template>
            <template v-else>
              <strong>你本次补充的状态</strong>
              <div class="state-summary">
                <span>睡眠：{{ optionLabel('sleepStatus', message.stateForm.sleepStatus) }}</span>
                <span>消化：{{ optionLabel('digestionStatus', message.stateForm.digestionStatus) }}</span>
                <span>排便：{{ optionLabel('bowelStatus', message.stateForm.bowelStatus) }}</span>
                <span>状态：{{ listLabels('currentStates', message.stateForm.currentStates) }}</span>
                <span>目标：{{ listLabels('healthGoals', message.stateForm.healthGoals) }}</span>
              </div>
              <textarea
                v-model="message.stateForm.freeDescription"
                maxlength="500"
                placeholder="还有哪些情况希望我们一起考虑？例如夜宵、减脂、膝盖不适、忌口等。"
              />
              <div class="state-actions">
                <button type="button" :disabled="message.stateSubmitting" @click="submitStateSnapshot(message, false)">
                  开始综合分析
                </button>
                <button type="button" :disabled="message.stateSubmitting" @click="submitStateSnapshot(message, true)">
                  暂不补充，直接分析
                </button>
              </div>
            </template>
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
  type BowelStatus,
  type CurrentState,
  type DigestionStatus,
  type HealthGoal,
  type SleepStatus,
  type TaskStatus,
  type UserMe,
  type UserStateSnapshot,
} from '@tongue/shared';
import AnalysisProgressCard from '../components/analysis/AnalysisProgressCard.vue';

type Phase =
  | 'UPLOADING'
  | 'STATE_COLLECTING'
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
  stateForm?: StateForm;
  stateStep?: number;
  stateSubmitting?: boolean;
}

interface StateForm {
  sleepStatus?: SleepStatus;
  digestionStatus?: DigestionStatus;
  bowelStatus?: BowelStatus;
  currentStates: CurrentState[];
  healthGoals: HealthGoal[];
  freeDescription: string;
}

interface StateQuestion {
  key: keyof StateForm;
  title: string;
  description: string;
  multi?: boolean;
  options: Array<{ label: string; value: string }>;
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
const stateQuestions: StateQuestion[] = [
  {
    key: 'sleepStatus',
    title: '最近三天睡眠怎么样？',
    description: '选择最贴近最近 3 天的情况。',
    options: [
      { label: '睡眠正常，醒后精神较好', value: 'NORMAL' },
      { label: '睡眠时间偏短', value: 'SHORT' },
      { label: '入睡困难或容易夜醒', value: 'DIFFICULT_OR_WAKE' },
      { label: '经常熬夜，作息不规律', value: 'IRREGULAR_LATE' },
    ],
  },
  {
    key: 'digestionStatus',
    title: '最近胃口和饭后感受怎么样？',
    description: '帮助报告把饮食建议写得更具体。',
    options: [
      { label: '胃口和消化基本正常', value: 'NORMAL' },
      { label: '食欲偏差', value: 'POOR_APPETITE' },
      { label: '饭后容易腹胀', value: 'BLOATING' },
      { label: '容易口腻、反酸或不舒服', value: 'GREASY_REFLUX_DISCOMFORT' },
    ],
  },
  {
    key: 'bowelStatus',
    title: '最近排便情况怎么样？',
    description: '只用于本次健康管理参考。',
    options: [
      { label: '基本正常', value: 'NORMAL' },
      { label: '偏干或排便困难', value: 'DRY_CONSTIPATION' },
      { label: '偏稀或容易腹泻', value: 'LOOSE_DIARRHEA' },
      { label: '大便黏滞或感觉排不干净', value: 'STICKY_INCOMPLETE' },
    ],
  },
  {
    key: 'currentStates',
    title: '最近整体状态怎么样？',
    description: '可以多选；选择“正常”会清空其他状态。',
    multi: true,
    options: [
      { label: '精神状态正常', value: 'NORMAL' },
      { label: '容易疲乏', value: 'FATIGUE' },
      { label: '压力较大或容易焦虑', value: 'STRESS_ANXIETY' },
      { label: '容易怕冷', value: 'COLD_SENSITIVE' },
      { label: '容易燥热或口干', value: 'HEAT_DRY_MOUTH' },
    ],
  },
  {
    key: 'healthGoals',
    title: '你这次最想改善什么？',
    description: '可以多选，报告会优先围绕这些目标给建议。',
    multi: true,
    options: [
      { label: '饮食和消化', value: 'DIET_DIGESTION' },
      { label: '睡眠和作息', value: 'SLEEP_ROUTINE' },
      { label: '运动和体能', value: 'FITNESS' },
      { label: '疲劳和精神状态', value: 'FATIGUE_ENERGY' },
      { label: '体重管理', value: 'WEIGHT_MANAGEMENT' },
      { label: '只是了解本次舌象', value: 'UNDERSTAND_TONGUE' },
    ],
  },
];

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
  if (stage === 'STATE_COLLECTING' || stage === 'WAITING_STATE') return 'STATE_COLLECTING';
  if (stage === 'MODEL_ANALYZING' || stage === 'RUNNING') return 'MODEL_ANALYZING';
  if (stage === 'RESULT_ANALYZING') return 'RESULT_ANALYZING';
  if (stage === 'RAG_RETRIEVING') return 'RAG_RETRIEVING';
  if (stage === 'REPORT_GENERATING' || stage === 'REPORT_READY' || stage === 'COMPLETED') {
    return 'REPORT_GENERATING';
  }
  return 'PENDING';
}

function isTaskRunning(task?: TaskStatus) {
  return Boolean(task && !['WAITING_STATE', 'COMPLETED', 'FAILED', 'CANCELED'].includes(task.status));
}

function defaultStateForm(): StateForm {
  return {
    currentStates: [],
    healthGoals: [],
    freeDescription: '',
  };
}

function stateQuestion(message: ChatMessage) {
  return stateQuestions[message.stateStep || 0];
}

function optionSelected(message: ChatMessage, value: string) {
  const question = stateQuestion(message);
  if (!question || !message.stateForm) return false;
  const key = question.key;
  if (key === 'currentStates') return message.stateForm.currentStates.includes(value as CurrentState);
  if (key === 'healthGoals') return message.stateForm.healthGoals.includes(value as HealthGoal);
  return message.stateForm[key] === value;
}

function toggleList<T extends string>(values: T[], value: T, normalValue?: T) {
  if (normalValue && value === normalValue) return [normalValue];
  const next = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values.filter((item) => item !== normalValue), value];
  return next;
}

function selectStateOption(message: ChatMessage, value: string) {
  const question = stateQuestion(message);
  if (!question || !message.stateForm) return;

  if (question.key === 'currentStates') {
    message.stateForm.currentStates = toggleList(message.stateForm.currentStates, value as CurrentState, 'NORMAL');
    return;
  }
  if (question.key === 'healthGoals') {
    message.stateForm.healthGoals = toggleList(message.stateForm.healthGoals, value as HealthGoal);
    return;
  }
  if (question.key === 'sleepStatus') message.stateForm.sleepStatus = value as SleepStatus;
  if (question.key === 'digestionStatus') message.stateForm.digestionStatus = value as DigestionStatus;
  if (question.key === 'bowelStatus') message.stateForm.bowelStatus = value as BowelStatus;
  message.stateStep = (message.stateStep || 0) + 1;
  void scrollToBottom();
}

function nextStateQuestion(message: ChatMessage) {
  const question = stateQuestion(message);
  if (!question || !message.stateForm) return;
  if (question.key === 'currentStates' && message.stateForm.currentStates.length === 0) {
    ElMessage.warning('请选择至少一项状态');
    return;
  }
  if (question.key === 'healthGoals' && message.stateForm.healthGoals.length === 0) {
    ElMessage.warning('请选择至少一个目标');
    return;
  }
  message.stateStep = (message.stateStep || 0) + 1;
  void scrollToBottom();
}

function optionLabel(key: keyof StateForm, value?: string) {
  if (!value) return '未选择';
  return stateQuestions
    .find((question) => question.key === key)
    ?.options.find((option) => option.value === value)
    ?.label || value;
}

function listLabels(key: keyof StateForm, values?: string[]) {
  if (!values?.length) return '未选择';
  return values.map((value) => optionLabel(key, value)).join('、');
}

function buildSnapshot(message: ChatMessage, skipped: boolean): UserStateSnapshot {
  const form = message.stateForm || defaultStateForm();
  return {
    observationWindow: 'LAST_3_DAYS',
    sleepStatus: skipped ? undefined : form.sleepStatus,
    digestionStatus: skipped ? undefined : form.digestionStatus,
    bowelStatus: skipped ? undefined : form.bowelStatus,
    currentStates: skipped ? [] : form.currentStates,
    healthGoals: skipped ? [] : form.healthGoals,
    freeDescription: skipped ? '' : form.freeDescription.trim(),
    skipped,
  };
}

async function submitStateSnapshot(message: ChatMessage, skipped: boolean) {
  if (!message.task?.taskId) return;
  if (!skipped) {
    const form = message.stateForm;
    const missingBasic = !form?.sleepStatus || !form.digestionStatus || !form.bowelStatus;
    if (missingBasic || !form?.currentStates.length || !form.healthGoals.length) {
      ElMessage.warning('请先完成状态补充，或选择暂不补充');
      return;
    }
  }

  message.stateSubmitting = true;
  running.value = true;
  try {
    const task = await tongueApi.submitStateSnapshot(message.task.taskId, buildSnapshot(message, skipped));
    message.stateForm = undefined;
    message.stateStep = undefined;
    message.task = task;
    message.phase = phaseOf(task);
    saveSession();
    await pollTask(task.taskId, message);
  } catch (error) {
    message.status = 'FAILED';
    message.phase = undefined;
    message.task = undefined;
    message.content = error instanceof Error ? error.message : '提交状态补充失败';
  } finally {
    message.stateSubmitting = false;
    running.value = false;
    saveSession();
  }
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
  const taskStatus = String(task?.status || '').toUpperCase();
  const taskStage = String(task?.currentStage || '').toUpperCase();
  const waitingForState = Boolean(
    task && (['WAITING_STATE', 'STATE_COLLECTING'].includes(taskStatus) || ['WAITING_STATE', 'STATE_COLLECTING'].includes(taskStage)),
  );

  return {
    id: typeof raw.id === 'string' ? raw.id : `message_${createId()}`,
    requestId: typeof raw.requestId === 'string' ? raw.requestId : `request_${createId()}`,
    role: raw.role,
    content,
    status,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : undefined,
    task,
    reportId,
    typing: false,
    display: undefined,
    thinking: false,
    stageText: undefined,
    phase: waitingForState ? 'STATE_COLLECTING' : phaseValue as Phase | undefined,
    stateForm: waitingForState ? defaultStateForm() : undefined,
    stateStep: waitingForState && typeof raw.stateStep === 'number' ? raw.stateStep : waitingForState ? 0 : undefined,
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
    stateSubmitting: false,
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
    const created = await tongueApi.prepareAnalyze(image, {
      clientTraceId: requestId,
      threadId: threadId.value,
      conversationId: conversationId.value,
      userDescription: description,
    });
    threadId.value = created.threadId || threadId.value;
    conversationId.value = created.conversationId || conversationId.value;
    target.phase = 'STATE_COLLECTING';
    target.task = {
      taskId: created.taskId,
      reportId: created.reportId,
      status: created.status,
      currentStage: 'STATE_COLLECTING',
      progress: 0,
    };
    target.stateForm = defaultStateForm();
    target.stateStep = 0;
    saveSession();
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
.chat{position:relative;min-height:620px;background:#f4f7fb}.list{height:680px;overflow-y:auto;padding:24px 18px 160px}.row{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;width:min(900px,100%);margin:0 auto 18px}.row.user{grid-template-columns:minmax(0,1fr) 36px}.row.user .avatar{grid-column:2}.row.user .bubble{grid-column:1;grid-row:1;justify-self:end;background:#e8f3ff}.avatar{display:grid;width:36px;height:36px;place-items:center;border-radius:50%;background:#fff;color:#28684a}.bubble{width:fit-content;max-width:720px;padding:14px 16px;border:1px solid #e1e9f0;border-radius:16px;background:#fff}.bubble.failed{border-color:#f5c2c7;background:#fff7f7}.bubble p{margin:0;white-space:pre-wrap;line-height:1.75}.preview{width:min(280px,100%);max-height:280px;object-fit:contain;margin-bottom:12px;border-radius:12px}.thinking{display:flex;align-items:center;gap:8px;color:#738078}.thinking span{width:8px;height:8px;border-radius:50%;background:#2f704d;animation:pulse 1s infinite}.state-card{width:min(620px,100%);display:grid;gap:12px}.state-kicker{font-size:12px;font-weight:700;color:#2f704d}.state-card strong{font-size:17px;color:#1f3128}.state-card p{margin:0;color:#69786f}.option-grid{display:flex;flex-wrap:wrap;gap:8px}.option-grid button,.state-actions button{border:1px solid #d7e4dc;border-radius:999px;background:#fff;padding:8px 12px;color:#31443a;cursor:pointer}.option-grid button.active{border-color:#2f704d;background:#e8f3ec;color:#22583c;font-weight:700}.state-actions{display:flex;flex-wrap:wrap;gap:8px}.state-summary{display:grid;gap:6px;padding:10px;border-radius:12px;background:#f7faf7;color:#536157}.state-card textarea{width:100%;min-height:82px;border:1px solid #d7e4dc;border-radius:12px;padding:10px;resize:vertical;font:inherit}.cursor{display:inline-block;width:1px;height:1em;margin-left:2px;background:currentColor;animation:blink .8s infinite}.report-btn{margin-top:12px}.composer{position:absolute;right:0;bottom:0;left:0;width:min(900px,calc(100% - 24px));margin:auto;padding:10px;border:1px solid #d4e1ec;border-radius:16px;background:#fff}.input-row{display:grid;grid-template-columns:auto minmax(0,1fr) 44px;gap:8px;align-items:end}.file{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px;border-radius:10px;background:#f2f7fb}.image-upload-button{height:42px}@keyframes pulse{50%{opacity:.35}}@keyframes blink{50%{opacity:0}}@media(max-width:760px){.list{height:620px}.row{grid-template-columns:32px minmax(0,1fr)}.row.user{grid-template-columns:minmax(0,1fr) 32px}}
</style>
