<template>
  <section class="privacy-page">
    <header class="privacy-head">
      <div>
        <span class="page-kicker">PRIVACY CENTER</span>
        <h1>您的健康数据，由您决定</h1>
        <p>查看数据规模、调整本地偏好，并管理报告与账号隐私操作。</p>
      </div>
      <div class="shield-visual" aria-hidden="true">
        <ShieldCheck :size="52" />
        <span class="leaf leaf-left" />
        <span class="leaf leaf-right" />
      </div>
    </header>

    <section class="data-overview">
      <article>
        <span class="overview-icon green"><FileText :size="19" /></span>
        <div><small>健康报告</small><strong>{{ reportCount }}</strong><p>当前账号下可见报告</p></div>
      </article>
      <article>
        <span class="overview-icon blue"><MessagesSquare :size="19" /></span>
        <div><small>聊天记录</small><strong>{{ chatCount }}</strong><p>保存在当前浏览器</p></div>
      </article>
      <article>
        <span class="overview-icon warm"><Database :size="19" /></span>
        <div><small>数据状态</small><strong>已保护</strong><p>登录鉴权与权限隔离</p></div>
      </article>
    </section>

    <div class="privacy-grid">
      <section class="settings-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA PREFERENCES</span>
            <h2>数据偏好</h2>
          </div>
        </div>

        <article class="setting-row">
          <span class="setting-icon"><BrainCircuit :size="18" /></span>
          <div>
            <strong>个性化回答偏好</strong>
            <p>允许助手在当前浏览器中保留回答展示偏好。</p>
          </div>
          <el-switch v-model="preferences.personalized" @change="savePreferences" />
        </article>

        <article class="setting-row">
          <span class="setting-icon"><History :size="18" /></span>
          <div>
            <strong>保存聊天记录</strong>
            <p>保存本机聊天会话，便于刷新页面后继续交流。</p>
          </div>
          <el-switch v-model="preferences.chatHistory" @change="savePreferences" />
        </article>

        <article class="setting-row action-row" @click="router.push('/reports')">
          <span class="setting-icon"><FolderHeart :size="18" /></span>
          <div>
            <strong>管理健康报告</strong>
            <p>查看、删除或进入任意一份舌象报告。</p>
          </div>
          <span class="row-meta">{{ reportCount }} 份 <ChevronRight :size="16" /></span>
        </article>

        <article class="setting-row action-row" @click="clearLocalChat">
          <span class="setting-icon"><MessageCircleOff :size="18" /></span>
          <div>
            <strong>清理本地聊天记录</strong>
            <p>仅删除当前浏览器中保存的聊天会话。</p>
          </div>
          <span class="row-meta">立即清理 <ChevronRight :size="16" /></span>
        </article>
      </section>

      <section class="operations-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">DATA OPERATIONS</span>
            <h2>数据操作</h2>
          </div>
        </div>

        <button class="operation-card" type="button" @click="exportData">
          <span class="operation-icon"><Download :size="19" /></span>
          <div>
            <strong>导出我的数据</strong>
            <p>下载个人资料与报告索引的 JSON 副本。</p>
          </div>
          <ChevronRight :size="17" />
        </button>

        <button class="operation-card danger-soft" type="button" @click="deleteReports">
          <span class="operation-icon"><Trash2 :size="19" /></span>
          <div>
            <strong>删除全部报告</strong>
            <p>软删除当前账号下可见的舌象报告。</p>
          </div>
          <ChevronRight :size="17" />
        </button>

        <button class="operation-card danger" type="button" @click="deleteAccount">
          <span class="operation-icon"><UserRoundX :size="19" /></span>
          <div>
            <strong>注销账号</strong>
            <p>提交账号删除请求并清理本地登录状态。</p>
          </div>
          <ChevronRight :size="17" />
        </button>
      </section>
    </div>

    <footer class="privacy-note">
      <LockKeyhole :size="16" />
      <span>敏感操作需要二次确认。健康数据仅用于本项目的健康管理和报告服务。</span>
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

async function clearLocalChat() {
  await ElMessageBox.confirm("确认清理当前浏览器保存的聊天记录吗？该操作不会删除服务器报告。", "清理本地聊天", { type: "warning" });
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
  await ElMessageBox.confirm("确认删除当前账号下的全部报告吗？删除后用户端将不可见。", "删除全部报告", { type: "warning" });
  await privacyApi.deleteReports();
  reports.value = [];
  reportCount.value = 0;
  ElMessage.success("报告删除请求已处理");
}

