<template>
  <section class="notifications-page">
    <header class="notifications-hero">
      <div class="hero-copy">
        <span class="page-kicker">ACTIVITY CENTER</span>
        <h1>及时掌握，<span>每一次健康进展</span></h1>
        <p>舌象分析、报告生成与医生审核状态都会在这里集中提醒。</p>

        <div class="hero-actions">
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :size="17" :class="{ spinning: loading }" />
            刷新通知
          </button>
          <button class="primary-action" type="button" :disabled="loading || unreadCount === 0" @click="readAll">
            <CheckCheck :size="17" />
            全部已读
          </button>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="pulse-ring ring-one" />
        <span class="pulse-ring ring-two" />
        <span class="hero-dot dot-one" />
        <span class="hero-dot dot-two" />
        <span class="hero-spark spark-one" />
        <span class="hero-spark spark-two" />

        <div class="bell-stage">
          <span class="bell-halo" />
          <div class="bell-shell">
            <BellRing :size="68" :stroke-width="1.65" />
            <span v-if="unreadCount" class="bell-count">{{ unreadCount > 99 ? "99+" : unreadCount }}</span>
          </div>
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
        </div>
      </div>
    </header>

    <section class="notification-overview" aria-label="通知概览">
      <article class="overview-card overview-total">
        <span class="overview-icon"><Bell :size="21" /></span>
        <span class="overview-copy">
          <small>全部通知</small>
          <strong>{{ totalCount }}</strong>
          <span>当前账号收到的状态提醒</span>
        </span>
      </article>

      <article class="overview-card overview-unread">
        <span class="overview-icon"><BellRing :size="21" /></span>
        <span class="overview-copy">
          <small>待查看</small>
          <strong>{{ unreadCount }}</strong>
          <span>{{ unreadCount ? "还有新进展等待查看" : "目前没有未读消息" }}</span>
        </span>
      </article>

      <article class="overview-card overview-progress">
        <span class="overview-icon"><CircleCheckBig :size="21" /></span>
        <span class="overview-copy">
          <small>已读进度</small>
          <strong>{{ readProgress }}%</strong>
          <span>保持通知中心整洁有序</span>
        </span>
        <span class="progress-ring" :style="{ '--progress': `${readProgress * 3.6}deg` }">
          <span />
        </span>
      </article>
    </section>

    <section class="notifications-panel">
      <div class="panel-toolbar">
        <div>
          <span class="page-kicker">NOTIFICATION STREAM</span>
          <h2>通知列表</h2>
          <p>按状态筛选消息，未读提醒会优先突出显示。</p>
        </div>

        <div class="filter-tabs" role="tablist" aria-label="通知筛选">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            :class="[ 'filter-tab', { active: activeFilter === filter.key } ]"
            role="tab"
            :aria-selected="activeFilter === filter.key"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
            <span>{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading && items.length === 0" class="skeleton-list" aria-label="正在加载通知">
        <div v-for="index in 3" :key="index" class="skeleton-card">
          <span class="skeleton-icon" />
          <span class="skeleton-lines">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>

      <EmptyState
        v-else-if="filteredGroups.length === 0"
        :title="emptyTitle"
        :description="emptyDescription"
      />

      <div v-else class="notification-groups">
        <section v-for="group in filteredGroups" :key="group.key" class="notification-group">
          <div class="group-heading">
            <span>{{ group.label }}</span>
            <small>{{ group.items.length }} 条</small>
          </div>

          <div class="notification-list">
            <article
              v-for="(item, index) in group.items"
              :key="item.id"
              :class="[
                'notification-card',
                `kind-${notificationMeta(item).kind}`,
                { unread: !item.readAt },
              ]"
              :style="{ animationDelay: `${Math.min(index, 8) * 45}ms` }"
            >
              <span class="timeline-dot" />

              <span class="notification-icon">
                <component :is="notificationMeta(item).icon" :size="21" :stroke-width="1.8" />
              </span>

              <div class="notification-content">
                <header class="notification-header">
                  <div class="notification-badges">
                    <span class="kind-badge">{{ notificationMeta(item).label }}</span>
                    <span v-if="!item.readAt" class="unread-badge">
                      <span /> 新消息
                    </span>
                  </div>
                  <time :title="formatDateTime(item.createdAt)">{{ relativeTime(item.createdAt) }}</time>
                </header>

                <h3>{{ item.title || item.type || "系统通知" }}</h3>
                <p>{{ item.content }}</p>

                <footer class="notification-footer">
                  <span class="full-time"><Clock3 :size="14" /> {{ formatDateTime(item.createdAt) }}</span>
                  <button
                    v-if="!item.readAt"
                    type="button"
                    class="read-action"
                    :disabled="readingId === item.id"
                    @click="read(item.id)"
                  >
                    <Check :size="15" />
                    {{ readingId === item.id ? "处理中" : "标记已读" }}
                  </button>
                  <span v-else class="read-status"><CircleCheckBig :size="15" /> 已读</span>
                </footer>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <footer class="notification-note">
      <ShieldCheck :size="15" />
      <span>通知仅用于展示当前账号的分析与审核进展，不会向其他用户公开。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleCheckBig,
  Clock3,
  FileCheck2,
  Info,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Stethoscope,
} from "lucide-vue-next";
import { EmptyState, formatDateTime, notificationApi, type NotificationItem } from "@tongue/shared";

