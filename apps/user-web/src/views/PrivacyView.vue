<template>
  <section class="privacy-page">
    <header class="privacy-hero">
      <div class="hero-copy">
        <span class="page-kicker">PRIVACY CENTER</span>
        <h1>您的健康数据，<span>由您决定</span></h1>
        <p>查看数据规模、调整本地偏好，并安全管理报告与账号隐私操作。</p>

        <div class="hero-trust">
          <span><LockKeyhole :size="14" /> 权限隔离</span>
          <span><ShieldCheck :size="14" /> 敏感操作二次确认</span>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="visual-leaf leaf-one" />
        <span class="visual-leaf leaf-two" />

        <div class="shield-stage">
          <span class="shield-glow" />
          <div class="shield-card">
            <ShieldCheck :size="62" :stroke-width="1.7" />
          </div>
          <span class="stage-ring ring-one" />
          <span class="stage-ring ring-two" />
        </div>
      </div>
    </header>

    <section class="data-overview" aria-label="隐私数据概览">
      <button class="overview-card overview-card-green" type="button" @click="router.push('/reports')">
        <span class="overview-icon"><FileText :size="21" /></span>
        <span class="overview-content">
          <small>健康报告</small>
          <strong>{{ reportCount }}</strong>
          <span>当前账号下可见报告</span>
        </span>
        <ChevronRight class="overview-arrow" :size="19" />
      </button>

      <button class="overview-card overview-card-blue" type="button" @click="scrollToPreferences">
        <span class="overview-icon"><MessagesSquare :size="21" /></span>
        <span class="overview-content">
          <small>聊天记录</small>
          <strong>{{ chatCount }}</strong>
          <span>保存在当前浏览器</span>
        </span>
        <ChevronRight class="overview-arrow" :size="19" />
      </button>

      <article class="overview-card overview-card-warm">
        <span class="overview-icon"><Database :size="21" /></span>
        <span class="overview-content">
          <small>数据状态</small>
          <strong class="protected-status">已保护</strong>
          <span>登录鉴权与多层权限隔离</span>
        </span>
        <ShieldCheck class="overview-arrow status-arrow" :size="19" />
      </article>
    </section>

    <div class="privacy-grid">
      <section ref="settingsPanel" class="panel settings-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA PREFERENCES</span>
            <h2>数据偏好</h2>
            <p>决定助手如何在当前设备保存和使用本地数据。</p>
          </div>
          <span class="panel-badge">本地设置</span>
        </div>

        <div class="settings-list">
          <article class="setting-row">
            <span class="setting-icon"><BrainCircuit :size="20" /></span>
            <div class="setting-copy">
              <strong>个性化回答偏好</strong>
              <p>允许助手在当前浏览器中保留回答展示偏好。</p>
            </div>
            <el-switch
              v-model="preferences.personalized"
              aria-label="个性化回答偏好"
              @change="savePreferences"
            />
          </article>

          <article class="setting-row">
            <span class="setting-icon"><History :size="20" /></span>
            <div class="setting-copy">
              <strong>保存聊天记录</strong>
              <p>保存本机聊天会话，便于刷新页面后继续交流。</p>
            </div>
            <el-switch
              v-model="preferences.chatHistory"
              aria-label="保存聊天记录"
              @change="savePreferences"
            />
          </article>

          <button class="setting-row setting-action" type="button" @click="router.push('/reports')">
            <span class="setting-icon"><FolderHeart :size="20" /></span>
            <span class="setting-copy">
              <strong>管理健康报告</strong>
              <span>查看、删除或进入任意一份舌象报告。</span>
            </span>
            <span class="row-meta">
              {{ reportCount }} 份
              <ChevronRight :size="17" />
            </span>
          </button>

          <button class="setting-row setting-action" type="button" @click="clearLocalChat">
            <span class="setting-icon"><MessageCircleOff :size="20" /></span>
            <span class="setting-copy">
              <strong>清理本地聊天记录</strong>
              <span>仅删除当前浏览器中保存的聊天会话。</span>
            </span>
            <span class="row-meta row-meta-accent">
              立即清理
              <ChevronRight :size="17" />
            </span>
          </button>
        </div>
      </section>

      <section class="panel operations-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA OPERATIONS</span>
            <h2>数据操作</h2>
            <p>导出副本或执行不可逆的账号数据操作。</p>
          </div>
        </div>

        <div class="operation-list">
          <button class="operation-card operation-export" type="button" @click="exportData">
            <span class="operation-icon"><Download :size="21" /></span>
            <span class="operation-copy">
              <strong>导出我的数据</strong>
              <span>下载个人资料与报告索引的 JSON 副本。</span>
            </span>
            <ChevronRight :size="18" />
          </button>

          <button class="operation-card operation-delete" type="button" @click="deleteReports">
            <span class="operation-icon"><Trash2 :size="21" /></span>
            <span class="operation-copy">
              <strong>删除全部报告</strong>
              <span>软删除当前账号下可见的全部舌象报告。</span>
            </span>
            <ChevronRight :size="18" />
          </button>

          <button class="operation-card operation-account" type="button" @click="deleteAccount">
            <span class="operation-icon"><UserRoundX :size="21" /></span>
            <span class="operation-copy">
              <strong>注销账号</strong>
              <span>提交账号删除请求并清理本地登录状态。</span>
            </span>
            <ChevronRight :size="18" />
          </button>
        </div>

        <div class="operation-hint">
          <LockKeyhole :size="15" />
          <span>危险操作会在执行前再次向您确认。</span>
        </div>
      </section>
    </div>

    <footer class="privacy-note">
      <LockKeyhole :size="15" />
      <span>我们致力于保护您的隐私与数据安全，敏感操作均受到身份鉴权与权限校验。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  BrainCircuit,
  ChevronRight,
  Database,
  Download,
  FileText,
  FolderHeart,
  History,
  LockKeyhole,
  MessageCircleOff,
  MessagesSquare,
  ShieldCheck,
  Trash2,
  UserRoundX,
} from "lucide-vue-next";
import { privacyApi, tongueApi, useAuthStore, type ReportListItem } from "@tongue/shared";

