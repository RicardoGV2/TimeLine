function openGoalFromMonthItem(item) {
  const goalId = item?.dataset?.goalId;
  const app = window.TimeLineApp;
  if (!goalId || !app?.state?.goals || typeof app.openDetail !== 'function') return;

  const goal = app.state.goals.find((candidate) => candidate.id === goalId);
  if (!goal) return;

  app.openDetail(goal);
}

// Delegated handler: keeps monthly cards opening even after re-renders or helper scripts.
document.addEventListener('click', (event) => {
  const item = event.target.closest('.month-item');
  if (!item) return;

  event.preventDefault();
  openGoalFromMonthItem(item);
}, { capture: false });

// Keyboard support for focused monthly items.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const item = event.target.closest?.('.month-item');
  if (!item) return;

  event.preventDefault();
  openGoalFromMonthItem(item);
});

function makeMonthItemsFocusable() {
  document.querySelectorAll('.month-item').forEach((item) => {
    if (!item.hasAttribute('tabindex')) item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.textContent.trim());
  });
}

const monthOpenFixObserver = new MutationObserver(() => makeMonthItemsFocusable());
monthOpenFixObserver.observe(document.body, { childList: true, subtree: true });
makeMonthItemsFocusable();