type FilterKey = "all" | "unread" | "read";
type NotificationKind = "analysis" | "review" | "system" | "report";

const items = ref<NotificationItem[]>([]);
const activeFilter = ref<FilterKey>("all");
const loading = ref(false);
const readingId = ref<number | null>(null);

const totalCount = computed(() => items.value.length);
const unreadCount = computed(() => items.value.filter((item) => !item.readAt).length);
const readCount = computed(() => totalCount.value - unreadCount.value);
const readProgress = computed(() => (
  totalCount.value === 0 ? 100 : Math.round((readCount.value / totalCount.value) * 100)
));

const filters = computed(() => [
  { key: "all" as const, label: "全部", count: totalCount.value },
  { key: "unread" as const, label: "未读", count: unreadCount.value },
  { key: "read" as const, label: "已读", count: readCount.value },
]);

const filteredItems = computed(() => {
  const sorted = [...items.value].sort((left, right) => (
    toTimestamp(right.createdAt) - toTimestamp(left.createdAt)
  ));

  if (activeFilter.value === "unread") return sorted.filter((item) => !item.readAt);
  if (activeFilter.value === "read") return sorted.filter((item) => Boolean(item.readAt));
  return sorted;
});

const filteredGroups = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: NotificationItem[] }>();

  for (const item of filteredItems.value) {
    const bucket = dateBucket(item.createdAt);
    const group = groups.get(bucket.key) || { ...bucket, items: [] };
    group.items.push(item);
    groups.set(bucket.key, group);
  }

  return ["today", "yesterday", "earlier"]
    .map((key) => groups.get(key))
    .filter((group): group is { key: string; label: string; items: NotificationItem[] } => Boolean(group));
});

const emptyTitle = computed(() => {
  if (activeFilter.value === "unread") return "没有未读通知";
  if (activeFilter.value === "read") return "还没有已读通知";
  return "暂无通知";
});

const emptyDescription = computed(() => {
  if (activeFilter.value === "unread") return "所有消息都已查看，新的分析和审核进展会继续出现在这里。";
  if (activeFilter.value === "read") return "标记已读后，消息会整理到这里。";
  return "分析完成、报告生成或审核状态变化后会生成通知。";
});

