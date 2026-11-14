<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Modal } from 'bootstrap';
import { confirmRequest } from '../feedback';
import { t } from '../i18n';

// Shows the question asked with confirm() (feedback.ts) as a Bootstrap modal.
const dialog = ref<HTMLElement>();

watch(confirmRequest, async request => {
  if (!request) {
    return;
  }
  await nextTick();
  const element = dialog.value!;
  const modal = Modal.getOrCreateInstance(element);
  element.addEventListener('hidden.bs.modal', () => {
    modal.dispose();
    // Closed without "Yes" (a no-op when it was answered already).
    request.answer(false);
    if (confirmRequest.value === request) {
      confirmRequest.value = null;
    }
  }, { once: true });
  modal.show();
});

// The answer is acted on at once; the dialog fades out meanwhile.
function yes() {
  confirmRequest.value?.answer(true);
  Modal.getInstance(dialog.value!)?.hide();
}
</script>

<template>
  <div v-if="confirmRequest" ref="dialog" data-testid="confirm-dialog" class="modal fade confirm-dialog" tabindex="-1"
       role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 id="confirm-dialog-title" data-testid="confirm-dialog-title" class="modal-title">{{ confirmRequest.title }}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('common.close')"></button>
        </div>
        <div class="modal-body">
          <span data-testid="confirm-dialog-message">{{ confirmRequest.message }}</span>
        </div>
        <div class="modal-footer">
          <button data-testid="confirm-dialog-yes" type="button" class="btn btn-primary btn-raised" @click="yes">{{ t('common.yes') }}</button>
          <button data-testid="confirm-dialog-no" type="button" class="btn btn-primary" data-bs-dismiss="modal">{{ t('common.no') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
