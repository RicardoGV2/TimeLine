const MONTH_DETAIL_GOAL_FILES = [
  'data/goals/business.json',
  'data/goals/personal.json',
  'data/goals/work.json',
  'data/goals/longevity.json',
  'data/goals/research.json',
  'data/goals/repos.json'
];

let monthDetailGoals = [];

async function loadMonthDetailGoals() {
  const goalSets = await Promise.all(
    MONTH_DETAIL_GOAL_FILES.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    })
  );
  monthDetailGoals = goalSets.flat();
}

function openGoalFromMonthItem(item) {
  const goalId = item?.dataset?.goalId;
  if (!goalId) return;

  const app = window.TimeLineApp;
  const goalFromApp = app?.state?.goals?.find?.((candidate) => candidate.id === goalId);
  if (goalFromApp && typeof app.openDetail === 'function') {
    app.openDetail(goalFromApp);
    return;
  }

  const fallbackGoal = monthDetailGoals.find((candidate) => candidate.id === goalId);
  if (fallbackGoal) openFallbackDetail(fallbackGoal);
}

function openFallbackDetail(goal) {
  const panel = document.querySelector('#detail-panel');
  const content = document.querySelector('#detail-content');
  const backdrop = document.querySelector('#panel-backdrop');
  if (!panel || !content) return;

  const milestones = goal.milestones || [];
  const tasks = [
    ...(goal.tasks || []),
    ...milestones.flatMap((milestone) => milestone.tasks || [])
  ];

  content.innerHTML = `
    <h2 class="detail-title">${escapeLocal(goal.emoji || '')} ${escapeLocal(goal.title || '')}</h2>
    <p>${escapeLocal(goal.summary || '')}</p>
    <div class="chips">
      <span class="chip">${escapeLocal(goal.domain || '')}</span>
      <span class="chip">${escapeLocal(goal.status || '')}</span>
      <span class="chip">${escapeLocal(goal.priority || '')}</span>
    </div>
    <div class="detail-meta">
      <div><span>Start date</span>${escapeLocal(goal.startDate || '—')}</div>
      <div><span>Target date</span>${escapeLocal(goal.targetDate || '—')}</div>
      <div><span>Period</span>${escapeLocal(goal.periodLabel || '—')}</div>
      <div><span>Users</span>${escapeLocal((goal.ownerIds || []).join(', ') || '—')}</div>
    </div>
    <h3>Milestones</h3>
    <ul class="milestone-list">
      ${milestones.map((milestone) => `<li><strong>${escapeLocal(milestone.title || '')}</strong><br><small>${escapeLocal(milestone.status || 'planned')} · target ${escapeLocal(milestone.targetDate || '—')}</small></li>`).join('') || '<li>No milestones yet.</li>'}
    </ul>
    <h3>Tasks</h3>
    <ul class="task-list">
      ${tasks.map((task) => `<li><strong>${escapeLocal(task.title || '')}</strong><br><small>${escapeLocal(task.status || 'planned')} · target ${escapeLocal(task.targetDate || '—')}</small></li>`).join('') || '<li>No tasks yet.</li>'}
    </ul>
  `;

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
}

function escapeLocal(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Capture phase so this still works if other scripts re-render or attach their own handlers.
document.addEventListener('click', (event) => {
  const item = event.target.closest('.month-item');
  if (!item) return;

  event.preventDefault();
  event.stopPropagation();
  openGoalFromMonthItem(item);
}, { capture: true });

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
loadMonthDetailGoals();
