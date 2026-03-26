import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Terminal-themed color palette
const TERMINAL_PALETTE = [
  '#39d353',  // green
  '#58a6ff',  // blue
  '#e3b341',  // yellow
  '#f778ba',  // pink
  '#bc8cff',  // purple
  '#79c0ff',  // light blue
  '#7ee787',  // light green
  '#ffa657',  // orange
];

// Global Chart.js defaults for terminal theme
Chart.defaults.color = '#8b949e';
Chart.defaults.font.family = "'Fira Code', 'JetBrains Mono', monospace";
Chart.defaults.font.size = 11;

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function countValues(data, key) {
  const counts = {};
  data.forEach((row) => {
    const val = row[key];
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

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
          backgroundColor: TERMINAL_PALETTE.slice(0, labels.length).map(c => c + 'cc'),
          borderColor: TERMINAL_PALETTE.slice(0, labels.length),
          borderWidth: 1,
          borderRadius: 3,
          maxBarThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `> ${title}`,
          font: { size: 13, weight: 600 },
          color: '#c9d1d9',
          align: 'start',
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, color: '#8b949e' },
          grid: { color: 'rgba(48, 54, 61, 0.6)', drawBorder: false },
          border: { color: '#30363d' },
        },
        x: {
          ticks: { color: '#8b949e' },
          grid: { display: false },
          border: { color: '#30363d' },
        },
      },
    },
  });
}

function renderHorizontalBarChart(canvasId, title, counts) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

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
          backgroundColor: TERMINAL_PALETTE.slice(0, labels.length).map(c => c + 'cc'),
          borderColor: TERMINAL_PALETTE.slice(0, labels.length),
          borderWidth: 1,
          borderRadius: 3,
          maxBarThickness: 32,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `> ${title}`,
          font: { size: 13, weight: 600 },
          color: '#c9d1d9',
          align: 'start',
        },
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, color: '#8b949e' },
          grid: { color: 'rgba(48, 54, 61, 0.6)', drawBorder: false },
          border: { color: '#30363d' },
        },
        y: {
          ticks: { color: '#8b949e' },
          grid: { display: false },
          border: { color: '#30363d' },
        },
      },
    },
  });
}

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
          backgroundColor: TERMINAL_PALETTE.slice(0, labels.length).map(c => c + 'cc'),
          borderColor: '#0d1117',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `> ${title}`,
          font: { size: 13, weight: 600 },
          color: '#c9d1d9',
          align: 'start',
        },
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            usePointStyle: true,
            color: '#8b949e',
            font: { family: "'Fira Code', monospace", size: 10 },
          },
        },
      },
    },
  });
}

export function renderAllCharts(data) {
  const totalEl = document.getElementById('total-responses');
  if (totalEl) totalEl.textContent = data.length;

  const yearOrder = [
    '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year or more',
  ];
  renderBarChart('chart-college-year', 'college_year.distribution', countValues(data, 'college_year'), yearOrder);
  renderHorizontalBarChart('chart-weekly-schedule', 'weekly_schedule.distribution', countValues(data, 'weekly_schedule'));
  renderHorizontalBarChart('chart-unwind', 'unwind_activities.frequency', countArrayValues(data, 'unwind_activities'));
  renderDoughnutChart('chart-self-time', 'self_time.breakdown', countValues(data, 'self_time_frequency'));
  renderBarChart('chart-mental-reset', 'mental_reset.counts', countValues(data, 'best_mental_reset'));
}
