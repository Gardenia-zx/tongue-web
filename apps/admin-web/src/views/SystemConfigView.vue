<template>
  <div class="config-page">
    <section class="th-panel th-section">
      <h2 class="th-title">新增或更新配置</h2>
      <el-form class="config-form" label-position="top">
        <div class="th-form-row">
          <el-form-item label="配置 Key">
            <el-input v-model="form.key" placeholder="例如：agent.base_url" />
          </el-form-item>
          <el-form-item label="配置分组">
            <el-input v-model="form.group" placeholder="例如：agent" />
          </el-form-item>
        </div>
        <el-form-item label="配置值">
          <el-input v-model="form.value" type="textarea" :rows="4" />
        </el-form-item>
        <el-button type="primary" @click="save">保存配置</el-button>
      </el-form>
    </section>

    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">配置列表</h2>
          <p class="th-subtitle">系统配置不会在前端直接暴露密钥明文。</p>
        </div>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="rows">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="configKey" label="Key" min-width="220" />
        <el-table-column prop="configGroup" label="分组" width="150" />
        <el-table-column prop="configValue" label="值" min-width="260" show-overflow-tooltip />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);
const form = reactive({ key: "", value: "", group: "" });

async function load() {
  rows.value = (await adminApi.configs()) as Record<string, any>[];
}

async function save() {
  await adminApi.upsertConfig(form);
  ElMessage.success("配置已保存");
  form.key = "";
  form.value = "";
  form.group = "";
  await load();
}

onMounted(load);
</script>

<style scoped>
.config-page {
  display: grid;
  gap: 18px;
}

.config-form {
  margin-top: 18px;
}
</style>
