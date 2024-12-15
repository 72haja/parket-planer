<template>
  <div class="p-10">
    <div class="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-3xl font-bold mb-4">Vinyl-Platten-Rechner</h1>
      <form class="flex flex-col">
        <template
          v-for="(platte, index) in vinylPlatten"
          :key="'platte_' + index"
        >
          <div class="flex gap-4 items-center">
            <div class="w-full grid gap-2">
              <label class="block text-lg font-medium">
                Länge der Vinyl-Platte:
                <input
                  type="number"
                  v-model="platte.laenge"
                  class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
              <label class="block text-lg font-medium">
                Breite der Vinyl-Platte:
                <input
                  type="number"
                  v-model="platte.breite"
                  class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>

              <div
                v-if="index !== vinylPlatten.length - 1"
                class="m-2 h-[1px] bg-gray-400"
              >
              </div>
            </div>

            <CloseButton @click="removeVinylPlatte(index)" />
          </div>
        </template>

        <button
          @click="vinylPlatten.push({ laenge: 0, breite: 0 })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
        >
          weitere Vinyl-Platte hinzufügen
        </button>
      </form>

      <div
        class="w-full aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4"
      >
        <canvas
          id="raum"
          ref="canvas"
          :width="widthOfCanvas * 1.02"
          :height="widthOfCanvas * 1.02"
          class="w-full h-full bg-gray-200"
        ></canvas>
      </div>

      <button
        @click="openAddRechteckDialog"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
      >
        Rechteck
        hinzufügen
      </button>
      <AddRechteckDialog
        :show-dialog="showAddRechteckDialog"
        :x-position="clickPosition.x"
        :y-position="clickPosition.y"
        @save="addRechteck"
        @close="closeAddRechteckDialog"
      />

      <div class="grid gap-2 p-4">
        <div
          class="flex items-center gap-2"
          v-for="(rechteck, index) in rechtecke"
          :key="index"
        >
          <span> Rechteck {{ index }}</span>
          <CloseButton @click="removeRechteck(index)" />
        </div>
      </div>
    </div>

    <Snackbar v-model:text="snackbarText" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AddRechteckDialog from './components/AddRechteckDialog.vue'
import CloseButton from './components/CloseButton.vue';
import Snackbar from './components/Snackbar.vue';

const snackbarText = ref('')

const vinylPlatten = ref([
  {
    laenge: 63.6,
    breite: 31.9,
  },
  {
    laenge: 152,
    breite: 23.8,
  },

])

function removeVinylPlatte (index) {
  console.log('removeVinylPlatte');
  vinylPlatten.value.splice(index, 1)
}

watch(vinylPlatten, (newValue) => {
  drawCanvas()
}, { deep: true })

const clickPosition = ref({
  x: 0,
  y: 0,
})

const canvas = ref(null)
const ctx = ref(null)
// const rechtecke = ref([
//   { x1: 0, y1: 0, x2: 482, y2: 327 },
//   { x1: 482 - 327, y1: 327, x2: 482, y2: 572 },
// ])

const abstandX = 20;
const abstandY = 20;
const tuerbreite1 = 85;
const tuerbreite2 = 72;
const tuertiefe = 16.5;
const fensterTiefe = 12;
const fensterBreite = 117.5;

// Abstellkammer
// const raumBreite = 149.5;
// const raumHoehe = 328;
// { x1: abstandX, y1: abstandY, x2: abstandX+raumBreite, y2: abstandY+raumHoehe },

// Flur
// const raumBreite = 297.5;
// const raumHoehe = 99;
// { x1: abstandX, y1: abstandY, x2: raumBreite+abstandX, y2: raumHoehe+abstandY },
// { x1: 97.5+abstandX, y1: raumHoehe+abstandY, x2: 97.5+abstandX+102, y2: 123+abstandY },
// { x1: abstandX-tuertiefe, y1: abstandY+5, x2: abstandX, y2: abstandY+5+tuerbreite1 },
// { x1: abstandX+5, y1: abstandY-tuertiefe, x2: abstandX+5+tuerbreite2, y2: abstandY },
// { x1: raumBreite+abstandX-2-tuerbreite2, y1: abstandY-tuertiefe, x2: raumBreite+abstandX-2, y2: abstandY },
// { x1: raumBreite+abstandX, y1: abstandY+5, x2: raumBreite+abstandX+tuertiefe, y2: abstandX+5+tuerbreite1 },

// Kinderzimmer
const schlauchBreite = 98.5;
const durchgangBreite = 13.5;
const raumBreite = schlauchBreite + durchgangBreite + 337;
const raumHoehe = 596;
const abstandFenster = 128;
const abstandZwischenFenster = 88.5;
// { x1: abstandX, y1: abstandY, x2: abstandX+schlauchBreite, y2: abstandY+340 },
// { x1: abstandX+schlauchBreite, y1: abstandY+35, x2: abstandX+schlauchBreite+durchgangBreite, y2: abstandY+35+220 },
// { x1: abstandX+schlauchBreite+durchgangBreite, y1: abstandY, x2: abstandX+raumBreite, y2: abstandY+raumHoehe },
// { x1: abstandX+raumBreite, y1: abstandY+abstandFenster, x2: abstandX+raumBreite+fensterTiefe, y2: abstandY+abstandFenster+fensterBreite },
// { x1: abstandX+raumBreite, y1: abstandY+abstandFenster+fensterBreite+abstandZwischenFenster, x2: abstandX+raumBreite+fensterTiefe, y2: abstandY+abstandFenster+fensterBreite+abstandZwischenFenster+fensterBreite },
// { x1: abstandX+schlauchBreite + durchgangBreite, y1: abstandY+raumHoehe-47.5, x2: abstandX+schlauchBreite + durchgangBreite+47.5, y2: abstandY+raumHoehe },


