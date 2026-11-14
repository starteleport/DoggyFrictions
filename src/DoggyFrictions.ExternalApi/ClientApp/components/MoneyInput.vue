<script setup lang="ts">
import { parseNumber } from '../format';

// A number field that takes what people type: "1,5", "10₽". The value is committed on change.
defineProps<{ modelValue: number }>();
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

function commit(event: Event) {
  emit('update:modelValue', parseNumber((event.target as HTMLInputElement).value));
}
</script>

<template>
  <input type="text" inputmode="decimal" class="form-control" :value="modelValue" @change="commit">
</template>
