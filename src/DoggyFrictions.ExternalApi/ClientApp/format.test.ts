import { describe, expect, it } from 'vitest';
import { dateOnly, formatDate, formatMoney, parseNumber, roundMoney } from './format';
import { textParts } from './i18n';
import { balances, owing } from './models/session';

describe('formatting', () => {
  it('shows amounts with two decimals and the rouble sign', () => {
    expect(formatMoney(5)).toBe('5.00₽');
    expect(formatMoney(-5)).toBe('-5.00₽');
    expect(formatMoney(3.335)).toBe('3.33₽');
  });

  it.each([
    ['10', 10],
    ['1,5', 1.5],
    ['10₽', 10],
    ['1 000', 1000],
    ['', 0],
  ])('reads "%s" as %d', (text, value) => {
    expect(parseNumber(text)).toBe(value);
  });

  it('reads garbage as NaN', () => {
    expect(parseNumber('abc')).toBeNaN();
  });

  it('rounds to kopecks', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('shows the stored calendar date whatever the time zone', () => {
    expect(formatDate('2026-01-15T00:00:00Z')).toBe('15/01/2026');
    expect(formatDate('2026-01-15')).toBe('15/01/2026');
    expect(dateOnly('2026-01-15T23:59:59Z')).toBe('2026-01-15');
  });
});

describe('text parts', () => {
  it('puts parts in place of the placeholders, so a link needs no HTML', () => {
    const link = { text: 'here', href: '#/x' };

    expect(textParts('Debt between {0} and {1} settled: {2}.', { text: '<b>Ann</b>' }, { text: 'Bob' }, link)).toEqual([
      { text: 'Debt between ' }, { text: '<b>Ann</b>' }, { text: ' and ' }, { text: 'Bob' }, { text: ' settled: ' }, link, { text: '.' },
    ]);
  });

  it('keeps a placeholder without a part as text', () => {
    expect(textParts('a {0} b {1}', { text: 'x' })).toEqual([{ text: 'a ' }, { text: 'x' }, { text: ' b ' }, { text: '{1}' }]);
  });
});

describe('balances', () => {
  it('keeps participants with the same name apart', () => {
    expect(balances([{ DebtorId: '2', Debtor: 'Ann', CreditorId: '1', Creditor: 'Ann', Amount: 10 }])).toEqual([
      { Name: 'Ann', Balance: -10 },
      { Name: 'Ann', Balance: 10 },
    ]);
  });

  it('nets out what a participant owes and is owed', () => {
    expect(balances([
      { DebtorId: 'b', Debtor: 'Bob', CreditorId: 'a', Creditor: 'Ann', Amount: 5 },
      { DebtorId: 'a', Debtor: 'Ann', CreditorId: 'c', Creditor: 'Rex', Amount: 5 },
    ])).toEqual([
      { Name: 'Bob', Balance: -5 },
      { Name: 'Ann', Balance: 0 },
      { Name: 'Rex', Balance: 5 },
    ]);
  });

  it('leaves out those who are even, float residue included', () => {
    expect(owing([
      { Name: 'Ann', Balance: 0.1 + 0.2 - 0.3 },
      { Name: 'Bob', Balance: 0 },
      { Name: 'Rex', Balance: 0.01 },
    ])).toEqual([{ Name: 'Rex', Balance: 0.01 }]);
  });
});
