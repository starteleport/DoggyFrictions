import { test, expect } from './fixtures';

test.describe('Debts', () => {
  test('a shared expense makes the consumer owe the payer', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open(`/Session/${session.Id}`);
    await page.getByTestId('session-debts-button').click();
    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}/Debts$`));
    await app.loaded();

    const debt = page.getByTestId('debt-row');
    await expect(debt).toHaveCount(1);
    await expect(debt.getByTestId('debt-debtor')).toHaveText('Bob');
    await expect(debt.getByTestId('debt-amount')).toHaveText('5.00₽');
    await expect(debt.getByTestId('debt-creditor')).toHaveText('Ann');

    const bob = page.getByTestId('balance-row').filter({ hasText: 'Bob' }).getByTestId('balance-amount');
    const ann = page.getByTestId('balance-row').filter({ hasText: 'Ann' }).getByTestId('balance-amount');
    await expect(bob).toHaveText('-5.00₽');
    await expect(bob).toHaveClass(/text-danger/);
    await expect(ann).toHaveText('5.00₽');
    await expect(ann).toHaveClass(/text-success/);
  });

  test('every consumer owes their own share to the payer', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob', 'Rex']);
    await api.createAction(session, { description: 'Ужин', payer: 'Ann', amount: 30, consumers: ['Ann', 'Bob', 'Rex'] });

    await app.open(`/Session/${session.Id}/Debts`);

    await expect(page.getByTestId('debt-debtor')).toHaveText(['Bob', 'Rex']);
    await expect(page.getByTestId('debt-amount')).toHaveText(['10.00₽', '10.00₽']);
    await expect(page.getByTestId('debt-creditor')).toHaveText(['Ann', 'Ann']);
  });

  test('mutual expenses cancel each other out', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Кофе', payer: 'Ann', amount: 10, consumers: ['Bob'] });
    await api.createAction(session, { description: 'Чай', payer: 'Bob', amount: 10, consumers: ['Ann'] });

    await app.open(`/Session/${session.Id}/Debts`);

    await expect(page.getByTestId('debts-view')).toBeVisible();
    await expect(page.getByTestId('debt-row')).toHaveCount(0);
    await expect(page.getByTestId('balances-empty')).toHaveText('Долгов нет');
    await expect(page.getByTestId('debts-empty')).toHaveText('Долгов нет');
  });

  test('paying off a debt records a transfer and clears the debt', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open(`/Session/${session.Id}/Debts`);
    await page.getByTestId('debt-payoff-button').click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-title')).toHaveText('Погасить долг');
    await app.confirm('yes');

    await expect(page.locator('#snackbar-container')).toContainText('Долг между Bob и Ann погашен.');
    await expect(page.getByTestId('debt-row')).toHaveCount(0);
    await expect(page.getByTestId('debts-empty')).toHaveText('Долгов нет');

    const actions = await api.listActions(session.Id);
    expect(actions.map(a => a.Description).sort()).toEqual(['Bob -> Ann', 'Пицца']);
    const transfer = actions.find(a => a.Description === 'Bob -> Ann');
    expect(transfer.Payers).toEqual([{ ParticipantId: session.Participants[1].Id, Amount: 5 }]);
  });

  test('paying off between participants with the same name settles the right ones', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Ann']);
    const [first, second] = session.Participants;
    await api.createAction(session, { description: 'Кофе', payer: first, amount: 10, consumers: [second] });

    await app.open(`/Session/${session.Id}/Debts`);
    await expect(page.getByTestId('debt-amount')).toHaveText('10.00₽');
    await page.getByTestId('debt-payoff-button').click();
    await app.confirm('yes');

    await expect(page.getByTestId('debts-empty')).toHaveText('Долгов нет');
    const transfer = (await api.listActions(session.Id)).find(a => a.Description === 'Ann -> Ann');
    expect(transfer.Payers).toEqual([{ ParticipantId: second.Id, Amount: 10 }]);
    expect(transfer.Consumptions[0].Consumers).toEqual([{ ParticipantId: first.Id, Amount: 10 }]);
  });

  test('participant names are shown as text, never run as HTML', async ({ app, api, page }) => {
    const evil = '<img src=x onerror="window.__xss=1">';
    const session = await api.createSession(['Ann', evil]);
    await api.createAction(session, { description: 'Кофе', payer: 'Ann', amount: 10, consumers: [evil] });

    await app.open(`/Session/${session.Id}/Debts`);
    await expect(page.getByTestId('debt-debtor')).toHaveText(evil);
    await page.getByTestId('debt-payoff-button').click();
    await app.confirm('yes');

    // The pay-off toast is the one place rendered as HTML (it carries a link).
    const toast = page.locator('#snackbar-container .snackbar').last();
    await expect(toast).toContainText(`Долг между ${evil} и Ann погашен.`);
    await expect(toast.locator('img')).toHaveCount(0);
    await expect(toast.getByRole('link', { name: 'здесь' })).toBeVisible();
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });

  test('balances of participants with the same name are kept apart', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Ann']);
    const [first, second] = session.Participants;
    await api.createAction(session, { description: 'Кофе', payer: first, amount: 10, consumers: [second] });

    await app.open(`/Session/${session.Id}/Debts`);

    await expect(page.getByTestId('debt-amount')).toHaveText('10.00₽');
    await expect(page.getByTestId('balance-amount')).toHaveText(['-10.00₽', '10.00₽']);
  });
});
