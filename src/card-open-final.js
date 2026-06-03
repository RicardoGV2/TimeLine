const FINAL_CARD_GOAL_FILES = [
  'data/goals/business.json',
  'data/goals/personal.json',
  'data/goals/work.json',
  'data/goals/longevity.json',
  'data/goals/research.json',
  'data/goals/repos.json'
];

let finalCardGoals = [];
let lastPointerOpenAt = 0;

async function loadFinalCardGoals() {
  const goalSets = await Promise.all(
    FINAL_CARD_GOAL_FILES.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    })
  );
  finalCardGoals = goalSets.flat();
}

function findGoalById(goalId) {
  return window.TimeLineApp?.state?.goals?.find?.((goal) => goal.id === goalId)
    || finalCardGoals.find((goal) => goal.id === goalId);
}

function openCardDetailFromElement(element) {
  const goalId = element?.dataset?.goalId;
  if (!goalId) return false;

  const goal = findGoalById(goalId);
  if (!goal) return false;

  if (typeof window.TimeLineApp?.openDetail === 'function') {
    window.TimeLineApp.openDetail(goal);
    return true;
  }

  openBasicFinalDetail(goal);
  return true;
}

function openBasicFinalDetail(goal) {
  const panel = document.querySelector('#detail-panel');
  const content = document.querySelector('#detail-content');
  const backdrop = document.querySelector('#panel-backdrop');
  if (!panel || !content) return;

  const milestones = goal.milestones || [];
  const nestedTasks = milestones.flatMap((milestone) => milestone.tasks || []);
  const tasks = [...(goal.tasks || []), ...nestedTasks];

  content.innerHTML = `
    <h2 class="detail-title">${escapeFinal(goal.emoji || '')} ${escapeFinal(goal.title || '')}</h2>
    <p>${escapeFinal(goal.summary || '')}</p>
    <div class="chips">
      <span class="chip">${escapeFinal(goal.domain || '')}</span>
      <span class="chip">${escapeFinal(goal.status || '')}</span>
      <span class="chip">${escapeFinal(goal.priority || '')}</span>
    </div>
    <div class="detail-meta">
      <div><span>Start date</span>${escapeFinal(goal.startDate || '—')}</div>
      <div><span>Target date</span>${escapeFinal(goal.targetDate || '—')}</div>
      <div><span>Period</span>${escapeFinal(goal.periodLabel || '—')}</div>
      <div><span>Users</span>${escapeFinal((goal.ownerIds || []).join(', ') || '—')}</div>
    </div>
    <h3>Milestones</h3>
    <ul class="milestone-list">
      ${milestones.map((milestone) => `<li><strong>${escapeFinal(milestone.title || '')}</strong><br><small>${escapeFinal(milestone.status || 'planned')} · target ${escapeFinal(milestone.targetDate || '—')}</small></li>`).join('') || '<li>No milestones yet.</li>'}
    </ul>
    <h3>Tasks</h3>
    <ul class="task-list">
      ${tasks.map((task) => `<li><strong>${escapeFinal(task.title || '')}</strong><br><small>${escapeFinal(task.status || 'planned')} · target ${escapeFinal(task.targetDate || '—')}</small></li>`).join('') || '<li>No tasks yet.</li>'}
    </ul>
  `;

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
}

function escapeFinal(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function handleCardOpen(event) {
  const card = event.target.closest?.('.month-item, .goal-card');
  if (!card) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  if (openCardDetailFromElement(card)) {
    lastPointerOpenAt = Date.now();
  }
}

document.addEventListener('pointerup', handleCardOpen, true);

document.addEventListener('click', (event) => {
  if (Date.now() - lastPointerOpenAt < 450) return;
  handleCardOpen(event);
}, true);

function makeCardsFocusableFinal() {
  document.querySelectorAll('.month-item, .goal-card').forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
  });
}

const finalCardObserver = new MutationObserver(() => makeCardsFocusableFinal());
finalCardObserver.observe(document.body, { childList: true, subtree: true });

makeCardsFocusableFinal();
loadFinalCardGoals();
