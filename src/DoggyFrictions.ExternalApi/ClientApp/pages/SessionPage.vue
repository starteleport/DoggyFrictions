<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api, type Action, type Page, type Session } from '../api';
import PageHead from '../components/PageHead.vue';
import Pager from '../components/Pager.vue';
import { confirm, run } from '../feedback';
import { formatDate, formatMoney } from '../format';
import { t } from '../i18n';
import { actionTotal, names, payerNames } from '../models/session';
import { paths, useNavigation } from '../navigation';

const PAGE_SIZE = 25;

const props = defineProps<{ id: string }>();
const { go, openRow } = useNavigation();

const session = ref<Session>();
const actions = ref<Page<Action>>();
const loadingActions = ref(false);

run(api.session(props.id)).then(data => {
  session.value = data;
  if (data) loadActions(1);
});

async function loadActions(page: number) {
  loadingActions.value = true;
  actions.value = await run(api.actions(props.id, page, PAGE_SIZE), { quiet: true }) ?? actions.value;
  loadingActions.value = false;
}

async function remove() {
  if (await confirm(t('sessions.deleteTitle'), t('sessions.deleteMessage', session.value!.Name))
      && await run(api.deleteSession(props.id))) {
    go(paths.sessions);
  }
}

async function removeAction(action: Action) {
  if (await confirm(t('action.deleteTitle'), t('action.deleteMessage', action.Description ?? ''))
      && await run(api.deleteAction(props.id, action.Id))) {
    go(paths.session(props.id));
  }
}
</script>

<template>
  <div v-if="session" data-testid="session-view" class="session jumbotron is-preview">
    <div>
      <PageHead :links="[{ name: t('sessions.title'), to: paths.sessions }]" :current="t('session.title')">
        <span data-testid="session-title">{{ session.Name }}</span>
        <RouterLink class="btn btn-primary" :to="paths.editSession(id)" :aria-label="t('common.edit')"><span class="bi bi-pencil"></span></RouterLink><button data-testid="delete-session-button" type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="remove"><span class="bi bi-trash"></span></button>
      </PageHead>

      <h4>{{ t('session.participantsTitle') }}</h4>
      <div v-if="!session.Participants.length">{{ t('session.noParticipants') }}</div>
      <div v-else data-testid="session-participants-summary">{{ names(session.Participants) }}</div>

      <RouterLink data-testid="create-action-button" class="btn btn-primary" :to="paths.newAction(id)"><span class="bi bi-plus"></span> {{ t('session.addAction') }}</RouterLink>
      <RouterLink data-testid="session-debts-button" class="btn btn-primary" :to="paths.debts(id)"><span class="bi bi-arrow-left-right"></span> {{ t('session.debts') }}</RouterLink>

      <div class="clearfix">
        <h4 class="float-start">{{ t('session.actionsTitle') }}</h4>
        <span v-if="actions && !loadingActions" class="float-end">
          <Pager :page="actions.Page" :total-pages="actions.TotalPages" @load="loadActions" />
        </span>
      </div>
      <div v-if="loadingActions" class="loading-screen-small">
        <img src="/img/runningdog_transparent.gif" :alt="t('common.loading')">
      </div>
      <div v-else-if="actions">
        <span v-if="!actions.Rows.length" data-testid="actions-empty">{{ t('session.noActions') }}</span>
        <table v-else class="table table-clickable table-cards">
          <thead>
            <tr>
              <th class="small-cell">{{ t('common.date') }}</th>
              <th class="really-wide-cell">{{ t('session.actionDescription') }}</th>
              <th class="wide-cell">{{ t('session.actionPayers') }}</th>
              <th class="money-cell">{{ t('common.amount') }}</th>
              <th class="actions-cell"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="action in actions.Rows" :key="action.Id" data-testid="session-action-row" class="card-row" @click="openRow($event, paths.action(id, action.Id))">
              <td class="small-cell" :data-label="t('common.date')">{{ formatDate(action.Date) }}</td>
              <td class="really-wide-cell" :data-label="t('session.actionDescription')"><RouterLink class="row-link" :to="paths.action(id, action.Id)">{{ action.Description }}</RouterLink></td>
              <td class="wide-cell" :data-label="t('session.actionPayers')">{{ payerNames(action, session.Participants) }}</td>
              <td class="money-cell" :data-label="t('common.amount')">{{ formatMoney(actionTotal(action)) }}</td>
              <td class="actions-cell">
                <RouterLink class="btn btn-primary" :to="paths.editAction(id, action.Id)" :aria-label="t('common.edit')"><span class="bi bi-pencil"></span></RouterLink><button data-testid="delete-action-button" type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="removeAction(action)"><span class="bi bi-trash"></span></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
