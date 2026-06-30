<template>
  <section class="privacy-page">
    <header class="privacy-hero">
      <div class="hero-copy">
        <span class="page-kicker">PRIVACY CENTER</span>
        <h1>您的健康数据，<span>由您决定</span></h1>
        <p>查看数据规模、调整本地偏好，并管理报告与账号隐私操作。</p>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="visual-leaf leaf-one" />
        <span class="visual-leaf leaf-two" />

        <div class="shield-stage">
          <span class="shield-halo" />
          <span class="stage-ring ring-back" />
          <span class="stage-ring ring-front" />
          <div class="shield-shell">
            <div class="shield-core">
              <ShieldCheck :size="66" :stroke-width="1.7" />
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="data-overview" aria-label="隐私数据概览">
      <button class="overview-card overview-green" type="button" @click="router.push('/reports')">
        <span class="overview-icon"><FileText :size="21" /></span>
        <span class="overview-copy">
          <small>健康报告</small>
          <strong>{{ reportCount }}</strong>
          <span>当前账号下可见报告</span>
        </span>
        <ChevronRight class="overview-arrow" :size="18" />
      </button>

      <button class="overview-card overview-blue" type="button" @click="scrollToPreferences">
        <span class="overview-icon"><MessagesSquare :size="21" /></span>
        <span class="overview-copy">
          <small>聊天记录</small>
          <strong>{{ chatCount }}</strong>
          <span>保存在当前浏览器</span>
        </span>
        <ChevronRight class="overview-arrow" :size="18" />
      </button>

      <article class="overview-card overview-gold">
        <span class="overview-icon"><Database :size="21" /></span>
        <span class="overview-copy">
          <small>数据状态</small>
          <strong class="protected-status">已保护</strong>
          <span>登录享受多层权限隔离</span>
        </span>
        <ShieldCheck class="overview-arrow status-arrow" :size="18" />
      </article>
    </section>

    <div class="privacy-grid">
      <section ref="settingsPanel" class="panel settings-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA PREFERENCES</span>
            <h2>数据偏好</h2>
          </div>
        </div>

        <div class="settings-list">
          <article class="setting-row">
            <span class="setting-icon"><BrainCircuit :size="19" /></span>
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
            <span class="setting-icon"><History :size="19" /></span>
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
            <span class="setting-icon"><FolderHeart :size="19" /></span>
            <span class="setting-copy">
              <strong>管理健康报告</strong>
              <span>查看、删除或进入任意一份健康报告。</span>
            </span>
            <span class="row-meta">{{ reportCount }} 份 <ChevronRight :size="16" /></span>
          </button>

          <button class="setting-row setting-action" type="button" @click="clearLocalChat">
            <span class="setting-icon"><MessageCircleOff :size="19" /></span>
            <span class="setting-copy">
              <strong>清理本地聊天记录</strong>
              <span>仅删除当前浏览器中保存的聊天会话。</span>
            </span>
            <span class="row-meta row-meta-accent">立即清理 <ChevronRight :size="16" /></span>
          </button>
        </div>
      </section>

      <section class="panel operations-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA OPERATIONS</span>
            <h2>数据操作</h2>
          </div>
        </div>

        <div class="operation-list">
          <button class="operation-card operation-export" type="button" @click="exportData">
            <span class="operation-icon"><Download :size="20" /></span>
            <span class="operation-copy">
              <strong>导出我的数据</strong>
              <span>下载个人资料与报告索引的 JSON 副本。</span>
            </span>
            <ChevronRight :size="17" />
          </button>

          <button class="operation-card operation-delete" type="button" @click="deleteReports">
            <span class="operation-icon"><Trash2 :size="20" /></span>
            <span class="operation-copy">
              <strong>删除全部报告</strong>
              <span>软删除当前账号下可见的全部舌象报告。</span>
            </span>
            <ChevronRight :size="17" />
          </button>

          <button class="operation-card operation-account" type="button" @click="deleteAccount">
            <span class="operation-icon"><UserRoundX :size="20" /></span>
            <span class="operation-copy">
              <strong>注销账号</strong>
              <span>提交账号删除请求并清理本地登录状态。</span>
            </span>
            <ChevronRight :size="17" />
          </button>
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
  --ink: #182820;
  --muted: #78847c;
  --line: rgba(143, 160, 149, 0.22);
  --green: #258956;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.privacy-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 242px;
  overflow: hidden;
  padding: 38px 44px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 86% 34%, rgba(176, 224, 188, 0.3), transparent 29%),
    radial-gradient(circle at 96% 95%, rgba(206, 234, 207, 0.7), transparent 34%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #eff8ef 100%);
  box-shadow: 0 22px 52px rgba(37, 71, 49, 0.07);
  animation: reveal-up 520ms ease-out both;
}

.hero-copy {
  position: relative;
  z-index: 3;
  min-width: 0;
}

