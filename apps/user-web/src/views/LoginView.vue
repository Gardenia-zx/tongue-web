<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-copy">
        <span class="brand-mark">舌</span>
        <h1>舌象健康管理</h1>
        <p>登录后可以上传舌象图片、查看历史报告、申请医生审核，并持续观察舌象特征趋势。</p>
      </div>

      <el-form class="login-form" label-position="top" @submit.prevent>
        <el-form-item label="后端地址">
          <el-input v-model="apiBase" placeholder="http://127.0.0.1:8080" @change="auth.saveApiBase(apiBase)" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="code" placeholder="请输入验证码" />
            <el-button native-type="button" :loading="auth.loading" @click="sendCode">发送</el-button>
          </div>
          <p v-if="auth.devCode" class="dev-code">开发验证码：{{ auth.devCode }}</p>
        </el-form-item>
        <el-button class="login-button" native-type="button" type="primary" :loading="auth.loading" @click="login">登录</el-button>
      </el-form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { DEFAULT_API_BASE, useAuthStore } from "@tongue/shared";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const apiBase = ref(auth.apiBase);
const phone = ref("");
const code = ref("");

async function sendCode() {
  if (!phone.value.trim()) {
    ElMessage.warning("请先输入手机号");
    return;
  }
  try {
    normalizeApiBase();
    await auth.sendSms(phone.value.trim());
    ElMessage.success("验证码已发送");
  } catch (error) {
    console.error("send sms failed", { apiBase: auth.apiBase, error });
    ElMessage.error(error instanceof Error ? error.message : "验证码发送失败，请检查后端服务和接口地址");
  }
}

async function login() {
  if (!phone.value.trim() || !code.value.trim()) {
    ElMessage.warning("请输入手机号和验证码");
    return;
  }
  try {
    normalizeApiBase();
    await auth.login(phone.value.trim(), code.value.trim());
    await router.replace(String(route.query.redirect || "/analysis"));
  } catch (error) {
    console.error("login failed", { apiBase: auth.apiBase, error });
    ElMessage.error(error instanceof Error ? error.message : "登录失败，请检查验证码或后端服务");
  }
}

function normalizeApiBase() {
  apiBase.value = apiBase.value.trim() || DEFAULT_API_BASE;
  auth.saveApiBase(apiBase.value);
}
</script>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--th-bg);
}

.login-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  width: min(920px, 100%);
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
  background: var(--th-surface);
  box-shadow: var(--th-shadow);
}

.login-copy {
  padding: 44px;
  border-right: 1px solid var(--th-border);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--th-radius);
  background: var(--th-primary);
  color: #fff;
  font-weight: 700;
}

.login-copy h1 {
  margin: 24px 0 10px;
  font-size: 32px;
}

.login-copy p {
  margin: 0;
  color: var(--th-text-muted);
  line-height: 1.8;
}

.login-form {
  padding: 36px;
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 10px;
  width: 100%;
}

.dev-code {
  margin: 8px 0 0;
  color: var(--th-primary);
  font-size: 13px;
}

.login-button {
  width: 100%;
}

@media (max-width: 760px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-copy {
    padding: 28px;
    border-right: 0;
    border-bottom: 1px solid var(--th-border);
  }
}
</style>
