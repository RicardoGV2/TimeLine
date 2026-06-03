let activeGoalFocusId = null;
let lastSelectedGoalId = null;

document.addEventListener('click', (event) => {
  const selected = event.target.closest('[data-goal-id]');
  if (selected?.dataset.goalId) {
    lastSelectedGoalId = selected.dataset.goalId;
  }
});

function isMonthlyTimelineView() {
  return Boolean(document.querySelector('.year-expanded .month-card'));
}

function getOpenDetailGoalId() {
  if (lastSelectedGoalId) return lastSelectedGoalId;

  const title = document.querySelector('#detail-content .detail-title')?.textContent || '';
  const allCards = Array.from(document.querySelectorAll('[data-goal-id]'));
  const matchedCard = allCards.find((card) => {
    const cardTitle = card.querySelector('.goal-title, strong')?.textContent || '';
    return title && cardTitle && title.includes(cardTitle.replace(/^\S+\s+/, '').trim());
  });

  return matchedCard?.dataset.goalId || null;
}

function addRelatedFocusButton() {
  const detail = document.querySelector('#detail-content');
  if (!detail || detail.querySelector('.goal-focus-actions')) return;

  const goalId = getOpenDetailGoalId();
  if (!goalId) return;

  const actions = document.createElement('div');
  actions.className = 'goal-focus-actions';
  actions.dataset.goalId = goalId;
  actions.innerHTML = `
    <button type="button" class="goal-focus-button">Show only this goal</button>
    <button type="button" class="goal-focus-clear">Show all</button>
  `;

  const chips = detail.querySelector('.chips');
  if (chips) chips.after(actions);
  else detail.prepend(actions);

  const focusButton = actions.querySelector('.goal-focus-button');
  const clearButton = actions.querySelector('.goal-focus-clear');

  focusButton.addEventListener('click', () => {
    if (!isMonthlyTimelineView()) return;
    if (activeGoalFocusId === goalId) {
      clearGoalFocus();
      return;
    }
    setGoalFocus(goalId);
  });

  clearButton.addEventListener('click', clearGoalFocus);

  updateFocusButtonState();
}

function setGoalFocus(goalId) {
  activeGoalFocusId = goalId;
  document.body.classList.add('goal-focus-active');
  applyGoalFocus();
  updateFocusButtonState();
}

function clearGoalFocus() {
  activeGoalFocusId = null;
  document.body.classList.remove('goal-focus-active');
  document.querySelectorAll('.goal-focus-match').forEach((item) => item.classList.remove('goal-focus-match'));
  updateFocusButtonState();
}

function applyGoalFocus() {
  document.querySelectorAll('.goal-focus-match').forEach((item) => item.classList.remove('goal-focus-match'));
  if (!activeGoalFocusId) return;

  document.querySelectorAll(`[data-goal-id="${CSS.escape(activeGoalFocusId)}"]`).forEach((item) => {
    item.classList.add('goal-focus-match');
  });
}

function updateFocusButtonState() {
  const actions = document.querySelector('.goal-focus-actions');
  const button = actions?.querySelector('.goal-focus-button');
  if (!actions || !button) return;
  const goalId = actions.dataset.goalId;
  const active = activeGoalFocusId === goalId;
  const monthlyView = isMonthlyTimelineView();

  button.classList.toggle('active', active);
  button.disabled = !monthlyView;
  button.title = monthlyView ? 'Show only timeline items related to this goal' : 'Available only in the expanded monthly view';
  button.textContent = !monthlyView ? 'Open a year to focus this goal' : active ? 'Showing only this goal' : 'Show only this goal';
}

const relatedFocusObserver = new MutationObserver(() => {
  addRelatedFocusButton();
  applyGoalFocus();
  updateFocusButtonState();
});
relatedFocusObserver.observe(document.body, { childList: true, subtree: true });

addRelatedFocusButton();
