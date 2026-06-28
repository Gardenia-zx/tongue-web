<template>
  <section class="profile-page">
    <header class="profile-head">
      <div class="avatar-block">
        <span>{{ avatarText }}</span>
      </div>
      <div class="profile-copy">
        <span class="page-kicker">PERSONAL HEALTH SPACE</span>
        <h1>{{ auth.user?.nickname || "我的健康空间" }}</h1>
        <p>维护基础资料与健康关注方向，让报告和助手回答更贴合您的使用习惯。</p>
      </div>
      <div class="completion-card">
        <span>档案完整度</span>
        <strong>{{ completion }}%</strong>
        <div><i :style="{ width: `${completion}%` }" /></div>
      </div>
    </header>

    <div class="profile-grid">
      <section class="profile-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">BASIC PROFILE</span>
            <h2>基础资料</h2>
          </div>
          <span class="save-status" :class="{ active: savedRecently }">
            {{ savedRecently ? "已保存" : "等待保存" }}
          </span>
        </div>

        <el-form class="profile-form" label-position="top">
          <div class="form-grid">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" size="large" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="性别">
              <el-select v-model="form.gender" clearable size="large" placeholder="请选择">
                <el-option label="女" value="female" />
                <el-option label="男" value="male" />
                <el-option label="不填写" value="unknown" />
              </el-select>
            </el-form-item>
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="0" :max="120" size="large" controls-position="right" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input :model-value="maskedPhone" disabled size="large" />
            </el-form-item>
          </div>

          <el-form-item label="健康关注方向">
            <el-input
              v-model="form.healthFocus"
              type="textarea"
              :rows="5"
              maxlength="300"
              show-word-limit
              placeholder="例如：希望关注舌苔变化、饮食建议、作息和长期趋势"
            />
          </el-form-item>

          <button class="save-button" type="button" :disabled="saving" @click="save">
            <Save :size="16" />
            {{ saving ? "正在保存" : "保存个人资料" }}
          </button>
        </el-form>
      </section>

      <aside class="profile-side">
        <section class="preference-card">
          <span class="page-kicker">PROFILE BENEFITS</span>
          <h2>完善资料后可以获得</h2>
          <ul>
            <li><span><UserRoundCheck :size="16" /></span> 更自然的称呼与交互体验</li>
            <li><span><MessagesSquare :size="16" /></span> 更贴合关注方向的报告解读</li>
            <li><span><ChartNoAxesCombined :size="16" /></span> 更清晰的长期趋势回顾</li>
          </ul>
        </section>

        <RouterLink class="privacy-entry" to="/privacy">
          <span class="privacy-icon"><ShieldCheck :size="19" /></span>
          <div>
            <strong>隐私与数据管理</strong>
            <p>管理报告、聊天记录与账号数据。</p>
          </div>
          <ChevronRight :size="17" />
        </RouterLink>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import {
  ChartNoAxesCombined,
  ChevronRight,
  MessagesSquare,
  Save,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-vue-next";
import { useAuthStore } from "@tongue/shared";

const auth = useAuthStore();
const saving = ref(false);
const savedRecently = ref(false);
const form = reactive({
  nickname: "",
  gender: "",
  age: 0,
  healthFocus: "",
});

const avatarText = computed(() => (auth.user?.nickname || auth.user?.phone || "我").slice(0, 1));
const maskedPhone = computed(() => {
  const value = auth.user?.phone || "";
  if (value.length < 7) return value || "未绑定";
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
});
const completion = computed(() => {
  const values = [form.nickname, form.gender, form.age > 0, form.healthFocus];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
});

watchEffect(() => {
  if (!auth.user) return;
  form.nickname = auth.user.nickname || "";
  form.gender = auth.user.gender || "";
  form.age = auth.user.age || 0;
  form.healthFocus = auth.user.healthFocus || "";
});

async function save() {
  saving.value = true;
  savedRecently.value = false;
  try {
    await auth.updateProfile(form);
    savedRecently.value = true;
    ElMessage.success("资料已保存");
    window.setTimeout(() => { savedRecently.value = false; }, 2400);
  } catch (error) {
    console.error("save profile failed", error);
    ElMessage.error(error instanceof Error ? error.message : "资料保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 18px;
  width: min(1080px, 100%);
  margin: 0 auto;
}

.profile-head {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 210px;
  align-items: center;
  gap: 22px;
  min-height: 190px;
  padding: 30px 34px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 26px;
  background:
    radial-gradient(circle at 100% 0, rgba(215, 231, 220, 0.78), transparent 38%),
    rgba(255, 254, 249, 0.9);
  box-shadow: 0 16px 44px rgba(54, 75, 63, 0.06);
}

.avatar-block {
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border-radius: 26px;
  background: linear-gradient(145deg, #dcebe1, #c9dfd0);
  color: #2d6848;
  font-family: "Noto Serif SC", serif;
  font-size: 31px;
  font-weight: 650;
  box-shadow: inset 0 0 0 1px rgba(54, 104, 70, 0.12);
}

.page-kicker {
  display: block;
  color: #3f7058;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.profile-copy h1 {
  margin: 9px 0 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 500;
  letter-spacing: -0.05em;
}

.profile-copy p {
  max-width: 610px;
  margin: 12px 0 0;
  color: #758078;
  font-size: 12px;
  line-height: 1.75;
}

.completion-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(163, 188, 169, 0.5);
  border-radius: 17px;
  background: rgba(247, 251, 247, 0.8);
}

.completion-card span { color: #7d8880; font-size: 10px; }
.completion-card strong { color: #2f6d4a; font-size: 27px; }
.completion-card div { overflow: hidden; height: 6px; border-radius: 999px; background: #e2eae4; }
.completion-card i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #3e7f58, #76a881); transition: width 0.3s ease; }

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 16px;
}

.profile-panel,
.preference-card,
.privacy-entry {
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.045);
}

.profile-panel { padding: 26px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 20px; }
.panel-heading h2,
.preference-card h2 { margin: 8px 0 0; color: #2d3930; font-size: 22px; font-weight: 620; }
.save-status { padding: 6px 9px; border-radius: 999px; background: #f1f3f0; color: #89928c; font-size: 9px; }
.save-status.active { background: #e5f1e8; color: #34724e; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.profile-form :deep(.el-input__wrapper),
.profile-form :deep(.el-textarea__inner),
.profile-form :deep(.el-select__wrapper) { border-radius: 11px; box-shadow: 0 0 0 1px rgba(95, 117, 103, 0.18) inset; }
.profile-form :deep(.el-form-item__label) { color: #5b6c61; font-size: 11px; font-weight: 650; }
.save-button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border: 0; border-radius: 12px; background: #245d3d; color: white; cursor: pointer; font-size: 12px; font-weight: 650; }
.save-button:disabled { cursor: wait; opacity: 0.65; }

.profile-side { display: grid; align-content: start; gap: 14px; }
.preference-card { padding: 24px; background: linear-gradient(155deg, #f5f8f2, #eaf2e7); }
.preference-card ul { display: grid; gap: 14px; margin: 22px 0 0; padding: 0; list-style: none; }
.preference-card li { display: flex; align-items: center; gap: 10px; color: #5e6e64; font-size: 11px; line-height: 1.6; }
.preference-card li span { display: grid; width: 34px; height: 34px; place-items: center; flex: 0 0 auto; border-radius: 11px; background: rgba(255, 255, 255, 0.7); color: #3d7656; }
.privacy-entry { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 104px; padding: 16px; color: inherit; text-decoration: none; }
.privacy-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #e8f0ea; color: #397254; }
.privacy-entry strong { color: #34493d; font-size: 12px; }
.privacy-entry p { margin: 5px 0 0; color: #828d85; font-size: 9px; }

@media (max-width: 900px) {
  .profile-head,
  .profile-grid { grid-template-columns: 1fr; }
  .completion-card { max-width: 280px; }
}

@media (max-width: 650px) {
  .profile-head { padding: 26px 20px; }
  .form-grid { grid-template-columns: 1fr; }
  .profile-panel { padding: 20px; }
}
</style>
