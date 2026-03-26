import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const PURPLE_PALETTE = [
  '#7c3aed',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
  '#ede9fe',
  '#6d28d9',
  '#5b21b6',
];

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

/**
 * Count occurrences of each value in a data array.
 */
function countValues(data, key) {
  const counts = {};
  data.forEach((row) => {
    const val = row[key];
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

/**
 * Count occurrences across array columns (like checkboxes).
 */
function countArrayValues(data, key) {
  const counts = {};
  data.forEach((row) => {
    const arr = row[key];
    if (Array.isArray(arr)) {
      arr.forEach((val) => {
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
    }
  });
  return counts;
}

/**
 * Render a bar chart.
 */
function renderBarChart(canvasId, title, counts, orderedLabels) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = orderedLabels || Object.keys(counts);
  const values = labels.map((l) => counts[l] || 0);

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: PURPLE_PALETTE.slice(0, labels.length),
          borderRadius: 6,
          maxBarThickness: 60,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, font: { size: 16, weight: 600 } },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(124,58,237,0.08)' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

/**
 * Render a horizontal bar chart.
 */
function renderHorizontalBarChart(canvasId, title, counts) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Sort descending by count
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map((s) => s[0]);
  const values = sorted.map((s) => s[1]);

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: PURPLE_PALETTE.slice(0, labels.length),
          borderRadius: 6,
          maxBarThickness: 40,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, font: { size: 16, weight: 600 } },
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(124,58,237,0.08)' },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  });
}

/**
 * Render a doughnut chart.
 */
function renderDoughnutChart(canvasId, title, counts) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = Object.keys(counts);
  const values = labels.map((l) => counts[l]);

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: PURPLE_PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, font: { size: 16, weight: 600 } },
        legend: {
          position: 'bottom',
          labels: { padding: 16, usePointStyle: true },
        },
      },
    },
  });
}

/**
 * Render all charts on the results page.
 */
export function renderAllCharts(data) {
  // Total responses counter
  const totalEl = document.getElementById('total-responses');
  if (totalEl) totalEl.textContent = data.length;

  // 1. College Year — bar chart (ordered)
  const yearOrder = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    '5th Year or more',
  ];
  renderBarChart('chart-college-year', 'Year in College', countValues(data, 'college_year'), yearOrder);

  // 2. Weekly Schedule — horizontal bar
  renderHorizontalBarChart(
    'chart-weekly-schedule',
    'Weekly Schedule',
    countValues(data, 'weekly_schedule')
  );

  // 3. Unwind Activities — horizontal bar (most popular)
  renderHorizontalBarChart(
    'chart-unwind',
    'Most Popular Ways to Unwind',
    countArrayValues(data, 'unwind_activities')
  );

  // 4. Self-time frequency — doughnut
  renderDoughnutChart(
    'chart-self-time',
    'How Often Making Time for Yourself',
    countValues(data, 'self_time_frequency')
  );

  // 5. Best mental reset — bar chart
  renderBarChart(
    'chart-mental-reset',
    'Best Mental Reset Activity',
    countValues(data, 'best_mental_reset')
  );
}
