<template>
  <section class="doctors-page">
    <header class="doctors-head">
      <div>
        <span class="page-kicker">DOCTOR REVIEW</span>
        <h1>选择为您复核的医生</h1>
        <p>由通过平台审核的专业医生复核 AI 报告，补充更具针对性的说明与建议。</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="load">
        <RefreshCw :class="{ spinning: loading }" :size="16" />
        刷新
      </button>
    </header>

    <section class="doctor-guidance">
      <div class="guidance-icon"><ShieldCheck :size="24" /></div>
      <div>
        <strong>医生复核如何工作？</strong>
        <p>选择医生后，您可以在报告详情页提交复核申请，并补充希望医生重点关注的问题。</p>
      </div>
      <RouterLink to="/reports">选择一份报告 <ArrowRight :size="15" /></RouterLink>
    </section>

    <div class="filters">
      <label class="search-box">
        <Search :size="15" />
        <input v-model="keyword" placeholder="搜索医生姓名、职称或擅长方向" />
      </label>
      <span>{{ filteredDoctors.length }} 位可选医生</span>
    </div>

    <EmptyState
      v-if="!loading && filteredDoctors.length === 0"
      title="暂无可选医生"
      description="医生资料通过审核后会展示在这里。"
    />

    <div v-else v-loading="loading" class="doctor-list">
      <article v-for="doctor in filteredDoctors" :key="doctor.doctorId" class="doctor-card">
        <div class="doctor-avatar" :style="avatarStyle(doctor.doctorId)">
          {{ doctorInitial(doctor) }}
        </div>

        <div class="doctor-main">
          <div class="doctor-title-row">
            <div>
              <h2>{{ doctor.realName || `医生 ${doctor.doctorId}` }}</h2>
              <p>{{ doctor.title || "专业健康复核医生" }}</p>
            </div>
            <StatusTag :status="doctor.reviewStatus" />
          </div>

          <p class="doctor-introduction">
            {{ doctor.introduction || "关注舌象报告复核与日常健康管理，为用户提供清晰、审慎的专业说明。" }}
          </p>

          <div class="specialty-tags">
            <span v-for="item in specialties(doctor.specialty)" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="doctor-meta">
          <div>
            <span>服务类型</span>
            <strong>报告复核</strong>
          </div>
          <div>
            <span>审核状态</span>
            <strong>{{ statusText(doctor.reviewStatus) }}</strong>
          </div>
        </div>

        <div class="doctor-actions">
          <button class="detail-button" type="button" @click="open(doctor)">查看详情</button>
          <RouterLink class="choose-button" to="/reports">选择报告</RouterLink>
        </div>
      </article>
    </div>

    <el-dialog v-model="dialogVisible" width="560px" class="doctor-dialog">
      <template #header>
        <div v-if="current" class="dialog-head">
          <div class="doctor-avatar small" :style="avatarStyle(current.doctorId)">{{ doctorInitial(current) }}</div>
          <div>
            <h3>{{ current.realName || `医生 ${current.doctorId}` }}</h3>
            <p>{{ current.title || "专业健康复核医生" }}</p>
          </div>
        </div>
      </template>
      <template v-if="current">
        <div class="dialog-section">
          <span>擅长方向</span>
          <div class="specialty-tags">
            <span v-for="item in specialties(current.specialty)" :key="item">{{ item }}</span>
          </div>
        </div>
        <div class="dialog-section">
          <span>医生简介</span>
          <p>{{ current.introduction || "暂无详细简介。" }}</p>
        </div>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goReports">选择报告并申请复核</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, RefreshCw, Search, ShieldCheck } from "lucide-vue-next";
import { EmptyState, StatusTag, doctorApi, type DoctorProfile } from "@tongue/shared";

const router = useRouter();
const doctors = ref<DoctorProfile[]>([]);
const current = ref<DoctorProfile | null>(null);
const dialogVisible = ref(false);
const loading = ref(false);
const keyword = ref("");

const filteredDoctors = computed(() => {
  const normalized = keyword.value.trim().toLowerCase();
  if (!normalized) return doctors.value;
  return doctors.value.filter((doctor) => [doctor.realName, doctor.title, doctor.specialty]
    .some((value) => String(value || "").toLowerCase().includes(normalized)));
});

async function load() {
  loading.value = true;
  try {
    doctors.value = await doctorApi.list();
  } finally {
    loading.value = false;
  }
}

function open(doctor: DoctorProfile) {
  current.value = doctor;
  dialogVisible.value = true;
}

function goReports() {
  dialogVisible.value = false;
  router.push("/reports");
}

function doctorInitial(doctor: DoctorProfile) {
  const value = doctor.realName || `医生${doctor.doctorId}`;
  return value.slice(0, 1);
}

