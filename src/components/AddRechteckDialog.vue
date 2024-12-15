<!-- AddRechteckDialog.vue -->
<template>
  <div
    v-show="props.showDialog"
    class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg shadow-md p-4 w-1/2">
      <h2 class="text-lg font-bold mb-4">Rechteck hinzufügen</h2>
      <form @submit.prevent="saveRechteck">
        <label class="block text-lg font-medium mb-2">
          Höhe
          <input
            type="float"
            v-model="hoehe"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <label class="block text-lg font-medium mb-2">
          Breite
          <input
            type="float"
            v-model="breite"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <label class="block text-lg font-medium mb-2">
          X Position
          <input
            type="float"
            v-model="posX"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <label class="block text-lg font-medium mb-2">
          Y Position
          <input
            type="float"
            v-model="posY"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
        >Speichern</button>
        <button
          @click="close"
          class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mt-4 ml-4"
        >Abbrechen</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  xPosition: {
    type: Number,
    default: undefined,
  },
  yPosition: {
    type: Number,
    default: undefined,
  },
})

const posX = ref(0)
const posY = ref(0)

watch(() => props.xPosition, (value) => {
  posX.value = value
})

watch(() => props.yPosition, (value) => {
  posY.value = value
})

const breite = ref(0)
const hoehe = ref(0)


const rechteck = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
})

const emit = defineEmits([ 'save', 'close' ])

function saveRechteck () {
  rechteck.value = {
    x1: posX.value,
    y1: posY.value,
    x2: posX.value + breite.value,
    y2: posY.value + hoehe.value,
  }

  emit('save', rechteck.value)
}

function close () {
  emit('close')
}
</script>