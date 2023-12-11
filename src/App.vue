<template>
  <main>
    <h1 class="text-center mt-10 text-[30px]">Weight tracker</h1>

    <div
      class="m-auto h-[250px] w-[250px] border-[3px] border-[#ff1493] rounded-full mt-10 flex flex-col justify-center items-center"
    >
      <span class="text-[50px]">{{ currentWeight.weight }}</span>
      <small>Current weight (kg)</small>
    </div>
    <form @submit.prevent="addWeight">
      <div class="m-auto w-full flex items-center justify-center my-5">
        <input
          type="number"
          step="0.1"
          v-model="weightInput"
          class="bg-white border-[1px] border-[#ff1493] rounded-l-[5px] p-2 outline-none"
        />
        <input
          type="submit"
          value="Add weight"
          class="bg-[#ff1493] border-[1px] border-[#ff1493] rounded-r-[5px] p-2 outline-none text-[white]"
        />
      </div>
    </form>
    <div v-if="weights && weights.length > 0" class="mx-5 mb-10">
      <h2 class="mt-10">last 7 days</h2>
      <div>
        <canvas ref="weightChartE1"></canvas>
      </div>
      <div>
        <h2 class="mt-10">weight history</h2>
        <ul>
          <li
            v-for="(weight, index) in firstSeven"
            :key="index"
            class="justify-between w-full flex bg-[#ff149129] p-2 rounded-[5px] my-3 items-end"
          >
            <p>{{ weight.weight }}kg <small>{{ weight.difference }}</small></p>
            <small>{{ new Date(weight.date).toLocaleDateString() }}</small>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, shallowRef, computed, watch, nextTick } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Chart from "chart.js/auto";
export default {
  setup() {
    const weights = ref(JSON.parse(localStorage.getItem('weights')) || []);
    const weightChartE1 = ref(null);
    const weightChart = shallowRef(null);
    let previousWeight = null;
    const weightInput = ref(0);
    const currentWeight = computed(() => {
      return weights.value.sort((a, b) => b.date - a.date)[0] || { weight: 0 };
    });

    const addWeight = () => {
      const currentDate = new Date();
      const currentWeight = weightInput.value;

      const weightDifference =
        previousWeight !== null ? currentWeight - previousWeight : null;
        const formattedDifference = weightDifference !== null
    ? (weightDifference >= 0 ? `+${weightDifference}` : weightDifference)
    : null;


      previousWeight = currentWeight;


      // Add the new weight to the weights array
      const existingObject = weights.value.find((item) => {
        const existingDate = new Date(item.date);
        const timeDifference = currentDate - existingDate;
        return timeDifference >= 0 && timeDifference < 24 * 60 * 60 * 1000;
      });

      if (weightInput.value === 0) {
        toast.warning("Fill in your weight");
        return;
      }
      if (existingObject) {
        toast.warning('Weight entry for the same date within 24 hours already exists.');
      }
      else {
        weights.value.push({
          weight: currentWeight,
          date: currentDate,
          difference: formattedDifference,
        });
      localStorage.setItem('weights', JSON.stringify(weights.value));
      
      }
    };

    const firstSeven = computed(() => {
      const firstSevenWeights = weights.value.slice(0, 7);
      return [...firstSevenWeights];
    });

    // Watch for changes in weights
watch(
  weights,
  (newWeights) => {
    const ws = [...newWeights];

    // Update chart data
    if (weightChart.value) {
      updateChart(ws);
      saveChartToLocalStorage(ws);
    } else {
      nextTick(() => {
        weightChart.value = createChart(ws);
        saveChartToLocalStorage(ws);
      });
    }
  },
  { deep: true }
);

// Function to update the chart data
function updateChart(ws) {
  weightChart.value.data.labels = ws
    .sort((a, b) => a.date - b.date)
    .map((w) => new Date(w.date).toLocaleDateString())
    .slice(-7);

  weightChart.value.data.datasets[0].data = ws
    .sort((a, b) => a.date - b.date)
    .map((w) => w.weight)
    .slice(-7);

  weightChart.value.update();
}
// Check if there is chart data in local storage and restore the chart on page load
const storedChartData = localStorage.getItem('chartData');
if (storedChartData) {
  const parsedChartData = JSON.parse(storedChartData);
  if (parsedChartData.length > 0) {
    nextTick(() => {
      weightChart.value = createChart(parsedChartData);
    });
  }
}


// Function to create the chart
function createChart(ws) {
  return new Chart(weightChartE1.value.getContext("2d"), {
    type: "line",
    data: {
      labels: ws.sort((a, b) => a.date - b.date).map((w) => new Date(w.date).toLocaleDateString()),
      datasets: [
        {
          label: "weight",
          data: ws.sort((a, b) => a.date - b.date).map((w) => w.weight),
          backgroundColor: "rgba(255,105,180,0.2)",
          borderColor: "rgb(255,105,180)",
          borderWidth: 1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Function to save chart data to local storage
function saveChartToLocalStorage(ws) {
  localStorage.setItem('chartData', JSON.stringify(ws));
}


    return {
      weights,
      weightChartE1,
      weightInput,
      firstSeven,
      currentWeight,
      addWeight,
    };
  },
};
</script>

<style>
</style>
