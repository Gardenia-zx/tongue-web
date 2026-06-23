<template>
  <main class="login-page">
    <section class="login-panel">
      <h1>舌诊管理后台</h1>
      <p>使用 admin_user 表中的管理员账号登录。</p>

      <el-form label-position="top" @submit.prevent>
        <el-form-item label="后端地址">
          <el-input v-model="apiBase" @change="auth.saveApiBase(apiBase)" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-button native-type="button" type="primary" class="login-button" :loading="auth.loading" @click="login">进入后台</el-button>
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
const username = ref("");
const password = ref("");

async function login() {
  if (!username.value.trim() || !password.value) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }
  try {
    normalizeApiBase();
    await auth.adminLogin(username.value.trim(), password.value);
    if (auth.user?.role !== "ADMIN") {
      ElMessage.error("当前账号不是管理员");
      await auth.logout();
      return;
    }
    await router.replace(String(route.query.redirect || "/dashboard"));
  } catch (error) {
    console.error("login failed", { apiBase: auth.apiBase, error });
    ElMessage.error(error instanceof Error ? error.message : "登录失败，请检查用户名、密码或后端服务");
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
}

.login-button {
  width: 100%;
}
</style>
