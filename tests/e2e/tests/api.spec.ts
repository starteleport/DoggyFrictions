import { test, expect } from './fixtures';

const pizza = { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] };
const MISSING = '00000000-0000-0000-0000-000000000000';

test.describe('API', () => {
  // Validation messages come in the language the client asks for; these tests assert the Russian ones.
  test.use({ extraHTTPHeaders: { 'Accept-Language': 'ru' } });

  test('validation messages follow the requested language', async ({ api, playwright, baseURL }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    const message = async (headers: Record<string, string>) => {
      const client = await playwright.request.newContext({ baseURL, extraHTTPHeaders: headers });
      const response = await client.post(`/api/Actions/${session.Id}`, {
        data: { ...api.actionBody(session, pizza), Payers: [] },
      });
      const body = await response.json();
      await client.dispose();
      return body.errors.Payers[0];
    };

    expect(await message({ 'Accept-Language': 'ru-RU,ru;q=0.9' })).toBe('Укажите, кто платил.');
    expect(await message({ 'Accept-Language': 'en-GB' })).toBe('Specify who paid.');
    expect(await message({})).toBe('Specify who paid.');
    // The choice made in the settings menu (a cookie) wins over the browser.
    expect(await message({ 'Accept-Language': 'en-GB', Cookie: 'lang=ru' })).toBe('Укажите, кто платил.');
    expect(await message({ 'Accept-Language': 'ru', Cookie: 'lang=en' })).toBe('Specify who paid.');
  });

  test.describe('request format', () => {
    test('bodies are JSON; form-encoded data is refused', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);

      const asForm = await request.post('/api/Sessions', {
        form: { Id: '0', Name: 'Form', 'Participants[0].Id': '0', 'Participants[0].Name': 'Ann' },
      });
      expect(asForm.status()).toBe(415);

      const asJson = await request.post(`/api/Actions/${session.Id}`, { data: api.actionBody(session, pizza) });
      expect(asJson.status()).toBe(200);
      expect(asJson.headers()['content-type']).toContain('application/json');
    });

    test('malformed or incomplete JSON is a validation error, not a crash', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const post = (data: unknown) => request.post(`/api/Actions/${session.Id}`, { data });
      const body = api.actionBody(session, pizza);

      const malformed = await request.post(`/api/Actions/${session.Id}`, {
        data: '{ not json', headers: { 'Content-Type': 'application/json' },
      });
      expect(malformed.status()).toBe(400);
      expect((await post({})).status()).toBe(400);
      expect((await post({ ...body, SessionId: undefined })).status()).toBe(400);
      expect((await post({ ...body, Payers: null })).status()).toBe(400);
      expect((await post({ ...body, Consumptions: [null] })).status()).toBe(400);
      expect((await post({ ...body, Consumptions: [{ ...body.Consumptions[0], Consumers: null }] })).status()).toBe(400);
      expect((await post({ ...body, Payers: [{ Amount: 10 }] })).status()).toBe(400);
      expect(await api.listActions(session.Id)).toHaveLength(0);

      const sessions = (data: unknown) => request.post('/api/Sessions', { data });
      expect((await sessions({ Id: '0', Name: 'x', Participants: [null] })).status()).toBe(400);
      expect((await sessions({ Id: '0', Name: 'x', Participants: [{ Id: '0' }] })).status()).toBe(400);
      expect((await sessions({ Id: '0', Participants: [{ Id: '0', Name: 'Ann' }] })).status()).toBe(400);
    });

    test('numbers may arrive as strings and items may be unnamed, as the app sends them', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const body = api.actionBody(session, pizza);
      const data = {
        ...body,
        Payers: [{ ...body.Payers[0], Amount: '10' }],
        Consumptions: [{ ...body.Consumptions[0], Description: undefined, Quantity: '1' }],
      };

      const response = await request.post(`/api/Actions/${session.Id}`, { data });

      expect(response.status()).toBe(200);
      const saved = await response.json();
      expect(saved.Payers[0].Amount).toBe(10);
      expect(saved.Consumptions[0].Description).toBeNull();
      expect(saved.Date).toContain('2026-01-15');
    });
  });

  test.describe('missing entities answer 404', () => {
    test('sessions', async ({ request }) => {
      expect((await request.get(`/api/Sessions/${MISSING}`)).status()).toBe(404);
      expect((await request.delete(`/api/Sessions/${MISSING}`)).status()).toBe(404);
      const put = await request.put(`/api/Sessions/${MISSING}`, {
        data: { Id: MISSING, Name: 'x', Participants: [{ Id: '0', Name: 'Ann' }] },
      });
      expect(put.status()).toBe(404);
      expect((await request.get(`/api/Debts/${MISSING}`)).status()).toBe(404);
      expect((await request.get(`/api/Actions/${MISSING}`)).status()).toBe(404);
    });

    test('actions', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);

      expect((await request.get(`/api/Actions/${session.Id}/${MISSING}`)).status()).toBe(404);
      expect((await request.delete(`/api/Actions/${session.Id}/${MISSING}`)).status()).toBe(404);
      const put = await request.put(`/api/Actions/${session.Id}/${MISSING}`, {
        data: { ...api.actionBody(session, pizza), Id: MISSING },
      });
      expect(put.status()).toBe(404);
      // An action of an unknown session cannot be created either.
      const post = await request.post(`/api/Actions/${MISSING}`, {
        data: { ...api.actionBody(session, pizza), SessionId: MISSING },
      });
      expect(post.status()).toBe(404);
    });

    test('an action is only reachable through its own session', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const other = await api.createSession(['Ann', 'Bob']);
      const action = await api.createAction(session, pizza);

      expect((await request.get(`/api/Actions/${other.Id}/${action.Id}`)).status()).toBe(404);
      expect((await request.delete(`/api/Actions/${other.Id}/${action.Id}`)).status()).toBe(404);
      expect((await request.get(`/api/Actions/${session.Id}/${action.Id}`)).status()).toBe(200);
    });
  });

  test.describe('paging of actions', () => {
    test('works without paging parameters', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      await api.createAction(session, pizza);

      const response = await request.get(`/api/Actions/${session.Id}`);

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ Page: 1, TotalPages: 1 });
    });

    test('counts pages exactly', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      for (let i = 0; i < 4; i++) await api.createAction(session, { ...pizza, description: `Пицца ${i}` });

      const page = async (query: string) => (await request.get(`/api/Actions/${session.Id}?${query}`)).json();

      expect((await page('Page=1&PageSize=2')).TotalPages).toBe(2);
      expect((await page('Page=1&PageSize=3')).TotalPages).toBe(2);
      expect((await page('Page=2&PageSize=3')).Rows).toHaveLength(1);
      expect((await page('Page=1&PageSize=4')).TotalPages).toBe(1);
    });

    test('an empty session has one empty page', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);

      expect(await (await request.get(`/api/Actions/${session.Id}?Page=1&PageSize=25`)).json())
        .toEqual({ Page: 1, TotalPages: 1, Rows: [] });
    });
  });

  test.describe('saving returns what was stored', () => {
    test('a created session reports the participant ids it was saved with', async ({ api, request }) => {
      const response = await request.post('/api/Sessions', {
        data: { Id: '0', Name: 'Ids', Participants: [{ Id: '0', Name: 'Ann' }] },
      });
      const created = await response.json();
      api.track(created.Id);

      expect(created).toEqual(await api.getSession(created.Id));
    });

    test('an updated session and action come back in their new state', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const action = await api.createAction(session, pizza);

      const renamed = await request.put(`/api/Sessions/${session.Id}`, { data: { ...session, Name: 'Новое имя' } });
      expect((await renamed.json()).Name).toBe('Новое имя');

      const edited = await request.put(`/api/Actions/${session.Id}/${action.Id}`, {
        data: { ...api.actionBody(session, { ...pizza, description: 'Кальцоне' }), Id: action.Id },
      });
      expect((await edited.json()).Description).toBe('Кальцоне');
    });
  });

  test.describe('validation of actions', () => {
    test('route and body must agree', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const other = await api.createSession(['Ann', 'Bob']);
      const action = await api.createAction(session, pizza);

      const wrongSession = await request.post(`/api/Actions/${other.Id}`, { data: api.actionBody(session, pizza) });
      expect(wrongSession.status()).toBe(400);
      const wrongId = await request.put(`/api/Actions/${session.Id}/${action.Id}`, {
        data: { ...api.actionBody(session, pizza), Id: MISSING },
      });
      expect(wrongId.status()).toBe(400);
    });

    test('participants must belong to the session', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const stranger = { Id: MISSING, Name: 'Stranger' };

      const response = await request.post(`/api/Actions/${session.Id}`, {
        data: api.actionBody(session, { ...pizza, consumers: ['Ann', stranger] }),
      });

      expect(response.status()).toBe(400);
      expect(JSON.stringify(await response.json())).toContain('должны быть участниками группы');
      expect(await api.listActions(session.Id)).toHaveLength(0);
      // The debts page of the session keeps working.
      expect((await request.get(`/api/Debts/${session.Id}`)).status()).toBe(200);
    });

    test('shares must add up to the item price', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const body = api.actionBody(session, pizza);
      body.Consumptions[0].Consumers[1].Amount = 1;

      const response = await request.post(`/api/Actions/${session.Id}`, { data: body });

      expect(response.status()).toBe(400);
      expect(JSON.stringify(await response.json())).toContain('не сходятся');
    });

    test('negative amounts and zero quantity are rejected', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const zeroQuantity = api.actionBody(session, pizza);
      zeroQuantity.Consumptions[0].Quantity = 0;
      const negative = api.actionBody(session, pizza);
      negative.Consumptions[0].Amount = -10;
      negative.Payers[0].Amount = -10;

      expect((await request.post(`/api/Actions/${session.Id}`, { data: zeroQuantity })).status()).toBe(400);
      expect((await request.post(`/api/Actions/${session.Id}`, { data: negative })).status()).toBe(400);
      expect(await api.listActions(session.Id)).toHaveLength(0);
    });
  });

  test.describe('participants with the same name', () => {
    test('debts keep them apart', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Ann']);
      const [first, second] = session.Participants;
      await api.createAction(session, { description: 'Кофе', payer: first, amount: 10, consumers: [second] });

      const debts = await (await request.get(`/api/Debts/${session.Id}`)).json();

      expect(debts).toEqual([{ DebtorId: second.Id, CreditorId: first.Id, Debtor: 'Ann', Creditor: 'Ann', Amount: 10 }]);
    });

    test('a transfer names its sides by id', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Ann']);
      const [first, second] = session.Participants;

      const response = await request.post(`/api/Actions/${session.Id}/MoveMoney`, {
        data: { FromId: second.Id, ToId: first.Id, Amount: 5 },
      });

      expect(response.status()).toBe(200);
      const action = await response.json();
      expect(action.Description).toBe('Ann -> Ann');
      expect(action.Payers).toEqual([{ ParticipantId: second.Id, Amount: 5 }]);
      expect(action.Consumptions[0].Consumers).toEqual([{ ParticipantId: first.Id, Amount: 5 }]);
    });
  });

  test.describe('transfers', () => {
    test('both sides must be different participants of the session', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const [ann, bob] = session.Participants;
      const move = (data: object) => request.post(`/api/Actions/${session.Id}/MoveMoney`, { data });

      expect((await move({ FromId: MISSING, ToId: ann.Id, Amount: 5 })).status()).toBe(400);
      expect((await move({ FromId: ann.Id, ToId: ann.Id, Amount: 5 })).status()).toBe(400);
      expect((await move({ ToId: ann.Id, Amount: 5 })).status()).toBe(400);
      expect((await move({ FromId: bob.Id, ToId: ann.Id, Amount: 0 })).status()).toBe(400);
      expect(await api.listActions(session.Id)).toHaveLength(0);
    });

    test('a reason becomes the description; a blank one falls back to the default', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const [ann, bob] = session.Participants;
      const move = async (reason?: string) =>
        (await request.post(`/api/Actions/${session.Id}/MoveMoney`, {
          data: { FromId: bob.Id, ToId: ann.Id, Amount: 5, Reason: reason },
        })).json();

      expect((await move('за пиццу')).Description).toBe('за пиццу');
      expect((await move('')).Description).toBe('Bob -> Ann');
      expect((await move()).Description).toBe('Bob -> Ann');
    });
  });

  test.describe('participants of a session', () => {
    test('one referenced by an action cannot be removed', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob', 'Rex']);
      const [ann, bob, rex] = session.Participants;
      await api.createAction(session, pizza);
      const put = (participants: object[]) =>
        request.put(`/api/Sessions/${session.Id}`, { data: { ...session, Participants: participants } });

      const withoutBob = await put([ann, rex]);
      expect(withoutBob.status()).toBe(400);
      expect(JSON.stringify(await withoutBob.json())).toContain('Нельзя удалить участника');

      // Rex has no actions, so he may go.
      expect((await put([ann, bob])).status()).toBe(200);
      expect((await api.getSession(session.Id)).Participants).toEqual([ann, bob]);
    });

    test('ids are assigned by the server and must be unique', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const [ann, bob] = session.Participants;
      const put = (participants: object[]) =>
        request.put(`/api/Sessions/${session.Id}`, { data: { ...session, Participants: participants } });

      expect((await put([ann, bob, { ...ann, Name: 'Clone' }])).status()).toBe(400);
      expect((await put([ann, bob, { Id: MISSING, Name: 'Invented' }])).status()).toBe(400);
      const invented = await request.post('/api/Sessions', {
        data: { Id: '0', Name: 'x', Participants: [{ Id: MISSING, Name: 'Invented' }] },
      });
      expect(invented.status()).toBe(400);

      // Several new participants at once are fine.
      const added = await put([ann, bob, { Id: '0', Name: 'Rex' }, { Id: '0', Name: 'Max' }]);
      expect(added.status()).toBe(200);
      const ids = (await added.json()).Participants.map((p: any) => p.Id);
      expect(new Set(ids).size).toBe(4);
    });
  });

  test.describe('amounts', () => {
    test('a manual split may be a kopeck off', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob', 'Rex']);
      const body = api.actionBody(session, { ...pizza, consumers: ['Ann', 'Bob', 'Rex'] });
      body.Consumptions[0].Consumers.forEach(consumer => (consumer.Amount = 3.33));

      expect((await request.post(`/api/Actions/${session.Id}`, { data: body })).status()).toBe(200);
    });

    test('absurd values are a validation error, not a crash', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const huge = api.actionBody(session, pizza);
      huge.Consumptions[0].Quantity = 1e30;
      const pricey = api.actionBody(session, pizza);
      pricey.Consumptions[0].Amount = 1e20;
      pricey.Payers[0].Amount = 1e20;

      expect((await request.post(`/api/Actions/${session.Id}`, { data: huge })).status()).toBe(400);
      expect((await request.post(`/api/Actions/${session.Id}`, { data: pricey })).status()).toBe(400);
    });

    test('a stored action carries exactly its own fields', async ({ api, request }) => {
      const session = await api.createSession(['Ann', 'Bob']);
      const body = api.actionBody(session, pizza);

      const saved = await (await request.post(`/api/Actions/${session.Id}`, { data: body })).json();

      expect(saved).toEqual({ ...body, Id: saved.Id, Date: '2026-01-15T00:00:00' });
    });
  });
});
