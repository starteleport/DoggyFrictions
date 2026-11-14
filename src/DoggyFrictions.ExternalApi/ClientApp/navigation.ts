import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { confirm } from './feedback';
import { t } from './i18n';

/** A link in the breadcrumbs. */
export interface Crumb {
  name: string;
  to: string;
}

/** The app's pages (routes in router.ts). */
export const paths = {
  sessions: '/Sessions',
  newSession: '/Session/Create',
  session: (id: string) => `/Session/${id}`,
  editSession: (id: string) => `/Session/Edit/${id}`,
  newAction: (sessionId: string) => `/Session/${sessionId}/Action/Create`,
  action: (sessionId: string, id: string) => `/Session/${sessionId}/Action/${id}`,
  editAction: (sessionId: string, id: string) => `/Session/${sessionId}/Action/Edit/${id}`,
  debts: (sessionId: string) => `/Session/${sessionId}/Debts`,
};

/** Bumped to load the current page afresh: App.vue keys the page on it. */
export const reloads = ref(0);

export function useNavigation() {
  const router = useRouter();

  /** Opens a page; when it is the one already open, loads it again (e.g. "save and add another"). */
  function go(path: string) {
    if (router.currentRoute.value.path === path) {
      reloads.value++;
    } else {
      void router.push(path);
    }
  }

  return {
    go,
    /** Leaves a form for another page once the user agrees to lose the changes. */
    async leave(path: string) {
      if (await confirm(t('common.discardTitle'), t('common.discardMessage'))) {
        go(path);
      }
    },
    /** The URL of a page, for a plain link (in a toast). */
    href: (path: string) => router.resolve(path).href,
    /**
     * A click on a table row opens its page, unless it was on a link or button in the row.
     * (The row's main cell also holds a link, which is how the keyboard opens it.)
     */
    openRow(event: MouseEvent, path: string) {
      if (!(event.target as Element).closest('a, button')) {
        go(path);
      }
    },
  };
}
