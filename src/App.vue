<template>
  <div class="p-10">
    <div class="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">

      <Rooms
        :selectedRoom="rechtecke"
        @update:selectedRoom="handleRoomSelect"
      />

      <h1 class="text-3xl font-bold mb-4">Vinyl-Platten-Rechner</h1>
      <form class="flex flex-col">
        <div class="w-full grid gap-2">
          <label class="block text-lg font-medium">
            Länge der Vinyl-Platte:
            <input
              type="number"
              v-model="plattenLaenge"
              class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </label>
          <label class="block text-lg font-medium">
            Breite der Vinyl-Platte:
            <input
              type="number"
              v-model="plattenBreite"
              class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </label>
        </div>
      </form>

      <p class="text-lg font-medium mt-8">Raum</p>

      <div
        class="grid grid-cols-[minmax(0,1fr)_max-content] grid-rows-[minmax(0,1fr)_max-content] items-center justify-items-center gap-2"
      >
        <div
          class="w-full aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4"
        >
          <canvas
            id="raum"
            ref="canvas"
            :width="widthOfCanvas"
            :height="widthOfCanvas"
            class="w-full h-full bg-gray-200 aspect-square"
          ></canvas>
        </div>

        <AddButton
          class="w-max h-max"
          @click="() => canvasWidthIncrease += 50"
        />
        <AddButton
          class="w-max h-max"
          @click="() => canvasWidthIncrease += 50"
        />
      </div>

      <button
        @click="openAddRechteckDialog"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
      >
        Rechteck
        hinzufügen
      </button>

      <div class="grid gap-2 p-4">
        <div
          class="flex items-center gap-2"
          v-for="(rechteck, index) in rechtecke"
          :key="index"
        >
          <span> Rechteck {{ index }}</span>
          <label class="block text-lg font-medium">
            Breite:
            <input
              type="number"
              step="0.5"
              :value="getBreite(rechteck)"
              class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              @input="(event) => {
                handleUpdateBreite(rechteck, event.target.value)
                drawCanvas()
              }"
            />
          </label>
          <label class="block text-lg font-medium">
            Höhe:
            <input
              type="number"
              step="0.5"
              :value="getHoehe(rechteck)"
              class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              @input="(event) => {
                handleUpdateHoehe(rechteck, event.target.value)
                drawCanvas()
              }"
            />
          </label>
          <CloseButton @click="removeRechteck(index)" />
        </div>
      </div>

      <p class="text-lg font-medium mt-8">Platten</p>

      <label class="block text-lg font-medium">
        Versatz:
        <input
          type="number"
          step="0.01"
          v-model="versatz"
          class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
        />
      </label>

      <div
        class="w-full aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4"
      >
        <canvas
          id="platten"
          ref="canvasPlatten"
          :width="widthOfCanvas"
          :height="widthOfCanvas"
          class="w-full h-full bg-gray-200"
        ></canvas>
      </div>

      <AddRechteckDialog
        :show-dialog="showAddRechteckDialog"
        :x-position="clickPosition.x"
        :y-position="clickPosition.y"
        @save="addRechteck"
        @close="closeAddRechteckDialog"
      />
    </div>

    <Snackbar v-model:text="snackbarText" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AddRechteckDialog from './components/AddRechteckDialog.vue'
import CloseButton from './components/CloseButton.vue';
import Snackbar from './components/Snackbar.vue';
import AddButton from './components/AddButton.vue';
import Rooms from './components/Rooms.vue';
import { nextTick } from 'vue';

const snackbarText = ref('')

// const plattenLaenge = ref(63.6)
// const plattenBreite = ref(31.9)

const plattenBreite = ref(23.8)
const plattenLaenge = ref(152)

const clickPosition = ref({
  x: 0,
  y: 0,
})

const canvas = ref(null)
const ctx = ref(null)
const canvasPlatten = ref(null)
const ctxPlatten = ref(null)

const rechtecke = ref([])

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  ctxPlatten.value = canvasPlatten.value.getContext('2d')

  drawCanvas()

  addEventListenersForCanvas()
})

function drawCanvas () {
  drawRaumCanvas()
  drawPlattenCanvas()
}

