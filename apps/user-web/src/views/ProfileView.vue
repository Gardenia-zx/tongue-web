<template>
  <section class="profile-page">
    <header class="profile-head">
      <div class="hero-avatar-wrap">
        <div class="hero-avatar">
          <img v-if="avatarSrc && !avatarLoadFailed" :src="avatarSrc" alt="用户头像" @error="avatarLoadFailed = true" />
          <span v-else>{{ avatarText }}</span>
        </div>
        <button class="avatar-camera" type="button" :disabled="avatarUploading" @click="openAvatarPicker">
          <Camera :size="17" />
        </button>
      </div>

      <div class="profile-copy">
        <div class="name-row">
          <h1>{{ currentUser?.nickname || "我的健康空间" }}</h1>
          <span class="space-badge">PERSONAL HEALTH SPACE</span>
        </div>
        <p>维护基础资料与健康关注方向，AI 将为您提供更贴合个人情况的舌象分析与健康建议。</p>
        <div class="hero-tags">
          <span v-for="item in selectedFocusItems.slice(0, 3)" :key="item.value">
            <component :is="item.icon" :size="14" />
            {{ item.label }}
          </span>
          <span v-if="selectedFocusItems.length === 0"><Sparkles :size="14" />等待设置健康关注方向</span>
        </div>
      </div>

      <div class="completion-card">
        <span class="completion-label">档案完整度</span>
        <strong>{{ completion }}%</strong>
        <div class="completion-track"><i :style="{ width: `${completion}%` }" /></div>
        <div class="completion-todo">
          <span>待完善：</span>
          <em v-for="item in missingItems.slice(0, 3)" :key="item">{{ item }}</em>
          <em v-if="missingItems.length === 0">基础档案已完善</em>
        </div>
        <button v-if="missingItems.length" type="button" class="complete-button" @click="goCompleteProfile">继续完善</button>
      </div>
    </header>

    <div class="profile-grid">
      <section class="profile-panel">
        <nav class="profile-tabs" aria-label="个人中心功能切换">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div v-if="activeTab === 'profile'" ref="profileFormRef" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">BASIC PROFILE</span>
              <h2>基础资料</h2>
            </div>
            <span class="save-status" :class="saveStatusClass">{{ saveStatusText }}</span>
          </div>

          <el-form class="profile-form" label-position="top">
            <div class="form-grid avatar-form-grid">
              <el-form-item label="头像">
                <div class="avatar-field">
                  <div class="form-avatar">
                    <img v-if="avatarSrc && !avatarLoadFailed" :src="avatarSrc" alt="头像预览" @error="avatarLoadFailed = true" />
                    <span v-else>{{ avatarText }}</span>
                  </div>
                  <div>
                    <button class="secondary-button" type="button" :disabled="avatarUploading" @click="openAvatarPicker">
                      {{ avatarUploading ? "正在上传" : "更换头像" }}
                    </button>
                    <p>支持 JPG / PNG / WEBP，2MB 以内</p>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="昵称" required>
                <el-input v-model="form.nickname" size="large" maxlength="64" placeholder="请输入昵称" />
                <span class="field-help">用于社区互动与报告署名</span>
              </el-form-item>

              <el-form-item label="性别" required>
                <el-radio-group v-model="form.gender" class="gender-segment" size="large">
                  <el-radio-button value="male">男</el-radio-button>
                  <el-radio-button value="female">女</el-radio-button>
                  <el-radio-button value="other">其他</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="出生日期" required>
                <el-date-picker
                  v-model="form.birthDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  size="large"
                  placeholder="请选择出生日期"
                  :disabled-date="disableFutureDate"
                />
                <span class="field-help">用于个性化健康评估，仅自己可见</span>
              </el-form-item>

              <el-form-item label="手机号">
                <div class="readonly-field">
                  <Phone :size="16" />
                  <span>{{ maskedPhone }}</span>
                  <RouterLink to="/privacy">管理</RouterLink>
                </div>
                <span class="field-help">用于账号登录与重要通知</span>
              </el-form-item>

              <el-form-item label="邮箱（选填）">
                <el-input v-model="form.email" size="large" maxlength="128" placeholder="请输入邮箱地址">
                  <template #prefix><Mail :size="16" /></template>
                </el-input>
                <span class="field-help">用于接收报告与活动通知</span>
              </el-form-item>
            </div>

            <el-form-item label="健康关注方向（多选）">
              <div class="focus-options">
                <button
                  v-for="item in focusOptions"
                  :key="item.value"
                  type="button"
                  :class="{ selected: form.healthFocus.includes(item.value) }"
                  @click="toggleFocus(item.value)"
                >
                  <component :is="item.icon" :size="15" />
                  {{ item.label }}
                  <Check v-if="form.healthFocus.includes(item.value)" :size="13" />
                </button>
              </div>
            </el-form-item>

            <el-form-item label="补充说明（选填）">
              <el-input
                v-model="form.profileNote"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="例如：希望关注舌苔变化、饮食建议、作息和长期趋势等"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="activeTab === 'health'" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">HEALTH PROFILE</span>
              <h2>健康档案</h2>
            </div>
            <span class="save-status" :class="saveStatusClass">{{ saveStatusText }}</span>
          </div>
          <p class="section-intro">以下信息均为选填，只用于生成更贴近个人情况的健康管理建议，不用于独立诊断。</p>
          <el-form class="profile-form" label-position="top">
            <div class="form-grid">
              <el-form-item label="身高（cm）">
                <el-input-number v-model="form.heightCm" :min="50" :max="250" :precision="1" size="large" />
              </el-form-item>
              <el-form-item label="体重（kg）">
                <el-input-number v-model="form.weightKg" :min="10" :max="350" :precision="1" size="large" />
              </el-form-item>
              <el-form-item label="平均睡眠时长（小时）">
                <el-input-number v-model="form.sleepHours" :min="0" :max="24" :step="0.5" :precision="1" size="large" />
              </el-form-item>
              <el-form-item label="每周运动频率">
                <el-select v-model="form.exerciseFrequency" size="large" clearable placeholder="请选择">
                  <el-option label="基本不运动" value="NONE" />
                  <el-option label="每周 1-2 次" value="LOW" />
                  <el-option label="每周 3-4 次" value="MEDIUM" />
                  <el-option label="每周 5 次及以上" value="HIGH" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="饮食偏好、忌口或过敏情况（选填）">
              <el-input
                v-model="form.dietaryPreference"
                type="textarea"
                :rows="5"
                maxlength="500"
                show-word-limit
                placeholder="例如：偏清淡、乳糖不耐受、海鲜过敏、正在控制晚餐摄入等"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="activeTab === 'ai'" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">AI PERSONALIZATION</span>
              <h2>AI 个性化设置</h2>
            </div>
            <span class="save-status" :class="saveStatusClass">{{ saveStatusText }}</span>
          </div>

          <section class="setting-block">
            <div>
              <strong>回答详细程度</strong>
              <p>控制助手默认回答的篇幅和解释深度。</p>
            </div>
            <el-radio-group v-model="form.answerDetailLevel" class="detail-level">
              <el-radio-button value="CONCISE">简洁</el-radio-button>
              <el-radio-button value="STANDARD">标准</el-radio-button>
              <el-radio-button value="DETAILED">详细</el-radio-button>
            </el-radio-group>
          </section>

          <section class="setting-list">
            <label>
              <span class="setting-icon"><HeartPulse :size="19" /></span>
              <span><strong>结合健康档案</strong><small>回答时按需使用已填写的基础健康信息</small></span>
              <el-switch v-model="form.useHealthProfile" />
            </label>
            <label>
              <span class="setting-icon"><History :size="19" /></span>
              <span><strong>引用历史报告</strong><small>进行趋势分析或报告追问时读取历史报告</small></span>
              <el-switch v-model="form.useHistoryReports" />
            </label>
            <label>
              <span class="setting-icon"><Brain :size="19" /></span>
              <span><strong>允许长期记忆</strong><small>保存稳定偏好，后续可在隐私中心查看与清除</small></span>
              <el-switch v-model="form.useLongTermMemory" />
            </label>
          </section>

          <div class="reminder-settings">
            <section>
              <div>
                <strong>舌象复拍提醒</strong>
                <p>在相近光线和时间下复拍，便于观察趋势。</p>
              </div>
              <el-switch v-model="form.tongueReminderEnabled" />
              <el-time-select
                v-model="form.tongueReminderTime"
                start="06:00"
                step="00:30"
                end="23:30"
                :disabled="!form.tongueReminderEnabled"
                placeholder="提醒时间"
              />
            </section>
            <section>
              <div>
                <strong>睡眠记录提醒</strong>
                <p>记录入睡、夜醒和起床后的精神状态。</p>
              </div>
              <el-switch v-model="form.sleepReminderEnabled" />
              <el-time-select
                v-model="form.sleepReminderTime"
                start="18:00"
                step="00:30"
                end="23:30"
                :disabled="!form.sleepReminderEnabled"
                placeholder="提醒时间"
              />
            </section>
          </div>
        </div>

        <div v-else class="tab-content privacy-tab">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">PRIVACY & SECURITY</span>
              <h2>隐私与安全</h2>
            </div>
          </div>
          <RouterLink class="privacy-action-card" to="/privacy">
            <span><ShieldCheck :size="22" /></span>
            <div>
              <strong>进入隐私与数据管理</strong>
              <p>管理报告、聊天记录、长期记忆、数据导出与账号注销。</p>
            </div>
            <ChevronRight :size="18" />
          </RouterLink>
          <button v-if="avatarSrc" class="privacy-action-card danger" type="button" @click="removeAvatar">
            <span><Trash2 :size="22" /></span>
            <div>
              <strong>删除当前头像</strong>
              <p>删除服务器本地保存的头像文件并恢复默认头像。</p>
            </div>
            <ChevronRight :size="18" />
          </button>
        </div>

        <footer v-if="activeTab !== 'privacy'" class="profile-actions">
          <button class="cancel-button" type="button" :disabled="saving || !dirty" @click="resetForm">取消修改</button>
          <button class="save-button" type="button" :disabled="saving || !dirty" @click="save">
            <Save :size="17" />
            {{ saving ? "正在保存" : "保存个人资料" }}
          </button>
        </footer>
      </section>

      <aside class="profile-side">
        <section class="preference-card">
          <h2>完善资料后可以获得</h2>
          <ul>
            <li>
              <span><UserRoundCheck :size="19" /></span>
              <div><strong>更精准的舌象分析</strong><p>信息越完善，AI 越能说明结论边界。</p></div>
            </li>
            <li>
              <span><MessagesSquare :size="19" /></span>
              <div><strong>个性化健康建议</strong><p>结合关注方向与习惯给出可执行方案。</p></div>
            </li>
            <li>
              <span><ChartNoAxesCombined :size="19" /></span>
              <div><strong>长期趋势追踪</strong><p>更清晰地回顾舌象和健康状态变化。</p></div>
            </li>
          </ul>
        </section>

        <section class="side-card recent-report-card">
          <div class="side-card-title">
            <h3>最近报告</h3>
            <span v-if="latestReport">{{ latestReport.analysisQualityLevel || "已生成" }}</span>
          </div>
          <template v-if="latestReport">
            <div class="report-preview">
              <span class="report-icon"><FileText :size="24" /></span>
              <div>
                <strong>舌象健康报告</strong>
                <time>{{ formatDate(latestReport.createdAt) }}</time>
                <p>{{ latestReport.featureSummary || "查看本次舌象特征与健康管理建议。" }}</p>
              </div>
            </div>
            <button type="button" class="outline-button" @click="openLatestReport">查看报告</button>
          </template>
          <div v-else class="empty-side-state">完成一次舌象检测后，最近报告会显示在这里。</div>
        </section>

        <section class="side-card reminder-card">
          <h3>下次提醒</h3>
          <div class="reminder-row">
            <span><Camera :size="17" /></span>
            <div><strong>舌象复拍提醒</strong><small>{{ form.tongueReminderEnabled ? form.tongueReminderTime : "未开启" }}</small></div>
          </div>
          <div class="reminder-row">
            <span><Moon :size="17" /></span>
            <div><strong>睡眠记录提醒</strong><small>{{ form.sleepReminderEnabled ? form.sleepReminderTime : "未开启" }}</small></div>
          </div>
        </section>

        <RouterLink class="privacy-entry" to="/privacy">
          <span class="privacy-icon"><ShieldCheck :size="20" /></span>
          <div>
            <strong>隐私与数据管理</strong>
            <p>管理您的数据、权限与导出。</p>
          </div>
          <ChevronRight :size="18" />
        </RouterLink>
      </aside>
    </div>

    <input
      ref="avatarInputRef"
      class="hidden-file-input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="onAvatarChange"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Activity,
  Brain,
  Camera,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Dumbbell,
  FileText,
  HeartPulse,
  History,
  Mail,
  MessagesSquare,
  Moon,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  UserRoundCheck,
  Utensils,
} from "lucide-vue-next";
import {
  getApiBase,
  tongueApi,
  useAuthStore,
  type ReportListItem,
  type UserMe,
} from "@tongue/shared";

