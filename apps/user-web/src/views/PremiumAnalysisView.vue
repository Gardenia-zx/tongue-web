<template>
  <AnalysisV2View />
</template>

<script setup lang="ts">
import AnalysisV2View from "./AnalysisV2View.vue";
</script>

<style scoped>
:deep(.chat-page) {
  min-height: calc(100dvh - 164px) !important;
  margin: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(185, 194, 184, 0.68);
  border-radius: 28px;
  background:
    radial-gradient(circle at 12% 8%, rgba(226, 235, 229, 0.9), transparent 30rem),
    radial-gradient(circle at 88% 92%, rgba(226, 217, 198, 0.52), transparent 28rem),
    rgba(247, 247, 243, 0.88) !important;
  box-shadow: var(--th-shadow-sm);
}

:deep(.chat-scroll) {
  height: calc(100dvh - 164px) !important;
  padding: clamp(32px, 4vw, 58px) clamp(18px, 4vw, 56px) 196px !important;
}

:deep(.thread) {
  width: min(940px, 100%) !important;
  gap: 30px !important;
}

:deep(.welcome) {
  position: relative;
  width: min(760px, 100%);
  min-height: 59vh !important;
  margin: 0 auto;
  text-align: left !important;
}

:deep(.welcome::before) {
  content: "AI HEALTH COMPANION";
  display: block;
  margin-bottom: 18px;
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

:deep(.welcome-mark) {
  width: 48px !important;
  height: 48px !important;
  margin-bottom: 22px !important;
  border: 1px solid rgba(63, 101, 82, 0.18) !important;
  border-radius: 15px !important;
  background: var(--th-primary-dark) !important;
  color: #f8faf7 !important;
  box-shadow: 0 14px 32px rgba(41, 72, 58, 0.18);
}

:deep(.welcome h1) {
  max-width: 680px;
  margin: 0 !important;
  color: var(--th-text);
  font-size: clamp(38px, 5vw, 60px) !important;
  font-weight: 590;
  letter-spacing: -0.055em;
  line-height: 1.08;
  text-wrap: balance;
}

:deep(.welcome h1::after) {
  content: "\A让每一次观察，都变成更清晰的日常行动。";
  white-space: pre;
  color: var(--th-primary);
}

:deep(.welcome p) {
  max-width: 56ch;
  margin: 23px 0 0 !important;
  color: var(--th-text-muted) !important;
  font-size: 16px;
  line-height: 1.85;
  text-wrap: pretty;
}

:deep(.message-row) {
  grid-template-columns: 40px minmax(0, 1fr) !important;
  gap: 13px !important;
}

:deep(.message-row.user) {
  grid-template-columns: minmax(0, 1fr) 40px !important;
}

:deep(.message-avatar) {
  width: 40px !important;
  height: 40px !important;
  border: 1px solid rgba(185, 194, 184, 0.76) !important;
  border-radius: 14px !important;
  background: rgba(255, 254, 253, 0.9) !important;
  color: var(--th-primary-dark) !important;
  box-shadow: var(--th-shadow-sm);
}

:deep(.message-row.user .message-avatar) {
  border-color: rgba(41, 72, 58, 0.16) !important;
  background: var(--th-primary-dark) !important;
  color: white !important;
}

:deep(.message-main) {
  max-width: min(760px, 100%) !important;
}

:deep(.message-bubble) {
  position: relative;
  padding: 22px 24px 24px !important;
  border: 1px solid rgba(185, 194, 184, 0.7) !important;
  border-radius: 23px 23px 23px 8px !important;
  background: rgba(255, 254, 253, 0.94) !important;
  box-shadow: var(--th-shadow-sm) !important;
}

:deep(.message-row.assistant .message-bubble::before) {
  content: "健康助手  ·  日常健康参考";
  display: block;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(216, 221, 213, 0.82);
  color: var(--th-primary);
  font-size: 11px;
  font-weight: 680;
  letter-spacing: 0.05em;
}

:deep(.message-row.user .message-bubble) {
  padding: 13px 17px !important;
  border: 1px solid rgba(63, 101, 82, 0.15) !important;
  border-radius: 18px 18px 7px 18px !important;
  background: var(--th-primary-soft) !important;
  color: var(--th-primary-dark) !important;
  box-shadow: none !important;
}

:deep(.message-bubble p) {
  max-width: 68ch;
  color: var(--th-text-soft, #46534b);
  font-size: 15px !important;
  line-height: 1.92 !important;
  letter-spacing: -0.008em;
  text-wrap: pretty;
}

:deep(.message-row.user .message-bubble p) {
  color: var(--th-primary-dark);
  line-height: 1.7 !important;
}

:deep(.message-bubble.failed) {
  border-color: rgba(157, 81, 76, 0.28) !important;
  background: #fff9f7 !important;
}

:deep(.message-image) {
  border: 7px solid rgba(255, 254, 253, 0.84);
  border-radius: 19px !important;
  background: var(--th-surface-soft) !important;
  box-shadow: var(--th-shadow-sm);
}

:deep(.task-card) {
  margin-top: 15px !important;
  padding: 15px 16px !important;
  border: 1px solid rgba(185, 194, 184, 0.64) !important;
  border-radius: 15px !important;
  background: var(--th-surface-soft) !important;
}

:deep(.actions) {
  margin-top: 15px !important;
}

:deep(.actions .el-button) {
  min-height: 40px;
  border-color: rgba(63, 101, 82, 0.28);
  border-radius: 12px;
  background: transparent;
  color: var(--th-primary-dark);
}

:deep(.actions .el-button:hover) {
  background: var(--th-primary-soft);
}

:deep(.composer-wrap) {
  padding: 42px clamp(10px, 3vw, 28px) 22px !important;
  background: linear-gradient(180deg, rgba(241, 242, 237, 0), rgba(241, 242, 237, 0.94) 38%, rgba(241, 242, 237, 0.99)) !important;
}

:deep(.composer) {
  width: min(900px, 100%) !important;
  padding: 9px !important;
  border: 1px solid rgba(185, 194, 184, 0.82) !important;
  border-radius: 20px !important;
  background: rgba(255, 254, 253, 0.94) !important;
  box-shadow: 0 22px 60px rgba(45, 61, 51, 0.15) !important;
  backdrop-filter: blur(18px);
}

:deep(.attachment) {
  margin-bottom: 8px !important;
  padding: 8px !important;
  border-radius: 14px !important;
  background: var(--th-surface-soft) !important;
}

:deep(.report-context-hint) {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 1px 5px 8px !important;
  padding: 5px 9px;
  border-radius: 9px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark) !important;
  font-size: 10px !important;
}

:deep(.input-row) {
  grid-template-columns: 48px minmax(0, 1fr) 46px !important;
  gap: 5px !important;
}

:deep(.image-upload-button) {
  width: 48px;
  height: 46px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 14px !important;
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
  width: 46px !important;
  height: 46px !important;
  border-radius: 14px !important;
  background: var(--th-primary-dark) !important;
  box-shadow: 0 8px 22px rgba(41, 72, 58, 0.2);
}

:deep(.send-button:hover) {
  background: var(--th-primary) !important;
}

:deep(.prompt-input .el-textarea__inner) {
  min-height: 46px !important;
  padding: 11px 7px !important;
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
    min-height: calc(100dvh - 126px) !important;
    height: calc(100dvh - 126px) !important;
  }

  :deep(.chat-page) {
    border-radius: 22px;
  }

  :deep(.chat-scroll) {
    padding: 26px 12px 178px !important;
  }

  :deep(.welcome) {
    min-height: 54vh !important;
  }

  :deep(.welcome h1) {
    font-size: 34px !important;
  }

  :deep(.welcome h1::after) {
    content: "\A让每次观察更清晰。";
  }

  :deep(.welcome p) {
    font-size: 14px;
  }

  :deep(.message-row) {
    grid-template-columns: 32px minmax(0, 1fr) !important;
    gap: 9px !important;
  }

  :deep(.message-row.user) {
    grid-template-columns: minmax(0, 1fr) 32px !important;
  }

  :deep(.message-avatar) {
    width: 32px !important;
    height: 32px !important;
    border-radius: 11px !important;
  }

  :deep(.message-bubble) {
    padding: 18px !important;
    border-radius: 19px 19px 19px 7px !important;
  }

  :deep(.message-row.user .message-bubble) {
    max-width: 92%;
    padding: 12px 14px !important;
  }

  :deep(.composer-wrap) {
    padding: 30px 8px 9px !important;
  }

  :deep(.composer) {
    border-radius: 18px !important;
  }
}
</style>
