<template>
  <section class="doctors-page">
    <header class="doctors-hero">
      <div class="hero-copy">
        <span class="page-kicker">DOCTOR REVIEW</span>
        <h1>让专业医生，<span>复核您的健康报告</span></h1>
        <p>选择通过平台审核的医生，对 AI 舌象报告进行人工复核，并获得更具针对性的专业说明。</p>

        <div class="hero-actions">
          <RouterLink class="primary-action" to="/reports">
            <FileCheck2 :size="17" />
            选择一份报告
            <ArrowRight :size="16" />
          </RouterLink>
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新医生
          </button>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="medical-cross cross-one" />
        <span class="medical-cross cross-two" />

        <div class="doctor-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="doctor-glass">
            <div class="doctor-symbol">
              <Stethoscope :size="65" :stroke-width="1.65" />
            </div>
            <span class="verified-orbit"><ShieldCheck :size="22" /></span>
          </div>
        </div>
      </div>
    </header>

    <section class="doctor-overview" aria-label="医生服务概览">
      <article class="overview-card overview-doctors">
        <span class="overview-icon"><Users :size="21" /></span>
        <span class="overview-copy">
          <small>可选医生</small>
          <strong>{{ doctors.length }}</strong>
          <span>当前可查看的医生资料</span>
        </span>
      </article>

      <article class="overview-card overview-approved">
        <span class="overview-icon"><ShieldCheck :size="21" /></span>
        <span class="overview-copy">
          <small>平台认证</small>
          <strong>{{ approvedCount }}</strong>
          <span>已完成平台资质审核</span>
        </span>
      </article>

      <article class="overview-card overview-specialties">
        <span class="overview-icon"><Sparkles :size="21" /></span>
        <span class="overview-copy">
          <small>擅长方向</small>
          <strong>{{ specialtyOptions.length }}</strong>
          <span>支持多种健康复核方向</span>
        </span>
      </article>
    </section>

    <section class="review-guide">
      <span class="guide-icon"><ShieldCheck :size="23" /></span>
      <div class="guide-copy">
        <span class="page-kicker">HOW IT WORKS</span>
        <strong>医生复核如何工作？</strong>
        <p>选择医生后，在报告详情中提交复核申请，并补充希望医生重点关注的问题。</p>
      </div>
      <div class="guide-steps" aria-label="医生复核流程">
        <span><b>01</b>选择报告</span>
        <i />
        <span><b>02</b>选择医生</span>
        <i />
        <span><b>03</b>获得意见</span>
      </div>
      <RouterLink class="guide-link" to="/reports">
        开始申请
        <ArrowRight :size="15" />
      </RouterLink>
    </section>

    <section class="doctor-directory">
      <div class="directory-heading">
        <div>
          <span class="page-kicker">VERIFIED DOCTORS</span>
          <h2>认证医生</h2>
          <p>搜索医生姓名、职称或专业方向，查看详细资料后再提交报告。</p>
        </div>
        <span class="result-count">{{ filteredDoctors.length }} 位符合条件</span>
      </div>

      <div class="filter-panel">
        <label class="search-box">
          <Search :size="17" />
          <input v-model="keyword" placeholder="搜索医生姓名、职称或擅长方向" />
          <button v-if="keyword" type="button" aria-label="清除搜索" @click="keyword = ''">×</button>
        </label>

        <div class="specialty-filter" role="list" aria-label="擅长方向筛选">
          <button
            type="button"
            :class="[ 'specialty-button', { active: activeSpecialty === 'all' } ]"
            @click="activeSpecialty = 'all'"
          >
            全部方向
          </button>
          <button
            v-for="item in specialtyOptions"
            :key="item"
            type="button"
            :class="[ 'specialty-button', { active: activeSpecialty === item } ]"
            @click="activeSpecialty = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div v-if="loading && doctors.length === 0" class="doctor-skeleton-list" aria-label="正在加载医生">
        <article v-for="index in 3" :key="index" class="doctor-skeleton">
          <span class="skeleton-avatar" />
          <span class="skeleton-copy">
            <span />
            <span />
            <span />
          </span>
          <span class="skeleton-meta" />
        </article>
      </div>

      <EmptyState
        v-else-if="filteredDoctors.length === 0"
        title="暂无符合条件的医生"
        description="可以调整搜索关键词或切换擅长方向后重试。"
      />

      <div v-else class="doctor-list">
        <article
          v-for="(doctor, index) in filteredDoctors"
          :key="doctor.doctorId"
          class="doctor-card"
          :style="{ animationDelay: `${Math.min(index, 8) * 55}ms` }"
        >
          <div class="doctor-profile">
            <div class="doctor-avatar-wrap">
              <div class="doctor-avatar" :style="avatarStyle(doctor.doctorId)">
                {{ doctorInitial(doctor) }}
              </div>
              <span class="verified-badge" title="平台认证">
                <ShieldCheck :size="15" />
              </span>
            </div>

            <div class="doctor-main">
              <div class="doctor-title-row">
                <div>
                  <span class="doctor-eyebrow">VERIFIED DOCTOR</span>
                  <h3>{{ doctor.realName || `医生 ${doctor.doctorId}` }}</h3>
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
          </div>

          <div class="doctor-service">
            <div class="service-item">
              <span class="service-icon"><FileCheck2 :size="17" /></span>
              <span>
                <small>服务类型</small>
                <strong>报告专业复核</strong>
              </span>
            </div>
            <div class="service-item">
              <span class="service-icon"><ShieldCheck :size="17" /></span>
              <span>
                <small>认证状态</small>
                <strong>{{ statusText(doctor.reviewStatus) }}</strong>
              </span>
            </div>
            <div class="service-item">
              <span class="service-icon"><Stethoscope :size="17" /></span>
              <span>
                <small>服务说明</small>
                <strong>结合报告补充意见</strong>
              </span>
            </div>
          </div>

          <div class="doctor-actions">
            <button class="detail-button" type="button" @click="open(doctor)">
              查看医生详情
              <ArrowRight :size="15" />
            </button>
            <RouterLink class="choose-button" to="/reports">
              选择报告申请复核
              <FileCheck2 :size="15" />
            </RouterLink>
          </div>
        </article>
      </div>
    </section>

    <footer class="doctor-note">
      <ShieldCheck :size="15" />
      <span>医生复核用于补充专业意见，不替代线下诊断、检查与紧急医疗服务。</span>
    </footer>

    <el-dialog v-model="dialogVisible" width="600px" class="doctor-dialog" align-center>
      <template #header>
        <div v-if="current" class="dialog-head">
          <div class="doctor-avatar-wrap compact">
            <div class="doctor-avatar small" :style="avatarStyle(current.doctorId)">{{ doctorInitial(current) }}</div>
            <span class="verified-badge"><ShieldCheck :size="13" /></span>
          </div>
          <div>
            <span class="doctor-eyebrow">DOCTOR PROFILE</span>
            <h3>{{ current.realName || `医生 ${current.doctorId}` }}</h3>
            <p>{{ current.title || "专业健康复核医生" }}</p>
          </div>
        </div>
      </template>

      <template v-if="current">
        <div class="dialog-summary">
          <span><ShieldCheck :size="17" /></span>
          <div>
            <strong>{{ statusText(current.reviewStatus) }}</strong>
            <p>医生资料已经过平台审核，可为用户提供报告复核服务。</p>
          </div>
        </div>

        <div class="dialog-section">
          <span>擅长方向</span>
          <div class="specialty-tags dialog-tags">
            <span v-for="item in specialties(current.specialty)" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="dialog-section">
          <span>医生简介</span>
          <p>{{ current.introduction || "暂无详细简介。" }}</p>
        </div>

        <div class="dialog-section service-description">
          <span>复核服务说明</span>
          <div class="dialog-service-grid">
            <div><b>01</b><p>阅读您的舌象报告与补充问题</p></div>
            <div><b>02</b><p>对 AI 分析结论进行人工复核</p></div>
            <div><b>03</b><p>补充专业说明与后续建议</p></div>
          </div>
        </div>
      </template>

      <template #footer>
        <button class="dialog-close" type="button" @click="dialogVisible = false">稍后再选</button>
        <button class="dialog-primary" type="button" @click="goReports">
          选择报告并申请复核
          <ArrowRight :size="15" />
        </button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  FileCheck2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-vue-next";