interface ExtendedUserProfile extends UserMe {
  birthDate?: string;
  email?: string;
  avatarUrl?: string;
  profileNote?: string;
  heightCm?: number;
  weightKg?: number;
  sleepHours?: number;
  exerciseFrequency?: string;
  dietaryPreference?: string;
  answerDetailLevel?: string;
  useHealthProfile?: boolean;
  useHistoryReports?: boolean;
  useLongTermMemory?: boolean;
  tongueReminderEnabled?: boolean;
  tongueReminderTime?: string;
  sleepReminderEnabled?: boolean;
  sleepReminderTime?: string;
}

type TabValue = "profile" | "health" | "ai" | "privacy";

const auth = useAuthStore();
const router = useRouter();
const activeTab = ref<TabValue>("profile");
const saving = ref(false);
const savedRecently = ref(false);
const avatarUploading = ref(false);
const avatarLoadFailed = ref(false);
const avatarInputRef = ref<HTMLInputElement | null>(null);
const profileFormRef = ref<HTMLElement | null>(null);
const latestReport = ref<ReportListItem | null>(null);
const initialSnapshot = ref("");

const tabs: Array<{ value: TabValue; label: string }> = [
  { value: "profile", label: "个人资料" },
  { value: "health", label: "健康档案" },
  { value: "ai", label: "AI 个性化设置" },
  { value: "privacy", label: "隐私与安全" },
];

