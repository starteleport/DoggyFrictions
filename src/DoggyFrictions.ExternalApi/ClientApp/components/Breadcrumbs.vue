<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useNavigation, type Crumb } from '../navigation';

// On a form (`confirmLeave`) every link asks before the changes are thrown away.
defineProps<{ links: Crumb[]; current: string; confirmLeave?: boolean }>();
const { href, leave } = useNavigation();
</script>

<template>
  <ul class="breadcrumb breadcrumb-default">
    <li v-for="link in links" :key="link.to" class="breadcrumb-item">
      <a v-if="confirmLeave" :href="href(link.to)" @click.prevent="leave(link.to)">{{ link.name }}</a>
      <RouterLink v-else :to="link.to">{{ link.name }}</RouterLink>
    </li>
    <li class="breadcrumb-item active" aria-current="page">{{ current }}</li>
  </ul>
</template>
