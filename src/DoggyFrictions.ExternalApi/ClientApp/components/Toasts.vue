<script setup lang="ts">
import { dismiss, toasts } from '../feedback';
import { t } from '../i18n';

// Messages are text parts, never HTML: names and server messages quoting user input stay inert.
// A click anywhere on a toast closes it; the close button does the same for the keyboard.
</script>

<template>
  <div id="snackbar-container" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.id" class="snackbar" :class="{ warning: toast.warning }" @click="dismiss(toast)">
      <span class="snackbar-content"><template v-for="(part, index) in toast.parts" :key="index"><a v-if="part.href" :href="part.href">{{ part.text }}</a><template v-else>{{ part.text }}</template></template></span>
      <button type="button" class="btn-close btn-close-white" :aria-label="t('common.close')" @click.stop="dismiss(toast)"></button>
    </div>
  </div>
</template>
