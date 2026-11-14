import type { Action, Debt, Participant } from '../api';
import { roundMoney } from '../format';
import { consumptionTotal } from './action';

/** "Ann, Bob, Rex". */
export function names(participants: Participant[]): string {
  return participants.map(participant => participant.Name).join(', ');
}

/** A participant's name by id ('' for one no longer in the session). */
export function nameOf(participants: Participant[], participantId: string): string {
  return participants.find(participant => participant.Id === participantId)?.Name ?? '';
}

/** Who paid for an expense, by name. */
export function payerNames(action: Action, participants: Participant[]): string {
  return action.Payers.map(payer => nameOf(participants, payer.ParticipantId)).join(', ');
}

/** What an expense cost in all. */
export function actionTotal(action: Action): number {
  return action.Consumptions.reduce((sum, consumption) => sum + consumptionTotal(consumption), 0);
}

export interface Balance {
  Name: string;
  /** Positive: others owe this participant; negative: they owe others. */
  Balance: number;
}

/** Each participant's balance over the debts, keyed by id: names are not unique within a session. */
export function balances(debts: Debt[]): Balance[] {
  const byId = new Map<string, Balance>();
  const balanceOf = (id: string, name: string) => {
    if (!byId.has(id)) byId.set(id, { Name: name, Balance: 0 });
    return byId.get(id)!;
  };
  for (const debt of debts) {
    balanceOf(debt.DebtorId, debt.Debtor).Balance -= debt.Amount;
    balanceOf(debt.CreditorId, debt.Creditor).Balance += debt.Amount;
  }
  return [...byId.values()];
}

/** Those who owe or are owed something, leaving out kopeck-sized float residue. */
export function owing(balances: Balance[]): Balance[] {
  return balances.filter(balance => roundMoney(balance.Balance) !== 0);
}