function handleRoomSelect (rooms) {
  rechtecke.value = rooms
  nextTick(() => {
    drawCanvas()
  })
}

function drawRaumCanvas () {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)

  drawRechtecke()

  drawRedDot()
  drawBlueDot()
  drawToolTipWithDistanceToX1AndY1()
}

function drawRechtecke () {
  rechtecke.value.forEach((rechteck) => {
    ctx.value.lineWidth = 2;
    const rechtEckIsTheOneWithTheMouse = tooltipRechteck.value.rechteck !== null && tooltipRechteck.value.rechteck.x1 === rechteck.x1 && tooltipRechteck.value.rechteck.y1 === rechteck.y1
    ctx.value.strokeStyle = rechtEckIsTheOneWithTheMouse ? 'red' : 'black';
    ctx.value.beginPath()
    ctx.value.rect(rechteck.x1, rechteck.y1, rechteck.x2 - rechteck.x1, rechteck.y2 - rechteck.y1)
    ctx.value.stroke()
  })
}

const versatz = ref(0.5)

watch(versatz, () => {
  drawPlattenCanvas()
})

function drawPlattenCanvas () {
  ctxPlatten.value.clearRect(0, 0, canvasPlatten.value.width, canvasPlatten.value.height)
  drawVinylPlatten()
}

const abstandX = 20;
const abstandY = 20;

function drawVinylPlatten () {
  const amountOfPlattenX = Math.floor(widthOfCanvas.value / plattenLaenge.value)
  const amountOfPlattenY = Math.floor(widthOfCanvas.value / plattenBreite.value)

  for (let i = 0; i < amountOfPlattenX; i++) {
    for (let j = 0; j < amountOfPlattenY; j++) {
      ctxPlatten.value.lineWidth = 1;
      ctxPlatten.value.strokeStyle = 'gray';
      ctxPlatten.value.beginPath()
      const versatzValue = j % 2 === 1 ? versatz.value * plattenLaenge.value : 0
      ctxPlatten.value.rect(abstandX + i * plattenLaenge.value + versatzValue, abstandY + j * plattenBreite.value, plattenLaenge.value, plattenBreite.value)
      ctxPlatten.value.stroke()
    }
  }
}

const maxXOfRechtecke = computed(() => {
  return Math.max(...rechtecke.value
    .filter((rechteck) => !rechteck.isDragging)
    .map(
      (rechteck) => [ rechteck.x1, rechteck.x2 ]
    ).flat()) + canvasWidthIncrease.value
})

const maxYOfRechtecke = computed(() => {
  return Math.max(...rechtecke.value
    .filter((rechteck) => !rechteck.isDragging)
    .map(
      (rechteck) => [ rechteck.y1, rechteck.y2 ]
    ).flat()) + canvasWidthIncrease.value
})

const canvasWidthIncrease = ref(0)

const widthOfCanvas = computed(() => {
  return (Math.max(maxXOfRechtecke.value, maxYOfRechtecke.value) + canvasWidthIncrease.value) * 1.1
})

const showAddRechteckDialog = ref(false)

function openAddRechteckDialog () {
  showAddRechteckDialog.value = true
}

function closeAddRechteckDialog () {
  showAddRechteckDialog.value = false
}

function addRechteck (rechteck) {
  if (rechteck.x1 - rechteck.x2 === 0 || rechteck.y1 - rechteck.y2 === 0) {
    snackbarText.value = 'Breite und Höhe müssen größer als 0 sein'
    return
  }

  // Rechteck-Objekt speichern
  rechtecke.value.push(rechteck)
  closeAddRechteckDialog()

  drawCanvas()
}

function removeRechteck (index) {
  rechtecke.value.splice(index, 1)
  drawCanvas()
}

function getMousePos (canvas, evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}

function roundToNextHalf (num) {
  return Math.round(num * 2) / 2;
}

