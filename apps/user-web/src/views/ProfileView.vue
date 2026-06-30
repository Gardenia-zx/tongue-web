<template>
  <section class="profile-page">
    <header class="profile-hero">
      <div class="hero-profile">
        <div class="avatar-stage">
          <span class="avatar-halo" />
          <div class="hero-avatar">
            <img v-if="avatarSrc && !avatarLoadFailed" :src="avatarSrc" alt="用户头像" @error="avatarLoadFailed = true" />
            <span v-else>{{ avatarText }}</span>
          </div>
          <button class="avatar-camera" type="button" :disabled="avatarUploading" aria-label="更换头像" @click="openAvatarPicker">
            <RefreshCw v-if="avatarUploading" class="spinning" :size="16" />
            <Camera v-else :size="17" />
          </button>
        </div>

        <div class="hero-copy">
          <span class="page-kicker">PERSONAL HEALTH SPACE</span>
          <h1>{{ currentUser?.nickname || "我的健康空间" }}</h1>
          <p>维护个人资料、健康关注方向和 AI 使用偏好，让每一次分析与建议更贴近您的真实情况。</p>

          <div class="hero-tags">
            <span v-for="item in selectedFocusItems.slice(0, 3)" :key="item.value">
              <component :is="item.icon" :size="14" />
              {{ item.label }}
            </span>
            <span v-if="selectedFocusItems.length === 0"><Sparkles :size="14" />等待设置健康关注方向</span>
          </div>
        </div>
      </div>

      <div class="completion-visual">
        <div class="completion-ring" :style="{ '--completion-angle': `${completion * 3.6}deg` }">
          <span><strong>{{ completion }}</strong><small>%</small></span>
        </div>
        <div class="completion-copy">
          <span>档案完整度</span>
          <strong>{{ completion >= 100 ? "基础档案已完善" : `还可完善 ${missingItems.length} 项` }}</strong>
          <p>{{ missingItems.length ? `建议补充：${missingItems.slice(0, 3).join("、")}` : "AI 可以更稳定地使用您的个性化信息。" }}</p>
          <button v-if="missingItems.length" type="button" @click="goCompleteProfile">
            继续完善
            <ArrowRight :size="15" />
          </button>
        </div>
      </div>

      <div class="hero-ambient" aria-hidden="true">
        <span class="ambient-grid" />
        <span class="ambient-orbit orbit-one" />
        <span class="ambient-orbit orbit-two" />
        <span class="ambient-dot dot-one" />
        <span class="ambient-dot dot-two" />
      </div>
    </header>

    <section class="profile-overview" aria-label="个人空间概览">
      <article class="overview-card overview-completion">
        <span class="overview-icon"><UserRoundCheck :size="21" /></span>
        <span class="overview-copy">
          <small>资料完整度</small>
          <strong>{{ completion }}<em>%</em></strong>
          <span>{{ missingItems.length ? `${missingItems.length} 项待完善` : "基础资料已完善" }}</span>
        </span>
      </article>

      <article class="overview-card overview-focus">
        <span class="overview-icon"><HeartPulse :size="21" /></span>
        <span class="overview-copy">
          <small>健康关注</small>
          <strong>{{ selectedFocusItems.length }}<em>项</em></strong>
          <span>{{ selectedFocusItems.length ? selectedFocusItems.map((item) => item.label).slice(0, 2).join("、") : "尚未设置关注方向" }}</span>
        </span>
      </article>

      <article class="overview-card overview-health">
        <span class="overview-icon"><Activity :size="21" /></span>
        <span class="overview-copy">
          <small>身体档案</small>
          <strong class="overview-text-value">{{ bmiText }}</strong>
          <span>{{ ageText }} · 睡眠 {{ form.sleepHours ? `${form.sleepHours} 小时` : "未填写" }}</span>
        </span>
      </article>

      <article class="overview-card overview-ai">
        <span class="overview-icon"><Brain :size="21" /></span>
        <span class="overview-copy">
          <small>AI 个性化</small>
          <strong class="overview-text-value">{{ answerDetailText }}</strong>
          <span>{{ form.useLongTermMemory ? "长期记忆已开启" : "长期记忆未开启" }}</span>
        </span>
      </article>
    </section>

    <section class="profile-workspace">
      <nav class="profile-tabs" aria-label="个人中心功能切换">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <span><component :is="tab.icon" :size="17" /></span>
          <div>
            <strong>{{ tab.label }}</strong>
            <small>{{ tab.description }}</small>
          </div>
          <ChevronRight :size="15" />
        </button>
      </nav>

      <main class="profile-panel">
        <div v-if="activeTab === 'profile'" ref="profileFormRef" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">BASIC PROFILE</span>
              <h2>基础资料</h2>
              <p>完善身份和联系方式，用于账号展示、报告署名与个性化分析。</p>
            </div>
            <span :class="[ 'save-status', saveStatusClass ]"><i />{{ saveStatusText }}</span>
          </div>

          <section class="form-section avatar-section">
            <div class="section-title">
              <span><Camera :size="18" /></span>
              <div><strong>头像与身份</strong><small>设置个人空间中的基础展示信息</small></div>
            </div>

            <div class="avatar-editor">
              <div class="form-avatar">
                <img v-if="avatarSrc && !avatarLoadFailed" :src="avatarSrc" alt="头像预览" @error="avatarLoadFailed = true" />
                <span v-else>{{ avatarText }}</span>
              </div>
              <div>
                <strong>{{ currentUser?.nickname || "设置您的头像" }}</strong>
                <p>支持 JPG、PNG、WEBP，文件不超过 2MB。</p>
                <div class="avatar-actions">
                  <button type="button" :disabled="avatarUploading" @click="openAvatarPicker">
                    <Camera :size="15" />{{ avatarUploading ? "正在上传" : "更换头像" }}
                  </button>
                  <button v-if="avatarSrc" class="remove-avatar" type="button" @click="removeAvatar">
                    <Trash2 :size="15" />删除头像
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-title">
              <span><UserRoundCheck :size="18" /></span>
              <div><strong>个人信息</strong><small>带 * 的字段建议优先完善</small></div>
            </div>

            <el-form class="profile-form" label-position="top">
              <div class="form-grid">
                <el-form-item label="昵称 *">
                  <el-input v-model="form.nickname" size="large" maxlength="64" placeholder="请输入昵称" />
                  <span class="field-help">用于个人空间展示和报告署名</span>
                </el-form-item>

                <el-form-item label="性别 *">
                  <el-radio-group v-model="form.gender" class="gender-segment" size="large">
                    <el-radio-button value="male">男</el-radio-button>
                    <el-radio-button value="female">女</el-radio-button>
                    <el-radio-button value="other">其他</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="出生日期 *">
                  <el-date-picker
                    v-model="form.birthDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    size="large"
                    placeholder="请选择出生日期"
                    :disabled-date="disableFutureDate"
                  />
                  <span class="field-help">仅用于个性化健康参考</span>
                </el-form-item>

                <el-form-item label="手机号">
                  <div class="readonly-field">
                    <Phone :size="16" />
                    <span>{{ maskedPhone }}</span>
                    <RouterLink to="/privacy">管理</RouterLink>
                  </div>
                  <span class="field-help">用于登录和重要通知</span>
                </el-form-item>

                <el-form-item label="邮箱（选填）">
                  <el-input v-model="form.email" size="large" maxlength="128" placeholder="请输入邮箱地址">
                    <template #prefix><Mail :size="16" /></template>
                  </el-input>
                  <span class="field-help">可用于接收报告和提醒</span>
                </el-form-item>
              </div>
            </el-form>
          </section>

          <section class="form-section">
            <div class="section-title">
              <span><HeartPulse :size="18" /></span>
              <div><strong>健康关注方向</strong><small>可多选，助手会在回答时优先关注这些方面</small></div>
            </div>

            <div class="focus-options">
              <button
                v-for="item in focusOptions"
                :key="item.value"
                type="button"
                :class="{ selected: form.healthFocus.includes(item.value) }"
                @click="toggleFocus(item.value)"
              >
                <span><component :is="item.icon" :size="17" /></span>
                <div><strong>{{ item.label }}</strong><small>{{ item.description }}</small></div>
                <Check v-if="form.healthFocus.includes(item.value)" :size="14" />
              </button>
            </div>

            <label class="textarea-field">
              <span>补充说明（选填）</span>
              <textarea v-model="form.profileNote" maxlength="500" placeholder="例如：希望持续关注舌苔变化、饮食建议、作息和长期趋势等。" />
              <small>{{ form.profileNote.length }}/500</small>
            </label>
          </section>
        </div>

        <div v-else-if="activeTab === 'health'" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">HEALTH PROFILE</span>
              <h2>健康档案</h2>
              <p>以下内容均为选填，仅用于生成更贴近个人情况的生活方式建议。</p>
            </div>
            <span :class="[ 'save-status', saveStatusClass ]"><i />{{ saveStatusText }}</span>
          </div>

          <section class="health-summary-card">
            <span class="health-summary-icon"><Activity :size="23" /></span>
            <div>
              <span class="page-kicker">PROFILE SUMMARY</span>
              <strong>{{ bmiText }}</strong>
              <p>{{ ageText }}，平均睡眠 {{ form.sleepHours ? `${form.sleepHours} 小时` : "尚未填写" }}，运动频率为 {{ exerciseFrequencyText }}。</p>
            </div>
            <small>仅作档案摘要</small>
          </section>

          <section class="form-section">
            <div class="section-title">
              <span><Activity :size="18" /></span>
              <div><strong>身体与生活方式</strong><small>用于调整建议的强度、频率和表达边界</small></div>
            </div>

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
                  <el-select v-model="form.exerciseFrequency" size="large" clearable placeholder="请选择运动频率">
                    <el-option label="基本不运动" value="NONE" />
                    <el-option label="每周 1-2 次" value="LOW" />
                    <el-option label="每周 3-4 次" value="MEDIUM" />
                    <el-option label="每周 5 次及以上" value="HIGH" />
                  </el-select>
                </el-form-item>
              </div>
            </el-form>
          </section>

          <section class="form-section">
            <div class="section-title">
              <span><Utensils :size="18" /></span>
              <div><strong>饮食偏好与限制</strong><small>填写忌口、过敏或正在执行的饮食安排</small></div>
            </div>

            <label class="textarea-field">
              <span>饮食偏好、忌口或过敏情况</span>
              <textarea v-model="form.dietaryPreference" maxlength="500" placeholder="例如：偏清淡、乳糖不耐受、海鲜过敏、正在控制晚餐摄入等。" />
              <small>{{ form.dietaryPreference.length }}/500</small>
            </label>
          </section>
        </div>

        <div v-else-if="activeTab === 'ai'" class="tab-content">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">AI PERSONALIZATION</span>
              <h2>AI 个性化设置</h2>
              <p>控制助手回答深度、可用信息范围和健康提醒方式。</p>
            </div>
            <span :class="[ 'save-status', saveStatusClass ]"><i />{{ saveStatusText }}</span>
          </div>

          <section class="detail-level-card">
            <div>
              <span class="detail-icon"><MessagesSquare :size="21" /></span>
              <div><strong>回答详细程度</strong><p>选择助手默认回答的篇幅与解释深度。</p></div>
            </div>
            <el-radio-group v-model="form.answerDetailLevel" class="detail-level">
              <el-radio-button value="CONCISE">简洁</el-radio-button>
              <el-radio-button value="STANDARD">标准</el-radio-button>
              <el-radio-button value="DETAILED">详细</el-radio-button>
            </el-radio-group>
          </section>

          <section class="setting-list">
            <label>
              <span class="setting-icon"><HeartPulse :size="20" /></span>
              <span><strong>结合健康档案</strong><small>回答时按需使用您主动填写的基础健康信息</small></span>
              <el-switch v-model="form.useHealthProfile" />
            </label>
            <label>
              <span class="setting-icon"><History :size="20" /></span>
              <span><strong>引用历史报告</strong><small>进行趋势分析或报告追问时读取历史报告</small></span>
              <el-switch v-model="form.useHistoryReports" />
            </label>
            <label>
              <span class="setting-icon"><Brain :size="20" /></span>
              <span><strong>允许长期记忆</strong><small>保存稳定偏好，可随时在隐私中心清除</small></span>
              <el-switch v-model="form.useLongTermMemory" />
            </label>
          </section>

          <section class="reminder-section">
            <div class="section-title">
              <span><Clock3 :size="18" /></span>
              <div><strong>健康提醒</strong><small>在适合的时间提示复拍和睡眠记录</small></div>
            </div>

            <div class="reminder-settings">
              <section>
                <span class="reminder-icon"><Camera :size="20" /></span>
                <div><strong>舌象复拍提醒</strong><p>保持相近光线和时间，便于观察趋势。</p></div>
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
                <span class="reminder-icon"><Moon :size="20" /></span>
                <div><strong>睡眠记录提醒</strong><p>记录入睡、夜醒和起床后的精神状态。</p></div>
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
          </section>
        </div>

        <div v-else class="tab-content privacy-tab">
          <div class="panel-heading">
            <div>
              <span class="page-kicker">PRIVACY & SECURITY</span>
              <h2>隐私与安全</h2>
              <p>集中管理健康数据、聊天记录、长期记忆和账号隐私操作。</p>
            </div>
          </div>

          <div class="privacy-grid">
            <RouterLink class="privacy-action-card" to="/privacy">
              <span><ShieldCheck :size="23" /></span>
              <div><strong>进入隐私与数据管理</strong><p>管理报告、聊天记录、长期记忆、数据导出和账号注销。</p></div>
              <ChevronRight :size="18" />
            </RouterLink>

            <RouterLink class="privacy-action-card" to="/reports">
              <span><FileText :size="23" /></span>
              <div><strong>管理健康报告</strong><p>查看、删除或进入历次舌象分析报告。</p></div>
              <ChevronRight :size="18" />
            </RouterLink>

            <button v-if="avatarSrc" class="privacy-action-card danger" type="button" @click="removeAvatar">
              <span><Trash2 :size="23" /></span>
              <div><strong>删除当前头像</strong><p>移除服务器保存的头像文件并恢复默认头像。</p></div>
              <ChevronRight :size="18" />
            </button>
          </div>

          <section class="privacy-note">
            <span><ShieldCheck :size="21" /></span>
            <div><strong>您的健康数据由您决定</strong><p>您可以在隐私中心导出或删除数据，并控制助手是否使用健康档案、历史报告和长期记忆。</p></div>
          </section>
        </div>

        <footer v-if="activeTab !== 'privacy'" class="profile-actions">
          <div class="action-tip">
            <ShieldCheck :size="16" />
            <span>只有点击保存后，本页修改才会应用到后续分析与回答。</span>
          </div>
          <div>
            <button class="cancel-button" type="button" :disabled="saving || !dirty" @click="resetForm">取消修改</button>
            <button class="save-button" type="button" :disabled="saving || !dirty" @click="save">
              <RefreshCw v-if="saving" class="spinning" :size="17" />
              <Save v-else :size="17" />
              {{ saving ? "正在保存" : "保存个人资料" }}
            </button>
          </div>
        </footer>
      </main>

      <aside class="profile-side">
        <section class="side-card benefit-card">
          <div class="side-heading">
            <span class="side-icon"><Sparkles :size="20" /></span>
            <div><span class="page-kicker">PERSONALIZATION</span><h3>完善资料后可以获得</h3></div>
          </div>
          <ul>
            <li>
              <span><UserRoundCheck :size="18" /></span>
              <div><strong>更贴近个人情况的解释</strong><p>帮助助手明确适用范围与表达边界。</p></div>
            </li>
            <li>
              <span><MessagesSquare :size="18" /></span>
              <div><strong>更可执行的健康建议</strong><p>结合关注方向和生活习惯安排建议。</p></div>
            </li>
            <li>
              <span><ChartNoAxesCombined :size="18" /></span>
              <div><strong>更连续的长期观察</strong><p>回顾舌象、报告和日常计划的变化。</p></div>
            </li>
          </ul>
        </section>

        <section class="side-card recent-report-card">
          <div class="side-card-title">
            <div><span class="page-kicker">LATEST REPORT</span><h3>最近报告</h3></div>
            <span v-if="latestReport">{{ latestReport.analysisQualityLevel || "已生成" }}</span>
          </div>

          <template v-if="latestReport">
            <div class="report-preview">
              <span class="report-icon"><FileText :size="23" /></span>
              <div>
                <strong>舌象健康报告 #{{ latestReport.reportId }}</strong>
                <time>{{ formatDate(latestReport.createdAt) }}</time>
                <p>{{ latestReport.featureSummary || "查看本次舌象特征和健康管理建议。" }}</p>
              </div>
            </div>
            <button type="button" class="outline-button" @click="openLatestReport">
              查看完整报告
              <ArrowRight :size="15" />
            </button>
          </template>

          <div v-else class="empty-side-state">
            <span><FileText :size="24" /></span>
            <div><strong>暂无健康报告</strong><p>完成一次舌象分析后，最近报告会显示在这里。</p></div>
          </div>
        </section>

        <section class="side-card reminder-card">
          <div class="side-card-title">
            <div><span class="page-kicker">REMINDERS</span><h3>健康提醒</h3></div>
          </div>
          <div class="reminder-row">
            <span><Camera :size="17" /></span>
            <div><strong>舌象复拍</strong><small>{{ form.tongueReminderEnabled ? form.tongueReminderTime : "未开启" }}</small></div>
          </div>
          <div class="reminder-row">
            <span><Moon :size="17" /></span>
            <div><strong>睡眠记录</strong><small>{{ form.sleepReminderEnabled ? form.sleepReminderTime : "未开启" }}</small></div>
          </div>
          <button type="button" @click="activeTab = 'ai'">管理提醒设置</button>
        </section>

        <RouterLink class="privacy-entry" to="/privacy">
          <span class="privacy-icon"><ShieldCheck :size="20" /></span>
          <div><strong>隐私与数据管理</strong><p>管理数据、权限、导出与账号操作。</p></div>
          <ChevronRight :size="18" />
        </RouterLink>
      </aside>
    </section>

    <input
      ref="avatarInputRef"
      class="hidden-file-input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="onAvatarChange"
    />

    <footer class="profile-note">
      <ShieldCheck :size="15" />
      <span>个人资料仅用于账号服务和您授权的个性化健康功能，不作为独立诊断依据。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Activity,
  ArrowRight,
  Brain,
  Camera,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  FileText,
  HeartPulse,
  History,
  Mail,
  MessagesSquare,
  Moon,
  Phone,
  RefreshCw,
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

