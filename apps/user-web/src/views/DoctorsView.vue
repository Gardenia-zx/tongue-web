<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">医生列表</h2>
        <p class="th-subtitle">仅展示已通过管理员审核的医生资料。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <EmptyState v-if="doctors.length === 0" title="暂无可选医生" description="医生资料通过审核后会展示在这里。" />
    <div v-else class="doctor-grid">
      <article v-for="doctor in doctors" :key="doctor.doctorId" class="doctor-item">
        <header>
          <h3>{{ doctor.realName || `医生 ${doctor.doctorId}` }}</h3>
          <StatusTag :status="doctor.reviewStatus" />
        </header>
        <p>{{ doctor.title || "暂无职称" }}</p>
        <p>{{ doctor.specialty || "暂无擅长方向" }}</p>
        <el-button @click="open(doctor)">查看详情</el-button>
      </article>
    </div>

    <el-dialog v-model="dialogVisible" title="医生详情" width="560px">
      <template v-if="current">
        <h3>{{ current.realName }}</h3>
        <p class="th-muted">{{ current.title }}</p>
        <p><strong>擅长：</strong>{{ current.specialty || "-" }}</p>
        <p><strong>简介：</strong>{{ current.introduction || "-" }}</p>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EmptyState, StatusTag, doctorApi, type DoctorProfile } from "@tongue/shared";

const doctors = ref<DoctorProfile[]>([]);
const current = ref<DoctorProfile | null>(null);
const dialogVisible = ref(false);

async function load() {
  doctors.value = await doctorApi.list();
}

function open(doctor: DoctorProfile) {
  current.value = doctor;
  dialogVisible.value = true;
}

onMounted(load);
</script>

<style scoped>
.doctor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.doctor-item {
  padding: 16px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
}

.doctor-item header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.doctor-item h3 {
  margin: 0;
}

.doctor-item p {
  color: var(--th-text-muted);
}
</style>