.page-kicker {
  display: block;
  color: #43805f;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.privacy-hero h1 {
  margin: 13px 0 0;
  color: var(--ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(42px, 4.45vw, 60px);
  font-weight: 520;
  line-height: 1.15;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.privacy-hero h1 span {
  color: var(--green);
}

.privacy-hero p {
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-visual {
  position: relative;
  min-height: 190px;
}

.visual-grid {
  position: absolute;
  inset: -48px -54px -48px 3%;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 24%);
  animation: grid-drift 18s linear infinite alternate;
}

.visual-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(53, 142, 84, 0.2);
  border-radius: 50%;
  transform-origin: center;
}

.orbit-one {
  width: 306px;
  height: 132px;
  animation: orbit-one 9s ease-in-out infinite;
}

.orbit-two {
  width: 252px;
  height: 174px;
  animation: orbit-two 11s ease-in-out infinite;
}

.visual-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one {
  top: 23px;
  left: 23px;
}

.dot-two {
  right: 18px;
  bottom: 31px;
  animation-delay: 1.1s;
}

.visual-leaf {
  position: absolute;
  width: 38px;
  height: 58px;
  border-radius: 80% 0 80% 0;
  background: linear-gradient(135deg, rgba(88, 166, 108, 0.17), rgba(88, 166, 108, 0.025));
  animation: leaf-drift 7s ease-in-out infinite;
}

.leaf-one {
  right: 14px;
  top: 35px;
  transform: rotate(28deg);
}

.leaf-two {
  left: 12px;
  bottom: 28px;
  transform: rotate(-55deg) scale(0.82);
  animation-delay: 1.2s;
}

.shield-stage {
  position: absolute;
  top: 8px;
  right: 10%;
  width: 270px;
  height: 190px;
  animation: shield-float 5.6s ease-in-out infinite;
}

.shield-halo {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 154px;
  height: 154px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.18);
  filter: blur(30px);
  transform: translateX(-50%);
}

.stage-ring {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  transform: translateX(-50%);
}

.ring-back {
  bottom: 5px;
  width: 252px;
  height: 69px;
  border: 1px solid rgba(68, 155, 94, 0.22);
  background: linear-gradient(180deg, rgba(250, 253, 250, 0.86), rgba(225, 242, 227, 0.9));
  box-shadow: inset 0 10px 20px rgba(87, 166, 106, 0.1);
}

.ring-front {
  bottom: 18px;
  width: 205px;
  height: 39px;
  border: 1px solid rgba(68, 155, 94, 0.17);
  background: rgba(255, 255, 255, 0.68);
}

