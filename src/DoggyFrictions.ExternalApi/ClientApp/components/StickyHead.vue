<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// A copy of a table's column headers pinned under the navbar while the table is scrolled past it.
// (`position: sticky` cannot do it: the table sits in a box that scrolls sideways.)
const props = defineProps<{ table?: HTMLTableElement; labels: string[] }>();

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const widths = ref<number[]>([]);

function update() {
  const head = props.table?.tHead?.rows[0];
  // No header row, or hidden (phones show rows as cards).
  if (!props.table || !head || !head.offsetHeight) {
    visible.value = false;
    return;
  }
  top.value = document.querySelector<HTMLElement>('.navbar')?.offsetHeight ?? 0;
  const table = props.table.getBoundingClientRect();
  visible.value = table.top < top.value && table.bottom > top.value + head.offsetHeight;
  left.value = table.left;
  widths.value = [...head.cells].map(cell => cell.getBoundingClientRect().width);
}

onMounted(() => {
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', update);
  window.removeEventListener('resize', update);
});
</script>

<template>
  <Transition name="fade-in">
    <div v-if="visible" class="sticky-table-head" :style="{ top: `${top}px`, left: `${left}px` }" aria-hidden="true">
      <div v-for="(label, index) in labels" :key="index" :style="{ width: `${widths[index]}px` }">{{ label }}</div>
    </div>
  </Transition>
</template>
