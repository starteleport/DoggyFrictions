import { test, expect, type App } from './fixtures';
import type { Page } from '@playwright/test';

/** Picks a language in the settings menu; the page reloads in it. */
async function chooseLanguage(app: App, code: 'ru' | 'en' | 'dog') {
  await app.page.getByTestId('settings-button').click();
  await Promise.all([
    app.page.waitForEvent('load'),
    app.page.getByTestId(`language-${code}`).click(),
  ]);
  await app.loaded();
}

const heading = (page: Page) => page.locator('[data-testid="sessions-view"] h4');

test.describe('Languages', () => {
  test.describe('without a choice the app follows the browser', () => {
    test('Russian browser: plain Russian', async ({ app, page }) => {
      await app.open('/Sessions');

      await expect(heading(page)).toHaveText('Группы:');
      await expect(page.getByTestId('create-session-button')).toContainText('Создать группу');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    });

    test.describe('English browser', () => {
      test.use({ locale: 'en-US' });

      test('plain English', async ({ app, page }) => {
        await app.open('/Sessions');

        await expect(heading(page)).toHaveText('Groups:');
        await expect(page.getByTestId('create-session-button')).toContainText('New group');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      });
    });

    test.describe('any other browser', () => {
      test.use({ locale: 'de-DE' });

      test('English', async ({ app, page }) => {
        await app.open('/Sessions');

        await expect(heading(page)).toHaveText('Groups:');
      });
    });
  });

  test('the settings menu switches the language and the choice sticks', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open('/Sessions');
    await expect(heading(page)).toHaveText('Группы:');

    // The menu lists every language under its own name and marks the current one.
    await page.getByTestId('settings-button').click();
    await expect(page.locator('[data-language]')).toHaveText(['Русский', 'English', 'Собачий']);
    await expect(page.getByTestId('language-ru')).toHaveClass(/active/);
    await page.keyboard.press('Escape');

    await chooseLanguage(app, 'dog');
    await expect(heading(page)).toHaveText('Тёрки:');
    await expect(page.getByTestId('create-session-button')).toContainText('Начать тёрку');
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('language-dog')).toHaveClass(/active/);
    await page.keyboard.press('Escape');

    // It survives a reload and applies to every page.
    await page.reload();
    await app.loaded();
    await expect(heading(page)).toHaveText('Тёрки:');
    await app.open(`/Session/${session.Id}`);
    await expect(page.getByTestId('session-view')).toContainText('Собаки:');
    await expect(page.getByTestId('create-action-button')).toContainText('Внести постанову');
    await expect(page.getByTestId('actions-empty')).toHaveText('Пока всё тихо');

    await chooseLanguage(app, 'en');
    await expect(page.getByTestId('session-view')).toContainText('Members:');
    await expect(page.getByTestId('create-action-button')).toContainText('Add expense');
    await expect(page.getByTestId('actions-empty')).toHaveText('No expenses yet');
  });

  for (const [code, sample] of [['ru', 'Группы'], ['en', 'Groups'], ['dog', 'Тёрки']] as const) {
    test(`every page is fully translated: ${code}`, async ({ app, api, page }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const action = await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });
      await app.open('/Sessions');
      await chooseLanguage(app, code);
      await expect(heading(page)).toHaveText(`${sample}:`);

      for (const route of [
        '/Sessions',
        '/Session/Create',
        `/Session/${session.Id}`,
        `/Session/Edit/${session.Id}`,
        `/Session/${session.Id}/Action/Create`,
        `/Session/${session.Id}/Action/${action.Id}`,
        `/Session/${session.Id}/Action/Edit/${action.Id}`,
        `/Session/${session.Id}/Debts`,
      ]) {
        await app.open(route);
        await expect(page.locator('.jumbotron').first()).toBeVisible();
        // A text that is missing shows up as its key, e.g. "session.addAction".
        const visible = await page.locator('body').innerText();
        const placeholders = await page.locator('[placeholder], [data-label]').evaluateAll(
          elements => elements.map(element => element.getAttribute('placeholder') ?? element.getAttribute('data-label')));
        const keys = [visible, ...placeholders].join('\n')
          .match(/\b(common|error|settings|sessions|session|action|debts|validation)\.[A-Za-z]+(\.[A-Za-z]+)?\b/g);
        expect(keys, `untranslated on ${route}`).toBeNull();
      }
    });
  }

  test('confirmations and toasts follow the language', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob'], "O'Neil's");
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });
    await app.open('/Sessions');
    await chooseLanguage(app, 'en');

    // A name with an apostrophe goes into the message as data, not into the script.
    await page.getByTestId('session-row').filter({ hasText: session.Name }).getByTestId('delete-session-button').click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-title')).toHaveText('Delete group');
    await expect(app.confirmDialog().getByTestId('confirm-dialog-message'))
      .toHaveText("Are you sure you want to delete the group “O'Neil's”?");
    await expect(app.confirmDialog().getByTestId('confirm-dialog-yes')).toHaveText('Yes');
    await app.confirm('no');

    await app.open(`/Session/${session.Id}/Debts`);
    await expect(page.getByTestId('debt-payoff-button')).toHaveText('Settle');
    await page.getByTestId('debt-payoff-button').click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-message'))
      .toHaveText('An expense will be created to fully settle the debt between Ann and Bob');
    await app.confirm('yes');
    const toast = page.locator('#snackbar-container .snackbar').last();
    await expect(toast).toContainText('The debt between Bob and Ann is settled.');
    await expect(toast.getByRole('link', { name: 'here' })).toBeVisible();
    await expect(page.getByTestId('debts-empty')).toHaveText('All settled');
  });

  test('server validation messages follow the language', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    const save = async () => {
      await app.open(`/Session/${session.Id}/Action/Create`);
      await app.type(page.getByTestId('action-description-input'), 'x');
      await page.getByTestId('save-action-button').click();
      return page.locator('#snackbar-container .snackbar').last();
    };

    await app.open('/Sessions');
    await expect(await save()).toHaveText('Ошибка! Укажите, кто платил.');

    await chooseLanguage(app, 'en');
    await expect(await save()).toHaveText('Error! Specify who paid.');

    await chooseLanguage(app, 'dog');
    await app.open(`/Session/${session.Id}/Action/Create`);
    await page.getByTestId('save-action-button').click();
    await expect(page.locator('#snackbar-container .snackbar').last()).toContainText('Укажите название постановы.');
  });

  test('switching the language is not held back by the offline cache', async ({ app, page }) => {
    // Let the service worker take over and cache the templates in Russian.
    await app.open('/Sessions');
    await expect(heading(page)).toHaveText('Группы:');
    await app.waitForOfflineShell();

    await chooseLanguage(app, 'en');

    await expect(heading(page)).toHaveText('Groups:');
    await expect(page.getByTestId('create-session-button')).toContainText('New group');
  });
});
