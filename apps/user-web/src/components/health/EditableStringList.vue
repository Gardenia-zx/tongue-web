<template>
  <div class="editable-list">
    <div v-for="(_, index) in modelValue" :key="index" class="editable-row">
      <el-input
        :model-value="modelValue[index]"
        :placeholder="placeholder"
        maxlength="100"
        @update:model-value="updateItem(index, String($event))"
      />
      <button type="button" class="remove-button" aria-label="删除" @click="removeItem(index)">
        <X :size="15" />
      </button>
    </div>
    <button type="button" class="add-button" @click="addItem">
      <Plus :size="15" />
      {{ addLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus, X } from "lucide-vue-next";

const props = withDefaults(defineProps<{
  modelValue: string[];
  placeholder?: string;
  addLabel?: string;
}>(), {
  placeholder: "请输入内容",
  addLabel: "添加一项",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: string[]): void;
}>();

function updateItem(index: number, value: string) {
  const next = [...props.modelValue];
  next[index] = value;
  emit("update:modelValue", next);
}

function removeItem(index: number) {
  emit("update:modelValue", props.modelValue.filter((_, itemIndex) => itemIndex !== index));
}

function addItem() {
  emit("update:modelValue", [...props.modelValue, ""]);
}
</script>

<style scoped>
.editable-list{display:grid;gap:9px}.editable-row{display:grid;grid-template-columns:minmax(0,1fr) 38px;gap:8px}.remove-button,.add-button{display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9e3dc;border-radius:10px;background:#fff;color:#637269;cursor:pointer}.remove-button{width:38px;height:38px}.remove-button:hover{border-color:#c48282;color:#a64d4d;background:#fff8f8}.add-button{width:max-content;min-height:36px;gap:7px;padding:0 12px;color:#2f704d;background:#f4f8f5}.add-button:hover{border-color:#78a58a;background:#edf6f0}
</style>