.shield-shell {
  position: absolute;
  top: 2px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 144px;
  height: 165px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 54px 54px 39px 39px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.shield-shell::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.shield-shell::after {
  position: absolute;
  top: -45%;
  left: -75%;
  width: 48%;
  height: 195%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  content: "";
  transform: rotate(18deg);
  animation: shield-shine 4.8s ease-in-out infinite;
}

.shield-core {
  position: relative;
  z-index: 2;
  display: grid;
  width: 86px;
  height: 86px;
  place-items: center;
  border-radius: 29px;
  background: linear-gradient(155deg, #50b976, #228653);
  color: white;
  box-shadow:
    0 14px 22px rgba(38, 135, 74, 0.25),
    inset 10px 10px 15px rgba(255, 255, 255, 0.15),
    inset -12px -13px 18px rgba(17, 97, 52, 0.28);
}

.data-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  min-height: 118px;
  padding: 20px 22px;
  border: 1px solid var(--line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  color: var(--ink);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  text-align: left;
  animation: reveal-up 520ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 140ms; }

button.overview-card {
  width: 100%;
  cursor: pointer;
}

button.overview-card:hover {
  border-color: rgba(52, 137, 84, 0.3);
  box-shadow: 0 16px 35px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.overview-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 17px;
}

.overview-green .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-blue .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-gold .overview-icon { background: #fbefd8; color: #ad7412; }

.overview-copy {
  display: grid;
  min-width: 0;
}

.overview-copy small {
  color: #858f89;
  font-size: 10px;
}

.overview-copy strong {
  margin-top: 4px;
  color: #21342a;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.overview-copy > span {
  margin-top: 8px;
  overflow: hidden;
  color: #949d97;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-copy .protected-status {
  color: #21824e;
  font-size: 25px;
}

.overview-arrow {
  color: #6c7b72;
  transition: transform 180ms ease;
}

button.overview-card:hover .overview-arrow {
  transform: translateX(3px);
}

.status-arrow { color: #2d8b57; }

.privacy-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(330px, 0.88fr);
  gap: 17px;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 23px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
  animation: reveal-up 560ms 170ms ease-out both;
}

.settings-panel {
  padding: 25px 27px 9px;
  scroll-margin-top: 28px;
}

.operations-panel {
  padding: 25px;
}

.panel-heading {
  padding-bottom: 16px;
}

.panel-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.settings-list {
  border-top: 1px solid #e7ebe7;
}

.setting-row {
  display: grid;
  grid-template-columns: 45px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 94px;
  padding: 15px 0;
  border: 0;
  border-bottom: 1px solid #e7ebe7;
  background: transparent;
  color: inherit;
  text-align: left;
}

.setting-row:last-child { border-bottom: 0; }

.setting-action {
  cursor: pointer;
  transition: background 180ms ease, padding 180ms ease, margin 180ms ease;
}

.setting-action:hover {
  margin-inline: -11px;
  padding-inline: 11px;
  border-radius: 14px;
  background: #f7faf7;
}

.setting-icon {
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border-radius: 14px;
  background: #ebf3ed;
  color: #33835a;
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
  color: #818b84;
  font-size: 10px;
  line-height: 1.6;
}

.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #77827a;
  font-size: 10px;
  white-space: nowrap;
}

.row-meta-accent {
  color: #2d8957;
  font-weight: 650;
}

.operation-list {
  display: grid;
  gap: 13px;
}

.operation-card {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  width: 100%;
  min-height: 94px;
  padding: 16px;
  border: 1px solid rgba(130, 149, 136, 0.18);
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.operation-card:hover {
  box-shadow: 0 12px 27px rgba(35, 66, 47, 0.07);
  transform: translateY(-2px);
}

.operation-card > svg { transition: transform 180ms ease; }
.operation-card:hover > svg { transform: translateX(3px); }

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
  color: #808a83;
  font-size: 10px;
  line-height: 1.55;
}

.operation-export {
  background: linear-gradient(135deg, #f7fbf7, #f1f8f3);
  color: #2d6b48;
}
.operation-export:hover { border-color: rgba(48, 126, 78, 0.28); }
.operation-export .operation-icon { background: #e7f2e9; color: #288251; }

.operation-delete {
  background: linear-gradient(135deg, #fffbf4, #fff7ea);
  color: #90601d;
}
.operation-delete:hover { border-color: rgba(174, 117, 38, 0.27); }
.operation-delete .operation-icon { background: #faecd1; color: #aa700f; }

.operation-account {
  background: linear-gradient(135deg, #fff8f7, #fff0ef);
  color: #a24640;
}
.operation-account:hover { border-color: rgba(176, 76, 70, 0.26); }
.operation-account .operation-icon { background: #f9e2df; color: #b54d46; }

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
  --el-switch-on-color: #258956;
  --el-switch-off-color: #cbd3cd;
}

:deep(.el-switch__core) {
  border: 0;
  box-shadow: inset 0 1px 2px rgba(20, 55, 35, 0.12);
}

button:focus-visible,
.setting-action:focus-visible,
.operation-card:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shield-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes shield-shine {
  0%, 58% { left: -75%; opacity: 0; }
  66% { opacity: 1; }
  83%, 100% { left: 135%; opacity: 0; }
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

@keyframes leaf-drift {
  0%, 100% { translate: 0 0; }
  50% { translate: 5px -7px; }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@media (max-width: 1100px) {
  .privacy-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .privacy-hero h1 {
    font-size: clamp(40px, 4.2vw, 52px);
  }

  .shield-stage { right: 3%; }

  .privacy-grid {
    grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
  }
}

@media (max-width: 900px) {
  .privacy-hero {
    grid-template-columns: 1fr;
    min-height: 230px;
  }

  .privacy-hero h1 {
    white-space: normal;
  }

  .hero-copy {
    max-width: 76%;
  }

  .hero-visual {
    position: absolute;
    right: -30px;
    bottom: -35px;
    width: 330px;
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.8);
  }

  .privacy-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .privacy-page { gap: 14px; }

  .privacy-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .privacy-hero h1 {
    font-size: clamp(35px, 10.5vw, 48px);
  }

  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .data-overview { grid-template-columns: 1fr; }
  .overview-card { min-height: 104px; }

  .settings-panel,
  .operations-panel {
    padding: 21px 20px 8px;
    border-radius: 20px;
  }

  .operations-panel { padding-bottom: 20px; }
}

@media (max-width: 520px) {
  .privacy-hero { padding: 26px 20px; }
  .privacy-hero p { font-size: 13px; }

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

  .row-meta { max-width: 72px; }

  .operation-card {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .privacy-hero,
  .overview-card,
  .panel,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .visual-leaf,
  .shield-stage,
  .shield-shell::after {
    animation: none;
  }

  .overview-card,
  .overview-arrow,
  .setting-action,
  .operation-card,
  .operation-card > svg {
    transition: none;
  }

  button.overview-card:hover,
  .setting-action:hover,
  .operation-card:hover {
    transform: none;
  }
}
</style>