const PREFERENCE_KEY = "tongue_privacy_preferences";
const CHAT_SESSION_PREFIX = "tongue_user_chat_session";
const router = useRouter();
const auth = useAuthStore();
const settingsPanel = ref<HTMLElement | null>(null);
const reports = ref<ReportListItem[]>([]);
const reportCount = ref(0);
const chatCount = ref(0);
const preferences = reactive({ personalized: true, chatHistory: true });

onMounted(async () => {
  restorePreferences();
  chatCount.value = countLocalChatMessages();

  try {
    reports.value = await tongueApi.reports();
    reportCount.value = reports.value.length;
  } catch (error) {
    console.error("load privacy overview failed", error);
  }
});

function restorePreferences() {
  const raw = localStorage.getItem(PREFERENCE_KEY);
  if (!raw) return;

  try {
    const value = JSON.parse(raw) as Partial<typeof preferences>;
    preferences.personalized = value.personalized ?? true;
    preferences.chatHistory = value.chatHistory ?? true;
  } catch {
    localStorage.removeItem(PREFERENCE_KEY);
  }
}

function savePreferences() {
  localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences));
  ElMessage.success("偏好已保存到当前浏览器");
}

function matchingChatKeys() {
  return Object.keys(localStorage).filter((key) => key.startsWith(CHAT_SESSION_PREFIX));
}

function countLocalChatMessages() {
  return matchingChatKeys().reduce((total, key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}") as { messages?: unknown[] };
      return total + (Array.isArray(value.messages) ? value.messages.length : 0);
    } catch {
      return total;
    }
  }, 0);
}

