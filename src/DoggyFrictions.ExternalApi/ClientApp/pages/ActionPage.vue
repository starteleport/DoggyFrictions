<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api, type Session } from '../api';
import PageHead from '../components/PageHead.vue';
import MoneyInput from '../components/MoneyInput.vue';
import StickyHead from '../components/StickyHead.vue';
import { confirm, run } from '../feedback';
import { formatDate, formatMoney } from '../format';
import { t } from '../i18n';
import { nameOf } from '../models/session';
import {
  addConsumption, addPayer, participantTotals, remove, setConsumerActive, setPrice, setQuantity,
  toAction, toForm, toggleParticipant, total, type ActionForm,
} from '../models/action';
import { paths, useNavigation, type Crumb } from '../navigation';

// An expense: read-only, or the form that creates (no id) or edits it.
const props = defineProps<{ sessionId: string; id?: string; edit: boolean }>();
const { go, leave } = useNavigation();

const session = ref<Session>();
const form = ref<ActionForm>();
const itemsTable = ref<HTMLTableElement>();
// Name fields of the items, by item, to put the cursor into a new one.
const itemNames = new Map<number, HTMLInputElement>();
const keepItemName = (key: number) => (element: unknown) => {
  if (element) itemNames.set(key, element as HTMLInputElement);
  else itemNames.delete(key);
};

run(Promise.all([api.session(props.sessionId), props.id ? api.action(props.sessionId, props.id) : undefined]))
  .then(data => {
    if (data) {
      session.value = data[0];
      form.value = toForm(props.sessionId, data[0].Participants, data[1]);
    }
  });

const participants = computed(() => session.value?.Participants ?? []);

const links = computed<Crumb[]>(() => [
  { name: t('sessions.title'), to: paths.sessions },
  { name: t('session.title'), to: paths.session(props.sessionId) },
  ...(props.edit && props.id ? [{ name: t('action.breadcrumb'), to: paths.action(props.sessionId, props.id) }] : []),
]);
const current = computed(() => props.edit ? (props.id ? t('common.edit') : t('action.new')) : t('action.title'));
const back = computed(() => links.value[links.value.length - 1]!.to);
const stickyLabels = computed(() =>
  [t('action.item'), t('common.amount'), t('action.quantityShort'), ...participants.value.map(participant => participant.Name)]);

/** Adds an item and puts the cursor into its name. */
async function newConsumption() {
  const item = addConsumption(form.value!, participants.value);
  await nextTick();
  itemNames.get(item.key)?.focus();
}

// Enter anywhere in the items table adds the next item.
function onEnter(event: KeyboardEvent) {
  if (props.edit) {
    event.preventDefault();
    void newConsumption();
  }
}

async function save(addAnother: boolean) {
  const saved = await run(api.saveAction(toAction(form.value!)));
  if (saved) {
    go(addAnother ? paths.newAction(props.sessionId) : paths.action(props.sessionId, saved.Id));
  }
}

async function removeAction() {
  if (await confirm(t('action.deleteTitle'), t('action.deleteMessage', form.value!.Description))
      && await run(api.deleteAction(props.sessionId, form.value!.Id))) {
    go(paths.session(props.sessionId));
  }
}
</script>

