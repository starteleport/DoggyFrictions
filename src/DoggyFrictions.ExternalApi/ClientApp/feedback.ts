// What the app tells the user about its work: the loading screen, toasts and confirmations.
// The components that show them (App.vue, Toasts.vue, ConfirmDialog.vue) read this state.
import { computed, reactive, ref, shallowRef } from 'vue';
import { ApiError } from './api';
import { t, type TextPart } from './i18n';

const pending = ref(0);

/** True while a request started with `run` is in flight: the loading screen is up. */
export const busy = computed(() => pending.value > 0);

export interface Toast {
  id: number;
  parts: TextPart[];
  warning: boolean;
}

/** Toasts stay until clicked. */
export const toasts = reactive<Toast[]>([]);
let lastToastId = 0;

export function notify(parts: TextPart[], warning = false) {
  toasts.push({ id: ++lastToastId, parts, warning });
}

export function dismiss(toast: Toast) {
  toasts.splice(toasts.indexOf(toast), 1);
}

/**
 * Waits for a request behind the loading screen (unless `quiet`). A failed request is explained in a
 * toast and gives `undefined`, so callers only handle success. Anything else is a bug and is rethrown.
 */
export async function run<T>(request: Promise<T>, { quiet = false } = {}): Promise<T | undefined> {
  if (!quiet) pending.value++;
  try {
    return await request;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
    const details = error.offline ? t('error.offline') : error.message;
    notify([{ text: `${t('error.prefix')} ${details}` }], true);
    return undefined;
  } finally {
    if (!quiet) pending.value--;
  }
}

export interface ConfirmRequest {
  title: string;
  message: string;
  answer: (yes: boolean) => void;
}

/** The question the confirmation dialog is showing, if any. */
export const confirmRequest = shallowRef<ConfirmRequest | null>(null);

/** Asks in a modal dialog; resolves to true on "Yes", false when declined or dismissed. */
export function confirm(title = t('common.confirmTitle'), message = t('common.confirmMessage')): Promise<boolean> {
  confirmRequest.value?.answer(false);
  return new Promise(resolve => {
    confirmRequest.value = { title, message, answer: resolve };
  });
}
