import { expect, type Locator, type Page } from '@playwright/test';

export type SessionFixture = {
  id: string;
  name: string;
  participants: [string, string];
};

const SESSION_ID_PATTERN = /#\/Session\/([^/?]+)/;

export function uniqueName(prefix: string): string {
  const randomSuffix = Math.floor(Math.random() * 100_000);
  return `${prefix}-${Date.now()}-${randomSuffix}`;
}

function readSessionIdFromUrl(url: string): string {
  const match = url.match(SESSION_ID_PATTERN);
  if (!match?.[1]) {
    throw new Error(`Unable to parse session id from url: ${url}`);
  }
  return match[1];
}

async function forceMoneyInputCommit(locator: Locator, value: string): Promise<void> {
  await locator.fill(value);
  await locator.dispatchEvent('change');
}

export async function gotoSessions(page: Page): Promise<void> {
  await page.goto('/#/Sessions');
  await expect(page.getByTestId('sessions-view')).toBeVisible();
  await expect(page.getByTestId('create-session-button')).toBeVisible();
}

export async function createSessionViaUi(
  page: Page,
  sessionName: string,
  participants: [string, string]
): Promise<SessionFixture> {
  await gotoSessions(page);
  await page.getByTestId('create-session-button').click();

  await expect(page.getByTestId('session-edit-view')).toBeVisible();
  await page.getByTestId('session-name-input').fill(sessionName);

  for (const participantName of participants) {
    await page.getByTestId('add-participant-button').click();
    const inputs = page.getByTestId('participant-name-input');
    const index = (await inputs.count()) - 1;
    await inputs.nth(index).fill(participantName);
    await inputs.nth(index).dispatchEvent('change');
  }

  await page.getByTestId('save-session-button').click();
  await expect(page.getByTestId('session-view')).toBeVisible();
  await expect(page.getByTestId('session-title')).toHaveText(sessionName);

  const summary = page.getByTestId('session-participants-summary');
  await expect(summary).toContainText(participants[0]);
  await expect(summary).toContainText(participants[1]);

  return {
    id: readSessionIdFromUrl(page.url()),
    name: sessionName,
    participants
  };
}

export async function createDebtProducingActionViaUi(
  page: Page,
  session: SessionFixture,
  actionDescription: string
): Promise<void> {
  await page.goto(`/#/Session/${session.id}/Action/Create`);
  await expect(page.getByTestId('action-view')).toBeVisible();

  await page.getByTestId('action-description-input').fill(actionDescription);
  await page.getByTestId('add-consumption-button').click();

  await page.getByTestId('consumption-description-input').first().fill('Dinner');
  await forceMoneyInputCommit(page.getByTestId('consumption-amount-input').first(), '100');
  await forceMoneyInputCommit(page.getByTestId('consumption-quantity-input').first(), '1');

  await page.getByTestId('add-payer-button').click();
  await expect(page.getByTestId('payer-amount-input').first()).toHaveValue('100');

  await page.getByTestId('save-action-button').click();
  await expect(page.getByTestId('action-title')).toHaveText(actionDescription);
}

export async function openDebtsPage(page: Page, sessionId: string): Promise<void> {
  await page.goto(`/#/Session/${sessionId}/Debts`);
  await expect(page.getByTestId('debts-view')).toBeVisible();
}