<template>
  <div v-if="form && session" data-testid="action-view" class="action" :class="edit ? 'is-edit' : 'is-preview'">
    <div class="jumbotron">
      <div>
        <div>
          <PageHead :links="links" :current="current" :confirm-leave="edit">
            <span class="page-name">
              <template v-if="edit">
                <label for="action-description">{{ t('common.name') }}</label>
                <span class="input-group">
                  <input id="action-description" v-model="form.Description" data-testid="action-description-input" type="text" class="form-control" :placeholder="t('action.namePlaceholder')">
                  <span class="input-group-text"><span class="bi bi-tag"></span></span>
                </span>
                <label for="action-date">{{ t('common.date') }}</label>
                <!-- The browser's own date field: its calendar button and the user's date format. -->
                <span class="input-group">
                  <input id="action-date" v-model="form.Date" data-testid="action-date-input" type="date" required class="form-control">
                </span>
              </template>
              <template v-else>
                <span data-testid="action-title">{{ form.Description }}</span>
                <span>{{ formatDate(form.Date) }}</span>
              </template>
            </span>
            <template v-if="!edit">
              <RouterLink class="btn btn-primary" :to="paths.editAction(sessionId, form.Id)" :aria-label="t('common.edit')"><span class="bi bi-pencil"></span></RouterLink><button data-testid="delete-action-button" type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="removeAction"><span class="bi bi-trash"></span></button>
            </template>
          </PageHead>
          <h4>{{ t('action.itemsTitle') }}</h4>
          <div>
            <StickyHead :table="itemsTable" :labels="stickyLabels" />
            <span v-if="!form.Consumptions.length">{{ t('common.noData') }}</span>
            <table ref="itemsTable" data-testid="consumptions-table" class="table table-cards" @keydown.enter="onEnter">
              <thead v-if="form.Consumptions.length">
                <tr>
                  <th class="wide-cell">{{ t('action.item') }}</th>
                  <th class="money-cell">{{ t('common.amount') }}</th>
                  <th class="small-cell">{{ t('action.quantityShort') }}</th>
                  <!-- While editing, a name takes that participant out of every item, or back in. -->
                  <th v-for="participant in participants" :key="participant.Id" class="money-cell">
                    <button v-if="edit" type="button" class="consumer-toggle" @click="toggleParticipant(form, participant.Id)">{{ participant.Name }}</button>
                    <template v-else>{{ participant.Name }}</template>
                  </th>
                  <th class="delete-row-cell actions-cell"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="consumption in form.Consumptions" :key="consumption.key" data-testid="consumption-row" class="card-row">
                  <td class="wide-cell" :data-label="t('action.item')">
                    <div v-if="edit" class="form-group">
                      <input :ref="keepItemName(consumption.key)" v-model="consumption.Description" data-testid="consumption-description-input" type="text" class="form-control" :placeholder="t('action.itemPlaceholder')">
                    </div>
                    <span v-else>{{ consumption.Description }}</span>
                  </td>
                  <td class="money-cell" :data-label="t('action.price')">
                    <div v-if="edit" class="form-group">
                      <MoneyInput :model-value="consumption.Amount" data-testid="consumption-amount-input" :placeholder="t('common.amount')" @update:model-value="setPrice(consumption, $event)" />
                    </div>
                    <span v-else>{{ formatMoney(consumption.Amount) }}</span>
                  </td>
                  <td class="small-cell" :data-label="t('action.quantity')">
                    <div v-if="edit" class="form-group">
                      <MoneyInput :model-value="consumption.Quantity" data-testid="consumption-quantity-input" :placeholder="t('action.quantity')" @update:model-value="setQuantity(consumption, $event)" />
                    </div>
                    <span v-else>{{ consumption.Quantity }}</span>
                  </td>
                  <td v-for="(consumer, index) in consumption.Consumers" :key="consumer.ParticipantId" class="money-cell consumer-cell"
                      :class="{ 'card-hide': !edit && !consumer.IsActive }" :data-label="participants[index]?.Name">
                    <div v-if="edit" class="form-group">
                      <div class="input-group">
                        <span class="input-group-text">
                          <span class="checkbox">
                            <label><input data-testid="consumer-checkbox" type="checkbox" tabindex="-1" :checked="consumer.IsActive" :aria-label="participants[index]?.Name"
                                          @change="setConsumerActive(consumption, consumer, ($event.target as HTMLInputElement).checked)"></label>
                          </span>
                        </span><span v-if="consumption.IsAuto || !consumer.IsActive" data-testid="consumer-share" class="form-control form-control-highlight">{{ formatMoney(consumer.Amount) }}</span>
                        <MoneyInput v-else v-model="consumer.Amount" tabindex="-1" :placeholder="t('action.share')" />
                      </div>
                    </div>
                    <span v-else-if="consumer.IsActive">{{ formatMoney(consumer.Amount) }}</span>
                  </td>
                  <td v-if="edit" class="actions-cell"><button type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="remove(form.Consumptions, consumption)"><span class="bi bi-trash"></span></button></td>
                </tr>
                <tr v-if="edit">
                  <td class="actions-cell">
                    <button data-testid="add-consumption-button" type="button" class="btn btn-primary" @click="newConsumption">
                      <span><span class="bi bi-plus"></span> {{ t('common.add') }}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="form.Consumptions.length" data-testid="consumptions-total">
                <tr class="card-row">
                  <td class="wide-cell card-title">{{ t('action.total') }}</td>
                  <td class="money-cell" :data-label="t('action.grandTotal')"><span>{{ formatMoney(total(form)) }}</span></td>
                  <td class="small-cell card-hide"></td>
                  <td v-for="(amount, index) in participantTotals(form, participants)" :key="index" class="money-cell" :data-label="participants[index]?.Name"><span>{{ formatMoney(amount) }}</span></td>
                  <td v-if="edit" class="actions-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <h4>{{ t('action.payersTitle') }}</h4>
          <span v-if="!form.Payers.length">{{ t('common.noData') }}</span>
          <table data-testid="payers-table" class="table table-cards">
            <thead v-if="form.Payers.length">
              <tr>
                <th class="wide-cell">{{ t('action.payerName') }}</th>
                <th class="money-cell">{{ t('common.amount') }}</th>
                <th class="actions-cell"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payer in form.Payers" :key="payer.key" data-testid="payer-row" class="card-row">
                <td class="wide-cell" :data-label="t('action.payer')">
                  <div v-if="edit">
                    <select v-model="payer.ParticipantId" data-testid="payer-select" class="form-control">
                      <option v-for="participant in participants" :key="participant.Id" :value="participant.Id">{{ participant.Name }}</option>
                    </select>
                  </div>
                  <span v-else>{{ nameOf(participants, payer.ParticipantId) }}</span>
                </td>
                <td class="money-cell" :data-label="t('common.amount')">
                  <MoneyInput v-if="edit" v-model="payer.Amount" data-testid="payer-amount-input" :placeholder="t('common.amount')" />
                  <span v-else>{{ formatMoney(payer.Amount) }}</span>
                </td>
                <td v-if="edit" class="actions-cell"><button type="button" class="btn btn-primary" :aria-label="t('common.delete')" @click="remove(form.Payers, payer)"><span class="bi bi-trash"></span></button></td>
              </tr>
              <tr v-if="edit">
                <td class="actions-cell">
                  <button data-testid="add-payer-button" type="button" class="btn btn-primary" @click="addPayer(form, participants)">
                    <span><span class="bi bi-plus"></span> {{ t('common.add') }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="edit" class="form-group">
          <button data-testid="save-action-button" type="button" class="btn btn-primary btn-raised" @click="save(false)">
            <span class="bi bi-floppy"></span> {{ t('action.save') }}
          </button>
          <button v-if="!id" type="button" class="btn btn-primary btn-raised" @click="save(true)">
            <span class="bi bi-floppy"></span> {{ t('action.saveAndNew') }}
          </button>
          <button type="button" class="btn btn-primary" @click="leave(back)">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
