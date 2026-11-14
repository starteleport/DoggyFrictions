import { test, expect, uniqueName } from './fixtures';

test.describe('Sessions', () => {
  test('creating a session with participants shows it on its page and in the list', async ({ app, api, page }) => {
    const name = uniqueName('Поход');

    await app.open('/Sessions');
    await page.getByTestId('create-session-button').click();

    await app.type(page.getByTestId('session-name-input'), name);
    for (const [index, dog] of ['Ann', 'Bob'].entries()) {
      await page.getByTestId('add-participant-button').click();
      await app.type(page.getByTestId('participant-name-input').nth(index), dog);
    }
    await page.getByTestId('save-session-button').click();

    await expect(page).toHaveURL(/#\/Session\/[0-9a-f-]{36}$/);
    await app.loaded();
    api.track(app.sessionIdFromUrl());
    await expect(page.getByTestId('session-title')).toHaveText(name);
    await expect(page.getByTestId('session-participants-summary')).toHaveText('Ann, Bob');
    await expect(page.getByTestId('actions-empty')).toHaveText('Расходов пока нет');

    await app.open('/Sessions');
    const row = page.getByTestId('session-row').filter({ hasText: name });
    await expect(row).toContainText('Ann');
    await expect(row).toContainText('Bob');
  });

  test('clicking a session in the list opens it', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);

    await app.open('/Sessions');
    await page.getByTestId('session-row').filter({ hasText: session.Name }).getByTestId('session-name-cell').click();

    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}$`));
    await expect(page.getByTestId('session-title')).toHaveText(session.Name);
  });

  test('a session opens from anywhere in its row, and with the keyboard', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    const row = page.getByTestId('session-row').filter({ hasText: session.Name });

    await app.open('/Sessions');
    await row.locator('td[data-label="Участники"]').click();
    await expect(page.getByTestId('session-title')).toHaveText(session.Name);

    await app.open('/Sessions');
    await row.getByRole('link', { name: session.Name }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}$`));
    await expect(page.getByTestId('session-title')).toHaveText(session.Name);
  });

  test('editing renames the session and adds a participant without changing existing ones', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    const renamed = uniqueName('Переименовано');

    await app.open(`/Session/Edit/${session.Id}`);
    await app.type(page.getByTestId('session-name-input'), renamed);
    await page.getByTestId('add-participant-button').click();
    await app.type(page.getByTestId('participant-name-input').nth(2), 'Rex');
    await page.getByTestId('save-session-button').click();

    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}$`));
    await expect(page.getByTestId('session-title')).toHaveText(renamed);
    await expect(page.getByTestId('session-participants-summary')).toHaveText('Ann, Bob, Rex');

    const saved = await api.getSession(session.Id);
    expect(saved.Name).toBe(renamed);
    expect(saved.Participants.map(p => p.Name)).toEqual(['Ann', 'Bob', 'Rex']);
    // Actions reference participants by id, so existing ids must survive an edit.
    expect(saved.Participants.slice(0, 2)).toEqual(session.Participants);
  });

  test('cancelling an edit asks for confirmation and discards the changes', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);

    await app.open(`/Session/Edit/${session.Id}`);
    await app.type(page.getByTestId('session-name-input'), 'не сохранять');
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-title')).toHaveText('Отмена изменений');
    await app.confirm('yes');

    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}$`));
    expect((await api.getSession(session.Id)).Name).toBe(session.Name);
  });

  test('deleting a session requires confirmation', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open('/Sessions');
    const row = page.getByTestId('session-row').filter({ hasText: session.Name });
    const deleteButton = row.getByTestId('delete-session-button');

    await deleteButton.click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-title')).toHaveText('Удаление группы');
    await expect(app.confirmDialog().getByTestId('confirm-dialog-message')).toContainText(session.Name);
    await app.confirm('no');
    await expect(row).toBeVisible();
    expect((await api.listSessions()).map(s => s.Id)).toContain(session.Id);

    await deleteButton.click();
    await app.confirm('yes');
    await app.loaded();
    await expect(row).toHaveCount(0);
    expect((await api.listSessions()).map(s => s.Id)).not.toContain(session.Id);
  });
});
