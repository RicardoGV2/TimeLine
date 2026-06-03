const DETAIL_DATA_FILES = {
  config: 'data/config.json',
  goals: [
    'data/goals/business.json',
    'data/goals/personal.json',
    'data/goals/work.json',
    'data/goals/longevity.json',
    'data/goals/research.json',
    'data/goals/repos.json'
  ],
  resources: 'data/resources.json',
  decisions: 'data/decisions.json'
};

let detailDataReady = null;
let detailData = {
  config: { users: [], bases: [] },
  goals: [],
  resources: [],
  decisions: []
};

function detailEscapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function detailLoadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

function detailById(items) {
  return Object.fromEntries((items || []).map((item) => [item.id, item]));
}

async function loadDetailData() {
  const config = await detailLoadJson(DETAIL_DATA_FILES.config, { users: [], bases: [] });
  const goalSets = await Promise.all(DETAIL_DATA_FILES.goals.map((path) => detailLoadJson(path, [])));
  const resources = await detailLoadJson(DETAIL_DATA_FILES.resources, []);
  const decisions = await detailLoadJson(DETAIL_DATA_FILES.decisions, []);

  detailData = {
    config,
    goals: goalSets.flat(),
    resources,
    decisions
  };
}

function openGoalDetailFallback(goalId) {
  const goal = detailData.goals.find((candidate) => candidate.id === goalId);
  if (!goal) return;

  const panel = document.querySelector('#detail-panel');
  const content = document.querySelector('#detail-content');
  const backdrop = document.querySelector('#panel-backdrop');
  if (!panel || !content) return;

  const users = detailById(detailData.config.users || []);
  const basesById = detailById(detailData.config.bases || []);

  const people = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => users[id]?.name)
    .filter(Boolean)
    .join(', ');

  const bases = (goal.bases || []).map((id) => basesById[id]).filter(Boolean);
  const linkedResources = detailData.resources.filter((resource) => (resource.relatedGoals || []).includes(goal.id));
  const linkedDecisions = detailData.decisions.filter((decision) => (decision.relatedGoals || []).includes(goal.id));

  content.dataset.goalId = goal.id;
  content.innerHTML = `
    <h2 class="detail-title">${goal.emoji || ''} ${detailEscapeHtml(goal.title)}</h2>
    <p>${detailEscapeHtml(goal.summary || '')}</p>
    <div class="chips">
      <span class="chip">${detailEscapeHtml(goal.domain)}</span>
      <span class="chip">${detailEscapeHtml(goal.category || '')}</span>
      <span class="chip">${detailEscapeHtml(goal.status)}</span>
      <span class="chip">${detailEscapeHtml(goal.priority)}</span>
    </div>
    <div class="detail-meta">
      <div><span>Start date</span>${detailEscapeHtml(goal.startDate || '—')}</div>
      <div><span>Target date</span>${detailEscapeHtml(goal.targetDate || '—')}</div>
      <div><span>Users</span>${detailEscapeHtml(people || '—')}</div>
      <div><span>Period</span>${detailEscapeHtml(goal.periodLabel || '—')}</div>
    </div>
    <h3>Related bases</h3>
    <div class="chips">${bases.map((base) => `<span class="chip">${base.emoji} ${detailEscapeHtml(base.name)}</span>`).join('') || '<span class="chip">No bases</span>'}</div>
    <h3>Milestones</h3>
    <ul class="milestone-list">${(goal.milestones || []).map((milestone) => `<li><strong>${detailEscapeHtml(milestone.title)}</strong><br><small>${detailEscapeHtml(milestone.status)} · target ${detailEscapeHtml(milestone.targetDate || '—')}</small><p>${detailEscapeHtml(milestone.summary || '')}</p></li>`).join('') || '<li>No milestones yet.</li>'}</ul>
    <h3>Tasks</h3>
    <ul class="task-list">${(goal.tasks || []).map((task) => `<li><strong>${detailEscapeHtml(task.title)}</strong><br><small>${detailEscapeHtml(task.status)} · target ${detailEscapeHtml(task.targetDate || '—')}</small></li>`).join('') || '<li>No tasks yet.</li>'}</ul>
    <h3>Linked resources</h3>
    <ul class="task-list">${linkedResources.map((resource) => `<li><strong>${detailEscapeHtml(resource.title)}</strong><br><small>${detailEscapeHtml(resource.resourceType)} · ${detailEscapeHtml(resource.status)}</small><p>${detailEscapeHtml(resource.summary || '')}</p></li>`).join('') || '<li>No resources linked yet.</li>'}</ul>
    <h3>Decisions</h3>
    <ul class="task-list">${linkedDecisions.map((decision) => `<li><strong>${detailEscapeHtml(decision.title)}</strong><br><small>${detailEscapeHtml(decision.date)}</small><p>${detailEscapeHtml(decision.summary || '')}</p></li>`).join('') || '<li>No decisions linked yet.</li>'}</ul>
    <h3>Notes</h3>
    <p>${detailEscapeHtml(goal.notes || 'No notes yet.')}</p>
  `;

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
}

function setupDelegatedDetailOpen() {
  document.addEventListener('click', async (event) => {
    const selected = event.target.closest('.goal-card, .month-item');
    if (!selected?.dataset.goalId) return;

    await detailDataReady;
    openGoalDetailFallback(selected.dataset.goalId);
  });
}

detailDataReady = loadDetailData();
setupDelegatedDetailOpen();
