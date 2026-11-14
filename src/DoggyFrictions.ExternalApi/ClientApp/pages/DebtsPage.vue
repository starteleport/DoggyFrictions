<script setup lang="ts">
import { computed, ref } from 'vue';
import { api, type Debt, type Session } from '../api';
import PageHead from '../components/PageHead.vue';
import { confirm, notify, run } from '../feedback';
import { formatMoney, today } from '../format';
import { t, textParts } from '../i18n';
import { balances, owing } from '../models/session';
import { paths, useNavigation } from '../navigation';

const props = defineProps<{ sessionId: string }>();
const { go, href } = useNavigation();

const session = ref<Session>();
const debts = ref<Debt[]>();

run(Promise.all([api.session(props.sessionId), api.debts(props.sessionId)])).then(data => {
  if (data) [session.value, debts.value] = data;
});

const owingBalances = computed(() => owing(balances(debts.value ?? [])));

async function payOff(debt: Debt) {
  if (!await confirm(t('debts.payOffTitle'), t('debts.payOffMessage', debt.Creditor, debt.Debtor))) {
    return;
  }
  // Dated by the user's calendar: the server would take today in UTC, the day before just after midnight in Moscow.
  const transfer = await run(api.moveMoney(props.sessionId, { FromId: debt.DebtorId, ToId: debt.CreditorId, Amount: debt.Amount, Date: today() }));
  if (transfer) {
    notify(textParts(t('debts.paidOff'),
      { text: debt.Debtor },
      { text: debt.Creditor },
      { text: t('debts.paidOffLink'), href: href(paths.action(props.sessionId, transfer.Id)) }));
    go(paths.debts(props.sessionId));
  }
}
</script>

<template>
  <div v-if="session && debts" data-testid="debts-view" class="debts jumbotron is-preview">
    <div>
      <PageHead :links="[{ name: t('sessions.title'), to: paths.sessions }, { name: t('session.title'), to: paths.session(sessionId) }]"
                :current="t('debts.title')">
        <span>{{ session.Name }}</span>
      </PageHead>
      <h4>{{ t('debts.balances') }}</h4>
      <div v-if="owingBalances.length" class="debt-balances-block">
        <!-- Balances are inline, kept apart by a space as well as the margin. -->
        <template v-for="(balance, index) in owingBalances" :key="index">
          <span data-testid="balance-row" class="balance-span">
            <span>{{ balance.Name }}: </span>
            <span data-testid="balance-amount" class="balance-amount" :class="{ 'text-danger': balance.Balance < 0, 'text-success': balance.Balance > 0 }">{{ formatMoney(balance.Balance) }}</span>
          </span>{{ ' ' }}
        </template>
      </div>
      <span v-else data-testid="balances-empty">{{ t('debts.settled') }}</span>
      <h4>{{ t('debts.list') }}</h4>
      <table v-if="debts.length" class="debts-table">
        <tbody>
          <tr v-for="(debt, index) in debts" :key="index" data-testid="debt-row" class="debt-block">
            <td data-testid="debt-debtor" class="wide-cell">{{ debt.Debtor }}</td>
            <td class="money-cell">
              <span data-testid="debt-amount">{{ formatMoney(debt.Amount) }}</span>
              <i class="bi bi-arrow-right debt-arrow" aria-hidden="true"></i>
            </td>
            <td data-testid="debt-creditor" class="wide-cell">{{ debt.Creditor }}</td>
            <td class="actions-cell">
              <button data-testid="debt-payoff-button" type="button" class="btn btn-primary" @click="payOff(debt)">{{ t('debts.payOff') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <span v-else data-testid="debts-empty">{{ t('debts.settled') }}</span>
    </div>
  </div>
</template>
