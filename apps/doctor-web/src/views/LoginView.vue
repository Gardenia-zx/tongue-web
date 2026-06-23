<template>
  <main class="login-page">
    <section class="login-panel">
      <h1>医生审核工作台</h1>
      <p>使用手机号验证码登录。若还不是医生账号，请先登录后提交医生资料。</p>

      <el-form label-position="top" @submit.prevent>
        <el-form-item label="后端地址">
          <el-input v-model="apiBase" @change="auth.saveApiBase(apiBase)" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="phone" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="code" />
            <el-button native-type="button" :loading="auth.loading" @click="sendCode">发送</el-button>
          </div>
          <p v-if="auth.devCode" class="dev-code">开发验证码：{{ auth.devCode }}</p>
        </el-form-item>
        <el-button native-type="button" type="primary" class="login-button" :loading="auth.loading" @click="login">进入医生端</el-button>
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
    await router.replace(String(route.query.redirect || (auth.user?.role === "DOCTOR" || auth.user?.role === "ADMIN" ? "/workbench" : "/profile")));
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
}

.login-panel {
  width: min(440px, 100%);
  padding: 34px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
  background: var(--th-surface);
  box-shadow: var(--th-shadow);
}

.login-panel h1 {
  margin: 0 0 8px;
}

.login-panel p {
  color: var(--th-text-muted);
  line-height: 1.7;
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
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
</style>
