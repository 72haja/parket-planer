<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: '#15803d',
  },
  timeout: {
    type: Number,
    default: 5000,
  }
});

const text = defineModel('text', {
  type: String,
  default: undefined,
});

const timer = ref(null);

const showSnackbar = ref(false);

watch(text, (val) => {
  showSnackbar.value = val !== undefined;

  if (val) {
    timer.value = setTimeout(() => {
      hideSnackbar();
    }, props.timeout);
  }
});

function hideSnackbar () {
  clearTimeout(timer.value);
  showSnackbar.value = false;
  text.value = undefined;
}

</script>

<template>
  <div
    v-show="showSnackbar"
    class="fixed bottom-0 left-0 right-0 z-50 p-4"
  >
    <div
      class="flex gap-5 max-w-[95%] w-max mx-auto items-center justify-between py-3 px-6 rounded-md drop-shadow-xl shadow-lg"
      :style="{ backgroundColor: props.color }"
    >
      <div class="font-medium text-white">
        {{ text }}
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium bg-white hover:bg-gray-300 focus:outline-none focus:bg-gray-300 focus:shadow-outline-indigo active:bg-gray-400 transition duration-150 ease-in-out"
        :style="{ color: props.color }"
        @click="hideSnackbar"
      >
        OK
      </button>
    </div>
  </div>
</template>