import { EmptyState, StatusTag, doctorApi, type DoctorProfile } from "@tongue/shared";

const router = useRouter();
const doctors = ref<DoctorProfile[]>([]);
const current = ref<DoctorProfile | null>(null);
const dialogVisible = ref(false);
const loading = ref(false);
const keyword = ref("");
const activeSpecialty = ref("all");

const approvedCount = computed(() => doctors.value.filter((doctor) => (
  String(doctor.reviewStatus || "").toUpperCase() === "APPROVED"
)).length);

const specialtyOptions = computed(() => {
  const values = doctors.value.flatMap((doctor) => specialties(doctor.specialty));
  return Array.from(new Set(values)).slice(0, 8);
});

const filteredDoctors = computed(() => {
  const normalized = keyword.value.trim().toLowerCase();

  return doctors.value.filter((doctor) => {
    const keywordMatched = !normalized || [doctor.realName, doctor.title, doctor.specialty, doctor.introduction]
      .some((value) => String(value || "").toLowerCase().includes(normalized));
    const specialtyMatched = activeSpecialty.value === "all"
      || specialties(doctor.specialty).includes(activeSpecialty.value);

    return keywordMatched && specialtyMatched;
  });
});

async function load(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    doctors.value = await doctorApi.list();
    if (showSuccess) ElMessage.success("医生列表已刷新");
  } catch (error) {
    console.error("load doctors failed", error);
    ElMessage.error("医生列表加载失败，请稍后重试");
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
    PENDING: "平台审核中",
    REJECTED: "当前暂不可用",
  };
  return map[String(value || "").toUpperCase()] || "已完成身份认证";
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

