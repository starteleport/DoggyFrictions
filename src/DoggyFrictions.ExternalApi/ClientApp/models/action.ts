// An expense (action) as the form edits it, and the rules of the form: how an item's price is
// split between its consumers and what a new payer is expected to pay.
import { NEW_ID, type Action, type Participant } from '../api';
import { dateOnly, roundMoney, today } from '../format';

export interface ConsumerForm {
  ParticipantId: string;
  Amount: number;
  IsActive: boolean;
}

export interface ConsumptionForm {
  /** Tells the rows apart for rendering; never sent. */
  key: number;
  Description: string;
  Amount: number;
  Quantity: number;
  /** Split equally between the active consumers; otherwise every share is typed in. */
  IsAuto: boolean;
  /** One per participant of the session, in the session's order. */
  Consumers: ConsumerForm[];
}

export interface PayerForm {
  key: number;
  ParticipantId: string;
  Amount: number;
}

export interface ActionForm {
  Id: string;
  SessionId: string;
  Description: string;
  /** The value of a date field: "2026-01-15". */
  Date: string;
  Payers: PayerForm[];
  Consumptions: ConsumptionForm[];
}

let lastKey = 0;
const nextKey = () => ++lastKey;

export function toForm(sessionId: string, participants: Participant[], action?: Action): ActionForm {
  return {
    Id: action?.Id ?? NEW_ID,
    SessionId: sessionId,
    Description: action?.Description ?? '',
    Date: action ? dateOnly(action.Date) : today(),
    Payers: (action?.Payers ?? []).map(payer => ({ key: nextKey(), ...payer })),
    Consumptions: (action?.Consumptions ?? []).map(consumption => ({
      key: nextKey(),
      Description: consumption.Description ?? '',
      Amount: consumption.Amount,
      Quantity: consumption.Quantity,
      IsAuto: consumption.SplittedEqually !== false,
      Consumers: participants.map(participant => {
        const amount = consumption.Consumers.find(consumer => consumer.ParticipantId === participant.Id)?.Amount ?? 0;
        return { ParticipantId: participant.Id, Amount: amount, IsActive: amount > 0 };
      }),
    })),
  };
}

/** The request body; only the consumers who take part are sent. A blank or unparsable number becomes 0. */
export function toAction(form: ActionForm): Action {
  const number = (value: number) => Number(value) || 0;
  return {
    Id: form.Id,
    SessionId: form.SessionId,
    Description: form.Description,
    Date: form.Date,
    Payers: form.Payers.map(payer => ({ ParticipantId: payer.ParticipantId, Amount: number(payer.Amount) })),
    Consumptions: form.Consumptions.map(consumption => ({
      Description: consumption.Description,
      Amount: number(consumption.Amount),
      Quantity: number(consumption.Quantity),
      SplittedEqually: consumption.IsAuto,
      Consumers: consumption.Consumers
        .filter(consumer => consumer.IsActive)
        .map(consumer => ({ ParticipantId: consumer.ParticipantId, Amount: number(consumer.Amount) })),
    })),
  };
}

/** What an item costs: price × quantity; 0 while either is not a number yet. */
export const consumptionTotal = (consumption: { Amount: number; Quantity: number }) =>
  Number(consumption.Amount) * Number(consumption.Quantity) || 0;

const consumerOf = (consumption: ConsumptionForm, participantId: string) =>
  consumption.Consumers.find(consumer => consumer.ParticipantId === participantId);

/** The price of all items. */
export function total(form: ActionForm): number {
  return form.Consumptions.reduce((sum, consumption) => sum + consumptionTotal(consumption), 0);
}

/** What each participant consumed, in the session's order. */
export function participantTotals(form: ActionForm, participants: Participant[]): number[] {
  return participants.map(participant => form.Consumptions.reduce(
    (sum, consumption) => sum + (consumerOf(consumption, participant.Id)?.Amount ?? 0),
    0));
}

/** Splits an item's price equally between its active consumers, the rounding remainder going to the last one. */
export function split(consumption: ConsumptionForm) {
  if (!consumption.IsAuto) {
    return;
  }
  const active = consumption.Consumers.filter(consumer => consumer.IsActive);
  const amount = consumptionTotal(consumption);
  const portion = roundMoney(amount / active.length);
  active.forEach((consumer, index) => {
    consumer.Amount = index < active.length - 1 ? portion : roundMoney(amount - portion * index);
  });
}

export function setPrice(consumption: ConsumptionForm, amount: number) {
  consumption.Amount = amount;
  split(consumption);
}

export function setQuantity(consumption: ConsumptionForm, quantity: number) {
  consumption.Quantity = quantity;
  split(consumption);
}

/** Takes a consumer in or out of an item; one who is out has no share. */
export function setConsumerActive(consumption: ConsumptionForm, consumer: ConsumerForm, active: boolean) {
  consumer.IsActive = active;
  if (!active) {
    consumer.Amount = 0;
  }
  split(consumption);
}

/**
 * Clicking a participant's column header: takes them out of every item if they are in the first one,
 * otherwise puts them into every item.
 */
export function toggleParticipant(form: ActionForm, participantId: string) {
  const first = form.Consumptions[0];
  if (!first) {
    return;
  }
  const active = !consumerOf(first, participantId)?.IsActive;
  for (const consumption of form.Consumptions) {
    const consumer = consumerOf(consumption, participantId);
    if (consumer) {
      setConsumerActive(consumption, consumer, active);
    }
  }
}

/** A new item is shared by everybody. */
export function addConsumption(form: ActionForm, participants: Participant[]): ConsumptionForm {
  const consumption: ConsumptionForm = {
    key: nextKey(),
    Description: '',
    Amount: 0,
    Quantity: 1,
    IsAuto: true,
    Consumers: participants.map(participant => ({ ParticipantId: participant.Id, Amount: 0, IsActive: true })),
  };
  form.Consumptions.push(consumption);
  return consumption;
}

/** A new payer is the first participant and is expected to pay what is still unpaid. */
export function addPayer(form: ActionForm, participants: Participant[]): PayerForm {
  const paid = form.Payers.reduce((sum, payer) => sum + (Number(payer.Amount) || 0), 0);
  const payer: PayerForm = { key: nextKey(), ParticipantId: participants[0]?.Id ?? '', Amount: roundMoney(total(form) - paid) };
  form.Payers.push(payer);
  return payer;
}

export function remove<T>(items: T[], item: T) {
  items.splice(items.indexOf(item), 1);
}
