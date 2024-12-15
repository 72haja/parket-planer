<template>
  <div class="p-10">
    <div class="max-w-lg mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-3xl font-bold mb-4">Vinyl-Platten-Rechner</h1>
      <form class="flex flex-col">
        <label class="block text-lg font-medium mb-2">
          Länge der Vinyl-Platte:
          <input
            type="number"
            v-model="vinylPlatteLaenge"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <label class="block text-lg font-medium mb-2">
          Breite der Vinyl-Platte:
          <input
            type="number"
            v-model="vinylPlatteBreite"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>

        <label class="block text-lg font-medium mb-2">
          Mindestlänge:
          <input
            type="number"
            v-model="mindestLaenge"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
        <label class="block text-lg font-medium mb-2">
          Mindestbreite:
          <input
            type="number"
            v-model="mindestBreite"
            class="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </label>
      </form>

      <div class="w-full h-96 bg-gray-200 rounded-lg shadow-md mt-4 p-4">
        <canvas
          id="raum"
          ref="canvas"
          :width="maxWidthOfRechtecke * 1.02"
          :height="maxWidthOfRechtecke * 1.02"
          class="w-full h-full bg-gray-200"
        ></canvas>
      </div>

      <button
        @click="openAddRechteckDialog"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
      >Rechteck hinzufügen</button>
      <button
        @click="berechneZuschnitt"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
      >Zuschnitt berechnen</button>
      <AddRechteckDialog
        v-if="showAddRechteckDialog"
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
          <!-- times icon -->
          <button
            @click="removeRechteck(index)"
            class="rounded-full bg-gray-400 hover:bg-gray-500 p-1"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AddRechteckDialog from './components/AddRechteckDialog.vue'

const vinylPlatteLaenge = ref(63.6)
const vinylPlatteBreite = ref(31.9)

const mindestLaenge = ref(20)
const mindestBreite = ref(15)

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

const dieleKleinBreite = 63.6;
const dieleKleinHoehe = 31.9;

const dieleGrossBreite = 152;
const dieleGrossHoehe = 23.8;

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
// const schlauchBreite = 98.5;
// const durchgangBreite = 13.5;
// const raumBreite = schlauchBreite + durchgangBreite + 337;
// const raumHoehe = 596;
// const abstandFenster = 128;
// const abstandZwischenFenster = 88.5;

// Schlafzimmer
// const raumHoehe = 576.5;
// const raumBreite = 318;
// { x1: abstandX, y1: abstandY, x2: abstandX+raumBreite, y2: abstandY+raumHoehe },

const rechtecke = ref([
  { x1: abstandX, y1: abstandY, x2: abstandX+raumBreite, y2: abstandY+raumHoehe },

  // Diele Klein
  { x1: abstandX, y1: raumHoehe+50, x2: abstandX+dieleKleinBreite, y2: raumHoehe+50+dieleKleinHoehe },

  // Diele Groß
  { x1: abstandX, y1: raumHoehe+50+dieleKleinHoehe+50, x2: abstandX+dieleGrossBreite, y2:raumHoehe+50+dieleKleinHoehe+50+dieleGrossHoehe },
])

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')

  drawRechtecke()
})

function drawRechtecke () {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  rechtecke.value.forEach((rechteck) => {
    ctx.value.lineWidth = 2;
    ctx.value.strokeStyle = 'black';
    ctx.value.beginPath()
    ctx.value.rect(rechteck.x1, rechteck.y1, rechteck.x2 - rechteck.x1, rechteck.y2 - rechteck.y1)
    // Stroke width of 2 and red color
    ctx.value.stroke()
  })
}

