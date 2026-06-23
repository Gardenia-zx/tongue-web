<template>
  <section class="th-panel th-section profile-view">
    <h2 class="th-title">医生资料</h2>
    <p class="th-subtitle">提交后需要管理员审核。若首次提交资料，请重新登录刷新医生权限。</p>

    <el-form class="profile-form" label-position="top">
      <el-form-item label="姓名">
        <el-input v-model="form.realName" />
      </el-form-item>
      <el-form-item label="职称">
        <el-input v-model="form.title" placeholder="例如：主治医师" />
      </el-form-item>
      <el-form-item label="擅长方向">
        <el-input v-model="form.specialty" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="form.introduction" type="textarea" :rows="5" />
      </el-form-item>
      <el-button type="primary" @click="save">提交资料</el-button>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { doctorApi, useAuthStore } from "@tongue/shared";

const router = useRouter();
const auth = useAuthStore();
const form = reactive({
  realName: "",
  title: "",
  introduction: "",
  specialty: "",
});

async function save() {
  await doctorApi.upsertMyProfile(form);
  await ElMessageBox.alert("医生资料已提交。请重新登录，让新的医生角色写入 token。", "提交成功");
  await auth.logout();
  ElMessage.success("请重新登录");
  await router.replace("/login");
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
