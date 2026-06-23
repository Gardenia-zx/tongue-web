<template>
  <section class="th-panel th-section privacy-view">
    <h2 class="th-title">隐私管理</h2>
    <p class="th-subtitle">当前模块调用后端隐私接口。删除操作不可在前端恢复，请谨慎确认。</p>

    <div class="privacy-actions">
      <article>
        <h3>删除全部报告</h3>
        <p>软删除当前账号下可见报告，后台仍可按审计策略保留必要记录。</p>
        <el-button type="danger" plain @click="deleteReports">删除报告</el-button>
      </article>
      <article>
        <h3>注销账号</h3>
        <p>提交账号删除请求，并清理本地登录状态。</p>
        <el-button type="danger" @click="deleteAccount">注销账号</el-button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { privacyApi, useAuthStore } from "@tongue/shared";

const router = useRouter();
const auth = useAuthStore();

async function deleteReports() {
  await ElMessageBox.confirm("确认删除当前账号下的报告吗？", "删除报告", { type: "warning" });
  await privacyApi.deleteReports();
  ElMessage.success("报告删除请求已处理");
}

async function deleteAccount() {
  await ElMessageBox.confirm("确认注销当前账号吗？", "注销账号", { type: "error" });
  await privacyApi.deleteAccount();
  await auth.logout();
  ElMessage.success("账号删除请求已处理");
  await router.replace("/login");
}
</script>

<style scoped>
.privacy-view {
  max-width: 900px;
}

.privacy-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.privacy-actions article {
  padding: 18px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
}

.privacy-actions h3 {
  margin: 0 0 8px;
}

.privacy-actions p {
  color: var(--th-text-muted);
  line-height: 1.7;
}

@media (max-width: 760px) {
  .privacy-actions {
    grid-template-columns: 1fr;
  }
}
</style>
