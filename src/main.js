import { submitResponse, fetchResponses } from './supabase.js';
import { renderAllCharts } from './charts.js';

/* ============================
   DOM References
   ============================ */
const views = {
  landing: document.getElementById('view-landing'),
  survey: document.getElementById('view-survey'),
  success: document.getElementById('view-success'),
  results: document.getElementById('view-results'),
};

const navbar = document.getElementById('navbar');
const navTitle = document.getElementById('nav-title');
const navResultsLink = document.getElementById('nav-results-link');
const btnStartSurvey = document.getElementById('btn-start-survey');
const btnViewResultsLanding = document.getElementById('btn-view-results-landing');
const btnViewResultsSuccess = document.getElementById('btn-view-results-success');
const surveyForm = document.getElementById('survey-form');
const formError = document.getElementById('form-error');
const btnSubmit = document.getElementById('btn-submit');
const successSummary = document.getElementById('success-summary');
const unwindOtherCheckbox = document.getElementById('unwind-other-checkbox');
const otherInputWrapper = document.getElementById('other-input-wrapper');
const unwindOtherText = document.getElementById('unwind-other-text');
const typingText = document.getElementById('typing-text');
const txnId = document.getElementById('txn-id');

/* ============================
   Matrix Rain Background
   ============================ */
function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:,.<>?/~`!';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array.from({ length: columns }, () => Math.random() * -100);

  function draw() {
    ctx.fillStyle = 'rgba(10, 14, 23, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#39d353';
    ctx.font = `${fontSize}px 'Fira Code', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

initMatrixRain();

/* ============================
   Typing Animation
   ============================ */
