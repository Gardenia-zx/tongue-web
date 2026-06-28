<template>
  <main class="wellness-landing">
    <div class="ambient ambient-left" aria-hidden="true" />
    <div class="ambient ambient-right" aria-hidden="true" />
    <div class="grain" aria-hidden="true" />

    <header class="site-header">
      <div class="brand-lockup" aria-label="舌知健康">
        <span class="brand-symbol" aria-hidden="true">
          <span class="symbol-orbit" />
          <span class="symbol-core" />
        </span>
        <span class="brand-copy">
          <strong>舌知健康</strong>
          <small>TONGUE WELLNESS</small>
        </span>
      </div>

      <el-button class="login-entry" type="primary" @click="dialogVisible = true">
        登录
      </el-button>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <p class="hero-kicker">AI-POWERED TONGUE HEALTH</p>

      <h1 id="hero-title">
        以舌象为镜，
        <span>读懂身体的细微变化</span>
      </h1>

      <div class="signal-stage" aria-label="舌象健康能力展示">
        <div class="signal-orbit" aria-hidden="true">
          <span class="orbit orbit-one" />
          <span class="orbit orbit-two" />
          <span class="signal-core" />
        </div>

        <Transition name="signal-copy" mode="out-in">
          <div :key="activeSignal.title" class="signal-copy">
            <span>{{ activeSignal.eyebrow }}</span>
            <strong>{{ activeSignal.title }}</strong>
          </div>
        </Transition>
      </div>

      <p class="hero-description">
        融合舌象识别、智能报告解读与健康趋势追踪，
        为您提供持续、清晰、可信的个性化健康参考。
      </p>

      <span class="quote-mark" aria-hidden="true">“</span>
    </section>

    <el-dialog
      v-model="dialogVisible"
      class="cascaid-login-dialog"
      width="430px"
      align-center
      append-to-body
      destroy-on-close
      :show-close="true"
    >
      <template #header>
        <div class="dialog-heading">
          <span>登录健康空间</span>
          <small>继续查看您的舌象报告与健康趋势</small>
        </div>
      </template>

      <el-form class="login-form" label-position="top" @submit.prevent>
        <el-form-item label="手机号">
          <el-input
            v-model="phone"
            autocomplete="tel"
            maxlength="20"
            placeholder="请输入手机号"
            size="large"
          />
        </el-form-item>

        <el-form-item label="验证码">
          <div class="code-row">
            <el-input
              v-model="code"
              autocomplete="one-time-code"
              maxlength="12"
              placeholder="请输入验证码"
              size="large"
              @keyup.enter="login"
            />
            <el-button
              native-type="button"
              size="large"
              :loading="auth.loading"
              @click="sendCode"
            >
              发送验证码
            </el-button>
          </div>
          <p v-if="auth.devCode" class="dev-code">开发验证码：{{ auth.devCode }}</p>
        </el-form-item>

        <el-button
          class="submit-login"
          native-type="button"
          type="primary"
          size="large"
          :loading="auth.loading"
          @click="login"
        >
          进入舌知健康
        </el-button>
      </el-form>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@tongue/shared";

interface HeroSignal {
  eyebrow: string;
  title: string;
}

const heroSignals: HeroSignal[] = [
  { eyebrow: "01 · 视觉识别", title: "捕捉舌象特征" },
  { eyebrow: "02 · 智能解读", title: "生成结构化健康报告" },
  { eyebrow: "03 · 持续追踪", title: "观察每一次细微变化" },
];

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const dialogVisible = ref(false);
const phone = ref("");
const code = ref("");
const activeSignalIndex = ref(0);
let signalTimer: number | undefined;

const activeSignal = computed(() => heroSignals[activeSignalIndex.value]);

onMounted(() => {
  signalTimer = window.setInterval(() => {
    activeSignalIndex.value = (activeSignalIndex.value + 1) % heroSignals.length;
  }, 2800);
});

onBeforeUnmount(() => {
  if (signalTimer) window.clearInterval(signalTimer);
});

