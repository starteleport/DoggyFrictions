import { test, expect, ActionForm, type App } from './fixtures';

// The pages are responsive: on a phone-sized screen each table row is laid out as a card.
// The scenarios below run in the `mobile` project (a phone viewport).

/** A page must fit the screen: no sideways scrolling. */
async function expectNoHorizontalOverflow(app: App) {
  const [content, viewport] = await app.page.evaluate(() =>
    [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(content, 'page is wider than the screen').toBeLessThanOrEqual(viewport);
}

test.describe('Phone', () => {
  test('every page fits a phone screen and shows rows as cards', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob', 'Константин']);
    const action = await api.createAction(session, {
      description: 'Пицца на всех', payer: 'Ann', amount: 30, consumers: ['Ann', 'Bob', 'Константин'],
    });

    await app.open('/Sessions');
    const row = page.getByTestId('session-row').filter({ hasText: session.Name });
    // Cards, not a table: the column header is gone and cells are stacked one under another.
    await expect(page.locator('[data-testid="sessions-view"] thead')).toBeHidden();
    const name = await row.getByTestId('session-name-cell').boundingBox();
    const participants = await row.locator('td[data-label="Участники"]').boundingBox();
    expect(participants!.y).toBeGreaterThan(name!.y);
    await expectNoHorizontalOverflow(app);

    for (const route of [
      `/Session/${session.Id}`,
      `/Session/Edit/${session.Id}`,
      `/Session/${session.Id}/Action/${action.Id}`,
      `/Session/${session.Id}/Action/Edit/${action.Id}`,
      `/Session/${session.Id}/Action/Create`,
      `/Session/${session.Id}/Debts`,
    ]) {
      await app.open(route);
      await expect(page.locator('.jumbotron').first()).toBeVisible();
      await expectNoHorizontalOverflow(app);
    }
  });

  test('opening a session from the list', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open('/Sessions');
    await page.getByTestId('session-row').filter({ hasText: session.Name }).getByTestId('session-name-cell').click();

    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}$`));
    await app.loaded();
    await expect(page.getByTestId('session-title')).toHaveText(session.Name);
    await expect(page.getByTestId('session-action-row').filter({ hasText: 'Пицца' })).toContainText('10.00₽');
  });

  test('creating an expense on a phone', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}`);
    await page.getByTestId('create-action-button').click();
    const form = new ActionForm(app);

    await form.setDescription('Шаурма');
    const item = await form.addConsumption('Две в лаваше', '12');
    await expect(form.shares(item)).toHaveText(['6.00₽', '6.00₽']);
    await expect(form.total().locator('td.money-cell').first()).toHaveText('12.00₽');
    const payer = await form.addPayer('Bob');
    await expect(form.payerAmount(payer)).toHaveValue('12');
    await expectNoHorizontalOverflow(app);
    await form.save();

    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}/Action/[0-9a-f-]{36}$`));
    const [saved] = await api.listActions(session.Id);
    expect(saved.Description).toBe('Шаурма');
    expect(saved.Payers).toEqual([{ ParticipantId: session.Participants[1].Id, Amount: 12 }]);
    expect(saved.Consumptions[0].Consumers.map((c: any) => c.Amount)).toEqual([6, 6]);
  });

  test('paying off a debt', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open(`/Session/${session.Id}/Debts`);
    const debt = page.getByTestId('debt-row');
    await expect(debt.getByTestId('debt-debtor')).toHaveText('Bob');
    await expect(debt.getByTestId('debt-amount')).toHaveText('5.00₽');
    await expect(debt.getByTestId('debt-creditor')).toHaveText('Ann');
    await debt.getByTestId('debt-payoff-button').click();
    await app.confirm('yes');

    await expect(page.locator('#snackbar-container')).toContainText('погашен');
    await expect(debt).toHaveCount(0);
    expect(await api.listActions(session.Id)).toHaveLength(2);
  });
});