async function deleteAccount() {
  await ElMessageBox.confirm("确认注销当前账号吗？该操作将清理登录状态。", "注销账号", { type: "error" });
  await privacyApi.deleteAccount();
  await auth.logout();
  ElMessage.success("账号删除请求已处理");
  await router.replace("/login");
}
</script>

<style scoped>
.privacy-page {
  display: grid;
  gap: 18px;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.privacy-head {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  min-height: 220px;
  overflow: hidden;
  padding: 34px 38px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 26px;
  background:
    radial-gradient(circle at 90% 50%, rgba(206, 228, 201, 0.88), transparent 28%),
    linear-gradient(135deg, #fafbf6, #eef4e9);
  box-shadow: 0 16px 44px rgba(54, 75, 63, 0.06);
}

.page-kicker {
  display: block;
  color: #3f7058;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.privacy-head h1 {
  margin: 10px 0 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(38px, 5vw, 60px);
  font-weight: 500;
  letter-spacing: -0.055em;
}

.privacy-head p {
  margin: 15px 0 0;
  color: #738078;
  line-height: 1.75;
}

.shield-visual {
  position: relative;
  display: grid;
  width: 130px;
  height: 130px;
  place-items: center;
  justify-self: center;
  border: 1px solid rgba(60, 110, 75, 0.16);
  border-radius: 42px;
  background: rgba(255, 255, 255, 0.55);
  color: #367650;
  box-shadow: 0 18px 45px rgba(53, 104, 70, 0.12);
}

.leaf {
  position: absolute;
  width: 26px;
  height: 45px;
  border: 2px solid #6e9a73;
  border-radius: 80% 0 80% 0;
  opacity: 0.55;
}
.leaf-left { left: -12px; bottom: 15px; transform: rotate(-45deg); }
.leaf-right { right: -8px; bottom: 17px; transform: rotate(42deg) scaleX(-1); }

.data-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.data-overview article {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  min-height: 120px;
  padding: 18px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 18px;
  background: rgba(255, 254, 249, 0.88);
}

.overview-icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 14px; }
.overview-icon.green { background: #e5f0e8; color: #377552; }
.overview-icon.blue { background: #e5eef2; color: #4c7580; }
.overview-icon.warm { background: #f5eadb; color: #9a6c39; }
.data-overview article div { display: grid; }
.data-overview small { color: #8a948d; font-size: 9px; }
.data-overview strong { margin-top: 4px; color: #315744; font-size: 22px; }
.data-overview p { margin: 4px 0 0; color: #969e98; font-size: 9px; }

.privacy-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 16px;
}

.settings-panel,
.operations-panel {
  padding: 24px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.045);
}

.panel-heading { margin-bottom: 12px; }
.panel-heading h2 { margin: 8px 0 0; color: #2d3930; font-size: 22px; font-weight: 620; }

.setting-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  min-height: 92px;
  padding: 14px 0;
  border-top: 1px solid #e5e9e4;
}

.setting-row.action-row { cursor: pointer; }
.setting-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #eaf1eb; color: #397254; }
.setting-row strong { color: #34493d; font-size: 13px; }
.setting-row p { margin: 5px 0 0; color: #7f8982; font-size: 10px; line-height: 1.6; }
.row-meta { display: inline-flex; align-items: center; gap: 6px; color: #758178; font-size: 10px; }

.operations-panel { display: grid; align-content: start; gap: 10px; }
.operation-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 94px;
  padding: 15px;
  border: 1px solid rgba(199, 209, 201, 0.72);
  border-radius: 15px;
  background: #fafbf8;
  color: #385044;
  cursor: pointer;
  text-align: left;
}
.operation-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #e8f0ea; color: #397254; }
.operation-card strong { font-size: 12px; }
.operation-card p { margin: 5px 0 0; color: #858f88; font-size: 9px; line-height: 1.55; }
.operation-card.danger-soft { background: #fff8f3; color: #8d5f3f; }
.operation-card.danger-soft .operation-icon { background: #f8e9df; color: #a36a45; }
.operation-card.danger { background: #fff5f3; color: #934f4a; }
.operation-card.danger .operation-icon { background: #f6e2df; color: #a6544d; }

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: #7f8982;
  font-size: 10px;
}

@media (max-width: 900px) {
  .privacy-grid,
  .privacy-head { grid-template-columns: 1fr; }
  .shield-visual { display: none; }
}

@media (max-width: 700px) {
  .data-overview { grid-template-columns: 1fr; }
  .privacy-head { padding: 28px 22px; }
  .settings-panel,
  .operations-panel { padding: 18px; }
}
</style>