// Schlafzimmer
// const raumHoehe = 576.5;
// const raumBreite = 318;
// { x1: abstandX, y1: abstandY, x2: abstandX+raumBreite, y2: abstandY+raumHoehe },

const rechtecke = ref([
  { x1: abstandX, y1: abstandY, x2: abstandX + schlauchBreite, y2: abstandY + 340 },
  { x1: abstandX + schlauchBreite, y1: abstandY + 35, x2: abstandX + schlauchBreite + durchgangBreite, y2: abstandY + 35 + 220 },
  { x1: abstandX + schlauchBreite + durchgangBreite, y1: abstandY, x2: abstandX + raumBreite, y2: abstandY + raumHoehe },
  { x1: abstandX + raumBreite, y1: abstandY + abstandFenster, x2: abstandX + raumBreite + fensterTiefe, y2: abstandY + abstandFenster + fensterBreite },
  { x1: abstandX + raumBreite, y1: abstandY + abstandFenster + fensterBreite + abstandZwischenFenster, x2: abstandX + raumBreite + fensterTiefe, y2: abstandY + abstandFenster + fensterBreite + abstandZwischenFenster + fensterBreite },
  { x1: abstandX + schlauchBreite + durchgangBreite, y1: abstandY + raumHoehe - 47.5, x2: abstandX + schlauchBreite + durchgangBreite + 47.5, y2: abstandY + raumHoehe },

  // Diele Klein
  // { x1: abstandX, y1: raumHoehe + 50, x2: abstandX + dieleKleinBreite, y2: raumHoehe + 50 + dieleKleinHoehe },

  // // Diele Groß
  // { x1: abstandX, y1: raumHoehe + 50 + dieleKleinHoehe + 50, x2: abstandX + dieleGrossBreite, y2: raumHoehe + 50 + dieleKleinHoehe + 50 + dieleGrossHoehe },
])

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')

  drawCanvas()

  addEventListenersForCanvas()
})

function drawCanvas () {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  drawRechtecke()

  drawVinylPlatten()

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
    // Stroke width of 2 and red color
    ctx.value.stroke()
  })
}

function drawVinylPlatten () {
  const abstand = 50

  vinylPlatten.value.forEach((platte, index) => {
    ctx.value.lineWidth = 2;
    ctx.value.strokeStyle = 'black';
    ctx.value.beginPath()
    ctx.value.rect(abstandX, maxYOfRechtecke.value + abstand * (index + 1), platte.laenge, platte.breite)
    // Stroke width of 2 and red color
    ctx.value.stroke()
  })
}

const maxXOfRechtecke = computed(() => {
  return Math.max(...rechtecke.value.map(
    (rechteck) => [ rechteck.x1, rechteck.x2 ]
  ).flat())
})

const maxYOfRechtecke = computed(() => {
  return Math.max(...rechtecke.value.map(
    (rechteck) => [ rechteck.y1, rechteck.y2 ]
  ).flat())
})

const maxY = computed(() => {
  return maxYOfRechtecke.value + 50 * vinylPlatten.value.length + vinylPlatten.value.reduce((acc, platte) => acc + platte.breite, 0)
})

const maxWidthOfRechtecke = computed(() => {
  return Math.max(maxXOfRechtecke.value, maxYOfRechtecke.value)
})

const widthOfCanvas = computed(() => {
  return Math.max(maxWidthOfRechtecke.value, maxY.value)
})

const showAddRechteckDialog = ref(false)

function openAddRechteckDialog () {
  showAddRechteckDialog.value = true
}

function closeAddRechteckDialog () {
  showAddRechteckDialog.value = false
}

function addRechteck (rechteck) {
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
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
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
    })
  }

  return rechteckDistancesKanten
}

function handleRechteckDistancesEdge (rechteckDistancesEdge, snapDistanceBlueDot) {
  const minDistance = Math.min(...rechteckDistancesEdge.map((rechteck) => rechteck.distance))
  if (minDistance < snapDistanceBlueDot) {
    const closestRechteck = rechteckDistancesEdge.find((rechteck) => rechteck.distance === minDistance)

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

function addEventListenersForCanvas () {
  canvas.value.addEventListener('mousemove', (event) => {
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
  })

  canvas.value.addEventListener('click', (event) => {
    if (
      redDot.value.x !== null && redDot.value.y !== null
      && blueDot.value.x !== null && blueDot.value.y !== null
    ) {
      return
    }

    // const mousePos = getMousePos(canvas.value, event)

    if (blueDot.value.x !== null && blueDot.value.y !== null) {
      clickPosition.value.x = blueDot.value.x
      clickPosition.value.y = blueDot.value.y
    } else if (redDot.value.x !== null && redDot.value.y !== null) {
      clickPosition.value.x = redDot.value.x
      clickPosition.value.y = redDot.value.y
    }

    console.log('clickPosition.value', clickPosition.value);
    snackbarText.value = 'Position zum Hinzufügen des Rechtecks gespeichert'
  })

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
}
function drawBlueDot () {
  if (blueDot.value.x === null || blueDot.value.y === null) {
    return
  }

  ctx.value.fillStyle = 'blue'
  ctx.value.beginPath()
  ctx.value.arc(blueDot.value.x, blueDot.value.y, 4, 1, 2 * Math.PI)
  ctx.value.fill()
}

const tooltipRechteck = ref({
  rechteck: null,
  x: 0,
  y: 0,
})

function drawToolTipWithDistanceToX1AndY1 () {
  if (tooltipRechteck.value.rechteck === null) {
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

</script>