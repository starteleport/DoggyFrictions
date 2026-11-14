// The front end: a Vue app mounted into #main of the start page (Views/Home/Index.cshtml).
// Styles and fonts are bundled with it, so the app needs nothing from other hosts.
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './styles/site.less';
// Bootstrap's scripts: the modal (ConfirmDialog.vue) and, through data attributes, the settings menu.
import 'bootstrap';

import { createApp } from 'vue';
import App from './App.vue';
import { chooseLanguage } from './i18n';
import { cacheAppShell, registerServiceWorker } from './pwa';
import { router } from './router';

registerServiceWorker();

// The settings menu is part of the layout (Views/Shared/_Layout.cshtml).
document.addEventListener('click', event => {
  const target = event.target as HTMLElement;

  const language = target.closest<HTMLElement>('[data-language]')?.dataset.language;
  if (language) {
    chooseLanguage(language);
  }

  // A click into a text field selects its content, ready to be typed over.
  if (target instanceof HTMLInputElement && target.type === 'text') {
    target.select();
  }
});

if (document.getElementById('main')) {
  const app = createApp(App).use(router);
  void router.isReady().then(() => {
    app.mount('#main');
    void document.fonts.ready.then(cacheAppShell);
  });
}
