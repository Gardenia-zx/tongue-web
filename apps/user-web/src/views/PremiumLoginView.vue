<template>
  <LoginView />
</template>

<script setup lang="ts">
import LoginView from "./LoginView.vue";
</script>

<style scoped>
:deep(.login-page) {
  position: relative;
  overflow: hidden;
  min-height: 100dvh !important;
  padding: clamp(16px, 3vw, 36px) !important;
  background:
    radial-gradient(circle at 5% 0, rgba(213, 225, 216, 0.86), transparent 32rem),
    radial-gradient(circle at 100% 100%, rgba(227, 218, 199, 0.66), transparent 34rem),
    var(--th-bg) !important;
}

:deep(.login-panel) {
  position: relative;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px) !important;
  width: min(1040px, 100%) !important;
  min-height: 580px;
  overflow: hidden;
  border: 1px solid rgba(185, 194, 184, 0.76) !important;
  border-radius: 28px !important;
  background: rgba(251, 250, 247, 0.94) !important;
  box-shadow: 0 30px 78px rgba(45, 61, 51, 0.14) !important;
  backdrop-filter: blur(18px);
}

:deep(.login-copy) {
  display: flex;
  min-width: 0;
  min-height: 580px;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: clamp(36px, 5vw, 62px) !important;
  border-right: 1px solid rgba(185, 194, 184, 0.66) !important;
  background:
    linear-gradient(155deg, rgba(255, 254, 253, 0.78), rgba(226, 235, 229, 0.62)),
    var(--th-surface) !important;
}

:deep(.brand-mark) {
  width: 48px !important;
  height: 48px !important;
  border-radius: 15px !important;
  background: var(--th-primary-dark) !important;
  color: white !important;
  font-size: 17px;
  font-weight: 650 !important;
  box-shadow: 0 12px 28px rgba(41, 72, 58, 0.18);
}

:deep(.login-copy::before) {
  content: "PERSONAL WELLNESS";
  display: block;
  order: -1;
  margin-bottom: 22px;
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

:deep(.login-copy h1) {
  max-width: 11em;
  margin: 22px 0 16px !important;
  font-size: clamp(38px, 4.2vw, 50px) !important;
  font-weight: 590;
  letter-spacing: -0.05em;
  line-height: 1.12;
  text-wrap: balance;
}

:deep(.login-copy p) {
  max-width: 46ch;
  color: var(--th-text-muted) !important;
  font-size: 14px;
  line-height: 1.82 !important;
  text-wrap: pretty;
}

:deep(.login-form) {
  align-self: center;
  width: 100%;
  padding: clamp(34px, 4vw, 52px) !important;
}

:deep(.login-form::before) {
  content: "登录个人健康空间";
  display: block;
  margin-bottom: 28px;
  color: var(--th-text);
  font-size: clamp(24px, 2.4vw, 30px);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1.2;
}

:deep(.login-form .el-form-item) {
  margin-bottom: 22px;
}

:deep(.login-form .el-form-item__label) {
  color: var(--th-text-soft, #46534b);
  font-size: 12px;
  font-weight: 650;
}

:deep(.login-form .el-input__wrapper) {
  min-height: 46px;
}

:deep(.code-row) {
  grid-template-columns: minmax(0, 1fr) 104px !important;
  gap: 9px !important;
}

:deep(.login-button) {
  min-height: 50px;
  margin-top: 2px;
  border-radius: 14px !important;
  box-shadow: 0 12px 28px rgba(41, 72, 58, 0.18);
}

:deep(.dev-code) {
  color: var(--th-primary) !important;
}

@media (max-width: 820px) {
  :deep(.login-panel) {
    grid-template-columns: 1fr !important;
    min-height: auto;
  }

  :deep(.login-copy) {
    min-height: auto;
    padding: 30px !important;
    border-right: 0 !important;
    border-bottom: 1px solid var(--th-border);
  }

  :deep(.login-copy::before) {
    margin-bottom: 16px;
  }

  :deep(.login-copy h1) {
    margin-top: 18px !important;
    font-size: 36px !important;
  }
}

@media (max-width: 520px) {
  :deep(.login-page) {
    padding: 8px !important;
  }

  :deep(.login-panel) {
    border-radius: 20px !important;
  }

  :deep(.login-copy) {
    padding: 24px 20px !important;
  }

  :deep(.login-copy h1) {
    font-size: 30px !important;
  }

  :deep(.login-copy p) {
    font-size: 13px;
  }

  :deep(.login-form) {
    padding: 28px 20px !important;
  }

  :deep(.code-row) {
    grid-template-columns: 1fr !important;
  }
}
</style>