const maxWidthOfRechtecke = computed(() => {
  return Math.max(...rechtecke.value.map(
    (rechteck) => [rechteck.x1, rechteck.x2,rechteck.y1, rechteck.y2]
  ).flat())
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

  drawRechtecke()
}

function removeRechteck (index) {
  rechtecke.value.splice(index, 1)
  drawRechtecke()
}

function fillPlatten (
  propsZuschnittAngepasstCounterY,
  propsZuschnittAngepasstCounterX,
) {
  function getTmpHoehe (y, plattenHoehe, hoehe, rechteckY1) {
    return y + plattenHoehe <= hoehe + rechteckY1 ? plattenHoehe : hoehe + rechteckY1 - y
  }

  function getPercent (percent) {
    return Math.round((1 - percent * 0.1) * 10) / 10
  }

  function getXInZeile (xInZeile, rechteckX1) {
    return xInZeile < rechteckX1 ? rechteckX1 : xInZeile
  }

  function getYInZeile (yInZeile, rechteckY1) {
    return yInZeile < rechteckY1 ? rechteckY1 : yInZeile
  }

  function getIndexGreater0 (oldRechtEckePos, rechteckPos, zuschnittAngepasstCounter, vinylPlatteLength) {
    const oldPos = oldRechtEckePos - vinylPlatteLength * (zuschnittAngepasstCounter * 0.1);
    const distanceToNewPos = Math.abs(rechteckPos - oldRechtEckePos)
    const blocksPos = Math.floor(distanceToNewPos / vinylPlatteLength)
    return oldPos + (blocksPos * vinylPlatteLength);
  }

  let zuschnittAngepasstCounterY = propsZuschnittAngepasstCounterY
  let zuschnittAngepasstCounterX = propsZuschnittAngepasstCounterX

  let xSave
  let ySave

  const platten = []

  const rechteckeListe = rechtecke.value.slice()

  rechteckeListe.sort((a, b) => (b.x2 - b.x1) * (b.y2 - b.y1) - (a.x2 - a.x1) * (a.y2 - a.y1))

  // Iteriere über die Rechtecke
  rechteckeListe.forEach((rechteck, index) => {
    // if (index === 1) {
    //   return
    // }
    if (index > 0 && platten.length === 0) {
      return {
        platten,
        zuschnittAngepasstCounterY,
        zuschnittAngepasstCounterX,
      }
    }
    const breite = rechteck.x2 - rechteck.x1
    const hoehe = rechteck.y2 - rechteck.y1

    let x = (rechteck.x1 - vinylPlatteLaenge.value * (zuschnittAngepasstCounterX * 0.1))
    let y = (rechteck.y1 - vinylPlatteBreite.value * (zuschnittAngepasstCounterY * 0.1))

    const deltaFirstPlatte = vinylPlatteLaenge.value - vinylPlatteLaenge.value * getPercent(zuschnittAngepasstCounterX)

    if (index > 0) {
      x = getIndexGreater0(rechteckeListe[ 0 ].x1, rechteck.x1, zuschnittAngepasstCounterX, vinylPlatteLaenge.value)
      y = getIndexGreater0(rechteckeListe[ 0 ].y1, rechteck.y1, zuschnittAngepasstCounterY, vinylPlatteBreite.value)
    }

    xSave = x
    ySave = y

    let counter = 0

    while (y - rechteck.y1 < hoehe) {
      if (zuschnittAngepasstCounterY > 10 || zuschnittAngepasstCounterX > 10) {
        alert("Zuschnitt konnte nicht berechnet werden")
        break
      }
      counter++
      if (counter > 10000) {
        break
      }
      if (counter > 5 && index > 0) {
        break
      }

      let plattenInZeile = 0
      let xInZeile = x
      const xRows = Math.round(y / vinylPlatteBreite.value)

      while (xInZeile - rechteck.x1 < breite) {
        const plattenBreite = vinylPlatteLaenge.value
        const plattenHoehe = vinylPlatteBreite.value

        if (xInZeile - rechteck.x1 + plattenBreite > breite) {
          // Wenn die Platte nicht mehr in die Zeile passt, versuche sie zuzuschneiden
          const zuschnittBreite = breite - xInZeile + rechteck.x1
          if (zuschnittBreite >= mindestBreite.value && (y - rechteck.y1 + plattenHoehe <= hoehe || y - rechteck.y1 + plattenHoehe - hoehe < mindestLaenge.value)) {
            const tmpHoehe = getTmpHoehe(y, plattenHoehe, hoehe, rechteck.y1)

            const tmpXInZeile = getXInZeile(xInZeile, rechteck.x1)
            const deltaX = tmpXInZeile - xInZeile

            const tmpYInZeile = getYInZeile(y, rechteck.y1)
            const deltaY = tmpYInZeile - y

            platten.push({
              x: xRows % 2 === 0 ? tmpXInZeile : tmpXInZeile,
              y: tmpYInZeile,
              breite: zuschnittBreite - deltaX,
              hoehe: tmpHoehe - deltaY,
            })
            xInZeile += zuschnittBreite
            plattenInZeile++
          } else {
            // Wenn der Zuschnitt nicht dem Mindestmaß entspricht, gehe zurück zum Anfang
            if (zuschnittBreite < mindestBreite.value) {
              zuschnittAngepasstCounterX++
              ySave = ySave % vinylPlatteBreite.value
              y = ySave
              while ((vinylPlatteLaenge.value * getPercent(zuschnittAngepasstCounterX)) < mindestBreite.value && zuschnittAngepasstCounterX < 10) {
                zuschnittAngepasstCounterX++
              }

              xSave = ((rechteck.x1 - vinylPlatteLaenge.value * (zuschnittAngepasstCounterX * 0.1)) - vinylPlatteLaenge.value) % vinylPlatteLaenge.value
              x = xSave
            } else {
              zuschnittAngepasstCounterY++
              while ((vinylPlatteBreite.value * getPercent(zuschnittAngepasstCounterY)) < mindestLaenge.value && zuschnittAngepasstCounterY < 10) {
                zuschnittAngepasstCounterY++
              }
              ySave = (rechteck.y1 - vinylPlatteBreite.value * (zuschnittAngepasstCounterY * 0.1)) - vinylPlatteBreite.value
              y = ySave
              xSave = xSave % vinylPlatteLaenge.value
              x = xSave
            }

            plattenInZeile = 0
            xInZeile = 0
            if (zuschnittAngepasstCounterX > 10 || zuschnittAngepasstCounterY > 10) {
              return
            }
            platten.length = 0

            return
          }
        } else {
          const tmpHoehe = getTmpHoehe(y, plattenHoehe, hoehe, rechteck.y1)

          const tmpXInZeile = getXInZeile(xInZeile, rechteck.x1)
          const deltaX = tmpXInZeile - xInZeile

          const tmpYInZeile = getYInZeile(y, rechteck.y1)
          const deltaY = tmpYInZeile - y

          platten.push({
            x: xRows % 2 === 0 ? tmpXInZeile : tmpXInZeile,
            y: tmpYInZeile,
            breite: plattenBreite - deltaX,
            hoehe: tmpHoehe - deltaY,
          })
          xInZeile += plattenBreite
          plattenInZeile++
        }
      }

      if (platten.length !== 0) {
        y += vinylPlatteBreite.value
        ySave = y
        
        x = rechteck.x1 - (xSave - (vinylPlatteLaenge.value / 2)) % vinylPlatteLaenge.value
        
        if (index > 0) {
          const xRows = Math.round(y / vinylPlatteBreite.value)
          const oldX = getIndexGreater0(rechteckeListe[ 0 ].x1, rechteck.x1, zuschnittAngepasstCounterX, vinylPlatteLaenge.value)
          x = xRows % 2 === 0 ? oldX : oldX - vinylPlatteLaenge.value / 2
        }

        xSave = x
      }
    }
  })

  return { platten, zuschnittAngepasstCounterY, zuschnittAngepasstCounterX }
}

function berechneZuschnitt () {
  const platten = []

  let zuschnittAngepasstCounterY = 0
  let zuschnittAngepasstCounterX = 0

  while (platten.length === 0) {
    platten.length = 0
    const response = fillPlatten(
      zuschnittAngepasstCounterY,
      zuschnittAngepasstCounterX,
    )

    platten.push(...response.platten)
    zuschnittAngepasstCounterY = response.zuschnittAngepasstCounterY
    zuschnittAngepasstCounterX = response.zuschnittAngepasstCounterX

    const breakWhile = platten.length !== 0 || zuschnittAngepasstCounterY > 10 || zuschnittAngepasstCounterX > 10
    if (breakWhile) {
      console.log('zuschnittAngepasstCounterY', zuschnittAngepasstCounterY);
      console.log('zuschnittAngepasstCounterX', zuschnittAngepasstCounterX);
      break
    }
  }

  console.log(platten)


  // Platten im Canvas zeichnen
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  rechtecke.value.forEach((rechteck) => {
    ctx.value.beginPath()
    ctx.value.rect(rechteck.x1, rechteck.y1, rechteck.x2 - rechteck.x1, rechteck.y2 - rechteck.y1)
    ctx.value.stroke()
  })

  platten.forEach((platte) => {
    ctx.value.beginPath()
    ctx.value.rect(platte.x, platte.y, platte.breite, platte.hoehe)
    ctx.value.stroke()
  })
}

</script>