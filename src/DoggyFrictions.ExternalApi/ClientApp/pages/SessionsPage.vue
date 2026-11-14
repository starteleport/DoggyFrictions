<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api, type Session } from '../api';
import { confirm, run } from '../feedback';
import { t } from '../i18n';
import { names } from '../models/session';
import { paths, useNavigation } from '../navigation';

const { go, openRow } = useNavigation();
const sessions = ref<Session[]>();

run(api.sessions()).then(data => sessions.value = data);

async function remove(session: Session) {
  if (await confirm(t('sessions.deleteTitle'), t('sessions.deleteMessage', session.Name))
      && await run(api.deleteSession(session.Id))) {
    go(paths.sessions);
  }
}
</script>

<template>
  <div v-if="sessions" data-testid="sessions-view" class="sessions jumbotron is-preview">
    <div>
      <div class="page-head">
        <h2 class="page-title">{{ t('sessions.listTitle') }}</h2>
      </div>
      <table class="table table-clickable table-cards">
        <thead>
          <tr>
            <th class="really-wide-cell">{{ t('common.name') }}</th>
            <th class="really-wide-cell">{{ t('sessions.participants') }}</th>
            <th class="actions-cell"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in sessions" :key="session.Id" data-testid="session-row" class="card-row" @click="openRow($event, paths.session(session.Id))">
            <td data-testid="session-name-cell" class="really-wide-cell" :data-label="t('common.name')"><RouterLink class="row-link" :to="paths.session(session.Id)">{{ session.Name }}</RouterLink></td>
            <td class="really-wide-cell" :data-label="t('sessions.participants')">{{ names(session.Participants) || t('session.noParticipants') }}</td>
            <td class="actions-cell">
              <RouterLink class="btn btn-primary" :to="paths.debts(session.Id)" :aria-label="t('session.debts')"><span class="bi bi-arrow-left-right"></span></RouterLink><RouterLink class="btn btn-primary" :to="paths.editSession(session.Id)" :aria-label="t('common.edit')"><span class="bi bi-pencil"></span></RouterLink><button data-testid="delete-session-button" type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="remove(session)"><span class="bi bi-trash"></span></button>
            </td>
          </tr>
        </tbody>
      </table>
      <RouterLink data-testid="create-session-button" class="btn btn-primary btn-raised" :to="paths.newSession"><span class="bi bi-plus"></span> {{ t('sessions.create') }}</RouterLink>
    </div>
  </div>
</template>
