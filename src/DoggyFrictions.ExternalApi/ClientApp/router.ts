import { createRouter, createWebHashHistory } from 'vue-router';
import SessionsPage from './pages/SessionsPage.vue';
import SessionPage from './pages/SessionPage.vue';
import SessionEditPage from './pages/SessionEditPage.vue';
import ActionPage from './pages/ActionPage.vue';
import DebtsPage from './pages/DebtsPage.vue';

// Hash URLs (#/Session/…), as the app has always had: the server only serves the start page.
// The paths are built in navigation.ts.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/Sessions' },
    { path: '/Sessions', component: SessionsPage },
    { path: '/Session/Create', component: SessionEditPage },
    { path: '/Session/Edit/:id', component: SessionEditPage, props: true },
    { path: '/Session/:id', component: SessionPage, props: true },
    { path: '/Session/:sessionId/Action/Create', component: ActionPage, props: route => ({ ...route.params, edit: true }) },
    { path: '/Session/:sessionId/Action/Edit/:id', component: ActionPage, props: route => ({ ...route.params, edit: true }) },
    { path: '/Session/:sessionId/Action/:id', component: ActionPage, props: route => ({ ...route.params, edit: false }) },
    { path: '/Session/:sessionId/Debts', component: DebtsPage, props: true },
    { path: '/:unknown(.*)*', redirect: '/Sessions' },
  ],
});
