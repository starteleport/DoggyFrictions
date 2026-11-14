<script setup lang="ts">
import { computed, ref } from 'vue';
import { api, NEW_ID, type Participant, type Session } from '../api';
import PageHead from '../components/PageHead.vue';
import { notify, run } from '../feedback';
import { t } from '../i18n';
import { paths, useNavigation, type Crumb } from '../navigation';

// Creates a session (no id) or edits one.
const props = defineProps<{ id?: string }>();
const { go, leave } = useNavigation();

const session = ref<Session>();
if (props.id) {
  run(api.session(props.id)).then(data => session.value = data);
} else {
  session.value = { Id: NEW_ID, Name: '', Participants: [] };
}

const links = computed<Crumb[]>(() => props.id
  ? [{ name: t('sessions.title'), to: paths.sessions }, { name: t('session.title'), to: paths.session(props.id) }]
  : [{ name: t('sessions.title'), to: paths.sessions }]);
const back = computed(() => links.value[links.value.length - 1]!.to);

function addParticipant() {
  session.value!.Participants.push({ Id: NEW_ID, Name: '' });
}

// Expenses refer to stored participants, so only a participant added in this edit can be removed.
function removeParticipant(participant: Participant) {
  if (participant.Id === NEW_ID) {
    const participants = session.value!.Participants;
    participants.splice(participants.indexOf(participant), 1);
  } else {
    notify([{ text: t('session.cannotDeleteParticipant') }], true);
  }
}

async function save() {
  const saved = await run(api.saveSession(session.value!));
  if (saved) {
    go(paths.session(saved.Id));
  }
}
</script>

<template>
  <div v-if="session" data-testid="session-edit-view" class="session jumbotron is-edit">
    <div>
      <PageHead :links="links" :current="id ? t('common.edit') : t('session.new')" confirm-leave>
        <span class="input-group">
          <span class="input-group-text"><span class="bi bi-tag"></span></span>
          <input v-model="session.Name" data-testid="session-name-input" type="text" class="form-control" :placeholder="t('session.namePlaceholder')">
        </span>
      </PageHead>

      <h4>{{ t('session.participantsTitle') }}</h4>
      <span v-if="!session.Participants.length">{{ t('session.noParticipants') }}</span>
      <table class="table table-cards">
        <thead v-if="session.Participants.length">
          <tr>
            <th class="wide-cell">{{ t('session.participantName') }}</th>
            <th class="actions-cell"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in session.Participants" :key="index" class="card-row">
            <td class="wide-cell" :data-label="t('session.participantName')">
              <input v-model="participant.Name" data-testid="participant-name-input" type="text" class="form-control" :placeholder="t('session.participantPlaceholder')">
            </td>
            <td class="actions-cell"><button type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="removeParticipant(participant)"><span class="bi bi-trash"></span></button></td>
          </tr>
          <tr>
            <td class="actions-cell">
              <button data-testid="add-participant-button" type="button" class="btn btn-primary" @click="addParticipant">
                <span><span class="bi bi-plus"></span> {{ t('common.add') }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button data-testid="save-session-button" type="submit" class="btn btn-primary btn-raised" @click="save"><span class="bi bi-floppy"></span> {{ t('session.save') }}</button>
      <button type="button" class="btn btn-primary" @click="leave(back)">
        {{ t('common.cancel') }}
      </button>
    </div>
  </div>
</template>
