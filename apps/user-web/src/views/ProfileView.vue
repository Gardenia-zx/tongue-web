<template>
  <section class="th-panel th-section profile-view">
    <h2 class="th-title">个人资料</h2>
    <p class="th-subtitle">这些信息用于前端展示和后续健康管理偏好，不替代医疗诊断。</p>

    <el-form class="profile-form" label-position="top">
      <div class="th-form-row">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" clearable>
            <el-option label="女" value="female" />
            <el-option label="男" value="male" />
            <el-option label="不填写" value="unknown" />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="年龄">
        <el-input-number v-model="form.age" :min="0" :max="120" />
      </el-form-item>
      <el-form-item label="健康关注方向">
        <el-input v-model="form.healthFocus" type="textarea" :rows="5" placeholder="例如：希望关注舌苔、湿气相关知识、饮食建议等" />
      </el-form-item>
      <el-button type="primary" @click="save">保存资料</el-button>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { reactive, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@tongue/shared";

const auth = useAuthStore();
const form = reactive({
  nickname: "",
  gender: "",
  age: 0,
  healthFocus: "",
});

watchEffect(() => {
  if (!auth.user) return;
  form.nickname = auth.user.nickname || "";
  form.gender = auth.user.gender || "";
  form.age = auth.user.age || 0;
  form.healthFocus = auth.user.healthFocus || "";
});

async function save() {
  await auth.updateProfile(form);
  ElMessage.success("资料已保存");
}
</script>

<style scoped>
.profile-view {
  max-width: 760px;
}

.profile-form {
  margin-top: 20px;
}
</style>