async function sendCode() {
  const normalizedPhone = phone.value.trim();
  if (!normalizedPhone) {
    ElMessage.warning("请先输入手机号");
    return;
  }

  try {
    await auth.sendSms(normalizedPhone);
    ElMessage.success("验证码已发送");
  } catch (error) {
    console.error("send sms failed", { apiBase: auth.apiBase, error });
    ElMessage.error(error instanceof Error ? error.message : "验证码发送失败，请检查后端服务");
  }
}

async function login() {
  const normalizedPhone = phone.value.trim();
  const normalizedCode = code.value.trim();
  if (!normalizedPhone || !normalizedCode) {
    ElMessage.warning("请输入手机号和验证码");
    return;
  }

  try {
    await auth.login(normalizedPhone, normalizedCode);
    dialogVisible.value = false;
    await router.replace(String(route.query.redirect || "/analysis"));
  } catch (error) {
    console.error("login failed", { apiBase: auth.apiBase, error });
    ElMessage.error(error instanceof Error ? error.message : "登录失败，请检查验证码或后端服务");
  }
}
</script>

<style scoped>
.wellness-landing {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  color: #202420;
  background:
    radial-gradient(circle at 48% 42%, rgba(255, 255, 255, 0.98) 0, rgba(247, 250, 249, 0.88) 28%, transparent 57%),
    linear-gradient(115deg, #eef2f4 0%, #f5f8f7 48%, #e8eff0 100%);
}

.site-header {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1280px, calc(100% - 80px));
  margin: 0 auto;
  padding-top: 30px;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 13px;
}

.brand-symbol {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 34px;
}

.symbol-orbit,
.symbol-core {
  position: absolute;
  display: block;
  border-radius: 999px;
}

.symbol-orbit {
  inset: 2px;
  border: 2px solid #173d2d;
  border-right-color: transparent;
  transform: rotate(-34deg);
}

.symbol-core {
  top: 9px;
  left: 9px;
  width: 16px;
  height: 16px;
  background: #173d2d;
  box-shadow: 9px -8px 0 -5px #173d2d;
}

.brand-copy {
  display: grid;
  gap: 2px;
}