function typeText(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  return new Promise((resolve) => {
    function type() {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Start typing on landing
typeText(typingText, './survey.exe --interactive', 45);

/* ============================
   View Management
   ============================ */
function showView(name) {
  Object.values(views).forEach((v) => v.classList.remove('active'));
  views[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'landing') {
    navbar.style.display = 'none';
  } else {
    navbar.style.display = 'flex';
    navResultsLink.textContent =
      name === 'results' ? '[home]' : '[view results]';
  }
}

// Initialize
navbar.style.display = 'none';

/* ============================
   Navigation Events
   ============================ */
btnStartSurvey.addEventListener('click', () => showView('survey'));

btnViewResultsLanding.addEventListener('click', () => {
  showView('results');
  loadResults();
});

btnViewResultsSuccess.addEventListener('click', () => {
  showView('results');
  loadResults();
});

navResultsLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (navResultsLink.textContent === '[home]') {
    showView('landing');
  } else {
    showView('results');
    loadResults();
  }
});

navTitle.addEventListener('click', () => showView('landing'));
navTitle.style.cursor = 'pointer';

/* ============================
   Conditional "Other" Toggle
   ============================ */
unwindOtherCheckbox.addEventListener('change', () => {
  if (unwindOtherCheckbox.checked) {
    otherInputWrapper.classList.add('visible');
    otherInputWrapper.classList.remove('hidden');
  } else {
    otherInputWrapper.classList.remove('visible');
    unwindOtherText.value = '';
  }
});

/* ============================
   Form Submission
   ============================ */
surveyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.remove('visible');
  document.querySelectorAll('.form-group.error').forEach((g) =>
    g.classList.remove('error')
  );

  // Gather values
  const currentLocation = surveyForm.querySelector('[name="current_location"]').value.trim();
  const homeState = surveyForm.querySelector('[name="home_state"]').value;
  const collegeYear = surveyForm.querySelector('[name="college_year"]:checked')?.value || '';
  const weeklySchedule = surveyForm.querySelector('[name="weekly_schedule"]:checked')?.value || '';
  const selfTimeFrequency = surveyForm.querySelector('[name="self_time_frequency"]:checked')?.value || '';
  const bestMentalReset = surveyForm.querySelector('[name="best_mental_reset"]').value;
  const freeDayPlans = surveyForm.querySelector('[name="free_day_plans"]').value.trim();

  const unwindChecked = Array.from(
    surveyForm.querySelectorAll('[name="unwind"]:checked')
  ).map((cb) => cb.value);
  const unwindOther =
    unwindOtherCheckbox.checked ? unwindOtherText.value.trim() : '';

  // Validation
  let hasError = false;
  const required = [
    { val: currentLocation, group: 'group-q1' },
    { val: homeState, group: 'group-q2' },
    { val: collegeYear, group: 'group-q3' },
    { val: weeklySchedule, group: 'group-q4' },
    { val: unwindChecked.length > 0 ? 'ok' : '', group: 'group-q5' },
    { val: selfTimeFrequency, group: 'group-q6' },
    { val: bestMentalReset, group: 'group-q7' },
    { val: freeDayPlans, group: 'group-q8' },
  ];

  required.forEach(({ val, group }) => {
    if (!val) {
      document.getElementById(group).classList.add('error');
      hasError = true;
    }
  });

  if (hasError) {
    formError.classList.add('visible');
    const firstError = document.querySelector('.form-group.error');
    if (firstError)
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Build payload
  const payload = {
    current_location: currentLocation,
    home_state: homeState,
    college_year: collegeYear,
    weekly_schedule: weeklySchedule,
    unwind_activities: unwindChecked.filter((v) => v !== 'Other'),
    unwind_other: unwindOther || null,
    self_time_frequency: selfTimeFrequency,
    best_mental_reset: bestMentalReset,
    free_day_plans: freeDayPlans,
  };

  if (unwindChecked.includes('Other') && unwindOther) {
    payload.unwind_activities.push(unwindOther);
  }

  // Disable & show spinner
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner"></span> submitting...';

  try {
    await submitResponse(payload);

    // Generate fake transaction ID
    const fakeTxn = 'txn_' + Math.random().toString(36).substring(2, 10);
    txnId.textContent = fakeTxn;

    // Terminal-style success summary
    successSummary.innerHTML = `
      <span class="key">current_location:</span> <span class="val">"${escapeHtml(currentLocation)}"</span><br/>
      <span class="key">home_state:</span> <span class="val">"${escapeHtml(homeState)}"</span><br/>
      <span class="key">college_year:</span> <span class="val">"${escapeHtml(collegeYear)}"</span><br/>
      <span class="key">weekly_schedule:</span> <span class="val">"${escapeHtml(weeklySchedule)}"</span><br/>
      <span class="key">unwind_activities:</span> <span class="val">[${unwindChecked.map((v) => `"${escapeHtml(v)}"`).join(', ')}]</span><br/>
      ${unwindOther ? `<span class="key">unwind_other:</span> <span class="val">"${escapeHtml(unwindOther)}"</span><br/>` : ''}
      <span class="key">self_time_frequency:</span> <span class="val">"${escapeHtml(selfTimeFrequency)}"</span><br/>
      <span class="key">best_mental_reset:</span> <span class="val">"${escapeHtml(bestMentalReset)}"</span><br/>
      <span class="key">free_day_plans:</span> <span class="val">"${escapeHtml(freeDayPlans)}"</span>
    `;
    showView('success');
    surveyForm.reset();
    otherInputWrapper.classList.remove('visible');
  } catch (err) {
    console.error('Submit error:', err);
    formError.textContent = '[ERROR] Database write failed. Retry.';
    formError.classList.add('visible');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span class="text-green">&gt;</span> submit --save';
  }
});

/* ============================
   Results Loading
   ============================ */
let resultsLoaded = false;

async function loadResults() {
  if (resultsLoaded) return;
  try {
    const data = await fetchResponses();
    renderAllCharts(data);
    resultsLoaded = true;
  } catch (err) {
    console.error('Failed to load results:', err);
  }
}

/* ============================
   Helpers
   ============================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
