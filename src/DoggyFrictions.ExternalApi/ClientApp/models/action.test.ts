import { describe, expect, it } from 'vitest';
import type { Action, Participant } from '../api';
import {
  addConsumption, addPayer, participantTotals, setConsumerActive, setPrice, setQuantity, toAction, toForm,
  toggleParticipant, total,
} from './action';

const participants: Participant[] = [
  { Id: 'ann', Name: 'Ann' },
  { Id: 'bob', Name: 'Bob' },
  { Id: 'rex', Name: 'Rex' },
];

const shares = (form: ReturnType<typeof toForm>, index = 0) => form.Consumptions[index]!.Consumers.map(consumer => consumer.Amount);

describe('the expense form', () => {
  it('starts empty, dated today', () => {
    const form = toForm('s1', participants);

    expect(form).toMatchObject({ Id: '0', SessionId: 's1', Description: '', Payers: [], Consumptions: [] });
    expect(form.Date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('a new item is shared by everybody and its price split equally', () => {
    const form = toForm('s1', participants);
    const item = addConsumption(form, participants);

    expect(item.Consumers.every(consumer => consumer.IsActive)).toBe(true);
    setPrice(item, 30);
    expect(shares(form)).toEqual([10, 10, 10]);
  });

  it('gives the rounding remainder to the last consumer', () => {
    const form = toForm('s1', participants);
    const item = addConsumption(form, participants);

    setPrice(item, 10);

    expect(shares(form)).toEqual([3.33, 3.33, 3.34]);
  });

  it('quantity multiplies the price', () => {
    const form = toForm('s1', participants.slice(0, 2));
    const item = addConsumption(form, participants.slice(0, 2));

    setPrice(item, 3);
    setQuantity(item, 2);

    expect(shares(form)).toEqual([3, 3]);
    expect(total(form)).toBe(6);
  });

  it('a consumer taken out has no share and the others split the price', () => {
    const form = toForm('s1', participants);
    const item = addConsumption(form, participants);
    setPrice(item, 30);

    setConsumerActive(item, item.Consumers[0]!, false);

    expect(shares(form)).toEqual([0, 15, 15]);
  });

  it('a click on a participant toggles them in every item, following the first', () => {
    const form = toForm('s1', participants);
    setPrice(addConsumption(form, participants), 30);
    setPrice(addConsumption(form, participants), 6);

    toggleParticipant(form, 'bob');
    expect([shares(form, 0), shares(form, 1)]).toEqual([[15, 0, 15], [3, 0, 3]]);

    toggleParticipant(form, 'bob');
    expect([shares(form, 0), shares(form, 1)]).toEqual([[10, 10, 10], [2, 2, 2]]);
  });

  it('toggling a participant without items does nothing', () => {
    const form = toForm('s1', participants);

    expect(() => toggleParticipant(form, 'bob')).not.toThrow();
  });

  it('a new payer is the first participant and pays what is still unpaid', () => {
    const form = toForm('s1', participants);
    setPrice(addConsumption(form, participants), 8);
    setPrice(addConsumption(form, participants), 4);

    const first = addPayer(form, participants);
    expect(first).toMatchObject({ ParticipantId: 'ann', Amount: 12 });

    first.Amount = 7;
    expect(addPayer(form, participants).Amount).toBe(5);
  });

  it('the unpaid rest is rounded to kopecks', () => {
    const form = toForm('s1', participants);
    setPrice(addConsumption(form, participants), 0.3);
    addPayer(form, participants).Amount = 0.1;

    expect(addPayer(form, participants).Amount).toBe(0.2);
  });

  it('totals per participant add up the shares', () => {
    const form = toForm('s1', participants);
    setPrice(addConsumption(form, participants), 30);
    const second = addConsumption(form, participants);
    setPrice(second, 4);
    setConsumerActive(second, second.Consumers[2]!, false);

    expect(participantTotals(form, participants)).toEqual([12, 12, 10]);
  });

  it('round-trips a stored expense and sends only the consumers who take part', () => {
    const stored: Action = {
      Id: 'a1',
      SessionId: 's1',
      Description: 'Пицца',
      Date: '2026-01-15T00:00:00Z',
      Payers: [{ ParticipantId: 'ann', Amount: 10 }],
      Consumptions: [{
        Description: 'Маргарита', Amount: 10, Quantity: 1, SplittedEqually: true,
        Consumers: [{ ParticipantId: 'ann', Amount: 5 }, { ParticipantId: 'rex', Amount: 5 }],
      }],
    };

    const form = toForm('s1', participants, stored);

    expect(form.Date).toBe('2026-01-15');
    expect(form.Consumptions[0]!.Consumers.map(consumer => consumer.IsActive)).toEqual([true, false, true]);
    expect(toAction(form)).toEqual({ ...stored, Date: '2026-01-15' });
  });

  it('a blank or unparsable number is sent as 0, for the server to explain', () => {
    const form = toForm('s1', participants);
    const item = addConsumption(form, participants);
    item.Quantity = Number.NaN;

    expect(toAction(form).Consumptions[0]!.Quantity).toBe(0);
  });

  it('keeps typed-in shares of an item not split equally', () => {
    const stored: Action = {
      Id: 'a1', SessionId: 's1', Description: 'x', Date: '2026-01-15',
      Payers: [],
      Consumptions: [{
        Description: 'y', Amount: 10, Quantity: 1, SplittedEqually: false,
        Consumers: [{ ParticipantId: 'ann', Amount: 7 }, { ParticipantId: 'bob', Amount: 3 }],
      }],
    };
    const form = toForm('s1', participants, stored);

    setPrice(form.Consumptions[0]!, 20);

    expect(shares(form)).toEqual([7, 3, 0]);
  });
});