async function load(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    items.value = await notificationApi.list();
    if (showSuccess) ElMessage.success("通知已刷新");
  } catch (error) {
    console.error("load notifications failed", error);
    ElMessage.error("通知加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

async function read(id: number) {
  if (readingId.value !== null) return;
  readingId.value = id;

  try {
    await notificationApi.read(id);
    const target = items.value.find((item) => item.id === id);
    if (target) target.readAt = new Date().toISOString();
  } catch (error) {
    console.error("read notification failed", error);
    ElMessage.error("标记失败，请稍后重试");
  } finally {
    readingId.value = null;
  }
}

async function readAll() {
  if (unreadCount.value === 0 || loading.value) return;
  loading.value = true;

  try {
    await notificationApi.readAll();
    const readAt = new Date().toISOString();
    items.value.forEach((item) => {
      if (!item.readAt) item.readAt = readAt;
    });
    ElMessage.success("全部通知已标记为已读");
  } catch (error) {
    console.error("read all notifications failed", error);
    ElMessage.error("操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

function notificationMeta(item: NotificationItem) {
  const kind = notificationKind(item);
  const config = {
    analysis: { kind, label: "舌象分析", icon: ScanLine },
    review: { kind, label: "医生审核", icon: Stethoscope },
    report: { kind, label: "健康报告", icon: FileCheck2 },
    system: { kind, label: "系统通知", icon: Info },
  } as const;

  return config[kind];
}

function notificationKind(item: NotificationItem): NotificationKind {
  const text = `${item.type || ""} ${item.title || ""} ${item.content || ""}`.toLowerCase();
  if (/审核|review|doctor|医生/.test(text)) return "review";
  if (/报告|report/.test(text)) return "report";
  if (/舌象|分析|analysis|tongue/.test(text)) return "analysis";
  return "system";
}

function dateBucket(value: string | null | undefined) {
  const timestamp = toTimestamp(value);
  if (!timestamp) return { key: "earlier", label: "更早" };

  const target = new Date(timestamp);
  const today = startOfDay(new Date());
  const targetDay = startOfDay(target);
  const diff = Math.round((today.getTime() - targetDay.getTime()) / 86_400_000);

  if (diff <= 0) return { key: "today", label: "今天" };
  if (diff === 1) return { key: "yesterday", label: "昨天" };
  return { key: "earlier", label: "更早" };
}

function relativeTime(value: string | null | undefined) {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "时间未知";

  const elapsed = Date.now() - timestamp;
  if (elapsed < 60_000) return "刚刚";
  if (elapsed < 3_600_000) return `${Math.max(1, Math.floor(elapsed / 60_000))} 分钟前`;
  if (elapsed < 86_400_000) return `${Math.max(1, Math.floor(elapsed / 3_600_000))} 小时前`;
  if (elapsed < 604_800_000) return `${Math.max(1, Math.floor(elapsed / 86_400_000))} 天前`;
  return formatDateTime(value as string);
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

onMounted(() => load());
</script>

<style scoped>
.notifications-page {
  --notice-ink: #182820;
  --notice-muted: #7b877f;
  --notice-line: rgba(137, 155, 143, 0.22);
  --notice-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.notifications-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 242px;
  overflow: hidden;
  padding: 38px 44px;
  border: 1px solid var(--notice-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 83% 30%, rgba(179, 226, 191, 0.3), transparent 29%),
    radial-gradient(circle at 96% 94%, rgba(210, 236, 211, 0.72), transparent 34%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #eef8ef 100%);
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

.notifications-hero h1 {
  margin: 13px 0 0;
  color: var(--notice-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(42px, 4.45vw, 60px);
  font-weight: 520;
  line-height: 1.15;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.notifications-hero h1 span {
  color: var(--notice-green);
}

.notifications-hero p {
  margin: 18px 0 0;
  color: var(--notice-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.hero-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 15px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.hero-actions button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.hero-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.ghost-action {
  border: 1px solid rgba(72, 116, 88, 0.18);
  background: rgba(255, 255, 255, 0.74);
  color: #526d5e;
  box-shadow: 0 7px 18px rgba(39, 74, 51, 0.04);
}

.primary-action {
  border: 1px solid #267c50;
  background: linear-gradient(150deg, #3d9364, #276f4c);
  color: white;
  box-shadow: 0 10px 20px rgba(38, 124, 80, 0.2);
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

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(53, 142, 84, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.ring-one {
  width: 306px;
  height: 132px;
  animation: ring-pulse 4.8s ease-in-out infinite;
}

.ring-two {
  width: 252px;
  height: 174px;
  animation: ring-pulse 5.8s 0.8s ease-in-out infinite reverse;
}

.hero-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one { top: 23px; left: 23px; }
.dot-two { right: 18px; bottom: 31px; animation-delay: 1.1s; }

.hero-spark {
  position: absolute;
  width: 16px;
  height: 16px;
}

.hero-spark::before,
.hero-spark::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(94, 171, 116, 0.3);
  content: "";
  transform: translate(-50%, -50%);
}

.hero-spark::before { width: 2px; height: 16px; }
.hero-spark::after { width: 16px; height: 2px; }
.spark-one { top: 28px; right: 46px; animation: sparkle 3.4s ease-in-out infinite; }
.spark-two { bottom: 28px; left: 32px; animation: sparkle 3.8s 1.1s ease-in-out infinite; }

.bell-stage {
  position: absolute;
  top: 8px;
  right: 10%;
  width: 270px;
  height: 190px;
  animation: bell-float 5.4s ease-in-out infinite;
}

.bell-halo {
  position: absolute;
  top: 22px;
  left: 50%;
  width: 158px;
  height: 158px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.18);
  filter: blur(30px);
  transform: translateX(-50%);
}

.bell-shell {
  position: absolute;
  top: 4px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 144px;
  height: 158px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 54px 54px 42px 42px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  color: #278d58;
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.bell-shell::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 33px 33px;
  content: "";
}

.bell-shell::after {
  position: absolute;
  top: -45%;
  left: -75%;
  width: 48%;
  height: 195%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.62), transparent);
  content: "";
  transform: rotate(18deg);
  animation: shell-shine 4.8s ease-in-out infinite;
}

.bell-shell svg {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 9px 10px rgba(34, 128, 75, 0.18));
}

.bell-count {
  position: absolute;
  top: 31px;
  right: 28px;
  z-index: 4;
  display: grid;
  min-width: 27px;
  height: 27px;
  padding: 0 7px;
  place-items: center;
  border: 3px solid rgba(245, 251, 246, 0.95);
  border-radius: 999px;
  background: #e05c4e;
  color: white;
  font-size: 9px;
  font-weight: 760;
  box-shadow: 0 7px 14px rgba(190, 75, 63, 0.25);
}

.stage-platform {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  transform: translateX(-50%);
}

.platform-back {
  bottom: 5px;
  width: 252px;
  height: 69px;
  border: 1px solid rgba(68, 155, 94, 0.22);
  background: linear-gradient(180deg, rgba(250, 253, 250, 0.86), rgba(225, 242, 227, 0.9));
  box-shadow: inset 0 10px 20px rgba(87, 166, 106, 0.1);
}

.platform-front {
  bottom: 18px;
  width: 205px;
  height: 39px;
  border: 1px solid rgba(68, 155, 94, 0.17);
  background: rgba(255, 255, 255, 0.68);
}

.notification-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  min-height: 118px;
  padding: 20px 22px;
  overflow: hidden;
  border: 1px solid var(--notice-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 140ms; }

.overview-card::after {
  position: absolute;
  right: -28px;
  bottom: -44px;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  content: "";
  opacity: 0.55;
}

.overview-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 17px;
}

.overview-total .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-total::after { background: #edf7ef; }
.overview-unread .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-unread::after { background: #edf4f8; }
.overview-progress .overview-icon { background: #fbefd8; color: #ad7412; }
.overview-progress::after { background: #fcf4e4; }

.overview-copy {
  position: relative;
  z-index: 2;
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

.progress-ring {
  --progress: 0deg;
  position: relative;
  z-index: 2;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#bf8a27 var(--progress), #f0e7d4 0deg);
}

.progress-ring span {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: #fffdf9;
}

.notifications-panel {
  padding: 26px 27px;
  border: 1px solid var(--notice-line);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
  animation: reveal-up 560ms 170ms ease-out both;
}

.panel-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 21px;
  border-bottom: 1px solid #e7ebe7;
}

.panel-toolbar h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.panel-toolbar p {
  margin: 7px 0 0;
  color: #89938d;
  font-size: 10px;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  padding: 5px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 14px;
  background: #f5f8f5;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #77827a;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: background 180ms ease, box-shadow 180ms ease, color 180ms ease;
}

.filter-tab span {
  display: grid;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  place-items: center;
  border-radius: 999px;
  background: rgba(119, 130, 122, 0.09);
  font-size: 9px;
}

.filter-tab.active {
  background: white;
  color: #267e50;
  box-shadow: 0 6px 16px rgba(35, 66, 47, 0.08);
}

.filter-tab.active span {
  background: #e7f2e9;
  color: #267e50;
}

.notification-groups {
  display: grid;
  gap: 22px;
  padding-top: 22px;
}

.group-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #43564b;
}

.group-heading span {
  font-size: 12px;
  font-weight: 720;
}

.group-heading small {
  color: #98a19b;
  font-size: 9px;
}

.notification-list {
  display: grid;
  gap: 11px;
  padding-left: 13px;
  border-left: 1px solid #e3e9e4;
}

.notification-card {
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 15px;
  padding: 18px 19px;
  border: 1px solid rgba(139, 157, 145, 0.18);
  border-radius: 18px;
  background: #fffefa;
  box-shadow: 0 8px 20px rgba(35, 66, 47, 0.035);
  animation: notice-enter 430ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 13px 29px rgba(35, 66, 47, 0.075);
}

.notification-card.unread {
  border-color: rgba(44, 137, 84, 0.3);
  background: linear-gradient(112deg, #f8fcf8, #fffefa 76%);
}

.notification-card.unread::before {
  position: absolute;
  inset: 11px auto 11px 0;
  width: 3px;
  border-radius: 999px;
  background: #3a9663;
  content: "";
}

.timeline-dot {
  position: absolute;
  top: 35px;
  left: -19px;
  width: 9px;
  height: 9px;
  border: 2px solid #f8fbf8;
  border-radius: 50%;
  background: #a8b5ac;
  box-shadow: 0 0 0 3px #e5ebe6;
}

.notification-card.unread .timeline-dot {
  background: #3c9663;
  box-shadow: 0 0 0 3px #dceee1;
}

.notification-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
}

.kind-analysis .notification-icon { background: #e7f3ea; color: #2c8755; }
.kind-report .notification-icon { background: #eaf1f7; color: #4b7897; }
.kind-review .notification-icon { background: #f0ecf8; color: #76609b; }
.kind-system .notification-icon { background: #fbefd9; color: #aa7418; }

.notification-content {
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.notification-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.kind-badge,
.unread-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 680;
}

.kind-analysis .kind-badge { background: #e9f4eb; color: #2d8052; }
.kind-report .kind-badge { background: #eaf1f7; color: #4a7492; }
.kind-review .kind-badge { background: #f0ecf8; color: #725c95; }
.kind-system .kind-badge { background: #fbefda; color: #9d6b17; }

.unread-badge {
  background: #fff1ef;
  color: #bd544a;
}

.unread-badge > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d95d52;
  animation: unread-pulse 2.2s ease-in-out infinite;
}

.notification-header time {
  flex: none;
  color: #9aa39d;
  font-size: 10px;
}

.notification-card h3 {
  margin: 11px 0 0;
  color: #26392f;
  font-size: 15px;
  font-weight: 710;
}

.notification-card p {
  margin: 7px 0 0;
  color: #78837c;
  font-size: 12px;
  line-height: 1.75;
}

.notification-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid rgba(139, 157, 145, 0.14);
}

.full-time,
.read-status,
.read-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.full-time { color: #969f99; }
.read-status { color: #71907d; }

.read-action {
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid rgba(43, 134, 83, 0.16);
  border-radius: 10px;
  background: #edf6ef;
  color: #2a8353;
  font-weight: 680;
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
}

.read-action:hover:not(:disabled) {
  background: #e4f1e7;
  transform: translateY(-1px);
}

.read-action:disabled {
  cursor: wait;
  opacity: 0.58;
}

.skeleton-list {
  display: grid;
  gap: 11px;
  padding-top: 22px;
}

.skeleton-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 15px;
  padding: 18px 19px;
  border: 1px solid rgba(139, 157, 145, 0.14);
  border-radius: 18px;
}

.skeleton-icon,
.skeleton-lines span {
  background: linear-gradient(90deg, #edf1ed 25%, #f7f9f7 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 15px;
}

.skeleton-lines {
  display: grid;
  align-content: center;
  gap: 9px;
}

.skeleton-lines span {
  height: 10px;
  border-radius: 999px;
}

.skeleton-lines span:nth-child(1) { width: 34%; }
.skeleton-lines span:nth-child(2) { width: 72%; }
.skeleton-lines span:nth-child(3) { width: 48%; }

.notification-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  color: #849088;
  font-size: 10px;
  text-align: center;
}

button:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 900ms linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes notice-enter {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bell-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

@keyframes shell-shine {
  0%, 58% { left: -75%; opacity: 0; }
  66% { opacity: 1; }
  83%, 100% { left: 135%; opacity: 0; }
}

@keyframes ring-pulse {
  0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.96) rotate(8deg); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04) rotate(13deg); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 0.9; transform: scale(1) rotate(45deg); }
}

@keyframes unread-pulse {
  0%, 100% { opacity: 0.68; box-shadow: 0 0 0 0 rgba(217, 93, 82, 0.16); }
  50% { opacity: 1; box-shadow: 0 0 0 5px rgba(217, 93, 82, 0); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@keyframes skeleton {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .notifications-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .notifications-hero h1 {
    font-size: clamp(40px, 4.2vw, 52px);
  }

  .bell-stage { right: 3%; }
}

@media (max-width: 900px) {
  .notifications-hero {
    grid-template-columns: 1fr;
    min-height: 230px;
  }

  .notifications-hero h1 { white-space: normal; }
  .hero-copy { max-width: 76%; }

  .hero-visual {
    position: absolute;
    right: -30px;
    bottom: -35px;
    width: 330px;
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.8);
  }

  .panel-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .notifications-page { gap: 14px; }

  .notifications-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .notifications-hero h1 {
    font-size: clamp(35px, 10.5vw, 48px);
  }

  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .notification-overview { grid-template-columns: 1fr; }

  .notifications-panel {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .filter-tabs {
    width: 100%;
  }

  .filter-tab {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .notifications-hero { padding: 26px 20px; }
  .notifications-hero p { font-size: 13px; }

  .hero-actions button {
    flex: 1;
  }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr) auto;
    padding: 17px;
  }

  .overview-icon {
    width: 44px;
    height: 44px;
  }

  .notification-list {
    padding-left: 8px;
  }

  .notification-card {
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 12px;
    padding: 15px;
  }

  .notification-icon {
    width: 42px;
    height: 42px;
  }

  .timeline-dot {
    left: -14px;
  }

  .notification-header,
  .notification-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .notification-card h3 {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notifications-hero,
  .overview-card,
  .notifications-panel,
  .notification-card,
  .visual-grid,
  .pulse-ring,
  .hero-dot,
  .hero-spark,
  .bell-stage,
  .bell-shell::after,
  .unread-badge > span,
  .skeleton-icon,
  .skeleton-lines span,
  .spinning {
    animation: none;
  }

  .hero-actions button,
  .notification-card,
  .read-action,
  .filter-tab {
    transition: none;
  }

  .hero-actions button:hover,
  .notification-card:hover,
  .read-action:hover {
    transform: none;
  }
}
</style>
