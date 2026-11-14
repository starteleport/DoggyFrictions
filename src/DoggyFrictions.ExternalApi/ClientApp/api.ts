// The HTTP API (Controllers/*). Bodies are JSON with the server's property names.
export interface Participant {
  Id: string;
  Name: string;
}

export interface Session {
  Id: string;
  Name: string;
  Participants: Participant[];
}

export interface Payer {
  ParticipantId: string;
  Amount: number;
}

export interface Consumer {
  ParticipantId: string;
  Amount: number;
}

export interface Consumption {
  Description: string | null;
  Amount: number;
  Quantity: number;
  SplittedEqually: boolean;
  Consumers: Consumer[];
}

export interface Action {
  Id: string;
  SessionId: string;
  Description: string | null;
  /** "2026-01-15" when sent; the server answers with a full timestamp. */
  Date: string;
  Payers: Payer[];
  Consumptions: Consumption[];
}

export interface Debt {
  DebtorId: string;
  Debtor: string;
  CreditorId: string;
  Creditor: string;
  Amount: number;
}

export interface Page<T> {
  Page: number;
  TotalPages: number;
  Rows: T[];
}

/** An entity the server has not stored yet. */
export const NEW_ID = '0';

/** A request that failed: the server's explanation, or `offline` when it was never reached. */
export class ApiError extends Error {
  constructor(message: string, readonly offline = false) {
    super(message);
  }
}

async function send<T>(method: string, url: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // The request never reached the server: offline, or the server is down.
    throw new ApiError('', true);
  }

  const data = parseJson(await response.text());
  if (!response.ok) {
    throw new ApiError(describeProblem(data) || response.statusText || String(response.status));
  }
  return data as T;
}

// Empty for a bodiless answer, and an error page from a proxy is not JSON either.
function parseJson(text: string) {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

// Validation problems come back as { errors: { field: [messages] } }, other failures as { title }.
function describeProblem(problem: { errors?: Record<string, string[]>; title?: string } | undefined): string {
  if (problem?.errors) {
    return [...new Set(Object.values(problem.errors).flat())].join(' ');
  }
  return problem?.title ?? '';
}

const sessionUrl = (id: string) => `/api/Sessions/${encodeURIComponent(id)}`;
const actionsUrl = (sessionId: string) => `/api/Actions/${encodeURIComponent(sessionId)}`;
const actionUrl = (sessionId: string, id: string) => `${actionsUrl(sessionId)}/${encodeURIComponent(id)}`;

export const api = {
  sessions: () => send<Session[]>('GET', '/api/Sessions'),
  session: (id: string) => send<Session>('GET', sessionUrl(id)),
  saveSession: (session: Session) => session.Id === NEW_ID
    ? send<Session>('POST', '/api/Sessions', session)
    : send<Session>('PUT', sessionUrl(session.Id), session),
  deleteSession: (id: string) => send<unknown>('DELETE', sessionUrl(id)).then(() => true),

  actions: (sessionId: string, page: number, pageSize: number) =>
    send<Page<Action>>('GET', `${actionsUrl(sessionId)}?page=${page}&pageSize=${pageSize}`),
  action: (sessionId: string, id: string) => send<Action>('GET', actionUrl(sessionId, id)),
  saveAction: (action: Action) => action.Id === NEW_ID
    ? send<Action>('POST', actionsUrl(action.SessionId), action)
    : send<Action>('PUT', actionUrl(action.SessionId, action.Id), action),
  deleteAction: (sessionId: string, id: string) => send<unknown>('DELETE', actionUrl(sessionId, id)).then(() => true),
  /** Records a transfer that settles a debt (dated "2026-01-15"); answers with the action it created. */
  moveMoney: (sessionId: string, transfer: { FromId: string; ToId: string; Amount: number; Date: string }) =>
    send<Action>('POST', `${actionsUrl(sessionId)}/MoveMoney`, transfer),

  debts: (sessionId: string) => send<Debt[]>('GET', `/api/Debts/${encodeURIComponent(sessionId)}`),
};
