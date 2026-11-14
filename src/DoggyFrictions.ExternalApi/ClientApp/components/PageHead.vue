<script setup lang="ts">
import Breadcrumbs from './Breadcrumbs.vue';
import type { Crumb } from '../navigation';

// A page's header: where it sits (breadcrumbs) and its title, given as the slot.
defineProps<{ links: Crumb[]; current: string; confirmLeave?: boolean }>();
</script>

<template>
  <div class="page-head page-head-split">
    <div class="page-crumbs">
      <Breadcrumbs :links="links" :current="current" :confirm-leave="confirmLeave" />
    </div>
    <h2 class="page-title">
      <slot />
    </h2>
  </div>
</template>
