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

/* ============================
   View Management
   ============================ */
function showView(name) {
  Object.values(views).forEach((v) => v.classList.remove('active'));
  views[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update navbar visibility
  if (name === 'landing') {
    navbar.style.display = 'none';
  } else {
    navbar.style.display = 'flex';
    navResultsLink.textContent =
      name === 'results' ? 'Home' : 'View Results';
  }
}

// Initialize: show landing, hide navbar
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
  const current = navResultsLink.textContent;
  if (current === 'Home') {
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

  // Clear previous errors
  document.querySelectorAll('.form-group.error').forEach((g) => g.classList.remove('error'));

  // Gather values
  const currentLocation = surveyForm.querySelector('[name="current_location"]').value.trim();
  const homeState = surveyForm.querySelector('[name="home_state"]').value;
  const collegeYear = surveyForm.querySelector('[name="college_year"]:checked')?.value || '';
  const weeklySchedule = surveyForm.querySelector('[name="weekly_schedule"]:checked')?.value || '';
  const selfTimeFrequency = surveyForm.querySelector('[name="self_time_frequency"]:checked')?.value || '';
  const bestMentalReset = surveyForm.querySelector('[name="best_mental_reset"]').value;
  const freeDayPlans = surveyForm.querySelector('[name="free_day_plans"]').value.trim();

  // Checkboxes
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
    // Scroll to first error
    const firstError = document.querySelector('.form-group.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  // If "Other" was checked, include it in the activities list  
  if (unwindChecked.includes('Other') && unwindOther) {
    payload.unwind_activities.push(unwindOther);
  }

  // Disable button + show spinner
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner"></span>Submitting…';

  try {
    await submitResponse(payload);

    // Show success with summary
    successSummary.innerHTML = `
      <strong>Location:</strong> ${escapeHtml(currentLocation)}<br/>
      <strong>State:</strong> ${escapeHtml(homeState)}<br/>
      <strong>Year:</strong> ${escapeHtml(collegeYear)}<br/>
      <strong>Schedule:</strong> ${escapeHtml(weeklySchedule)}<br/>
      <strong>Unwind:</strong> ${escapeHtml(unwindChecked.join(', '))}${unwindOther ? ' — ' + escapeHtml(unwindOther) : ''}<br/>
      <strong>Self-time:</strong> ${escapeHtml(selfTimeFrequency)}<br/>
      <strong>Best Reset:</strong> ${escapeHtml(bestMentalReset)}<br/>
      <strong>Free Day:</strong> ${escapeHtml(freeDayPlans)}
    `;
    showView('success');
    surveyForm.reset();
    otherInputWrapper.classList.remove('visible');
  } catch (err) {
    console.error('Submit error:', err);
    formError.textContent = 'Something went wrong. Please try again.';
    formError.classList.add('visible');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Submit';
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