const tabs = [
  { value: "profile" as const, label: "个人资料", description: "身份与关注方向", icon: UserRoundCheck },
  { value: "health" as const, label: "健康档案", description: "身体与生活方式", icon: HeartPulse },
  { value: "ai" as const, label: "AI 个性化", description: "回答与提醒设置", icon: Brain },
  { value: "privacy" as const, label: "隐私与安全", description: "数据和账号管理", icon: ShieldCheck },
];

const focusOptions = [
  { value: "SLEEP", label: "睡眠改善", description: "作息、夜醒与恢复", icon: Moon },
  { value: "DIET", label: "饮食管理", description: "饮食结构与执行建议", icon: Utensils },
  { value: "MOOD", label: "情绪压力", description: "压力、情绪和身心状态", icon: Smile },
  { value: "DIGESTION", label: "消化健康", description: "食欲、腹胀与消化感受", icon: Activity },
  { value: "IMMUNITY", label: "免疫提升", description: "日常恢复与健康防护", icon: Shield },
  { value: "FITNESS", label: "运动健身", description: "活动强度和持续计划", icon: Dumbbell },
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
const answerDetailText = computed(() => ({
  CONCISE: "简洁回答",
  STANDARD: "标准回答",
  DETAILED: "详细回答",
}[form.answerDetailLevel] || "标准回答"));
const exerciseFrequencyText = computed(() => ({
  NONE: "基本不运动",
  LOW: "每周 1-2 次",
  MEDIUM: "每周 3-4 次",
  HIGH: "每周 5 次及以上",
}[form.exerciseFrequency] || "尚未填写"));
const ageText = computed(() => {
  if (!form.birthDate) return "年龄未填写";
  const birth = new Date(`${form.birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return "年龄未知";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday = today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? `${age} 岁` : "年龄未知";
});
const bmiText = computed(() => {
  if (!form.heightCm || !form.weightKg) return "BMI 未填写";
  const height = form.heightCm / 100;
  if (!height) return "BMI 未填写";
  return `BMI ${(form.weightKg / (height * height)).toFixed(1)}`;
});

watch(
  () => auth.user,
  (user) => hydrateForm(user as ExtendedUserProfile | null),
  { immediate: true, deep: true },
);
watch(avatarSrc, () => { avatarLoadFailed.value = false; });

onMounted(async () => {
  try {
    const reports = await tongueApi.reports();
    latestReport.value = [...reports]
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] || null;
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
  --profile-ink: #182820;
  --profile-muted: #79857d;
  --profile-line: rgba(137, 155, 143, 0.22);
  --profile-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
  color: #243129;
}

.profile-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  align-items: center;
  min-height: 265px;
  overflow: hidden;
  padding: 37px 42px;
  border: 1px solid var(--profile-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 28%, rgba(179, 226, 191, 0.31), transparent 29%),
    radial-gradient(circle at 97% 95%, rgba(211, 237, 212, 0.72), transparent 34%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #eef8ef 100%);
  box-shadow: 0 22px 52px rgba(37, 71, 49, 0.07);
  animation: reveal-up 520ms ease-out both;
}

.hero-profile {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 126px minmax(0, 1fr);
  align-items: center;
  gap: 25px;
}

.avatar-stage {
  position: relative;
  width: 126px;
  height: 126px;
}

.avatar-halo {
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.22);
  filter: blur(20px);
}

.hero-avatar,
.form-avatar {
  position: relative;
  z-index: 2;
  display: grid;
  overflow: hidden;
  place-items: center;
  border: 1px solid rgba(63, 139, 87, 0.2);
  border-radius: 35%;
  background: linear-gradient(155deg, #4aa36d, #27764f);
  color: white;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  box-shadow: 0 15px 30px rgba(39, 118, 79, 0.21);
}

.hero-avatar {
  width: 116px;
  height: 116px;
  margin: 5px;
  font-size: 42px;
}

.hero-avatar img,
.form-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-camera {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 4px solid #f7fbf7;
  border-radius: 50%;
  background: #fffefa;
  color: #2d7850;
  box-shadow: 0 8px 18px rgba(42, 105, 69, 0.17);
  cursor: pointer;
}

.avatar-camera:disabled { cursor: wait; opacity: 0.65; }

.page-kicker {
  display: block;
  color: #43805f;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.hero-copy h1 {
  margin: 10px 0 0;
  color: var(--profile-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(37px, 4vw, 52px);
  font-weight: 520;
  line-height: 1.18;
  letter-spacing: -0.05em;
}

.hero-copy p {
  max-width: 650px;
  margin: 14px 0 0;
  color: var(--profile-muted);
  font-size: 12px;
  line-height: 1.75;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.hero-tags span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 29px;
  padding: 0 9px;
  border: 1px solid rgba(70, 120, 87, 0.13);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: #5e7165;
  font-size: 8px;
}

.completion-visual {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr);
  align-items: center;
  gap: 17px;
  padding: 19px;
  border: 1px solid rgba(72, 141, 94, 0.17);
  border-radius: 21px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 13px 28px rgba(42, 86, 55, 0.06);
  backdrop-filter: blur(8px);
}

.completion-ring {
  --completion-angle: 0deg;
  display: grid;
  width: 98px;
  height: 98px;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#348b5a var(--completion-angle), #e3ebe5 0deg);
  box-shadow: 0 10px 20px rgba(49, 127, 82, 0.1);
}

.completion-ring > span {
  display: flex;
  width: 76px;
  height: 76px;
  align-items: baseline;
  justify-content: center;
  place-items: center;
  border-radius: 50%;
  background: #fffefa;
}

.completion-ring strong { color: #2f754d; font-size: 26px; }
.completion-ring small { margin-left: 2px; color: #7f8c84; font-size: 9px; }

.completion-copy > span { color: #7c8880; font-size: 8px; }
.completion-copy > strong { display: block; margin-top: 5px; color: #334a3c; font-size: 12px; }
.completion-copy p { margin: 6px 0 0; color: #7d8981; font-size: 8px; line-height: 1.6; }
.completion-copy button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 31px;
  margin-top: 11px;
  padding: 0 10px;
  border: 1px solid #2d7850;
  border-radius: 10px;
  background: #2d7850;
  color: white;
  cursor: pointer;
  font-size: 8px;
  font-weight: 680;
}

.hero-ambient {
  position: absolute;
  inset: 0 0 0 55%;
  pointer-events: none;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 24%);
  animation: grid-drift 18s linear infinite alternate;
}

.ambient-orbit {
  position: absolute;
  top: 50%;
  left: 57%;
  border: 1px dashed rgba(53, 142, 84, 0.18);
  border-radius: 50%;
}

.orbit-one { width: 310px; height: 130px; animation: orbit-one 9s ease-in-out infinite; }
.orbit-two { width: 245px; height: 180px; animation: orbit-two 11s ease-in-out infinite; }

.ambient-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one { top: 34px; right: 32px; }
.dot-two { right: 210px; bottom: 34px; animation-delay: 1.1s; }

.profile-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 114px;
  padding: 19px 20px;
  overflow: hidden;
  border: 1px solid var(--profile-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 130ms; }
.overview-card:nth-child(4) { animation-delay: 190ms; }

.overview-card::after {
  position: absolute;
  right: -28px;
  bottom: -44px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  content: "";
  opacity: 0.55;
}

.overview-icon {
  position: relative;
  z-index: 2;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
}

.overview-completion .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-completion::after { background: #edf7ef; }
.overview-focus .overview-icon { background: #f8eadf; color: #a96745; }
.overview-focus::after { background: #fbefe6; }
.overview-health .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-health::after { background: #edf4f8; }
.overview-ai .overview-icon { background: #f0ecf7; color: #746097; }
.overview-ai::after { background: #f5f0fa; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 9px; }
.overview-copy strong { margin-top: 5px; color: #21342a; font-size: 24px; font-weight: 700; line-height: 1; }
.overview-copy .overview-text-value { font-size: 17px; }
.overview-copy em { margin-left: 4px; font-size: 8px; font-style: normal; font-weight: 520; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }

.profile-workspace {
  display: grid;
  grid-template-columns: 215px minmax(0, 1fr) 270px;
  align-items: start;
  gap: 15px;
}

.profile-tabs,
.profile-panel,
.side-card,
.privacy-entry {
  border: 1px solid var(--profile-line);
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 14px 34px rgba(35, 66, 47, 0.045);
}

.profile-tabs {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 7px;
  padding: 10px;
  border-radius: 20px;
}

.profile-tabs button {
  display: grid;
  grid-template-columns: 37px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 9px;
  min-height: 65px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: #66746b;
  cursor: pointer;
  text-align: left;
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.profile-tabs button:hover { background: #f6f9f6; transform: translateX(2px); }
.profile-tabs button.active { border-color: rgba(52, 137, 82, 0.18); background: #eaf4ec; color: #2f704d; }

.profile-tabs button > span {
  display: grid;
  width: 37px;
  height: 37px;
  place-items: center;
  border-radius: 11px;
  background: #f0f4f1;
}

.profile-tabs button.active > span { background: white; color: #2f8052; }
.profile-tabs button > div { display: grid; min-width: 0; gap: 3px; }
.profile-tabs strong { font-size: 9px; }
.profile-tabs small { overflow: hidden; color: #929b95; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.profile-tabs button > svg { color: #87928b; }

.profile-panel {
  min-width: 0;
  border-radius: 23px;
  animation: reveal-up 560ms 210ms ease-out both;
}

.tab-content {
  display: grid;
  gap: 16px;
  padding: 25px 26px 10px;
}

.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 162, 151, 0.17);
}

.panel-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.panel-heading p { margin: 7px 0 0; color: #89938d; font-size: 9px; line-height: 1.6; }

.save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 29px;
  padding: 0 9px;
  border-radius: 999px;
  background: #f0f3f1;
  color: #7f8a83;
  font-size: 8px;
  white-space: nowrap;
}

.save-status i { width: 7px; height: 7px; border-radius: 50%; background: #9aa49d; }
.save-status.active { background: #e7f2ea; color: #2f704d; }
.save-status.active i { background: #39915d; }
.save-status.warning { background: #fbefd8; color: #956721; }
.save-status.warning i { background: #d59a3b; }

.form-section {
  display: grid;
  gap: 15px;
  padding: 18px;
  border: 1px solid rgba(145, 162, 151, 0.16);
  border-radius: 17px;
  background: #fafcf9;
}

.section-title,
.side-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title > span,
.side-icon {
  display: grid;
  width: 37px;
  height: 37px;
  place-items: center;
  border-radius: 11px;
  background: #e8f2ea;
  color: #397e55;
}

.section-title > div,
.side-heading > div { display: grid; gap: 3px; }
.section-title strong { color: #354b3e; font-size: 11px; }
.section-title small { color: #8a958e; font-size: 8px; }

.avatar-editor {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 15px;
  padding: 14px;
  border-radius: 14px;
  background: white;
}

.form-avatar {
  width: 72px;
  height: 72px;
  font-size: 25px;
}

.avatar-editor > div:last-child > strong { color: #354b3e; font-size: 11px; }
.avatar-editor p { margin: 5px 0 0; color: #8b958f; font-size: 8px; }
.avatar-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.avatar-actions button {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid rgba(65, 116, 82, 0.18);
  border-radius: 9px;
  background: #f6f9f6;
  color: #4e6a59;
  cursor: pointer;
  font-size: 8px;
}
.avatar-actions .remove-avatar { border-color: rgba(177, 76, 67, 0.14); background: #fff5f3; color: #b34f47; }

.profile-form :deep(.el-form-item) { margin-bottom: 0; }
.profile-form :deep(.el-form-item__label) { color: #52665a; font-size: 9px; font-weight: 650; }
.profile-form :deep(.el-input__wrapper),
.profile-form :deep(.el-select__wrapper),
.profile-form :deep(.el-input-number) {
  width: 100%;
  border-radius: 11px;
  box-shadow: 0 0 0 1px rgba(139, 158, 146, 0.24) inset;
}
.profile-form :deep(.el-input__wrapper.is-focus),
.profile-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #69a17f inset, 0 0 0 3px rgba(62, 143, 91, 0.08); }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px 15px;
}

.field-help { display: block; margin-top: 5px; color: #98a09b; font-size: 7px; }
.gender-segment { width: 100%; }
.gender-segment :deep(.el-radio-button) { flex: 1; }
.gender-segment :deep(.el-radio-button__inner) { width: 100%; }

.readonly-field {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid rgba(139, 158, 146, 0.24);
  border-radius: 11px;
  background: white;
  color: #68766d;
  font-size: 9px;
}

.readonly-field a { color: #2f7c50; font-weight: 680; text-decoration: none; }

.focus-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.focus-options button {
  display: grid;
  grid-template-columns: 39px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  min-height: 67px;
  padding: 10px;
  border: 1px solid rgba(145, 162, 151, 0.2);
  border-radius: 13px;
  background: white;
  color: #596c60;
  cursor: pointer;
  text-align: left;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.focus-options button:hover { border-color: rgba(52, 138, 83, 0.3); transform: translateY(-2px); }
.focus-options button.selected { border-color: rgba(48, 135, 80, 0.34); background: #edf6ef; color: #2e704c; }
.focus-options button > span { display: grid; width: 39px; height: 39px; place-items: center; border-radius: 12px; background: #f0f4f1; }
.focus-options button.selected > span { background: white; color: #2f8052; }
.focus-options button > div { display: grid; min-width: 0; gap: 3px; }
.focus-options strong { font-size: 9px; }
.focus-options small { overflow: hidden; color: #909a94; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }

.textarea-field { position: relative; display: grid; gap: 7px; }
.textarea-field > span { color: #52665a; font-size: 9px; font-weight: 650; }
.textarea-field textarea {
  min-height: 105px;
  padding: 12px 13px 27px;
  border: 1px solid rgba(139, 158, 146, 0.24);
  border-radius: 12px;
  outline: 0;
  resize: vertical;
  background: white;
  color: #34483c;
  font: inherit;
  font-size: 9px;
  line-height: 1.65;
}
.textarea-field textarea:focus { border-color: #69a17f; box-shadow: 0 0 0 3px rgba(62, 143, 91, 0.08); }
.textarea-field > small { position: absolute; right: 10px; bottom: 9px; color: #9aa39d; font-size: 7px; }

.health-summary-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid rgba(74, 145, 96, 0.18);
  border-radius: 15px;
  background: linear-gradient(120deg, #edf6ef, #f9fcf8);
}
.health-summary-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 15px; background: #dceee2; color: #2c8554; }
.health-summary-card > div > strong { display: block; margin-top: 5px; color: #315642; font-size: 12px; }
.health-summary-card p { margin: 5px 0 0; color: #77847c; font-size: 8px; line-height: 1.55; }
.health-summary-card > small { color: #8d9891; font-size: 7px; }

.detail-level-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 17px;
  border: 1px solid rgba(145, 162, 151, 0.17);
  border-radius: 16px;
  background: #fafcf9;
}
.detail-level-card > div { display: flex; align-items: center; gap: 11px; }
.detail-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #e9f2eb; color: #3a8056; }
.detail-level-card strong { color: #344a3d; font-size: 10px; }
.detail-level-card p { margin: 4px 0 0; color: #89938d; font-size: 8px; }
.detail-level :deep(.el-radio-button__inner) { font-size: 9px; }

.setting-list {
  display: grid;
  gap: 9px;
}
.setting-list label {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  min-height: 70px;
  padding: 12px;
  border: 1px solid rgba(145, 162, 151, 0.17);
  border-radius: 14px;
  background: #fafcf9;
}
.setting-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #e9f2eb; color: #3a8056; }
.setting-list label > span:nth-child(2) { display: grid; gap: 4px; }
.setting-list strong { color: #344a3d; font-size: 10px; }
.setting-list small { color: #89938d; font-size: 8px; }

.reminder-section { display: grid; gap: 14px; padding-top: 3px; }
.reminder-settings { display: grid; gap: 9px; }
.reminder-settings section {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto 118px;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border: 1px solid rgba(145, 162, 151, 0.17);
  border-radius: 14px;
  background: #fafcf9;
}
.reminder-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #f5eadc; color: #9e6d37; }
.reminder-settings strong { color: #344a3d; font-size: 10px; }
.reminder-settings p { margin: 4px 0 0; color: #89938d; font-size: 8px; }

.privacy-grid { display: grid; gap: 10px; }
.privacy-action-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
  min-height: 82px;
  padding: 14px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 15px;
  background: #fafcf9;
  color: inherit;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: border-color 180ms ease, transform 180ms ease;
}
.privacy-action-card:hover { border-color: rgba(52, 138, 83, 0.3); transform: translateX(3px); }
.privacy-action-card > span { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 15px; background: #e7f2ea; color: #317a51; }
.privacy-action-card > div { display: grid; gap: 5px; }
.privacy-action-card strong { color: #344a3d; font-size: 10px; }
.privacy-action-card p { margin: 0; color: #89938d; font-size: 8px; line-height: 1.5; }
.privacy-action-card > svg { color: #7a8880; }
.privacy-action-card.danger { border-color: rgba(177, 76, 67, 0.15); }
.privacy-action-card.danger > span { background: #fae9e6; color: #b34f47; }

.privacy-note { display: grid; grid-template-columns: 43px minmax(0, 1fr); align-items: center; gap: 12px; padding: 15px; border-radius: 14px; background: #edf6ef; }
.privacy-note > span { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; background: white; color: #317a51; }
.privacy-note strong { color: #34513f; font-size: 10px; }
.privacy-note p { margin: 5px 0 0; color: #748179; font-size: 8px; line-height: 1.55; }

.profile-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 26px;
  border-top: 1px solid rgba(145, 162, 151, 0.17);
  background: #fafcf9;
  border-radius: 0 0 23px 23px;
}
.action-tip { display: flex; align-items: center; gap: 7px; color: #7d8981; font-size: 8px; }
.action-tip svg { color: #3d7f58; }
.profile-actions > div:last-child { display: flex; gap: 8px; }
.cancel-button,
.save-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 9px;
  font-weight: 680;
}
.cancel-button { border: 1px solid rgba(70, 98, 82, 0.17); background: white; color: #596a60; }
.save-button { border: 1px solid #286f49; background: linear-gradient(150deg, #398d5e, #246b46); color: white; box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16); }
.cancel-button:disabled,
.save-button:disabled { cursor: not-allowed; opacity: 0.5; box-shadow: none; }

.profile-side {
  display: grid;
  gap: 13px;
}
.side-card,
.privacy-entry { padding: 17px; border-radius: 18px; }
.side-card-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.side-card-title h3,
.side-heading h3 { margin: 5px 0 0; color: #33483c; font-size: 13px; }
.side-card-title > span { min-height: 25px; padding: 0 8px; border-radius: 999px; background: #e7f2ea; color: #317451; font-size: 7px; line-height: 25px; }

.benefit-card ul { display: grid; gap: 12px; margin: 17px 0 0; padding: 0; list-style: none; }
.benefit-card li { display: grid; grid-template-columns: 37px minmax(0, 1fr); align-items: center; gap: 10px; }
.benefit-card li > span { display: grid; width: 37px; height: 37px; place-items: center; border-radius: 11px; background: #edf4ef; color: #397e55; }
.benefit-card li strong { color: #405448; font-size: 9px; }
.benefit-card li p { margin: 4px 0 0; color: #89938d; font-size: 7px; line-height: 1.5; }

.report-preview { display: grid; grid-template-columns: 43px minmax(0, 1fr); align-items: start; gap: 10px; margin-top: 15px; }
.report-icon { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; background: #e7f2ea; color: #317a51; }
.report-preview > div { display: grid; gap: 4px; min-width: 0; }
.report-preview strong { color: #3c5144; font-size: 9px; }
.report-preview time { color: #8b958f; font-size: 7px; }
.report-preview p { display: -webkit-box; margin: 2px 0 0; overflow: hidden; color: #7d8981; font-size: 7px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.outline-button { display: flex; width: 100%; min-height: 35px; align-items: center; justify-content: space-between; margin-top: 14px; padding: 0 10px; border: 1px solid rgba(65, 116, 82, 0.18); border-radius: 10px; background: #f7faf7; color: #3d6e50; cursor: pointer; font-size: 8px; font-weight: 680; }

.empty-side-state { display: grid; grid-template-columns: 43px minmax(0, 1fr); align-items: center; gap: 10px; margin-top: 15px; padding: 12px; border-radius: 13px; background: #f7f9f7; }
.empty-side-state > span { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; background: #e9f2eb; color: #3c8057; }
.empty-side-state strong { color: #405448; font-size: 9px; }
.empty-side-state p { margin: 4px 0 0; color: #89938d; font-size: 7px; line-height: 1.5; }

.reminder-row { display: grid; grid-template-columns: 36px minmax(0, 1fr); align-items: center; gap: 9px; margin-top: 11px; padding: 10px; border-radius: 12px; background: #f8faf8; }
.reminder-row > span { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 11px; background: #f5eadc; color: #9e6d37; }
.reminder-row strong { color: #405448; font-size: 8px; }
.reminder-row small { display: block; margin-top: 3px; color: #89938d; font-size: 7px; }
.reminder-card > button { width: 100%; min-height: 34px; margin-top: 12px; border: 1px solid rgba(65, 116, 82, 0.18); border-radius: 10px; background: #f7faf7; color: #3d6e50; cursor: pointer; font-size: 8px; font-weight: 680; }

.privacy-entry { display: grid; grid-template-columns: 41px minmax(0, 1fr) 18px; align-items: center; gap: 10px; color: inherit; text-decoration: none; }
.privacy-icon { display: grid; width: 41px; height: 41px; place-items: center; border-radius: 13px; background: #e7f2ea; color: #317a51; }
.privacy-entry strong { color: #3c5144; font-size: 9px; }
.privacy-entry p { margin: 4px 0 0; color: #89938d; font-size: 7px; }
.privacy-entry > svg { color: #7b8880; }

.hidden-file-input { display: none; }
.profile-note { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; color: #849088; font-size: 9px; text-align: center; }

button:focus-visible,
a:focus-visible,
textarea:focus-visible { outline: 3px solid rgba(54, 150, 96, 0.2); outline-offset: 2px; }
.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}
@keyframes orbit-one {
  0%, 100% { transform: translate(-50%, -50%) rotate(11deg); }
  50% { transform: translate(-50%, -54%) rotate(16deg); }
}
@keyframes orbit-two {
  0%, 100% { transform: translate(-50%, -50%) rotate(-18deg); }
  50% { transform: translate(-50%, -46%) rotate(-23deg); }
}
@keyframes dot-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1160px) {
  .profile-hero { grid-template-columns: minmax(0, 1fr) 310px; padding-inline: 34px; }
  .profile-workspace { grid-template-columns: 200px minmax(0, 1fr); }
  .profile-side { grid-column: 1 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .privacy-entry { align-self: stretch; }
}

@media (max-width: 960px) {
  .profile-hero { grid-template-columns: 1fr; }
  .completion-visual { margin-top: 21px; max-width: 430px; }
  .hero-ambient { opacity: 0.4; }
  .profile-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .profile-workspace { grid-template-columns: 1fr; }
  .profile-tabs { position: static; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .profile-tabs button { grid-template-columns: 34px minmax(0, 1fr); }
  .profile-tabs button > svg { display: none; }
  .profile-side { grid-column: auto; }
}

@media (max-width: 760px) {
  .profile-page { gap: 14px; }
  .profile-hero { padding: 27px 22px; border-radius: 22px; }
  .hero-profile { grid-template-columns: 92px minmax(0, 1fr); gap: 17px; }
  .avatar-stage { width: 92px; height: 92px; }
  .hero-avatar { width: 84px; height: 84px; font-size: 31px; }
  .avatar-camera { width: 35px; height: 35px; }
  .hero-copy h1 { font-size: clamp(32px, 9vw, 43px); }
  .completion-visual { grid-template-columns: 84px minmax(0, 1fr); }
  .completion-ring { width: 82px; height: 82px; }
  .completion-ring > span { width: 64px; height: 64px; }
  .completion-ring strong { font-size: 21px; }
  .profile-overview { grid-template-columns: 1fr; }
  .profile-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .profile-panel { border-radius: 20px; }
  .tab-content { padding: 21px 19px 8px; }
  .panel-heading { align-items: flex-start; flex-direction: column; }
  .form-grid,
  .focus-options { grid-template-columns: 1fr; }
  .detail-level-card { align-items: flex-start; flex-direction: column; }
  .reminder-settings section { grid-template-columns: 42px minmax(0, 1fr) auto; }
  .reminder-settings :deep(.el-select) { grid-column: 2 / -1; width: 100%; }
  .profile-actions { align-items: flex-start; flex-direction: column; padding: 16px 19px; }
  .profile-actions > div:last-child { width: 100%; }
  .cancel-button,
  .save-button { flex: 1; }
  .profile-side { grid-template-columns: 1fr; }
}

@media (max-width: 520px) {
  .profile-hero { padding: 24px 18px; }
  .hero-profile { grid-template-columns: 1fr; }
  .avatar-stage { margin: 0 auto; }
  .hero-copy { text-align: center; }
  .hero-tags { justify-content: center; }
  .completion-visual { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .profile-tabs { grid-template-columns: 1fr; }
  .profile-tabs button { grid-template-columns: 36px minmax(0, 1fr) 16px; }
  .profile-tabs button > svg { display: block; }
  .avatar-editor { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .avatar-actions { justify-content: center; }
  .health-summary-card { grid-template-columns: 43px minmax(0, 1fr); }
  .health-summary-card > small { grid-column: 2; }
  .detail-level { width: 100%; }
  .detail-level :deep(.el-radio-button) { flex: 1; }
  .detail-level :deep(.el-radio-button__inner) { width: 100%; }
  .reminder-settings section { grid-template-columns: 40px minmax(0, 1fr); }
  .reminder-settings section > .el-switch { grid-column: 1; }
  .reminder-settings section > .el-select { grid-column: 2; }
  .action-tip { align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .profile-hero,
  .overview-card,
  .profile-panel,
  .ambient-grid,
  .ambient-orbit,
  .ambient-dot,
  .spinning { animation: none; }
  .profile-tabs button,
  .focus-options button,
  .privacy-action-card { transition: none; }
  .profile-tabs button:hover,
  .focus-options button:hover,
  .privacy-action-card:hover { transform: none; }
}
</style>