onMounted(() => load());
</script>

<style scoped>
.doctors-page {
  --doctor-ink: #182820;
  --doctor-muted: #7a867e;
  --doctor-line: rgba(137, 155, 143, 0.22);
  --doctor-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.doctors-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 39px 44px;
  border: 1px solid var(--doctor-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 28%, rgba(179, 226, 191, 0.31), transparent 29%),
    radial-gradient(circle at 97% 95%, rgba(211, 237, 212, 0.72), transparent 34%),
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

.doctors-hero h1 {
  margin: 13px 0 0;
  color: var(--doctor-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(40px, 4.25vw, 58px);
  font-weight: 520;
  line-height: 1.17;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.doctors-hero h1 span {
  color: var(--doctor-green);
}

.doctors-hero p {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--doctor-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.primary-action,
.ghost-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 41px;
  padding: 0 15px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.primary-action {
  border: 1px solid #267c50;
  background: linear-gradient(150deg, #3d9364, #276f4c);
  color: white;
  box-shadow: 0 10px 20px rgba(38, 124, 80, 0.2);
}

.ghost-action {
  border: 1px solid rgba(72, 116, 88, 0.18);
  background: rgba(255, 255, 255, 0.74);
  color: #526d5e;
  box-shadow: 0 7px 18px rgba(39, 74, 51, 0.04);
}

.primary-action:hover,
.ghost-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.ghost-action:disabled {
  cursor: wait;
  opacity: 0.55;
}

.hero-visual {
  position: relative;
  min-height: 192px;
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
  width: 250px;
  height: 178px;
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

.dot-one { top: 24px; left: 23px; }
.dot-two { right: 17px; bottom: 32px; animation-delay: 1.1s; }

.medical-cross {
  position: absolute;
  width: 21px;
  height: 21px;
  opacity: 0.26;
  animation: cross-float 5s ease-in-out infinite;
}

.medical-cross::before,
.medical-cross::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999px;
  background: #4e9a68;
  content: "";
  transform: translate(-50%, -50%);
}

.medical-cross::before { width: 5px; height: 21px; }
.medical-cross::after { width: 21px; height: 5px; }
.cross-one { top: 31px; right: 35px; }
.cross-two { bottom: 30px; left: 30px; animation-delay: 1.2s; transform: scale(0.72); }

.doctor-stage {
  position: absolute;
  top: 8px;
  right: 10%;
  width: 270px;
  height: 190px;
  animation: doctor-float 5.7s ease-in-out infinite;
}

.stage-halo {
  position: absolute;
  top: 21px;
  left: 50%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.18);
  filter: blur(30px);
  transform: translateX(-50%);
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

.doctor-glass {
  position: absolute;
  top: 2px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 145px;
  height: 165px;
  place-items: center;
  overflow: visible;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 54px 54px 39px 39px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.doctor-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.doctor-glass::after {
  position: absolute;
  top: -45%;
  left: -75%;
  width: 48%;
  height: 195%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.62), transparent);
  content: "";
  transform: rotate(18deg);
  animation: glass-shine 4.8s ease-in-out infinite;
}

.doctor-symbol {
  position: relative;
  z-index: 2;
  display: grid;
  width: 88px;
  height: 88px;
  place-items: center;
  border-radius: 30px;
  background: linear-gradient(155deg, #52b978, #248653);
  color: white;
  box-shadow:
    0 14px 22px rgba(38, 135, 74, 0.25),
    inset 10px 10px 15px rgba(255, 255, 255, 0.15),
    inset -12px -13px 18px rgba(17, 97, 52, 0.28);
}

.verified-orbit {
  position: absolute;
  right: -10px;
  bottom: 25px;
  z-index: 4;
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 4px solid rgba(245, 251, 246, 0.95);
  border-radius: 50%;
  background: #fffefa;
  color: #288653;
  box-shadow: 0 8px 17px rgba(39, 115, 68, 0.17);
}

.doctor-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: center;
  gap: 15px;
  min-height: 116px;
  padding: 20px 22px;
  overflow: hidden;
  border: 1px solid var(--doctor-line);
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
  position: relative;
  z-index: 2;
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 17px;
}

.overview-doctors .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-doctors::after { background: #edf7ef; }
.overview-approved .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-approved::after { background: #edf4f8; }
.overview-specialties .overview-icon { background: #f2ecf8; color: #725f96; }
.overview-specialties::after { background: #f5f0fa; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 10px; }
.overview-copy strong { margin-top: 4px; color: #21342a; font-size: 26px; font-weight: 700; line-height: 1; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }

.review-guide {
  display: grid;
  grid-template-columns: 50px minmax(240px, 1fr) auto auto;
  align-items: center;
  gap: 17px;
  padding: 20px 22px;
  border: 1px solid rgba(92, 161, 113, 0.28);
  border-radius: 20px;
  background: linear-gradient(120deg, #edf6ef, #f9fcf8 64%, #f2f8f1);
  box-shadow: 0 10px 26px rgba(35, 77, 49, 0.035);
  animation: reveal-up 560ms 160ms ease-out both;
}

.guide-icon {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border-radius: 16px;
  background: #dceee2;
  color: #2c8554;
}

.guide-copy strong {
  display: block;
  margin-top: 6px;
  color: #2d4838;
  font-size: 14px;
}

.guide-copy p {
  margin: 5px 0 0;
  color: #758179;
  font-size: 10px;
  line-height: 1.6;
}

.guide-steps {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-steps span {
  display: grid;
  gap: 3px;
  color: #5f7366;
  font-size: 9px;
  text-align: center;
  white-space: nowrap;
}

.guide-steps b {
  color: #2f8a58;
  font-size: 10px;
}

.guide-steps i {
  width: 25px;
  height: 1px;
  background: #bed6c5;
}

.guide-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2d7e50;
  font-size: 11px;
  font-weight: 680;
  text-decoration: none;
  white-space: nowrap;
}

.doctor-directory {
  padding: 26px 27px;
  border: 1px solid var(--doctor-line);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
  animation: reveal-up 560ms 200ms ease-out both;
}

.directory-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.directory-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.directory-heading p {
  margin: 7px 0 0;
  color: #89938d;
  font-size: 10px;
}

.result-count {
  flex: none;
  color: #89938d;
  font-size: 10px;
}

.filter-panel {
  display: grid;
  gap: 13px;
  margin-top: 21px;
  padding: 15px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 17px;
  background: #f7f9f7;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 45px;
  padding: 0 14px;
  border: 1px solid rgba(147, 164, 153, 0.25);
  border-radius: 13px;
  background: white;
  color: #829087;
  box-shadow: 0 6px 15px rgba(38, 67, 48, 0.035);
}

.search-box:focus-within {
  border-color: rgba(43, 137, 83, 0.42);
  box-shadow: 0 0 0 3px rgba(48, 143, 88, 0.08);
}

.search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #33423a;
  font-size: 12px;
}

.search-box button {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #edf2ee;
  color: #718078;
  cursor: pointer;
  font-size: 16px;
}

.specialty-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.specialty-button {
  min-height: 31px;
  padding: 0 11px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 999px;
  background: white;
  color: #718078;
  font-size: 10px;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease, transform 180ms ease;
}

.specialty-button:hover {
  border-color: rgba(43, 137, 83, 0.3);
  transform: translateY(-1px);
}

.specialty-button.active {
  border-color: #398d5e;
  background: #e8f3eb;
  color: #287c4e;
  font-weight: 680;
}

.doctor-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.doctor-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px 185px;
  align-items: stretch;
  gap: 22px;
  padding: 23px;
  overflow: hidden;
  border: 1px solid rgba(145, 162, 151, 0.22);
  border-radius: 21px;
  background: #fffefa;
  box-shadow: 0 11px 27px rgba(35, 66, 47, 0.04);
  animation: card-enter 430ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.doctor-card::after {
  position: absolute;
  top: -55px;
  right: -60px;
  width: 155px;
  height: 155px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(205, 233, 210, 0.42), transparent 70%);
  content: "";
  pointer-events: none;
}

.doctor-card:hover {
  border-color: rgba(55, 139, 86, 0.31);
  box-shadow: 0 18px 40px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.doctor-profile {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.doctor-avatar-wrap {
  position: relative;
  align-self: start;
  width: max-content;
}

.doctor-avatar {
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 26px;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: 30px;
  font-weight: 680;
  box-shadow: 0 10px 20px rgba(50, 75, 60, 0.08);
}

.doctor-avatar.small {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  font-size: 21px;
}

.verified-badge {
  position: absolute;
  right: -6px;
  bottom: -5px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 3px solid #fffefa;
  border-radius: 50%;
  background: #2e8c59;
  color: white;
  box-shadow: 0 5px 12px rgba(37, 127, 75, 0.2);
}

.compact .verified-badge {
  width: 24px;
  height: 24px;
  right: -5px;
  bottom: -4px;
}

.doctor-main {
  min-width: 0;
}

.doctor-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.doctor-eyebrow {
  color: #518269;
  font-size: 8px;
  font-weight: 740;
  letter-spacing: 0.12em;
}

.doctor-title-row h3 {
  margin: 5px 0 0;
  color: #293b31;
  font-size: 20px;
  font-weight: 720;
}

.doctor-title-row p {
  margin: 5px 0 0;
  color: #748078;
  font-size: 11px;
}

.doctor-introduction {
  display: -webkit-box;
  max-width: 620px;
  margin: 12px 0 0;
  overflow: hidden;
  color: #768078;
  font-size: 11px;
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.specialty-tags span {
  padding: 5px 9px;
  border: 1px solid rgba(63, 122, 84, 0.08);
  border-radius: 999px;
  background: #eaf2eb;
  color: #426c52;
  font-size: 9px;
}

.doctor-service {
  position: relative;
  z-index: 2;
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 0 20px;
  border-left: 1px solid #e5e9e5;
  border-right: 1px solid #e5e9e5;
}

.service-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.service-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #edf4ef;
  color: #39855a;
}

.service-item > span:last-child {
  display: grid;
  min-width: 0;
}

.service-item small {
  color: #929b95;
  font-size: 8px;
}

.service-item strong {
  margin-top: 3px;
  overflow: hidden;
  color: #385744;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doctor-actions {
  position: relative;
  z-index: 2;
  display: grid;
  align-content: center;
  gap: 10px;
}

.detail-button,
.choose-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 41px;
  padding: 0 12px;
  border-radius: 11px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.detail-button {
  border: 1px solid rgba(70, 98, 82, 0.17);
  background: #f9fbf8;
  color: #3c5948;
}

.choose-button {
  border: 1px solid #256f48;
  background: linear-gradient(150deg, #398d5e, #246b46);
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.detail-button:hover,
.choose-button:hover {
  transform: translateY(-2px);
}

.doctor-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  color: #849088;
  font-size: 10px;
  text-align: center;
}

.dialog-head {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dialog-head h3 {
  margin: 5px 0 0;
  color: #2b3c32;
  font-size: 20px;
}

.dialog-head p {
  margin: 5px 0 0;
  color: #7b857e;
  font-size: 11px;
}

.dialog-summary {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid rgba(69, 145, 93, 0.18);
  border-radius: 14px;
  background: #f0f7f2;
}

.dialog-summary > span {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: #dceee1;
  color: #2d8554;
}

.dialog-summary strong {
  color: #31513d;
  font-size: 12px;
}

.dialog-summary p {
  margin: 5px 0 0;
  color: #768179;
  font-size: 10px;
  line-height: 1.6;
}

.dialog-section {
  padding: 18px 0;
  border-bottom: 1px solid #e5e9e5;
}

.dialog-section:last-child { border-bottom: 0; }
.dialog-section > span { color: #3f7058; font-size: 10px; font-weight: 700; }
.dialog-section > p { margin: 9px 0 0; color: #6f7b73; font-size: 12px; line-height: 1.8; }
.dialog-tags { margin-top: 10px; }

.dialog-service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-top: 11px;
}

.dialog-service-grid div {
  padding: 12px;
  border: 1px solid rgba(137, 155, 143, 0.17);
  border-radius: 12px;
  background: #fafcf9;
}

.dialog-service-grid b {
  color: #2e8756;
  font-size: 10px;
}

.dialog-service-grid p {
  margin: 6px 0 0;
  color: #738078;
  font-size: 9px;
  line-height: 1.55;
}

.dialog-close,
.dialog-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 15px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 680;
  cursor: pointer;
}

.dialog-close {
  border: 1px solid rgba(70, 98, 82, 0.17);
  background: #fafcf9;
  color: #52655a;
}

.dialog-primary {
  border: 1px solid #267149;
  background: #28774d;
  color: white;
}

:deep(.doctor-dialog) {
  overflow: hidden;
  border-radius: 22px;
  background: #fffefa;
  box-shadow: 0 28px 80px rgba(30, 58, 40, 0.18);
}

:deep(.doctor-dialog .el-dialog__header) {
  margin: 0;
  padding: 24px 25px 18px;
  border-bottom: 1px solid #e8ece8;
}

:deep(.doctor-dialog .el-dialog__body) {
  padding: 20px 25px 8px;
}

:deep(.doctor-dialog .el-dialog__footer) {
  padding: 17px 25px 22px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes doctor-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes glass-shine {
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

@keyframes cross-float {
  0%, 100% { opacity: 0.2; translate: 0 0; }
  50% { opacity: 0.38; translate: 4px -6px; }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@keyframes skeleton {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@keyframes spin { to { transform: rotate(360deg); } }

.doctor-skeleton-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.doctor-skeleton {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) 220px;
  align-items: center;
  gap: 20px;
  padding: 23px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 21px;
}

.skeleton-avatar,
.skeleton-copy span,
.skeleton-meta {
  background: linear-gradient(90deg, #edf1ed 25%, #f7f9f7 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.skeleton-avatar {
  width: 82px;
  height: 82px;
  border-radius: 26px;
}

.skeleton-copy {
  display: grid;
  gap: 10px;
}

.skeleton-copy span {
  height: 10px;
  border-radius: 999px;
}

.skeleton-copy span:nth-child(1) { width: 28%; }
.skeleton-copy span:nth-child(2) { width: 55%; }
.skeleton-copy span:nth-child(3) { width: 76%; }
.skeleton-meta { height: 82px; border-radius: 15px; }

@media (max-width: 1100px) {
  .doctors-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .doctors-hero h1 {
    font-size: clamp(38px, 4vw, 50px);
  }

  .doctor-stage { right: 3%; }

  .doctor-card {
    grid-template-columns: minmax(0, 1fr) 205px;
  }

  .doctor-actions {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .doctors-hero {
    grid-template-columns: 1fr;
    min-height: 235px;
  }

  .doctors-hero h1 { white-space: normal; }
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

  .review-guide {
    grid-template-columns: 50px minmax(0, 1fr) auto;
  }

  .guide-steps { display: none; }

  .doctor-card {
    grid-template-columns: 1fr;
  }

  .doctor-service {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 16px 0;
    border: 0;
    border-top: 1px solid #e5e9e5;
    border-bottom: 1px solid #e5e9e5;
  }
}

@media (max-width: 720px) {
  .doctors-page { gap: 14px; }

  .doctors-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .doctors-hero h1 {
    font-size: clamp(34px, 10vw, 47px);
  }

  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .doctor-overview { grid-template-columns: 1fr; }

  .review-guide {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 18px;
  }

  .guide-link { grid-column: 2; }

  .doctor-directory {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .directory-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .doctor-profile {
    grid-template-columns: 72px minmax(0, 1fr);
    align-items: flex-start;
  }

  .doctor-avatar {
    width: 68px;
    height: 68px;
    border-radius: 21px;
    font-size: 25px;
  }

  .doctor-title-row {
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .doctors-hero { padding: 26px 20px; }
  .doctors-hero p { font-size: 13px; }
  .hero-actions a,
  .hero-actions button { flex: 1; }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 17px;
  }

  .overview-icon { width: 44px; height: 44px; }

  .doctor-card { padding: 17px; }

  .doctor-profile {
    grid-template-columns: 1fr;
  }

  .doctor-avatar-wrap { margin-bottom: 3px; }

  .doctor-service {
    grid-template-columns: 1fr;
  }

  .doctor-actions {
    grid-template-columns: 1fr;
  }

  .dialog-service-grid {
    grid-template-columns: 1fr;
  }

  :deep(.doctor-dialog) {
    width: calc(100vw - 28px) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doctors-hero,
  .overview-card,
  .review-guide,
  .doctor-directory,
  .doctor-card,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .medical-cross,
  .doctor-stage,
  .doctor-glass::after,
  .skeleton-avatar,
  .skeleton-copy span,
  .skeleton-meta,
  .spinning {
    animation: none;
  }

  .primary-action,
  .ghost-action,
  .specialty-button,
  .doctor-card,
  .detail-button,
  .choose-button {
    transition: none;
  }

  .primary-action:hover,
  .ghost-action:hover,
  .specialty-button:hover,
  .doctor-card:hover,
  .detail-button:hover,
  .choose-button:hover {
    transform: none;
  }
}
</style>
