<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ConfirmDialog from './components/ConfirmDialog.vue';
import Toasts from './components/Toasts.vue';
import { busy } from './feedback';
import { t } from './i18n';
import { reloads } from './navigation';

// A page is created afresh for every visit, and again when reloaded (navigation.ts, `go`).
const route = useRoute();
const pageKey = computed(() => `${route.fullPath}#${reloads.value}`);
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :key="pageKey" />
  </RouterView>
  <Transition name="fade-in">
    <div v-if="busy" id="loading-screen" class="modal d-block">
      <div class="modal-backdrop show"></div>
      <div class="text-center loading-screen-content">
        <img src="/img/runningdog_transparent.gif" :alt="t('common.loading')">
      </div>
    </div>
  </Transition>
  <ConfirmDialog />
  <Toasts />
</template>
