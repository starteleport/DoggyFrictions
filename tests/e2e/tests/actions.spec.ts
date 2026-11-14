import { test, expect, ActionForm } from './fixtures';

test.describe('Actions', () => {
  test('creating an expense splits it equally and lists it in the session', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}`);
    await page.getByTestId('create-action-button').click();
    const form = new ActionForm(app);

    await form.setDescription('Пицца');
    const item = await form.addConsumption('Маргарита', '10');
    await expect(form.shares(item)).toHaveText(['5.00₽', '5.00₽']);
    const payer = await form.addPayer('Ann');
    await expect(form.payerAmount(payer)).toHaveValue('10');
    await form.save();

    // Saved: the app moves to the read-only view of the new action.
    await expect(page).toHaveURL(new RegExp(`#/Session/${session.Id}/Action/[0-9a-f-]{36}$`));
    await app.loaded();
    await expect(page.getByTestId('action-title')).toHaveText('Пицца');
    await expect(form.consumptionRow(0)).toContainText('Маргарита');
    await expect(form.consumptionRow(0).locator('td.money-cell')).toHaveText(['10.00₽', '5.00₽', '5.00₽']);
    await expect(form.payerRow(0)).toContainText('Ann');
    await expect(form.payerRow(0)).toContainText('10.00₽');

    await app.open(`/Session/${session.Id}`);
    const row = page.getByTestId('session-action-row').filter({ hasText: 'Пицца' });
    await expect(row.locator('td.wide-cell')).toHaveText('Ann');
    await expect(row.locator('td.money-cell')).toHaveText('10.00₽');

    const [saved] = await api.listActions(session.Id);
    expect(saved.Payers).toEqual([{ ParticipantId: session.Participants[0].Id, Amount: 10 }]);
    expect(saved.Consumptions[0].Consumers.map((c: any) => c.Amount)).toEqual([5, 5]);
  });

  test('unchecking a participant moves the whole amount to the others', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob', 'Rex']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Такси');
    const item = await form.addConsumption('Поездка', '30');
    await expect(form.shares(item)).toHaveText(['10.00₽', '10.00₽', '10.00₽']);
    await form.consumptionRow(item).getByTestId('consumer-checkbox').first().uncheck();
    await expect(form.shares(item)).toHaveText(['0.00₽', '15.00₽', '15.00₽']);
    await form.addPayer('Ann');
    await form.save();

    await expect(page).toHaveURL(/\/Action\/[0-9a-f-]{36}$/);
    const [saved] = await api.listActions(session.Id);
    expect(saved.Consumptions[0].Consumers).toEqual([
      { ParticipantId: session.Participants[1].Id, Amount: 15 },
      { ParticipantId: session.Participants[2].Id, Amount: 15 },
    ]);
  });

  test('an expense can have several items and several payers', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Бар');
    await form.addConsumption('Пиво', '8');
    await form.addConsumption('Орешки', '4');
    await expect(form.total().locator('td.money-cell')).toHaveText(['12.00₽', '6.00₽', '6.00₽']);
    await form.addPayer('Ann', '7');
    // The second payer is pre-filled with what is still unpaid.
    const second = await form.addPayer('Bob');
    await expect(form.payerAmount(second)).toHaveValue('5');
    await form.save();

    await expect(page).toHaveURL(/\/Action\/[0-9a-f-]{36}$/);
    await app.open(`/Session/${session.Id}`);
    const row = page.getByTestId('session-action-row').filter({ hasText: 'Бар' });
    await expect(row.locator('td.money-cell')).toHaveText('12.00₽');
    await expect(row.locator('td.wide-cell')).toContainText('Ann');
    await expect(row.locator('td.wide-cell')).toContainText('Bob');
  });

  test('quantity multiplies the price of an item', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Пиво');
    const item = await form.addConsumption('Кружка', '3', '2');
    await expect(form.shares(item)).toHaveText(['3.00₽', '3.00₽']);
    await expect(form.total().locator('td.money-cell').first()).toHaveText('6.00₽');
    const payer = await form.addPayer('Ann');
    await expect(form.payerAmount(payer)).toHaveValue('6');
    await form.save();

    await expect(page).toHaveURL(/\/Action\/[0-9a-f-]{36}$/);
    await expect(page.getByTestId('action-title')).toHaveText('Пиво');
    await expect(form.total().locator('td.money-cell').first()).toHaveText('6.00₽');

    await app.open(`/Session/${session.Id}/Debts`);
    const debt = page.getByTestId('debt-row');
    await expect(debt.getByTestId('debt-debtor')).toHaveText('Bob');
    await expect(debt.getByTestId('debt-amount')).toHaveText('3.00₽');
    await expect(debt.getByTestId('debt-creditor')).toHaveText('Ann');
  });

  test('editing an expense persists the new amounts', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    const action = await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open(`/Session/${session.Id}/Action/Edit/${action.Id}`);
    const form = new ActionForm(app);
    await expect(form.description()).toHaveValue('Пицца');
    await form.setDescription('Большая пицца');
    await app.type(form.consumptionAmount(0), '20');
    await expect(form.shares(0)).toHaveText(['10.00₽', '10.00₽']);
    await app.type(form.payerAmount(0), '20');
    await form.save();

    await expect(page).toHaveURL(new RegExp(`/Action/${action.Id}$`));
    await app.loaded();
    await expect(page.getByTestId('action-title')).toHaveText('Большая пицца');
    await expect(form.consumptionRow(0).locator('td.money-cell')).toHaveText(['20.00₽', '10.00₽', '10.00₽']);

    const actions = await api.listActions(session.Id);
    expect(actions).toHaveLength(1);
    expect(actions[0].Description).toBe('Большая пицца');
    expect(actions[0].Payers[0].Amount).toBe(20);
  });

  test('deleting an expense from the session requires confirmation', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

    await app.open(`/Session/${session.Id}`);
    const row = page.getByTestId('session-action-row').filter({ hasText: 'Пицца' });
    await row.getByTestId('delete-action-button').click();
    await expect(app.confirmDialog().getByTestId('confirm-dialog-title')).toHaveText('Удаление расхода');
    await app.confirm('no');
    await expect(row).toBeVisible();

    await row.getByTestId('delete-action-button').click();
    await app.confirm('yes');
    await expect(page.getByTestId('actions-empty')).toHaveText('Расходов пока нет');
    expect(await api.listActions(session.Id)).toHaveLength(0);
  });

  test('an expense where paid differs from spent is rejected', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Не сходится');
    await form.addConsumption('Пицца', '10');
    await form.addPayer('Ann', '7');
    await form.save();

    // The toast carries the server's explanation, not a bare status.
    await expect(app.errorToast()).toContainText('Сумма оплат не совпадает со стоимостью позиций.');
    await expect(page).toHaveURL(/\/Action\/Create$/);
    expect(await api.listActions(session.Id)).toHaveLength(0);
  });

  test('an expense without a payer is rejected', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Без плательщика');
    await form.save();

    await expect(app.errorToast()).toContainText('Укажите, кто платил.');
    await expect(page).toHaveURL(/\/Action\/Create$/);
    expect(await api.listActions(session.Id)).toHaveLength(0);
  });

  test('an item name echoed in a validation error is shown as text, never run as HTML', async ({ app, api, page }) => {
    const evil = '<img src=x onerror="window.__xss=1">';
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Подвох');
    const item = await form.addConsumption(evil, '10');
    // Nobody consumes the item, so the server rejects it and quotes its name.
    for (const checkbox of await form.consumptionRow(item).getByTestId('consumer-checkbox').all()) await checkbox.uncheck();
    await form.addPayer('Ann', '10');
    await form.save();

    await expect(app.errorToast()).toContainText(`Доли по позиции «${evil}» не сходятся с её стоимостью.`);
    await expect(app.errorToast().locator('img')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });

  test('quantity accepts a decimal comma', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Сыр');
    await form.addConsumption('Кило с половиной', '10', '1,5');
    await expect(form.total().locator('td.money-cell').first()).toHaveText('15.00₽');
    const payer = await form.addPayer('Ann');
    await expect(form.payerAmount(payer)).toHaveValue('15');
    await form.save();

    await expect(page).toHaveURL(/\/Action\/[0-9a-f-]{36}$/);
    const [saved] = await api.listActions(session.Id);
    expect(saved.Consumptions[0].Quantity).toBe(1.5);
    expect(saved.Consumptions[0].Consumers.map((c: any) => c.Amount)).toEqual([7.5, 7.5]);
  });

  test('a blank quantity is explained instead of failing obscurely', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open(`/Session/${session.Id}/Action/Create`);
    const form = new ActionForm(app);

    await form.setDescription('Без количества');
    await form.addConsumption('Пицца', '10', '');
    await form.addPayer('Ann', '10');
    await form.save();

    await expect(app.errorToast()).toContainText('Позиция «Пицца»: цена и доли должны быть от 0');
    await expect(page).toHaveURL(/\/Action\/Create$/);
    expect(await api.listActions(session.Id)).toHaveLength(0);
  });
});
