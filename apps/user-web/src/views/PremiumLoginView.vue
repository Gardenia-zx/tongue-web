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
  padding: clamp(18px, 4vw, 48px) !important;
  background:
    radial-gradient(circle at 5% 0, rgba(213, 225, 216, 0.9), transparent 34rem),
    radial-gradient(circle at 100% 100%, rgba(227, 218, 199, 0.72), transparent 36rem),
    var(--th-bg) !important;
}

:deep(.login-panel) {
  position: relative;
  grid-template-columns: minmax(0, 1.12fr) minmax(360px, 0.88fr) !important;
  width: min(1060px, 100%) !important;
  overflow: hidden;
  border: 1px solid rgba(185, 194, 184, 0.76) !important;
  border-radius: 30px !important;
  background: rgba(251, 250, 247, 0.92) !important;
  box-shadow: 0 34px 90px rgba(45, 61, 51, 0.15) !important;
  backdrop-filter: blur(20px);
}

:deep(.login-copy) {
  display: flex;
  min-height: 620px;
  flex-direction: column;
  justify-content: center;
  padding: clamp(38px, 5vw, 64px) !important;
  border-right: 1px solid rgba(185, 194, 184, 0.66) !important;
  background:
    linear-gradient(155deg, rgba(255, 254, 253, 0.76), rgba(226, 235, 229, 0.62)),
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
  box-shadow: 0 14px 32px rgba(41, 72, 58, 0.2);
}

:deep(.login-copy::before) {
  content: "PERSONAL WELLNESS";
  display: block;
  margin: 28px 0 16px;
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

:deep(.login-copy h1) {
  max-width: 600px;
  margin: 0 0 18px !important;
  font-size: clamp(40px, 5vw, 58px) !important;
  font-weight: 580;
  letter-spacing: -0.055em;
  line-height: 1.08;
  text-wrap: balance;
}

:deep(.login-copy h1::after) {
  content: "\A让每一次观察，都沉淀为长期记录。";
  white-space: pre;
  color: var(--th-primary);
}

:deep(.login-copy p) {
  max-width: 54ch;
  color: var(--th-text-muted) !important;
  font-size: 15px;
  line-height: 1.85 !important;
  text-wrap: pretty;
}

:deep(.login-form) {
  padding: clamp(34px, 5vw, 54px) !important;
}

:deep(.login-form::before) {
  content: "登录个人健康空间";
  display: block;
  margin-bottom: 26px;
  color: var(--th-text);
  font-size: 27px;
  font-weight: 620;
  letter-spacing: -0.04em;
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
  grid-template-columns: minmax(0, 1fr) 108px !important;
  gap: 9px !important;
}

:deep(.login-button) {
  min-height: 50px;
  margin-top: 6px;
  border-radius: 14px !important;
  box-shadow: 0 12px 28px rgba(41, 72, 58, 0.18);
}

:deep(.dev-code) {
  color: var(--th-primary) !important;
}

@media (max-width: 820px) {
  :deep(.login-panel) {
    grid-template-columns: 1fr !important;
  }

  :deep(.login-copy) {
    min-height: auto;
    padding: 28px !important;
    border-right: 0 !important;
    border-bottom: 1px solid var(--th-border);
  }

  :deep(.login-copy h1) {
    font-size: 38px !important;
  }
}

@media (max-width: 520px) {
  :deep(.login-page) {
    padding: 10px !important;
  }

  :deep(.login-panel) {
    border-radius: 22px !important;
  }

  :deep(.login-copy) {
    padding: 24px 20px !important;
  }

  :deep(.login-copy h1) {
    font-size: 32px !important;
  }

  :deep(.login-copy h1::after) {
    content: "\A沉淀为长期记录。";
  }

  :deep(.login-copy p) {
    font-size: 13px;
  }

  :deep(.login-form) {
    padding: 30px 20px !important;
  }

  :deep(.code-row) {
    grid-template-columns: 1fr !important;
  }
}
</style>
