<template>
  <AnalysisV2View />
</template>

<script setup lang="ts">
import AnalysisV2View from "./AnalysisV2View.vue";
</script>

<style scoped>
:deep(.chat-page) {
  min-height: calc(100dvh - 116px) !important;
  margin: -12px 0 -28px !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.chat-scroll) {
  height: calc(100dvh - 116px) !important;
  padding: clamp(30px, 4vw, 48px) clamp(12px, 3vw, 36px) 180px !important;
}

:deep(.thread) {
  width: min(900px, 100%) !important;
  gap: 28px !important;
}

:deep(.welcome) {
  position: relative;
  width: min(650px, 100%);
  min-height: 55vh !important;
  margin: 0 auto;
  text-align: center !important;
}

:deep(.welcome::before) {
  content: "AI HEALTH COMPANION";
  display: block;
  margin-bottom: 16px;
  color: var(--th-primary);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

:deep(.welcome-mark) {
  width: 44px !important;
  height: 44px !important;
  margin-bottom: 18px !important;
  border: 1px solid rgba(63, 101, 82, 0.18) !important;
  border-radius: 14px !important;
  background: var(--th-primary-dark) !important;
  color: #f8faf7 !important;
  box-shadow: 0 12px 28px rgba(41, 72, 58, 0.16);
}

:deep(.welcome h1) {
  max-width: 620px;
  margin: 0 auto !important;
  color: var(--th-text);
  font-size: clamp(32px, 4vw, 46px) !important;
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 1.12;
  text-wrap: balance;
}

:deep(.welcome p) {
  max-width: 48ch;
  margin: 18px auto 0 !important;
  color: var(--th-text-muted) !important;
  font-size: 15px;
  line-height: 1.75;
  text-wrap: pretty;
}

:deep(.message-row) {
  grid-template-columns: 38px minmax(0, 1fr) !important;
  gap: 12px !important;
}

:deep(.message-row.user) {
  grid-template-columns: minmax(0, 1fr) 38px !important;
}

:deep(.message-avatar) {
  width: 38px !important;
  height: 38px !important;
  border: 1px solid rgba(185, 194, 184, 0.72) !important;
  border-radius: 13px !important;
  background: rgba(255, 254, 253, 0.88) !important;
  color: var(--th-primary-dark) !important;
  box-shadow: 0 6px 18px rgba(45, 61, 51, 0.05);
}

:deep(.message-row.user .message-avatar) {
  border-color: rgba(41, 72, 58, 0.14) !important;
  background: var(--th-primary-dark) !important;
  color: white !important;
}

:deep(.message-main) {
  max-width: min(740px, 100%) !important;
}

:deep(.message-bubble) {
  position: relative;
  padding: 20px 22px 22px !important;
  border: 1px solid rgba(185, 194, 184, 0.62) !important;
  border-radius: 21px 21px 21px 7px !important;
  background: rgba(255, 254, 253, 0.9) !important;
  box-shadow: 0 10px 30px rgba(45, 61, 51, 0.055) !important;
}

:deep(.message-row.assistant .message-bubble::before) {
  content: "健康助手 · 日常健康参考";
  display: block;
  margin-bottom: 13px;
  padding-bottom: 11px;
  border-bottom: 1px solid rgba(216, 221, 213, 0.78);
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 680;
  letter-spacing: 0.04em;
}

:deep(.message-row.user .message-bubble) {
  padding: 12px 16px !important;
  border: 1px solid rgba(63, 101, 82, 0.14) !important;
  border-radius: 17px 17px 7px 17px !important;
  background: var(--th-primary-soft) !important;
  color: var(--th-primary-dark) !important;
  box-shadow: none !important;
}

:deep(.message-bubble p) {
  max-width: 66ch;
  color: var(--th-text-soft, #46534b);
  font-size: 15px !important;
  line-height: 1.82 !important;
  letter-spacing: -0.006em;
  text-wrap: pretty;
}

:deep(.message-row.user .message-bubble p) {
  color: var(--th-primary-dark);
  line-height: 1.68 !important;
}

:deep(.message-bubble.failed) {
  border-color: rgba(157, 81, 76, 0.26) !important;
  background: #fff9f7 !important;
}

:deep(.message-image) {
  border: 6px solid rgba(255, 254, 253, 0.82);
  border-radius: 18px !important;
  background: var(--th-surface-soft) !important;
  box-shadow: var(--th-shadow-sm);
}

:deep(.task-card) {
  margin-top: 14px !important;
  padding: 14px 15px !important;
  border: 1px solid rgba(185, 194, 184, 0.6) !important;
  border-radius: 14px !important;
  background: var(--th-surface-soft) !important;
}

:deep(.actions) {
  margin-top: 14px !important;
}

:deep(.actions .el-button) {
  min-height: 38px;
  border-color: rgba(63, 101, 82, 0.24);
  border-radius: 11px;
  background: transparent;
  color: var(--th-primary-dark);
}

:deep(.actions .el-button:hover) {
  background: var(--th-primary-soft);
}

:deep(.composer-wrap) {
  padding: 36px clamp(8px, 3vw, 24px) 18px !important;
  background: linear-gradient(180deg, rgba(241, 242, 237, 0), rgba(241, 242, 237, 0.88) 40%, rgba(241, 242, 237, 0.98)) !important;
}

:deep(.composer) {
  width: min(860px, 100%) !important;
  padding: 8px !important;
  border: 1px solid rgba(185, 194, 184, 0.78) !important;
  border-radius: 18px !important;
  background: rgba(255, 254, 253, 0.94) !important;
  box-shadow: 0 16px 42px rgba(45, 61, 51, 0.12) !important;
  backdrop-filter: blur(16px);
}

:deep(.attachment) {
  margin-bottom: 8px !important;
  padding: 8px !important;
  border-radius: 13px !important;
  background: var(--th-surface-soft) !important;
}

:deep(.report-context-hint) {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 1px 5px 8px !important;
  padding: 5px 8px;
  border-radius: 8px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark) !important;
  font-size: 10px !important;
}

:deep(.input-row) {
  grid-template-columns: 46px minmax(0, 1fr) 44px !important;
  gap: 5px !important;
}

:deep(.image-upload-button) {
  width: 46px;
  height: 44px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 13px !important;
  background: transparent !important;
  color: var(--th-text-muted) !important;
}

:deep(.image-upload-button span span) {
  display: none;
}

:deep(.image-upload-button:hover) {
  background: var(--th-primary-soft) !important;
  color: var(--th-primary-dark) !important;
}

:deep(.send-button) {
  width: 44px !important;
  height: 44px !important;
  border-radius: 13px !important;
  background: var(--th-primary-dark) !important;
  box-shadow: 0 7px 18px rgba(41, 72, 58, 0.18);
}

:deep(.send-button:hover) {
  background: var(--th-primary) !important;
}

:deep(.prompt-input .el-textarea__inner) {
  min-height: 44px !important;
  padding: 10px 7px !important;
  background: transparent !important;
  color: var(--th-text);
  font-size: 14px !important;
}

:deep(.prompt-input .el-textarea__inner::placeholder) {
  color: #8a958e;
}

@media (max-width: 760px) {
  :deep(.chat-page),
  :deep(.chat-scroll) {
    min-height: calc(100dvh - 92px) !important;
    height: calc(100dvh - 92px) !important;
  }

  :deep(.chat-page) {
    margin: -8px 0 -24px !important;
  }

  :deep(.chat-scroll) {
    padding: 24px 8px 168px !important;
  }

  :deep(.welcome) {
    min-height: 50vh !important;
  }

  :deep(.welcome h1) {
    font-size: 30px !important;
  }

  :deep(.welcome p) {
    font-size: 14px;
  }

  :deep(.message-row) {
    grid-template-columns: 31px minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  :deep(.message-row.user) {
    grid-template-columns: minmax(0, 1fr) 31px !important;
  }

  :deep(.message-avatar) {
    width: 31px !important;
    height: 31px !important;
    border-radius: 10px !important;
  }

  :deep(.message-bubble) {
    padding: 17px !important;
    border-radius: 18px 18px 18px 7px !important;
  }

  :deep(.message-row.user .message-bubble) {
    max-width: 92%;
    padding: 11px 13px !important;
  }

  :deep(.composer-wrap) {
    padding: 28px 4px 8px !important;
  }

  :deep(.composer) {
    border-radius: 16px !important;
  }
}
</style>