function specialties(value?: string) {
  const list = String(value || "舌象复核、健康管理")
    .split(/[，,、/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
  return list.length ? list : ["舌象复核"];
}

function statusText(value?: string) {
  const map: Record<string, string> = {
    APPROVED: "已通过平台审核",
    PENDING: "审核中",
    REJECTED: "暂不可用",
  };
  return map[String(value || "").toUpperCase()] || "已认证";
}

function avatarStyle(id: number) {
  const palettes = [
    ["#dfece3", "#2e6a49"],
    ["#e7edf2", "#436c7a"],
    ["#f2e7df", "#9a6543"],
    ["#ece8f3", "#6f668e"],
  ];
  const [background, color] = palettes[Math.abs(id || 0) % palettes.length];
  return { background, color };
}

onMounted(load);
</script>

<style scoped>
.doctors-page {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.doctors-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 22px;
}

.page-kicker {
  display: block;
  color: #3f7058;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.doctors-head h1 {
  margin: 9px 0 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(40px, 5vw, 62px);
  font-weight: 500;
  letter-spacing: -0.055em;
}

.doctors-head p {
  max-width: 680px;
  margin: 13px 0 0;
  color: #778178;
  line-height: 1.75;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(77, 102, 87, 0.16);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.82);
  color: #3d5949;
  cursor: pointer;
  font-size: 11px;
}

.doctor-guidance {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 20px 22px;
  border: 1px solid rgba(161, 190, 170, 0.52);
  border-radius: 20px;
  background: linear-gradient(135deg, #edf5ef, #f7faf5);
}

.guidance-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #dcebe1;
  color: #2e704b;
}

.doctor-guidance strong { color: #2f483a; font-size: 14px; }
.doctor-guidance p { margin: 6px 0 0; color: #708077; font-size: 11px; }
.doctor-guidance a { display: inline-flex; align-items: center; gap: 6px; color: #2e6849; font-size: 11px; font-weight: 650; text-decoration: none; }

.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 22px 0 16px;
}

.filters > span { color: #8b958e; font-size: 10px; }
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(420px, 100%);
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.82);
  color: #849088;
}
.search-box input { width: 100%; border: 0; outline: 0; background: transparent; color: #33423a; font-size: 12px; }

.doctor-list { display: grid; gap: 14px; }
.doctor-card {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) 170px 170px;
  align-items: center;
  gap: 22px;
  min-height: 190px;
  padding: 24px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 13px 34px rgba(54, 75, 63, 0.05);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.doctor-card:hover { box-shadow: 0 19px 44px rgba(54, 75, 63, 0.08); transform: translateY(-2px); }
.doctor-avatar { display: grid; width: 78px; height: 78px; place-items: center; border-radius: 24px; font-family: "Noto Serif SC", serif; font-size: 30px; font-weight: 650; }
.doctor-avatar.small { width: 54px; height: 54px; border-radius: 16px; font-size: 21px; }
.doctor-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; }
.doctor-title-row h2 { margin: 0; color: #2d3930; font-size: 20px; }
.doctor-title-row p { margin: 6px 0 0; color: #768078; font-size: 11px; }
.doctor-introduction { max-width: 620px; margin: 13px 0 0; color: #768078; font-size: 11px; line-height: 1.75; }
.specialty-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 13px; }
.specialty-tags span { padding: 5px 8px; border-radius: 999px; background: #eaf1eb; color: #3e6b51; font-size: 9px; }
.doctor-meta { display: grid; gap: 14px; padding: 0 20px; border-left: 1px solid #e0e6e0; border-right: 1px solid #e0e6e0; }
.doctor-meta div { display: grid; gap: 4px; }
.doctor-meta span { color: #929b95; font-size: 9px; }
.doctor-meta strong { color: #385744; font-size: 11px; }
.doctor-actions { display: grid; gap: 9px; }
.detail-button,
.choose-button { display: grid; min-height: 38px; place-items: center; border: 0; border-radius: 10px; cursor: pointer; font-size: 11px; font-weight: 650; text-decoration: none; }
.detail-button { border: 1px solid rgba(70, 98, 82, 0.17); background: #f9fbf8; color: #3c5948; }
.choose-button { background: #245d3d; color: white; }
.dialog-head { display: flex; align-items: center; gap: 14px; }
.dialog-head h3 { margin: 0; font-size: 20px; }
.dialog-head p { margin: 5px 0 0; color: #7b857e; font-size: 11px; }
.dialog-section { padding: 16px 0; border-top: 1px solid #e4e8e3; }
.dialog-section > span { color: #3f7058; font-size: 10px; font-weight: 700; }
.dialog-section p { color: #6f7b73; line-height: 1.75; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 980px) {
  .doctor-card { grid-template-columns: 72px minmax(0, 1fr); }
  .doctor-meta,
  .doctor-actions { grid-column: 2; }
  .doctor-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 14px 0; border: 0; border-top: 1px solid #e0e6e0; border-bottom: 1px solid #e0e6e0; }
  .doctor-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 700px) {
  .doctors-head,
  .filters { align-items: flex-start; flex-direction: column; }
  .doctor-guidance { grid-template-columns: 44px minmax(0, 1fr); }
  .doctor-guidance a { grid-column: 2; }
  .doctor-card { grid-template-columns: 1fr; }
  .doctor-avatar { width: 68px; height: 68px; }
  .doctor-main,
  .doctor-meta,
  .doctor-actions { grid-column: 1; }
}
</style>
