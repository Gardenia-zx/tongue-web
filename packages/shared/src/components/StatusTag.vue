<template>
  <el-tag :type="statusType(status)" effect="light" round>
    {{ statusText(status) }}
  </el-tag>
</template>

<script setup lang="ts">
import { statusText, statusType } from "../utils/format";

defineProps<{
  status?: string;
}>();
</script>