const focusOptions = [
  { value: "SLEEP", label: "睡眠改善", icon: Moon },
  { value: "DIET", label: "饮食管理", icon: Utensils },
  { value: "MOOD", label: "情绪压力", icon: Smile },
  { value: "DIGESTION", label: "消化健康", icon: Activity },
  { value: "IMMUNITY", label: "免疫提升", icon: Shield },
  { value: "FITNESS", label: "运动健身", icon: Dumbbell },
];

const form = reactive({
  nickname: "",
  gender: "",
  birthDate: "",
  email: "",
  healthFocus: [] as string[],
  profileNote: "",
  heightCm: undefined as number | undefined,
  weightKg: undefined as number | undefined,
  sleepHours: undefined as number | undefined,
  exerciseFrequency: "",
  dietaryPreference: "",
  answerDetailLevel: "STANDARD",
  useHealthProfile: true,
  useHistoryReports: true,
  useLongTermMemory: false,
  tongueReminderEnabled: false,
  tongueReminderTime: "09:00",
  sleepReminderEnabled: false,
  sleepReminderTime: "22:00",
});

const currentUser = computed(() => auth.user as ExtendedUserProfile | null);
const avatarText = computed(() => (currentUser.value?.nickname || currentUser.value?.phone || "我").slice(0, 1));
const avatarSrc = computed(() => {
  const value = currentUser.value?.avatarUrl;
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${getApiBase()}${value.startsWith("/") ? value : `/${value}`}`;
});
const maskedPhone = computed(() => {
  const value = currentUser.value?.phone || "";
  if (value.length < 7) return value || "未绑定";
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
});
const selectedFocusItems = computed(() => focusOptions.filter((item) => form.healthFocus.includes(item.value)));
const completionFields = computed(() => [
  { label: "昵称", value: Boolean(form.nickname.trim()) },
  { label: "性别", value: Boolean(form.gender) },
  { label: "出生日期", value: Boolean(form.birthDate) },
  { label: "邮箱", value: Boolean(form.email.trim()) },
  { label: "健康关注方向", value: form.healthFocus.length > 0 },
  { label: "头像", value: Boolean(avatarSrc.value) },
]);
const completion = computed(() => Math.round(
  completionFields.value.filter((item) => item.value).length / completionFields.value.length * 100,
));
const missingItems = computed(() => completionFields.value.filter((item) => !item.value).map((item) => item.label));
const dirty = computed(() => Boolean(initialSnapshot.value) && serializeForm() !== initialSnapshot.value);
const saveStatusText = computed(() => {
  if (saving.value) return "正在保存";
  if (savedRecently.value) return "已保存";
  if (dirty.value) return "有未保存修改";
  return "已保存";
});
const saveStatusClass = computed(() => ({
  active: savedRecently.value || (!dirty.value && !saving.value),
  warning: dirty.value && !saving.value,
}));

watch(
  () => auth.user,
  (user) => hydrateForm(user as ExtendedUserProfile | null),
  { immediate: true, deep: true },
);
watch(avatarSrc, () => { avatarLoadFailed.value = false; });

onMounted(async () => {
  try {
    const reports = await tongueApi.reports();
    latestReport.value = [...reports].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] || null;
  } catch (error) {
    console.warn("load latest report failed", error);
  }
});

function hydrateForm(user: ExtendedUserProfile | null) {
  if (!user) return;
  Object.assign(form, {
    nickname: user.nickname || "",
    gender: user.gender === "unknown" ? "" : user.gender || "",
    birthDate: user.birthDate || "",
    email: user.email || "",
    healthFocus: parseHealthFocus(user.healthFocus),
    profileNote: user.profileNote || "",
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    sleepHours: user.sleepHours,
    exerciseFrequency: user.exerciseFrequency || "",
    dietaryPreference: user.dietaryPreference || "",
    answerDetailLevel: user.answerDetailLevel || "STANDARD",
    useHealthProfile: user.useHealthProfile ?? true,
    useHistoryReports: user.useHistoryReports ?? true,
    useLongTermMemory: user.useLongTermMemory ?? false,
    tongueReminderEnabled: user.tongueReminderEnabled ?? false,
    tongueReminderTime: user.tongueReminderTime || "09:00",
    sleepReminderEnabled: user.sleepReminderEnabled ?? false,
    sleepReminderTime: user.sleepReminderTime || "22:00",
  });
  initialSnapshot.value = serializeForm();
}

function parseHealthFocus(value?: string) {
  if (!value) return [];
  const aliases: Record<string, string> = {
    睡眠改善: "SLEEP",
    饮食管理: "DIET",
    情绪压力: "MOOD",
    消化健康: "DIGESTION",
    免疫提升: "IMMUNITY",
    运动健身: "FITNESS",
  };
  return value
    .split(/[，,、|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => aliases[item] || item)
    .filter((item, index, array) => focusOptions.some((option) => option.value === item) && array.indexOf(item) === index);
}

function serializeForm() {
  return JSON.stringify({
    ...form,
    healthFocus: [...form.healthFocus].sort(),
  });
}

function toggleFocus(value: string) {
  const index = form.healthFocus.indexOf(value);
  if (index >= 0) form.healthFocus.splice(index, 1);
  else form.healthFocus.push(value);
}

function openAvatarPicker() {
  if (!avatarUploading.value) avatarInputRef.value?.click();
}

async function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    ElMessage.warning("头像仅支持 JPG、PNG 或 WEBP");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning("头像不能超过 2MB");
    return;
  }

  avatarUploading.value = true;
  try {
    await auth.uploadAvatar(file);
    avatarLoadFailed.value = false;
    ElMessage.success("头像已更新");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "头像上传失败");
  } finally {
    avatarUploading.value = false;
  }
}

async function removeAvatar() {
  try {
    await ElMessageBox.confirm("确认删除当前头像并恢复默认头像吗？", "删除头像", {
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
      type: "warning",
    });
    await auth.removeAvatar();
    avatarLoadFailed.value = false;
    ElMessage.success("头像已删除");
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error instanceof Error ? error.message : "头像删除失败");
    }
  }
}

async function save() {
  if (!form.nickname.trim()) {
    activeTab.value = "profile";
    ElMessage.warning("请填写昵称");
    return;
  }
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
    activeTab.value = "profile";
    ElMessage.warning("请输入正确的邮箱地址");
    return;
  }

  saving.value = true;
  savedRecently.value = false;
  try {
    await auth.updateProfile({
      nickname: form.nickname.trim(),
      gender: form.gender || "unknown",
      birthDate: form.birthDate || undefined,
      email: form.email.trim(),
      healthFocus: form.healthFocus.join("、"),
      profileNote: form.profileNote.trim(),
      heightCm: form.heightCm,
      weightKg: form.weightKg,
      sleepHours: form.sleepHours,
      exerciseFrequency: form.exerciseFrequency,
      dietaryPreference: form.dietaryPreference.trim(),
      answerDetailLevel: form.answerDetailLevel,
      useHealthProfile: form.useHealthProfile,
      useHistoryReports: form.useHistoryReports,
      useLongTermMemory: form.useLongTermMemory,
      tongueReminderEnabled: form.tongueReminderEnabled,
      tongueReminderTime: form.tongueReminderTime,
      sleepReminderEnabled: form.sleepReminderEnabled,
      sleepReminderTime: form.sleepReminderTime,
    });
    initialSnapshot.value = serializeForm();
    savedRecently.value = true;
    ElMessage.success("个人资料已保存");
    window.setTimeout(() => { savedRecently.value = false; }, 2400);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "资料保存失败");
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  if (!initialSnapshot.value) return;
  Object.assign(form, JSON.parse(initialSnapshot.value));
}

function goCompleteProfile() {
  activeTab.value = "profile";
  window.setTimeout(() => profileFormRef.value?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
}

function openLatestReport() {
  if (latestReport.value?.reportId) router.push(`/reports/${latestReport.value.reportId}`);
}

function disableFutureDate(date: Date) {
  return date.getTime() > Date.now();
}

function formatDate(value?: string) {
  if (!value) return "时间未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 20px;
  width: min(1290px, 100%);
  margin: 0 auto;
  color: #243129;
}

.profile-head,
.profile-panel,
.preference-card,
.side-card,
.privacy-entry {
  border: 1px solid rgba(168, 184, 173, 0.46);
  background: rgba(255, 255, 252, 0.92);
  box-shadow: 0 18px 48px rgba(45, 68, 54, 0.07);
}

.profile-head {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) minmax(300px, 360px);
  align-items: center;
  gap: 26px;
  min-height: 210px;
  padding: 28px 32px;
  border-radius: 28px;
  background:
    radial-gradient(circle at 100% 0, rgba(211, 230, 217, 0.78), transparent 42%),
    rgba(255, 255, 252, 0.94);
}

.hero-avatar-wrap {
  position: relative;
  width: 126px;
  height: 126px;
}

.hero-avatar,
.form-avatar {
  display: grid;
  overflow: hidden;
  place-items: center;
  border: 5px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: linear-gradient(145deg, #e5f0e8, #bdd8c7);
  color: #2b6747;
  box-shadow: 0 10px 28px rgba(46, 91, 62, 0.15);
}

.hero-avatar { width: 126px; height: 126px; font-size: 42px; }
.hero-avatar img,
.form-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-camera {
  position: absolute;
  right: -2px;
  bottom: 7px;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid #d8e3db;
  border-radius: 50%;
  background: #fff;
  color: #276945;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(40, 82, 55, 0.14);
}

.name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.profile-copy h1 {
  margin: 0;
  color: #1f2923;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(38px, 4.2vw, 58px);
  font-weight: 560;
  letter-spacing: -0.055em;
}
.space-badge {
  padding: 7px 11px;
  border-radius: 9px;
  background: #edf5ee;
  color: #397153;
  font-size: 10px;
  letter-spacing: 0.05em;
}
.profile-copy > p { max-width: 680px; margin: 14px 0 0; color: #6f7b73; font-size: 13px; line-height: 1.75; }
.hero-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.hero-tags span { display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 999px; background: #eff6ef; color: #397253; font-size: 12px; }

.completion-card {
  position: relative;
  display: grid;
  gap: 9px;
  padding: 20px 22px;
  border: 1px solid rgba(148, 177, 157, 0.45);
  border-radius: 20px;
  background: rgba(251, 253, 250, 0.82);
}
.completion-label { color: #66736b; font-size: 12px; }
.completion-card strong { color: #286c45; font-size: 34px; line-height: 1; }
.completion-track { overflow: hidden; height: 8px; border-radius: 999px; background: #e3ebe5; }
.completion-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2d7049, #76aa84); transition: width 0.3s ease; }
.completion-todo { display: flex; flex-wrap: wrap; gap: 8px 12px; color: #7b867f; font-size: 11px; }
.completion-todo em { position: relative; padding-left: 11px; color: #647269; font-style: normal; }
.completion-todo em::before { position: absolute; top: 5px; left: 0; width: 6px; height: 6px; border-radius: 50%; background: #cee2d2; content: ""; }
.complete-button { justify-self: end; min-height: 38px; padding: 0 16px; border: 0; border-radius: 11px; background: #276a45; color: #fff; cursor: pointer; font-weight: 650; }

.profile-grid { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(300px, 0.72fr); gap: 18px; align-items: start; }
.profile-panel { overflow: hidden; border-radius: 24px; }
.profile-tabs { display: flex; gap: 34px; padding: 0 28px; border-bottom: 1px solid #e5ebe6; }
.profile-tabs button { position: relative; min-height: 64px; padding: 0 4px; border: 0; background: none; color: #6e7771; cursor: pointer; font-size: 14px; }
.profile-tabs button.active { color: #276b47; font-weight: 700; }
.profile-tabs button.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 3px; border-radius: 99px 99px 0 0; background: #2c714a; content: ""; }
.tab-content { min-height: 520px; padding: 26px 28px 12px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
.page-kicker { display: block; color: #3d7255; font-size: 10px; font-weight: 760; letter-spacing: 0.16em; }
.panel-heading h2 { margin: 8px 0 0; font-size: 24px; font-weight: 680; }
.save-status { padding: 7px 11px; border: 1px solid transparent; border-radius: 999px; background: #f0f3f0; color: #7d8780; font-size: 10px; }
.save-status.active { background: #e9f4eb; color: #367252; }
.save-status.warning { border-color: #efc98a; background: #fff8e9; color: #b8781f; }
.section-intro { margin: -10px 0 24px; padding: 12px 14px; border-radius: 12px; background: #f5f8f5; color: #6e7a71; font-size: 12px; line-height: 1.7; }

.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 24px; }
.avatar-form-grid { grid-template-columns: minmax(250px, 0.78fr) minmax(0, 1.1fr); }
.avatar-field { display: flex; align-items: center; gap: 18px; min-height: 112px; }
.form-avatar { width: 90px; height: 90px; flex: 0 0 auto; font-size: 30px; }
.avatar-field p,
.field-help { display: block; margin: 7px 0 0; color: #8a938d; font-size: 10px; line-height: 1.55; }
.secondary-button { min-height: 36px; padding: 0 14px; border: 1px solid #d4ddd6; border-radius: 10px; background: #fff; color: #425b4c; cursor: pointer; }
.profile-form :deep(.el-form-item) { margin-bottom: 22px; }
.profile-form :deep(.el-form-item__label) { color: #536359; font-size: 12px; font-weight: 680; }
.profile-form :deep(.el-input__wrapper),
.profile-form :deep(.el-textarea__inner),
.profile-form :deep(.el-select__wrapper),
.profile-form :deep(.el-date-editor),
.profile-form :deep(.el-input-number) { border-radius: 11px; box-shadow: 0 0 0 1px rgba(91, 113, 99, 0.18) inset; }
.profile-form :deep(.el-date-editor),
.profile-form :deep(.el-input-number),
.profile-form :deep(.el-select) { width: 100%; }
.gender-segment { display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; }
.gender-segment :deep(.el-radio-button__inner) { width: 100%; min-height: 40px; padding: 12px; }
.readonly-field { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 9px; min-height: 40px; padding: 0 13px; border: 1px solid #dde5df; border-radius: 11px; background: #f6f8f7; color: #78827c; }
.readonly-field a { color: #2f704d; text-decoration: none; font-weight: 650; }
.focus-options { display: flex; flex-wrap: wrap; gap: 10px; }
.focus-options button { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 13px; border: 1px solid #dce4de; border-radius: 10px; background: #fff; color: #5f6c64; cursor: pointer; }
.focus-options button.selected { border-color: #55906b; background: #edf6ef; color: #2f704c; box-shadow: 0 0 0 1px rgba(64, 127, 82, 0.08); }

.setting-block { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px; border: 1px solid #e0e7e2; border-radius: 16px; background: #fafcf9; }
.setting-block strong,
.setting-list strong,
.reminder-settings strong { color: #33463a; font-size: 13px; }
.setting-block p,
.setting-list small,
.reminder-settings p { display: block; margin: 6px 0 0; color: #7f8a82; font-size: 10px; line-height: 1.55; }
.setting-list { display: grid; gap: 10px; margin-top: 16px; }
.setting-list label { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: 13px; padding: 16px; border: 1px solid #e1e8e3; border-radius: 15px; background: #fff; }
.setting-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #eaf3ec; color: #377253; }
.reminder-settings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.reminder-settings section { display: grid; grid-template-columns: 1fr auto; gap: 14px; padding: 18px; border: 1px solid #e0e7e2; border-radius: 16px; background: #fafcf9; }
.reminder-settings :deep(.el-select) { grid-column: 1 / -1; width: 100%; }

.privacy-tab { min-height: 480px; }
.privacy-action-card { display: grid; grid-template-columns: 50px 1fr auto; align-items: center; gap: 14px; width: 100%; margin-bottom: 14px; padding: 18px; border: 1px solid #dfe7e1; border-radius: 16px; background: #fbfdfb; color: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.privacy-action-card > span { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; background: #e9f2eb; color: #397253; }
.privacy-action-card strong { color: #33473a; font-size: 13px; }
.privacy-action-card p { margin: 5px 0 0; color: #7d8980; font-size: 11px; line-height: 1.6; }
.privacy-action-card.danger { border-color: #f0dddd; }
.privacy-action-card.danger > span { background: #fbebeb; color: #a24d4d; }

.profile-actions { display: flex; justify-content: center; gap: 16px; padding: 16px 28px 22px; border-top: 1px solid #e6ebe7; background: rgba(252, 253, 251, 0.95); }
.cancel-button,
.save-button { display: inline-flex; min-width: 190px; min-height: 44px; align-items: center; justify-content: center; gap: 8px; border-radius: 11px; cursor: pointer; font-weight: 680; }
.cancel-button { border: 1px solid #d7dfd9; background: #fff; color: #536159; }
.save-button { border: 0; background: linear-gradient(135deg, #286d47, #337d52); color: #fff; box-shadow: 0 8px 18px rgba(38, 105, 67, 0.18); }
.cancel-button:disabled,
.save-button:disabled,
.avatar-camera:disabled,
.secondary-button:disabled { cursor: not-allowed; opacity: 0.5; }

.profile-side { display: grid; align-content: start; gap: 14px; }
.preference-card,
.side-card { padding: 22px; border-radius: 21px; }
.preference-card { background: linear-gradient(155deg, #fbfdf9, #eaf4e9); }
.preference-card h2,
.side-card h3 { margin: 0; color: #27352c; font-size: 19px; }
.preference-card ul { display: grid; gap: 16px; margin: 20px 0 0; padding: 0; list-style: none; }
.preference-card li { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 12px; }
.preference-card li > span { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: rgba(255, 255, 255, 0.78); color: #367251; }
.preference-card li strong { color: #405247; font-size: 12px; }
.preference-card li p { margin: 4px 0 0; color: #7c8880; font-size: 10px; line-height: 1.5; }
.side-card-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.side-card-title > span { padding: 4px 8px; border-radius: 8px; background: #e9f4eb; color: #397453; font-size: 10px; }
.report-preview { display: grid; grid-template-columns: 58px 1fr; gap: 13px; margin-top: 17px; }
.report-icon { display: grid; width: 58px; height: 58px; place-items: center; border-radius: 14px; background: linear-gradient(145deg, #dfeee3, #c5dccd); color: #337151; }
.report-preview strong { display: block; color: #34463b; font-size: 12px; }
.report-preview time { display: block; margin-top: 4px; color: #8a948e; font-size: 9px; }
.report-preview p { display: -webkit-box; overflow: hidden; margin: 7px 0 0; color: #6e7a72; font-size: 10px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.outline-button { display: block; min-height: 36px; margin: 16px 0 0 auto; padding: 0 15px; border: 1px solid #d3ded6; border-radius: 10px; background: #fff; color: #367151; cursor: pointer; font-weight: 650; }
.empty-side-state { margin-top: 15px; padding: 16px; border-radius: 12px; background: #f5f8f5; color: #7c8880; font-size: 11px; line-height: 1.65; }
.reminder-card { display: grid; gap: 12px; }
.reminder-row { display: grid; grid-template-columns: 38px 1fr; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px solid #e7ece8; }
.reminder-row > span { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 11px; background: #eaf3ec; color: #377252; }
.reminder-row strong { display: block; color: #405047; font-size: 11px; }
.reminder-row small { display: block; margin-top: 3px; color: #8a948e; font-size: 9px; }
.privacy-entry { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 13px; min-height: 104px; padding: 17px; border-radius: 20px; color: inherit; text-decoration: none; }
.privacy-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; background: #e7f1e9; color: #397253; }
.privacy-entry strong { color: #34483c; font-size: 12px; }
.privacy-entry p { margin: 5px 0 0; color: #818c84; font-size: 9px; }
.hidden-file-input { display: none; }

@media (max-width: 1100px) {
  .profile-head { grid-template-columns: 120px minmax(0, 1fr); }
  .completion-card { grid-column: 1 / -1; }
  .profile-grid { grid-template-columns: 1fr; }
  .profile-side { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .profile-head { grid-template-columns: 1fr; justify-items: start; padding: 24px; }
  .profile-tabs { gap: 16px; overflow-x: auto; padding: 0 18px; }
  .profile-tabs button { flex: 0 0 auto; }
  .tab-content { padding: 22px 18px 10px; }
  .form-grid,
  .avatar-form-grid,
  .reminder-settings,
  .profile-side { grid-template-columns: 1fr; }
  .setting-block { align-items: flex-start; flex-direction: column; }
  .profile-actions { position: sticky; bottom: 0; padding: 14px 18px; }
  .cancel-button,
  .save-button { min-width: 0; flex: 1; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
}
</style>