.brand-copy strong {
  font-size: 23px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.brand-copy small {
  color: #6c7670;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

.login-entry {
  min-width: 96px;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: #194c32;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.08em;
  box-shadow: 0 10px 26px rgba(24, 70, 47, 0.16);
}

.login-entry:hover,
.login-entry:focus-visible {
  background: #246141;
  transform: translateY(-1px);
}

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: calc(100vh - 104px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 40px 86px;
  text-align: center;
}

.hero-kicker {
  margin: 0 0 28px;
  color: #3d6854;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.28em;
}

.hero h1 {
  max-width: 1240px;
  margin: 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", STSong, serif;
  font-size: clamp(58px, 6.25vw, 100px);
  font-weight: 430;
  letter-spacing: -0.055em;
  line-height: 1.23;
  text-wrap: balance;
}

.hero h1 span {
  display: block;
}

.signal-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 320px;
  min-height: 120px;
  margin-top: 32px;
}

.signal-orbit {
  position: absolute;
  top: 2px;
  left: 50%;
  width: 46px;
  height: 46px;
  transform: translateX(-50%);
}

.orbit,
.signal-core {
  position: absolute;
  border-radius: 999px;
}

.orbit-one {
  inset: 0;
  border: 2px solid rgba(31, 54, 44, 0.86);
  border-top-color: transparent;
  animation: orbit-spin 4s linear infinite;
}

.orbit-two {
  inset: 8px;
  border: 1px solid rgba(31, 54, 44, 0.34);
  border-left-color: transparent;
  animation: orbit-spin-reverse 2.8s linear infinite;
}

.signal-core {
  inset: 19px;
  background: #1f362c;
  animation: core-pulse 1.9s ease-in-out infinite;
}

.signal-copy {
  display: grid;
  gap: 5px;
  margin-top: 58px;
}

.signal-copy span {
  color: #7a847e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.signal-copy strong {
  color: #263b31;
  font-size: 15px;
  font-weight: 560;
  letter-spacing: 0.08em;
}

.hero-description {
  max-width: 650px;
  margin: 8px 0 0;
  color: #5f6863;
  font-size: 18px;
  font-weight: 380;
  line-height: 1.75;
}

.quote-mark {
  margin-top: 28px;
  color: #1f362c;
  font-family: Georgia, serif;
  font-size: 34px;
  line-height: 1;
}

.ambient {
  position: absolute;
  z-index: 0;
  width: 620px;
  height: 620px;
  border-radius: 999px;
  filter: blur(84px);
  opacity: 0.42;
  animation: ambient-drift 12s ease-in-out infinite alternate;
}

.ambient-left {
  top: -230px;
  left: -230px;
  background: rgba(197, 217, 207, 0.8);
}

.ambient-right {
  right: -250px;
  bottom: -250px;
  background: rgba(200, 220, 224, 0.78);
  animation-delay: -4s;
}

.grain {
  position: absolute;
  z-index: 1;
  inset: 0;
  opacity: 0.16;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
}

.signal-copy-enter-active,
.signal-copy-leave-active {
  transition: opacity 0.36s ease, transform 0.36s ease;
}

.signal-copy-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.signal-copy-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

:global(.cascaid-login-dialog) {
  overflow: hidden;
  border: 1px solid rgba(51, 77, 64, 0.14);
  border-radius: 22px;
  background: rgba(252, 253, 251, 0.98);
  box-shadow: 0 32px 90px rgba(24, 47, 35, 0.2);
  backdrop-filter: blur(18px);
}

:global(.cascaid-login-dialog .el-dialog__header) {
  margin: 0;
  padding: 30px 30px 12px;
}

:global(.cascaid-login-dialog .el-dialog__body) {
  padding: 12px 30px 32px;
}

.dialog-heading {
  display: grid;
  gap: 8px;
  padding-right: 28px;
}

.dialog-heading span {
  color: #1f2f27;
  font-size: 26px;
  font-weight: 620;
  letter-spacing: -0.04em;
}

.dialog-heading small {
  color: #77817b;
  font-size: 13px;
  font-weight: 400;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-form-item__label) {
  color: #45534b;
  font-size: 12px;
  font-weight: 650;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 48px;
  border-radius: 11px;
  box-shadow: 0 0 0 1px rgba(55, 78, 66, 0.16) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2e6547 inset;
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 10px;
  width: 100%;
}

.code-row .el-button {
  height: 48px;
  border-radius: 11px;
  color: #28553d;
  border-color: rgba(45, 93, 65, 0.24);
  background: #eef5f0;
  font-size: 12px;
}

.dev-code {
  margin: 8px 0 0;
  color: #2e6547;
  font-size: 12px;
}

.submit-login {
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 12px;
  background: #194c32;
  font-weight: 650;
  letter-spacing: 0.05em;
}

.submit-login:hover,
.submit-login:focus-visible {
  background: #246141;
}

@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}

@keyframes orbit-spin-reverse {
  to { transform: rotate(-360deg); }
}

@keyframes core-pulse {
  0%, 100% { opacity: 0.55; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1.18); }
}

@keyframes ambient-drift {
  from { transform: translate3d(-18px, -12px, 0) scale(0.96); }
  to { transform: translate3d(26px, 22px, 0) scale(1.06); }
}

@media (max-width: 900px) {
  .site-header {
    width: calc(100% - 40px);
  }

  .hero {
    padding-inline: 24px;
  }

  .hero h1 {
    font-size: clamp(48px, 9vw, 74px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient,
  .orbit-one,
  .orbit-two,
  .signal-core {
    animation: none;
  }

  .signal-copy-enter-active,
  .signal-copy-leave-active {
    transition: none;
  }
}
</style>