function scrollToPreferences() {
  settingsPanel.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function clearLocalChat() {
  await ElMessageBox.confirm(
    "确认清理当前浏览器保存的聊天记录吗？该操作不会删除服务器报告。",
    "清理本地聊天",
    { type: "warning" },
  );
  matchingChatKeys().forEach((key) => localStorage.removeItem(key));
  chatCount.value = 0;
  ElMessage.success("本地聊天记录已清理");
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    user: auth.user,
    reports: reports.value,
    localPreferences: { ...preferences },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tongue-health-data-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  ElMessage.success("数据副本已导出");
}

async function deleteReports() {
  await ElMessageBox.confirm(
    "确认删除当前账号下的全部报告吗？删除后用户端将不可见。",
    "删除全部报告",
    { type: "warning" },
  );
  await privacyApi.deleteReports();
  reports.value = [];
  reportCount.value = 0;
  ElMessage.success("报告删除请求已处理");
}

async function deleteAccount() {
  await ElMessageBox.confirm(
    "确认注销当前账号吗？该操作将清理登录状态。",
    "注销账号",
    { type: "error" },
  );
  await privacyApi.deleteAccount();
  await auth.logout();
  ElMessage.success("账号删除请求已处理");
  await router.replace("/login");
}
</script>

<style scoped>
.privacy-page {
  --privacy-ink: #182820;
  --privacy-muted: #748078;
  --privacy-line: rgba(116, 139, 123, 0.18);
  --privacy-green: #238455;
  --privacy-green-dark: #17653f;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 10px;
}

.privacy-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 38%);
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 38px 44px;
  border: 1px solid var(--privacy-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 78% 30%, rgba(181, 225, 194, 0.28), transparent 26%),
    radial-gradient(circle at 94% 82%, rgba(211, 236, 208, 0.8), transparent 31%),
    linear-gradient(132deg, #fffefa 0%, #f8fbf7 58%, #edf6ec 100%);
  box-shadow:
    0 24px 60px rgba(37, 76, 53, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.privacy-hero::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(54, 118, 79, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(54, 118, 79, 0.025) 1px, transparent 1px);
  background-size: 38px 38px;
  content: "";
  mask-image: linear-gradient(90deg, transparent 42%, black);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 2;
}

.page-kicker {
  display: block;
  color: #3d7a59;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.privacy-hero h1 {
  max-width: 720px;
  margin: 13px 0 0;
  color: var(--privacy-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(40px, 5.2vw, 68px);
  font-weight: 520;
  line-height: 1.12;
  letter-spacing: -0.055em;
}

.privacy-hero h1 span {
  color: var(--privacy-green);
}

.privacy-hero p {
  margin: 18px 0 0;
  color: var(--privacy-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 24px;
}

.hero-trust span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border: 1px solid rgba(54, 118, 79, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  color: #517060;
  font-size: 10px;
  backdrop-filter: blur(8px);
}

.hero-visual {
  position: relative;
  display: grid;
  min-height: 190px;
  place-items: center;
}

.shield-stage {
  position: relative;
  display: grid;
  width: 230px;
  height: 170px;
  place-items: center;
  transform: translateY(4px);
}

.shield-card {
  position: relative;
  z-index: 4;
  display: grid;
  width: 116px;
  height: 136px;
  place-items: center;
  border: 1px solid rgba(39, 132, 84, 0.2);
  border-radius: 50px 50px 42px 42px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(214, 242, 220, 0.84));
  color: #238455;
  filter: drop-shadow(0 20px 22px rgba(35, 132, 85, 0.18));
  transform: perspective(500px) rotateY(-8deg);
}

.shield-card::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(35, 132, 85, 0.15);
  border-radius: 42px 42px 35px 35px;
  content: "";
}

.shield-glow {
  position: absolute;
  z-index: 1;
  width: 145px;
  height: 145px;
  border-radius: 50%;
  background: rgba(82, 183, 114, 0.18);
  filter: blur(30px);
}

.stage-ring {
  position: absolute;
  z-index: 2;
  border: 1px solid rgba(46, 135, 82, 0.2);
  border-radius: 50%;
}

.ring-one {
  bottom: 8px;
  width: 210px;
  height: 46px;
  background: rgba(255, 255, 255, 0.35);
}

.ring-two {
  bottom: 18px;
  width: 158px;
  height: 30px;
  border-color: rgba(46, 135, 82, 0.28);
}

.visual-orbit {
  position: absolute;
  border: 1px dashed rgba(46, 135, 82, 0.2);
  border-radius: 50%;
}

.orbit-one {
  width: 286px;
  height: 132px;
  transform: rotate(11deg);
}

.orbit-two {
  width: 244px;
  height: 178px;
  transform: rotate(-18deg);
}

.visual-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8fcba2;
  box-shadow: 0 0 0 7px rgba(143, 203, 162, 0.14);
}

.dot-one {
  top: 18px;
  left: 30px;
}

.dot-two {
  right: 16px;
  bottom: 36px;
}

.visual-leaf {
  position: absolute;
  width: 34px;
  height: 54px;
  border-radius: 80% 0 80% 0;
  background: linear-gradient(135deg, rgba(88, 164, 107, 0.14), rgba(88, 164, 107, 0.02));
}

