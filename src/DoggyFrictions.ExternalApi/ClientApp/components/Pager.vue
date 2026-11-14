<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../i18n';

const props = defineProps<{ page: number; totalPages: number }>();
const emit = defineEmits<{ load: [page: number] }>();

// The current page and its neighbours, the first and the last page, and jumps of 10 and 100 pages.
const pages = computed(() => {
  const { page, totalPages } = props;
  const candidates = [1, page - 100, page - 10, page - 1, page, page + 1, page + 10, page + 100, totalPages];
  return [...new Set(candidates)].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
});
</script>

<template>
  <div v-if="totalPages > 1" class="pages">
    {{ t('common.page') }}
    <span class="pages-wrap">
      <template v-for="(n, index) in pages" :key="n">
        <span v-if="index > 0 && n - pages[index - 1]! > 1"> . . . </span>
        <span v-if="n === page" class="current-page" aria-current="page">{{ n }}</span>
        <button v-else type="button" class="pager-link" @click="emit('load', n)">{{ n }}</button>{{ ' ' }}
      </template>
    </span>
  </div>
</template>
