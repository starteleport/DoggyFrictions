import { expect, test } from '@playwright/test';
import {
  createDebtProducingActionViaUi,
  createSessionViaUi,
  gotoSessions,
  openDebtsPage,
  uniqueName
} from './helpers';

test.describe('DoggyFrictions UI end-to-end', () => {
  test('creates a new session from the UI', async ({ page }) => {
    const sessionName = uniqueName('e2e-session');
    const participants: [string, string] = [uniqueName('Alpha'), uniqueName('Bravo')];

    const session = await createSessionViaUi(page, sessionName, participants);
    await gotoSessions(page);

    const matchingSessionRow = page.getByTestId('session-row').filter({ hasText: session.name });

    await expect(matchingSessionRow).toHaveCount(1);
    await expect(matchingSessionRow.first()).toContainText(participants[0]);
    await expect(matchingSessionRow.first()).toContainText(participants[1]);
  });

  test('creates an action and shows corresponding debt', async ({ page }) => {
    const sessionName = uniqueName('e2e-debt-session');
    const creditor = uniqueName('Alice');
    const debtor = uniqueName('Bob');
    const actionDescription = uniqueName('Dinner');

    const session = await createSessionViaUi(page, sessionName, [creditor, debtor]);
    await createDebtProducingActionViaUi(page, session, actionDescription);

    await openDebtsPage(page, session.id);

    const debtRow = page.getByTestId('debt-row').first();
    await expect(debtRow).toBeVisible();
    await expect(debtRow.getByTestId('debt-debtor')).toHaveText(debtor);
    await expect(debtRow.getByTestId('debt-creditor')).toHaveText(creditor);
    await expect(debtRow.getByTestId('debt-amount')).toContainText('50.00');

    const creditorBalanceRow = page.getByTestId('balance-row').filter({ hasText: creditor });
    const debtorBalanceRow = page.getByTestId('balance-row').filter({ hasText: debtor });
    await expect(page.getByTestId('balance-row')).toHaveCount(2);
    await expect(creditorBalanceRow).toHaveCount(1);
    await expect(debtorBalanceRow).toHaveCount(1);
    await expect(creditorBalanceRow.getByTestId('balance-amount')).toHaveText('50.00₽');
    await expect(debtorBalanceRow.getByTestId('balance-amount')).toHaveText('-50.00₽');
    await expect(page.getByTestId('balances-empty')).toBeHidden();
  });

  test('pays off a debt and creates a payoff action', async ({ page }) => {
    const sessionName = uniqueName('e2e-payoff-session');
    const creditor = uniqueName('Alice');
    const debtor = uniqueName('Bob');
    const actionDescription = uniqueName('Rent');

    const session = await createSessionViaUi(page, sessionName, [creditor, debtor]);
    await createDebtProducingActionViaUi(page, session, actionDescription);
    await openDebtsPage(page, session.id);

    const payoffResponsePromise = page.waitForResponse((response) => {
      return response.request().method() === 'POST' && response.url().includes('/MoveMoney');
    });
    const debtsReloadPromise = page.waitForResponse((response) => {
      return response.request().method() === 'GET' && response.url().includes(`/Debts/${session.id}`);
    });

    await page.getByTestId('debt-payoff-button').first().click();
    await page.getByTestId('confirm-dialog-yes').click();
    const payoffResponse = await payoffResponsePromise;
    await debtsReloadPromise;

    expect(payoffResponse.ok()).toBeTruthy();
    await expect(page.getByTestId('debt-row')).toHaveCount(0);
    await expect(page.getByTestId('balance-row')).toHaveCount(0);
    await expect(page.getByTestId('balances-empty')).toBeVisible();
    await expect(page.getByTestId('debts-empty')).toBeVisible();

    await page.goto(`/#/Session/${session.id}`);
    await expect(page.getByTestId('session-view')).toBeVisible();
    await expect(page.getByTestId('session-view')).toContainText(`${debtor} -> ${creditor}`);
  });
});