.leaf-one {
  right: 16px;
  top: 40px;
  transform: rotate(28deg);
}

.leaf-two {
  left: 20px;
  bottom: 26px;
  transform: rotate(-58deg) scale(0.8);
}

.data-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  min-height: 124px;
  padding: 20px 22px;
  border: 1px solid var(--privacy-line);
  border-radius: 20px;
  background: rgba(255, 255, 252, 0.92);
  color: var(--privacy-ink);
  box-shadow: 0 12px 34px rgba(35, 70, 49, 0.045);
  text-align: left;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

button.overview-card {
  width: 100%;
  cursor: pointer;
}

button.overview-card:hover {
  border-color: rgba(48, 126, 78, 0.3);
  box-shadow: 0 16px 38px rgba(35, 70, 49, 0.08);
  transform: translateY(-2px);
}

button.overview-card:focus-visible,
.setting-action:focus-visible,
.operation-card:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.22);
  outline-offset: 2px;
}

.overview-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
}

.overview-card-green .overview-icon {
  background: #e8f3eb;
  color: #2f8555;
}

.overview-card-blue .overview-icon {
  background: #e8f1f7;
  color: #4c7996;
}

.overview-card-warm .overview-icon {
  background: #fbefdc;
  color: #a26d1b;
}

.overview-content {
  display: grid;
  min-width: 0;
}

.overview-content small {
  color: #7e8a82;
  font-size: 10px;
}

.overview-content strong {
  margin-top: 4px;
  color: #21352a;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.overview-content > span {
  margin-top: 8px;
  overflow: hidden;
  color: #929b95;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-content .protected-status {
  color: #1c7a4b;
  font-size: 25px;
}

.overview-arrow {
  color: #65766c;
  transition: transform 180ms ease;
}

button.overview-card:hover .overview-arrow {
  transform: translateX(3px);
}

.status-arrow {
  color: #2f8555;
}

.privacy-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(330px, 0.82fr);
  gap: 18px;
}

.panel {
  border: 1px solid var(--privacy-line);
  border-radius: 24px;
  background: rgba(255, 255, 252, 0.92);
  box-shadow: 0 18px 46px rgba(35, 70, 49, 0.055);
}

.settings-panel {
  padding: 26px 28px 10px;
  scroll-margin-top: 28px;
}

.operations-panel {
  display: flex;
  flex-direction: column;
  padding: 26px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 17px;
}

.panel-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.panel-heading p {
  margin: 7px 0 0;
  color: #8a958e;
  font-size: 10px;
  line-height: 1.6;
}

.panel-badge {
  flex: none;
  padding: 6px 9px;
  border: 1px solid rgba(56, 124, 81, 0.14);
  border-radius: 999px;
  background: #f2f7f2;
  color: #58806a;
  font-size: 9px;
}

.settings-list {
  border-top: 1px solid #e8ece8;
}

.setting-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  width: 100%;
  min-height: 96px;
  padding: 15px 0;
  border: 0;
  border-bottom: 1px solid #e8ece8;
  background: transparent;
  color: inherit;
  text-align: left;
}

.setting-row:last-child {
  border-bottom: 0;
}

.setting-action {
  cursor: pointer;
  transition: background 180ms ease, padding 180ms ease;
}

.setting-action:hover {
  margin-inline: -12px;
  padding-inline: 12px;
  border-radius: 14px;
  background: #f7faf6;
}

.setting-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 15px;
  background: #eaf3ec;
  color: #2e8052;
}

.setting-copy {
  display: grid;
  min-width: 0;
}

.setting-copy strong {
  color: #30463a;
  font-size: 13px;
  font-weight: 680;
}

.setting-copy p,
.setting-copy > span {
  margin: 6px 0 0;
  color: #818c85;
  font-size: 10px;
  line-height: 1.6;
}

.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #77837b;
  font-size: 10px;
  white-space: nowrap;
}

.row-meta-accent {
  color: #2e8052;
  font-weight: 650;
}

.operation-list {
  display: grid;
  gap: 11px;
}

