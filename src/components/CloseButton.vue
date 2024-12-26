<script setup>

const props = defineProps({
  color: {
    type: String,
    default: 'bg-gray-400'
  }
})

const emits = defineEmits(['click'])
</script>

<template>
  <button
    @click="emits('click')"
    class="rounded-full hover:bg-gray-500 p-1"
    :class="[props.color]"
  >
    <svg
      width="25"
      height="25"
      class="rounded-full"
    >
      <line
        x1="5"
        y1="5"
        x2="20"
        y2="20"
        stroke="black"
        stroke-width="2"
      />
      <line
        x1="20"
        y1="5"
        x2="5"
        y2="20"
        stroke="black"
        stroke-width="2"
      />
    </svg>
  </button>
</template>
