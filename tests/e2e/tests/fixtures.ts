import { test as base, expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

export interface Participant { Id: string; Name: string }
export interface Session { Id: string; Name: string; Participants: Participant[] }

export interface ActionSeed {
  description: string;
  /** Who paid the whole amount: a participant, or the name of one. */
  payer: Participant | string;
  amount: number;
  /** Who shares the amount equally: participants or their names. */
  consumers: (Participant | string)[];
}

export interface ActionBody {
  Id: string;
  SessionId: string;
  Description: string;
  Date: string;
  Payers: { ParticipantId: string; Amount: number }[];
  Consumptions: {
    Description: string;
    Amount: number;
    Quantity: number;
    SplittedEqually: boolean;
    Consumers: { ParticipantId: string; Amount: number }[];
  }[];
}

/** Server-side helpers for arranging data without clicking through the UI. */
export class Api {
  private readonly created: string[] = [];

  constructor(private readonly request: APIRequestContext) {}

  async createSession(participants: string[], name = uniqueName('Тёрка')): Promise<Session> {
    const data = { Id: '0', Name: name, Participants: participants.map(p => ({ Id: '0', Name: p })) };
    const response = await this.request.post('/api/Sessions', { data });
    expect(response.ok(), await response.text()).toBeTruthy();
    const session: Session = await response.json();
    this.created.push(session.Id);
    return session;
  }

  async getSession(id: string): Promise<Session> {
    return (await this.request.get(`/api/Sessions/${id}`)).json();
  }

  /** Request body of a one-item action, as the app itself would post it. */
  actionBody(session: Session, seed: ActionSeed): ActionBody {
    const id = (who: Participant | string) =>
      typeof who === 'string' ? session.Participants.find(p => p.Name === who)!.Id : who.Id;
    const share = Math.round((seed.amount / seed.consumers.length) * 100) / 100;
    return {
      Id: '0',
      SessionId: session.Id,
      Description: seed.description,
      Date: '2026-01-15',
      Payers: [{ ParticipantId: id(seed.payer), Amount: seed.amount }],
      Consumptions: [{
        Description: seed.description,
        Amount: seed.amount,
        Quantity: 1,
        SplittedEqually: true,
        // Like the app, give the rounding remainder to the last consumer.
        Consumers: seed.consumers.map((c, i) => ({
          ParticipantId: id(c),
          Amount: i === seed.consumers.length - 1 ? Math.round((seed.amount - share * i) * 100) / 100 : share,
        })),
      }],
    };
  }

  async createAction(session: Session, seed: ActionSeed): Promise<{ Id: string }> {
    const response = await this.request.post(`/api/Actions/${session.Id}`, { data: this.actionBody(session, seed) });
    expect(response.ok(), await response.text()).toBeTruthy();
    return response.json();
  }

  async listActions(sessionId: string): Promise<any[]> {
    const page = await (await this.request.get(`/api/Actions/${sessionId}?Page=1&PageSize=100`)).json();
    return page.Rows;
  }

  async listSessions(): Promise<Session[]> {
    return (await this.request.get('/api/Sessions')).json();
  }

  /** Registers a session created through the UI so it is removed after the test. */
  track(sessionId: string) {
    this.created.push(sessionId);
  }

  async cleanup() {
    for (const id of this.created) {
      await this.request.delete(`/api/Sessions/${id}`).catch(() => undefined);
    }
  }
}

export const test = base.extend<{ api: Api; app: App }>({
  api: async ({ request }, use) => {
    const api = new Api(request);
    await use(api);
    await api.cleanup();
  },

  app: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    await use(new App(page));
    expect(errors, 'uncaught JavaScript errors on the page').toEqual([]);
  },
});

export { expect };

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Thin wrapper over the page for the things every scenario does. */
export class App {
  constructor(readonly page: Page) {}

  /** Navigates the single-page app to a hash route and waits until its view is rendered. */
  async open(route: string) {
    await this.page.goto(`/#${route}`);
    await this.loaded();
  }