function checkForBlueDot (rechteck, mouseXOnCanvas, mouseYOnCanvas, snapDistanceBlueDot) {
  const rechteckDistancesEdge = []

  if (
    Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceBlueDot
    && Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceBlueDot
  ) {
    rechteckDistancesEdge.push({
      distance: Math.abs(rechteck.x1 - mouseXOnCanvas) + Math.abs(rechteck.y1 - mouseYOnCanvas),
      x: rechteck.x1,
      y: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceBlueDot
    && Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceBlueDot
  ) {
    rechteckDistancesEdge.push({
      distance: Math.abs(rechteck.x2 - mouseXOnCanvas) + Math.abs(rechteck.y1 - mouseYOnCanvas),
      x: rechteck.x2,
      y: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceBlueDot
    && Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceBlueDot
  ) {
    rechteckDistancesEdge.push({
      distance: Math.abs(rechteck.x1 - mouseXOnCanvas) + Math.abs(rechteck.y2 - mouseYOnCanvas),
      x: rechteck.x1,
      y: rechteck.y2,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceBlueDot
    && Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceBlueDot
  ) {
    rechteckDistancesEdge.push({
      distance: Math.abs(rechteck.x2 - mouseXOnCanvas) + Math.abs(rechteck.y2 - mouseYOnCanvas),
      x: rechteck.x2,
      y: rechteck.y2,
      isDragging: rechteck.isDragging,
    })
  }

  return rechteckDistancesEdge
}

function checkForRedDot (rechteck, mouseXOnCanvas, mouseYOnCanvas, snapDistanceRedDot) {
  const rechteckDistancesKanten = []

  if (
    Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceRedDot
    && mouseYOnCanvas > rechteck.y1
    && mouseYOnCanvas < rechteck.y2
  ) {
    rechteckDistancesKanten.push({
      distance: Math.abs(rechteck.x1 - mouseXOnCanvas),
      x: roundToNextHalf(rechteck.x1),
      y: roundToNextHalf(mouseYOnCanvas),
      x1: rechteck.x1,
      y1: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceRedDot
    && mouseYOnCanvas > rechteck.y1
    && mouseYOnCanvas < rechteck.y2
  ) {
    rechteckDistancesKanten.push({
      distance: Math.abs(rechteck.x2 - mouseXOnCanvas),
      x: roundToNextHalf(rechteck.x2),
      y: roundToNextHalf(mouseYOnCanvas),
      x1: rechteck.x1,
      y1: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceRedDot
    && mouseXOnCanvas > rechteck.x1
    && mouseXOnCanvas < rechteck.x2
  ) {
    rechteckDistancesKanten.push({
      distance: Math.abs(rechteck.y1 - mouseYOnCanvas),
      x: roundToNextHalf(mouseXOnCanvas),
      y: roundToNextHalf(rechteck.y1),
      x1: rechteck.x1,
      y1: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }
  if (
    Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceRedDot
    && mouseXOnCanvas > rechteck.x1
    && mouseXOnCanvas < rechteck.x2
  ) {
    rechteckDistancesKanten.push({
      distance: Math.abs(rechteck.y2 - mouseYOnCanvas),
      x: roundToNextHalf(mouseXOnCanvas),
      y: roundToNextHalf(rechteck.y2),
      x1: rechteck.x1,
      y1: rechteck.y1,
      isDragging: rechteck.isDragging,
    })
  }

  return rechteckDistancesKanten
}

function handleRechteckDistancesEdge (rechteckDistancesEdge, snapDistanceBlueDot) {
  const minDistance = Math.min(...rechteckDistancesEdge.map((rechteck) => rechteck.distance))
  if (minDistance < snapDistanceBlueDot) {
    const closestRechteck = rechteckDistancesEdge.find((rechteck) => rechteck.distance === minDistance)
    if (closestRechteck.isDragging) {
      blueDot.value.x = null
      blueDot.value.y = null
      return
    }

    blueDot.value.x = closestRechteck.x
    blueDot.value.y = closestRechteck.y

    redDot.value.x = null
    redDot.value.y = null

    tooltipRechteck.value.rechteck = null

    drawCanvas()
    return
  } else {
    blueDot.value.x = null
    blueDot.value.y = null
  }
}

function handleRechteckDistancesKanten (rechteckDistancesKanten, snapDistanceRedDot, mouseXOnCanvas, mouseYOnCanvas) {
  const minDistance = Math.min(...rechteckDistancesKanten.map((rechteck) => rechteck.distance))
  if (minDistance < snapDistanceRedDot) {
    const closestRechteck = rechteckDistancesKanten.find((rechteck) => rechteck.distance === minDistance)

    if (closestRechteck.isDragging) {
      redDot.value.x = null
      redDot.value.y = null
      return
    }

    redDot.value.x = closestRechteck.x
    redDot.value.y = closestRechteck.y

    tooltipRechteck.value = {
      rechteck: closestRechteck,
      x: mouseXOnCanvas,
      y: mouseYOnCanvas,
    }
  } else {
    redDot.value.x = null
    redDot.value.y = null

    tooltipRechteck.value.rechteck = null
  }
}

function handleNormalMouseMove (event) {
  event.stopPropagation()

  const mousePos = getMousePos(canvas.value, event)
  const mouseXOnCanvas = mousePos.x
  const mouseYOnCanvas = mousePos.y

  const snapDistanceRedDot = 20
  const snapDistanceBlueDot = 5

  const rechteckDistancesKanten = []
  const rechteckDistancesEdge = []

  rechtecke.value.forEach((rechteck, index) => {
    const rechteckDistancesEdgeOfRechteck = checkForBlueDot(rechteck, mouseXOnCanvas, mouseYOnCanvas, snapDistanceBlueDot)
    rechteckDistancesEdge.push(...rechteckDistancesEdgeOfRechteck)

    const rechteckDistancesKantenOfRechteck = checkForRedDot(rechteck, mouseXOnCanvas, mouseYOnCanvas, snapDistanceRedDot)
    rechteckDistancesKanten.push(...rechteckDistancesKantenOfRechteck)
  })

  handleRechteckDistancesEdge(rechteckDistancesEdge, snapDistanceBlueDot)

  handleRechteckDistancesKanten(rechteckDistancesKanten, snapDistanceRedDot, mouseXOnCanvas, mouseYOnCanvas)

  drawCanvas()
}

function addEventListenersForCanvas () {
  canvas.value.addEventListener('mousemove', handleNormalMouseMove)

  canvas.value.addEventListener('click', handleClickOnCanvas)
  canvas.value.addEventListener('dblclick', (event) => {
    handleClickOnCanvas(event)
    openAddRechteckDialog()
  })
  canvas.value.addEventListener('mousedown', handleMouseDownOnCanvas)
  canvas.value.addEventListener('mouseup', handleMouseUpOnCanvas)
  canvas.value.addEventListener('mousemove', handleMousemove)
}

const dragRectangle = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  isDragging: false,
})

function handleMouseDownOnCanvas (event) {
  dragRectangle.value.isDragging = true

  const rechteckeHasAlreadyDraggingElement = rechtecke.value.some((rechteck) => {
    return (
      rechteck.isDragging
    )
  })
  if (rechteckeHasAlreadyDraggingElement) {
    return
  }

  const mousePos = getMousePos(canvas.value, event)
  const mouseXOnCanvas = blueDot.value.x || redDot.value.x || mousePos.x
  const mouseYOnCanvas = blueDot.value.y || redDot.value.y || mousePos.y

  dragRectangle.value.x1 = roundToNextHalf(mouseXOnCanvas)
  dragRectangle.value.y1 = roundToNextHalf(mouseYOnCanvas)
  dragRectangle.value.x2 = roundToNextHalf(mouseXOnCanvas)
  dragRectangle.value.y2 = roundToNextHalf(mouseYOnCanvas)


  rechtecke.value.push(dragRectangle.value)
}

function handleMouseUpOnCanvas () {
  dragRectangle.value.isDragging = false

  const copyOfDragRectangle = { ...dragRectangle.value }

  rechtecke.value.pop()

  if (copyOfDragRectangle.x1 - copyOfDragRectangle.x2 === 0 || copyOfDragRectangle.y1 - copyOfDragRectangle.y2 === 0) {
    return
  }

  rechtecke.value.push(copyOfDragRectangle)

  canvasWidthIncrease.value = 0
}

function handleMousemove (event) {
  event.stopPropagation()

  if (dragRectangle.value.isDragging) {
    const mousePos = getMousePos(canvas.value, event)
    const mouseXOnCanvas = redDot.value.x && dragRectangle.value.x1 !== redDot.value.x ? redDot.value.x : mousePos.x
    const mouseYOnCanvas = redDot.value.x && dragRectangle.value.y1 !== redDot.value.y ? redDot.value.y : mousePos.y

    if (mouseXOnCanvas > widthOfCanvas.value) return
    if (mouseYOnCanvas > widthOfCanvas.value) return

    dragRectangle.value.x2 = roundToNextHalf(mouseXOnCanvas)
    dragRectangle.value.y2 = roundToNextHalf(mouseYOnCanvas)

    drawCanvas()

    ctx.value.fillStyle = 'black'
    ctx.value.font = '16px Arial'
    ctx.value.fillText(`breite: ${Math.abs(dragRectangle.value.x2 - dragRectangle.value.x1).toFixed(2)}, hoehe: ${Math.abs(dragRectangle.value.y2 - dragRectangle.value.y1).toFixed(2)}`, dragRectangle.value.x2, dragRectangle.value.y2)
  }
}

function handleClickOnCanvas (event) {
  event.stopPropagation()
  if (
    redDot.value.x === null && redDot.value.y === null
    && blueDot.value.x === null && blueDot.value.y === null
  ) {
    return
  }

  if (blueDot.value.x !== null && blueDot.value.y !== null) {
    clickPosition.value.x = blueDot.value.x
    clickPosition.value.y = blueDot.value.y
  } else if (redDot.value.x !== null && redDot.value.y !== null) {
    clickPosition.value.x = redDot.value.x
    clickPosition.value.y = redDot.value.y
  }

  snackbarText.value = 'Position zum Hinzufügen des Rechtecks gespeichert'
}

const redDot = ref({
  x: null,
  y: null,
})
const blueDot = ref({
  x: null,
  y: null,
})

function drawRedDot () {
  if (
    redDot.value.x === null || redDot.value.y === null
    || blueDot.value.x !== null || blueDot.value.y !== null
  ) {
    return
  }

  ctx.value.fillStyle = 'red'
  ctx.value.beginPath()
  ctx.value.arc(redDot.value.x, redDot.value.y, 4, 1, 2 * Math.PI)
  ctx.value.fill()

  clickPosition.value.x = blueDot.value.x
  clickPosition.value.y = blueDot.value.y
}
function drawBlueDot () {
  if (
    blueDot.value.x === null || blueDot.value.y === null
  ) {
    return
  }

  ctx.value.fillStyle = 'blue'
  ctx.value.beginPath()
  ctx.value.arc(blueDot.value.x, blueDot.value.y, 4, 1, 2 * Math.PI)
  ctx.value.fill()

  clickPosition.value.x = blueDot.value.x
  clickPosition.value.y = blueDot.value.y
}

const tooltipRechteck = ref({
  rechteck: null,
  x: 0,
  y: 0,
})

function drawToolTipWithDistanceToX1AndY1 () {
  if (
    tooltipRechteck.value.rechteck === null
    || dragRectangle.value.isDragging
  ) {
    return
  }

  const {
    rechteck,
    x,
    y,
  } = tooltipRechteck.value
  const distanceToX1 = Math.abs(rechteck.x1 - redDot.value.x).toFixed(2)
  const distanceToY1 = Math.abs(rechteck.y1 - redDot.value.y).toFixed(2)

  ctx.value.fillStyle = 'black'
  ctx.value.font = '16px Arial'
  ctx.value.fillText(`x1: ${distanceToX1}, y1: ${distanceToY1}`, x, y)
}

function getBreite (rechteck) {
  return Math.abs(rechteck.x2 - rechteck.x1)
}

function handleUpdateBreite (rechteck, breite) {
  rechteck.x2 = parseFloat(rechteck.x1) + parseFloat(breite)
}

function getHoehe (rechteck) {
  return Math.abs(rechteck.y2 - rechteck.y1)
}

function handleUpdateHoehe (rechteck, hoehe) {
  rechteck.y2 = parseFloat(rechteck.y1) + parseFloat(hoehe)
}

</script>