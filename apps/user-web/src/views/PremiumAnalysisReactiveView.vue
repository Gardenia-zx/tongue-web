<template>
  <div class="analysis-home-page">
    <PremiumAnalysisView class="home-dashboard" :show-assistant="false" />

    <section class="assistant-shell replacement-assistant">
      <div class="assistant-ambient" aria-hidden="true">
        <span class="ambient-grid" />
        <span class="ambient-orbit orbit-a" />
        <span class="ambient-orbit orbit-b" />
        <span class="ambient-dot dot-a" />
        <span class="ambient-dot dot-b" />
      </div>

      <header class="assistant-heading">
        <div class="assistant-title-group">
          <span class="assistant-icon"><MessagesSquare :size="22" /></span>
          <div>
            <span class="page-kicker">PERSONAL HEALTH ASSISTANT</span>
            <h2>继续提问，或上传一张新的舌象照片</h2>
            <p>助手会结合当前对话、报告与已授权的个人健康信息，提供可追问的结构化回答。</p>
          </div>
        </div>

        <div class="assistant-status">
          <span><i />在线服务</span>
          <small><ShieldCheck :size="14" /> 健康信息受保护</small>
        </div>
      </header>

      <div class="assistant-divider">
        <span>AI HEALTH CONVERSATION</span>
      </div>

      <AnalysisChatView />
    </section>
  </div>
</template>

<script setup lang="ts">
import { MessagesSquare, ShieldCheck } from "lucide-vue-next";
import PremiumAnalysisView from "./PremiumAnalysisView.vue";
import AnalysisChatView from "./AnalysisChatView.vue";
</script>

<style scoped>
.analysis-home-page {
  display: grid;
  gap: 18px;
}

.home-dashboard {
  order: 1;
}

.assistant-shell {
  position: relative;
  order: 2;
  width: min(1220px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(137, 155, 143, 0.22);
  border-radius: 25px;
  background:
    radial-gradient(circle at 100% 0%, rgba(206, 232, 212, 0.48), transparent 29%),
    rgba(255, 255, 253, 0.96);
  box-shadow: 0 18px 46px rgba(35, 66, 47, 0.065);
  animation: reveal-up 560ms 260ms ease-out both;
}

.analysis-home-page :deep(.home-dashboard > .assistant-shell) {
  display: none;
}

.assistant-ambient {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 180px;
  overflow: hidden;
  pointer-events: none;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.045) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(90deg, transparent, black 35%);
  animation: grid-drift 16s linear infinite alternate;
}

.ambient-orbit {
  position: absolute;
  right: 30px;
  border: 1px dashed rgba(52, 139, 82, 0.2);
  border-radius: 50%;
}

.orbit-a {
  top: 32px;
  width: 210px;
  height: 78px;
  transform: rotate(10deg);
  animation: orbit-float 7s ease-in-out infinite;
}

.orbit-b {
  top: 51px;
  right: 63px;
  width: 155px;
  height: 92px;
  transform: rotate(-15deg);
  animation: orbit-float-alt 8.5s ease-in-out infinite;
}

.ambient-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #83c999;
  box-shadow: 0 0 0 6px rgba(131, 201, 153, 0.13);
  animation: dot-pulse 3s ease-in-out infinite;
}

.dot-a { top: 39px; right: 64px; }
.dot-b { top: 118px; right: 225px; animation-delay: 1s; }

.assistant-heading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 27px 29px 20px;
}

.assistant-title-group {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.assistant-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(145deg, #3f9565, #27764f);
  color: white;
  box-shadow: 0 10px 20px rgba(39, 118, 79, 0.2);
}

.page-kicker {
  display: block;
  color: #43805f;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.assistant-heading h2 {
  margin: 7px 0 0;
  color: #26382e;
  font-size: 22px;
  font-weight: 690;
  letter-spacing: -0.03em;
}

.assistant-heading p {
  margin: 7px 0 0;
  color: #818c85;
  font-size: 10px;
  line-height: 1.65;
}

.assistant-status {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: end;
  gap: 8px;
}

.assistant-status > span,
.assistant-status > small {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.assistant-status > span {
  color: #397354;
  font-size: 10px;
  font-weight: 680;
}

.assistant-status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #42a66d;
  box-shadow: 0 0 0 5px rgba(66, 166, 109, 0.12);
  animation: status-pulse 2.6s ease-in-out infinite;
}

.assistant-status > small {
  color: #819087;
  font-size: 9px;
}

.assistant-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 29px;
  color: #8b958f;
  font-size: 8px;
  letter-spacing: 0.14em;
}

.assistant-divider::before,
.assistant-divider::after {
  height: 1px;
  flex: 1;
  background: rgba(137, 155, 143, 0.18);
  content: "";
}

.assistant-shell :deep(.analysis-chat-view),
.assistant-shell :deep(.analysis-chat-page) {
  border: 0;
  box-shadow: none;
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 18px 12px, 18px 12px; }
}

@keyframes orbit-float {
  0%, 100% { transform: rotate(10deg) translateY(0); }
  50% { transform: rotate(14deg) translateY(-5px); }
}

@keyframes orbit-float-alt {
  0%, 100% { transform: rotate(-15deg) translateY(0); }
  50% { transform: rotate(-20deg) translateY(5px); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.65; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 5px rgba(66, 166, 109, 0.1); }
  50% { box-shadow: 0 0 0 9px rgba(66, 166, 109, 0); }
}

@media (max-width: 760px) {
  .assistant-shell {
    border-radius: 20px;
  }

  .assistant-heading {
    align-items: flex-start;
    flex-direction: column;
    padding: 22px 20px 16px;
  }

  .assistant-title-group {
    grid-template-columns: 43px minmax(0, 1fr);
  }

  .assistant-icon {
    width: 43px;
    height: 43px;
  }

  .assistant-heading h2 {
    font-size: 18px;
  }

  .assistant-status {
    justify-items: start;
  }

  .assistant-divider {
    padding-inline: 20px;
  }

  .assistant-ambient {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-shell,
  .ambient-grid,
  .ambient-orbit,
  .ambient-dot,
  .assistant-status i {
    animation: none;
  }
}
</style>
