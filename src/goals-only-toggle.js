let goalsOnlyMode = false;
let goalsOnlyUpdateScheduled = false;

function isTimelineViewVisible() {
  return Boolean(document.querySelector('.timeline-scroll, .month-scroll'));
}

function countVisibleGoals() {
  return document.querySelectorAll('.goal-card').length;
}

function countVisibleMonthGoalItems() {
  return document.querySelectorAll('.month-item.month-item-start, .month-item.month-item-target').length;
}

function updateGoalsOnlyButtonLabel(button) {
  if (!button) return;
  const inMonthlyView = Boolean(document.querySelector('.month-scroll'));
  const count = inMonthlyView ? countVisibleMonthGoalItems() : countVisibleGoals();
  const nextText = goalsOnlyMode ? `Showing goals only (${count})` : `Goals only (${count})`;

  if (button.textContent !== nextText) {
    button.textContent = nextText;
  }

  button.classList.toggle('active', goalsOnlyMode);
  button.setAttribute('aria-pressed', goalsOnlyMode ? 'true' : 'false');
}

function applyGoalsOnlyMode() {
  document.body.classList.toggle('goals-only-mode', goalsOnlyMode);

  document.querySelectorAll('.month-item').forEach((item) => {
    const isGoalLevelItem = item.classList.contains('month-item-start') || item.classList.contains('month-item-target');
    item.classList.toggle('hide-for-goals-only', goalsOnlyMode && !isGoalLevelItem);
  });

  document.querySelectorAll('.month-card').forEach((card) => {
    const hasGoalLevelItems = Boolean(card.querySelector('.month-item.month-item-start, .month-item.month-item-target'));
    card.classList.toggle('month-card-has-goal-items', hasGoalLevelItems);
  });

  document.querySelectorAll('.goals-only-toggle').forEach(updateGoalsOnlyButtonLabel);
}

function findHeaderRightSide(viewHeader) {
  return Array.from(viewHeader.children).find((child) => {
    return child.classList?.contains('chip') || child.id === 'back-to-global';
  });
}

function ensureGoalsOnlyToggle() {
  if (!isTimelineViewVisible()) return;

  const viewHeader = document.querySelector('#view-root .view-header');
  if (!viewHeader || viewHeader.querySelector('.goals-only-toggle')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'goals-only-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    goalsOnlyMode = !goalsOnlyMode;
    applyGoalsOnlyMode();
  });

  const existingRightSide = findHeaderRightSide(viewHeader);
  if (existingRightSide) {
    existingRightSide.insertAdjacentElement('beforebegin', button);
  } else {
    viewHeader.append(button);
  }

  updateGoalsOnlyButtonLabel(button);
}

function scheduleGoalsOnlyRefresh() {
  if (goalsOnlyUpdateScheduled) return;
  goalsOnlyUpdateScheduled = true;

  requestAnimationFrame(() => {
    goalsOnlyUpdateScheduled = false;
    ensureGoalsOnlyToggle();
    applyGoalsOnlyMode();
  });
}

const goalsOnlyObserver = new MutationObserver(scheduleGoalsOnlyRefresh);
goalsOnlyObserver.observe(document.body, { childList: true, subtree: true });

scheduleGoalsOnlyRefresh();