  async loaded() {
    await expect(this.page.locator('#loading-screen')).toBeHidden();
  }

  /** Amount fields take what was typed on `change`, which `fill` alone does not raise. */
  async type(input: Locator, value: string) {
    await input.fill(value);
    await input.dispatchEvent('change');
  }

  /** The confirmation modal once it is shown. */
  confirmDialog() {
    return this.page.locator('[data-testid="confirm-dialog"].show');
  }

  /** Answers the app's confirmation modal and waits for it to go away. */
  async confirm(answer: 'yes' | 'no') {
    await expect(this.confirmDialog()).toBeVisible();
    await this.confirmDialog().getByTestId(`confirm-dialog-${answer}`).click();
    await expect(this.page.getByTestId('confirm-dialog')).toHaveCount(0);
  }

  /**
   * Waits until the service worker controls the page and has cached what an offline start needs.
   * Works on the very first visit: nothing else has to be loaded beforehand.
   */
  async waitForOfflineShell() {
    await this.page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await expect.poll(() => this.page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect.poll(() => this.page.evaluate(async () => {
      const paths = (await (await caches.open('doggy-frictions-v2')).keys()).map(request => new URL(request.url).pathname);
      return ['/', '/dist/app.js', '/dist/app.css'].every(path => paths.includes(path));
    })).toBe(true);
  }

  /** The error toast the app shows when a request fails. */
  errorToast() {
    return this.page.locator('#snackbar-container .snackbar', { hasText: 'Ошибка' });
  }

  sessionIdFromUrl(): string {
    const match = /#\/Session\/([0-9a-f-]{36})/.exec(this.page.url());
    if (!match) throw new Error(`Not on a session page: ${this.page.url()}`);
    return match[1];
  }
}

/**
 * The action form (`#/Session/:id/Action/Create` and `.../Edit/:id`).
 * The page is responsive (rows become cards on a phone) with the same data-testid hooks, so it drives both.
 */
export class ActionForm {
  readonly root: Locator;

  constructor(private readonly app: App) {
    this.root = app.page.getByTestId('action-view');
  }

  description() { return this.root.getByTestId('action-description-input'); }
  consumptionAmount(index: number) { return this.root.getByTestId('consumption-amount-input').nth(index); }
  payerAmount(index: number) { return this.root.getByTestId('payer-amount-input').nth(index); }
  /** Totals: overall amount first, then one per participant. */
  total() { return this.root.getByTestId('consumptions-total'); }

  /** Item rows, also present in the read-only view. */
  consumptionRow(index: number) { return this.root.getByTestId('consumption-row').nth(index); }
  payerRow(index: number) { return this.root.getByTestId('payer-row').nth(index); }
  /** Per-participant shares of an item while editing. */
  shares(index: number) { return this.consumptionRow(index).getByTestId('consumer-share'); }

  async setDescription(value: string) {
    await this.app.type(this.description(), value);
  }

  /** Adds an item and returns its index. */
  async addConsumption(description: string, amount: string, quantity?: string): Promise<number> {
    const index = await this.root.getByTestId('consumption-description-input').count();
    await this.root.getByTestId('add-consumption-button').click();
    await this.app.type(this.root.getByTestId('consumption-description-input').nth(index), description);
    await this.app.type(this.consumptionAmount(index), amount);
    if (quantity !== undefined) {
      await this.app.type(this.root.getByTestId('consumption-quantity-input').nth(index), quantity);
    }
    return index;
  }

  /** Adds a payer and returns its index; the app pre-fills the amount with the still unpaid rest. */
  async addPayer(name: string, amount?: string): Promise<number> {
    const index = await this.root.getByTestId('payer-select').count();
    await this.root.getByTestId('add-payer-button').click();
    await this.root.getByTestId('payer-select').nth(index).selectOption({ label: name });
    if (amount !== undefined) await this.app.type(this.payerAmount(index), amount);
    return index;
  }

  async save() {
    await this.root.getByTestId('save-action-button').click();
  }
}