.operation-card {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 96px;
  padding: 16px;
  border: 1px solid rgba(116, 139, 123, 0.16);
  border-radius: 16px;
  color: #30463a;
  cursor: pointer;
  text-align: left;
  transition: box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.operation-card:hover {
  box-shadow: 0 12px 28px rgba(35, 70, 49, 0.07);
  transform: translateY(-2px);
}

.operation-card > svg {
  transition: transform 180ms ease;
}

.operation-card:hover > svg {
  transform: translateX(3px);
}

.operation-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
}

.operation-copy {
  display: grid;
  min-width: 0;
}

.operation-copy strong {
  font-size: 13px;
  font-weight: 690;
}

.operation-copy span {
  margin-top: 6px;
  color: #818c85;
  font-size: 10px;
  line-height: 1.55;
}

.operation-export {
  background: linear-gradient(135deg, #f7fbf7, #f1f8f3);
  color: #2b6745;
}

.operation-export:hover {
  border-color: rgba(48, 126, 78, 0.28);
}

.operation-export .operation-icon {
  background: #e6f2e9;
  color: #24804e;
}

.operation-delete {
  background: linear-gradient(135deg, #fffbf5, #fff7eb);
  color: #8f611e;
}

.operation-delete:hover {
  border-color: rgba(174, 117, 38, 0.26);
}

.operation-delete .operation-icon {
  background: #faecd3;
  color: #aa700f;
}

.operation-account {
  background: linear-gradient(135deg, #fff8f7, #fff1f0);
  color: #a04440;
}

.operation-account:hover {
  border-color: rgba(176, 76, 70, 0.25);
}

.operation-account .operation-icon {
  background: #f9e2e0;
  color: #b14943;
}

.operation-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  padding: 18px 4px 2px;
  color: #929b95;
  font-size: 9px;
}

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  color: #849088;
  font-size: 10px;
  text-align: center;
}

:deep(.el-switch) {
  --el-switch-on-color: #238455;
  --el-switch-off-color: #c9d1cb;
}

:deep(.el-switch__core) {
  border: 0;
  box-shadow: inset 0 1px 2px rgba(20, 55, 35, 0.12);
}

@media (max-width: 1050px) {
  .privacy-hero {
    grid-template-columns: minmax(0, 1fr) 260px;
    padding-inline: 34px;
  }

  .privacy-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  }
}

@media (max-width: 900px) {
  .privacy-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-visual {
    position: absolute;
    right: -34px;
    bottom: -42px;
    opacity: 0.34;
    pointer-events: none;
    transform: scale(0.82);
  }

  .hero-copy {
    max-width: 82%;
  }

  .privacy-grid {
    grid-template-columns: 1fr;
  }

  .operation-hint {
    margin-top: 2px;
  }
}

@media (max-width: 720px) {
  .privacy-page {
    gap: 14px;
  }

  .privacy-hero {
    padding: 30px 24px;
    border-radius: 22px;
  }

  .privacy-hero h1 {
    font-size: clamp(36px, 11vw, 50px);
  }

  .hero-copy {
    max-width: 100%;
  }

  .hero-visual {
    display: none;
  }

  .hero-trust {
    gap: 7px;
  }

  .data-overview {
    grid-template-columns: 1fr;
  }

  .overview-card {
    min-height: 104px;
  }

  .settings-panel,
  .operations-panel {
    padding: 22px 20px 8px;
    border-radius: 20px;
  }

  .operations-panel {
    padding-bottom: 20px;
  }
}

@media (max-width: 520px) {
  .privacy-hero {
    padding: 26px 20px;
  }

  .privacy-hero p {
    font-size: 13px;
  }

  .hero-trust {
    display: none;
  }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr) auto;
    padding: 17px;
  }

  .overview-icon,
  .setting-icon,
  .operation-icon {
    width: 44px;
    height: 44px;
  }

  .panel-heading {
    padding-bottom: 12px;
  }

  .panel-badge {
    display: none;
  }

  .setting-row {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 12px;
    min-height: 88px;
  }

  .setting-copy p,
  .setting-copy > span,
  .operation-copy span {
    font-size: 9px;
  }

  .row-meta {
    max-width: 70px;
  }

  .operation-card {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .overview-card,
  .overview-arrow,
  .setting-action,
  .operation-card,
  .operation-card > svg {
    transition: none;
  }

  .setting-action:hover,
  .operation-card:hover,
  button.overview-card:hover {
    transform: none;
  }
}
</style>
