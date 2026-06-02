const DATA_FILES = {
  config: 'data/config.json',
  goals: [
    'data/goals/business.json',
    'data/goals/personal.json',
    'data/goals/work.json',
    'data/goals/longevity.json',
    'data/goals/research.json',
    'data/goals/repos.json'
  ],
  ideas: 'data/ideas.json',
  resources: 'data/resources.json',
  decisions: 'data/decisions.json',
  reviews: 'data/reviews.json'
};

const MONTHS = [
  { id: '01', short: 'Jan', name: 'January' },
  { id: '02', short: 'Feb', name: 'February' },
  { id: '03', short: 'Mar', name: 'March' },
  { id: '04', short: 'Apr', name: 'April' },
  { id: '05', short: 'May', name: 'May' },
  { id: '06', short: 'Jun', name: 'June' },
  { id: '07', short: 'Jul', name: 'July' },
  { id: '08', short: 'Aug', name: 'August' },
  { id: '09', short: 'Sep', name: 'September' },
  { id: '10', short: 'Oct', name: 'October' },
  { id: '11', short: 'Nov', name: 'November' },
  { id: '12', short: 'Dec', name: 'December' }
];

const state = {
  config: null,
  goals: [],
  ideas: [],
  resources: [],
  decisions: [],
  reviews: [],
  view: 'timeline',
  selectedYear: null,
  filters: {
    user: 'all',
    domain: 'all',
    base: 'all',
    status: 'all',
    priority: 'all',
    search: ''
  }
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Could not load ${path}`, error);
    return fallback;
  }
}

async function loadData() {
  state.config = await loadJson(DATA_FILES.config, { users: [], domains: [], bases: [], statuses: [], priorities: [] });
  const goalSets = await Promise.all(DATA_FILES.goals.map((path) => loadJson(path, [])));
  state.goals = goalSets.flat().sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  state.ideas = await loadJson(DATA_FILES.ideas, []);
  state.resources = await loadJson(DATA_FILES.resources, []);
  state.decisions = await loadJson(DATA_FILES.decisions, []);
  state.reviews = await loadJson(DATA_FILES.reviews, []);
}

function byId(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function getMaps() {
  return {
    users: byId(state.config.users || []),
    domains: byId(state.config.domains || []),
    bases: byId(state.config.bases || [])
  };
}

function populateSelect(selectId, items, mapper) {
  const select = $(selectId);
  if (!select) return;
  const current = select.value || 'all';
  const options = ['<option value="all">All</option>']
    .concat(items.map(mapper))
    .join('');
  select.innerHTML = options;
  select.value = current;
}

function setupFilters() {
  populateSelect('#filter-user', state.config.users || [], (u) => `<option value="${u.id}">${u.emoji} ${escapeHtml(u.name)}</option>`);
  populateSelect('#filter-domain', state.config.domains || [], (d) => `<option value="${d.id}">${d.emoji} ${escapeHtml(d.name)}</option>`);
  populateSelect('#filter-base', state.config.bases || [], (b) => `<option value="${b.id}">${b.emoji} ${escapeHtml(b.name)}</option>`);
  populateSelect('#filter-status', state.config.statuses || [], (s) => `<option value="${s}">${escapeHtml(s)}</option>`);
  populateSelect('#filter-priority', state.config.priorities || [], (p) => `<option value="${p}">${escapeHtml(p)}</option>`);

  const bindings = [
    ['#filter-user', 'user'],
    ['#filter-domain', 'domain'],
    ['#filter-base', 'base'],
    ['#filter-status', 'status'],
    ['#filter-priority', 'priority']
  ];

  bindings.forEach(([selector, key]) => {
    const el = $(selector);
    if (!el) return;
    el.addEventListener('change', () => {
      state.filters[key] = el.value;
      render();
    });
  });

  const search = $('#filter-search');
  search.addEventListener('input', () => {
    state.filters.search = search.value.trim().toLowerCase();
    render();
  });
}

function goalMatches(goal) {
  const f = state.filters;
  const haystack = [goal.title, goal.summary, goal.notes, goal.category, goal.domain, ...(goal.tags || [])]
    .join(' ')
    .toLowerCase();

  if (f.user !== 'all') {
    const users = new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])]);
    if (!users.has(f.user)) return false;
  }
  if (f.domain !== 'all' && goal.domain !== f.domain) return false;
  if (f.base !== 'all' && !(goal.bases || []).includes(f.base)) return false;
  if (f.status !== 'all' && goal.status !== f.status) return false;
  if (f.priority !== 'all' && goal.priority !== f.priority) return false;
  if (f.search && !haystack.includes(f.search)) return false;
  return true;
}

function filteredGoals() {
  return state.goals.filter(goalMatches);
}

function setupNavigation() {
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      state.view = button.dataset.view;
      state.selectedYear = null;
      render();
    });
  });

  $('#close-detail').addEventListener('click', closeDetail);
  $('#panel-backdrop').addEventListener('click', closeDetail);
}

function renderDomains() {
  const maps = getMaps();
  const counts = state.goals.reduce((acc, goal) => {
    acc[goal.domain] = (acc[goal.domain] || 0) + 1;
    return acc;
  }, {});

  $('#domain-list').innerHTML = (state.config.domains || []).map((domain) => {
    const active = state.filters.domain === domain.id ? 'active' : '';
    return `
      <div class="domain-item ${active}" data-domain="${domain.id}">
        <span>${domain.emoji} ${escapeHtml(domain.name)}</span>
        <span class="domain-dot" style="background:${domain.color}"></span>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.domain-item').forEach((item) => {
    item.addEventListener('click', () => {
      state.filters.domain = state.filters.domain === item.dataset.domain ? 'all' : item.dataset.domain;
      $('#filter-domain').value = state.filters.domain;
      render();
    });
  });
}

function render() {
  renderDomains();
  const root = $('#view-root');
  if (state.view === 'timeline') renderTimeline(root);
  if (state.view === 'bases') renderBases(root);
  if (state.view === 'dashboard') renderDashboard(root);
  if (state.view === 'knowledge') renderKnowledge(root);
  if (state.view === 'ideas') renderIdeas(root);
}

function renderTimeline(root) {
  if (state.selectedYear) {
    renderYearExpanded(root, state.selectedYear);
    return;
  }

  const goals = filteredGoals();
  const periods = [...new Set(goals.map((g) => g.periodLabel))].sort(sortPeriods);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Timeline</h2>
        <p>Global roadmap by strategic years. Click a year to expand it into months.</p>
      </div>
      <span class="chip">${goals.length} goals</span>
    </div>
    <div class="timeline-scroll">
      <div class="timeline-grid">
        ${periods.map((period) => renderYearColumn(period, goals.filter((g) => g.periodLabel === period))).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.year-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedYear = button.dataset.period;
      render();
    });
  });

  wireGoalCards();
}

function sortPeriods(a, b) {
  const extract = (value) => Number(String(value).match(/\d{4}/)?.[0] || 9999);
  return extract(a) - extract(b);
}

function renderYearColumn(period, goals) {
  return `
    <section class="year-column">
      <button class="year-button" data-period="${escapeHtml(period)}">${escapeHtml(period)}</button>
      ${goals.map(renderGoalCard).join('') || '<div class="empty-state">No goals</div>'}
    </section>
  `;
}

function renderGoalCard(goal) {
  const maps = getMaps();
  const baseChips = (goal.bases || []).slice(0, 2).map((id) => {
    const base = maps.bases[id];
    return `<span class="chip" title="${escapeHtml(base?.name || id)}">${base?.emoji || ''} ${escapeHtml(base?.name || id)}</span>`;
  }).join('');

  const users = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => maps.users[id])
    .filter(Boolean)
    .map((u) => `<span class="user-bubble" style="background:${u.color}" title="${escapeHtml(u.name)}">${escapeHtml(u.emoji)}</span>`)
    .join('');

  const milestones = goal.milestones || [];
  const completed = milestones.filter((m) => m.status === 'completed' || m.completedDate).length;

  return `
    <article class="goal-card" data-goal-id="${goal.id}">
      <h3 class="goal-title">${goal.emoji || ''} ${escapeHtml(goal.title)}</h3>
      <p class="goal-summary">${escapeHtml(goal.summary || '')}</p>
      <div class="chips">
        <span class="chip">${escapeHtml(goal.status)}</span>
        <span class="chip">${escapeHtml(goal.priority)}</span>
        ${baseChips}
      </div>
      <div class="user-bubbles">${users}</div>
      ${milestones.length ? `<p class="goal-summary">Milestones: ${completed}/${milestones.length}</p>` : ''}
    </article>
  `;
}

function renderYearExpanded(root, period) {
  const goals = filteredGoals().filter((g) => g.periodLabel === period || dateOverlapsPeriod(g, period));
  const itemsByMonth = buildMonthlyItems(goals, period);

  root.innerHTML = `
    <div class="year-expanded">
      <div class="view-header">
        <div>
          <h2>${escapeHtml(period)}</h2>
          <p>Monthly execution view. Goals stay strategic; milestones, tasks, resources and decisions appear by month.</p>
        </div>
        <button class="nav-button" id="back-to-global">← Global timeline</button>
      </div>
      <div class="month-scroll">
        <div class="month-grid">
          ${MONTHS.map((month) => renderMonthColumn(month, itemsByMonth[month.id] || [])).join('')}
        </div>
      </div>
    </div>
  `;

  $('#back-to-global').addEventListener('click', () => {
    state.selectedYear = null;
    render();
  });

  wireGoalCards();
  document.querySelectorAll('.month-item').forEach((item) => {
    item.addEventListener('click', () => {
      const goal = state.goals.find((g) => g.id === item.dataset.goalId);
      if (goal) openDetail(goal);
    });
  });
}

function dateOverlapsPeriod(goal, period) {
  const year = String(period).match(/\d{4}/)?.[0];
  if (!year) return false;
  return String(goal.startDate || '').startsWith(year) || String(goal.targetDate || '').startsWith(year);
}

function buildMonthlyItems(goals, period) {
  const year = String(period).match(/\d{4}/)?.[0];
  const output = Object.fromEntries(MONTHS.map((m) => [m.id, []]));

  goals.forEach((goal) => {
    const addDateItem = (date, label, type) => {
      if (!date || !date.startsWith(year)) return;
      const month = date.slice(5, 7);
      output[month]?.push({ type, label, date, goal });
    };

    addDateItem(goal.startDate, `Start: ${goal.title}`, 'goal-start');
    addDateItem(goal.targetDate, `Target: ${goal.title}`, 'goal-target');

    (goal.milestones || []).forEach((milestone) => {
      addDateItem(milestone.targetDate, milestone.title, 'milestone');
    });

    (goal.tasks || []).forEach((task) => {
      addDateItem(task.targetDate, task.title, 'task');
      (task.subtasks || []).forEach((subtask) => addDateItem(subtask.targetDate, subtask.title, 'subtask'));
    });
  });

  return output;
}

function renderMonthColumn(month, items) {
  return `
    <section class="month-card">
      <h3>${month.short}</h3>
      ${items.map((item) => `
        <div class="month-item" data-goal-id="${item.goal.id}">
          <strong>${iconForItemType(item.type)} ${escapeHtml(item.label)}</strong><br />
          <small>${escapeHtml(item.date)} · ${escapeHtml(item.goal.domain)}</small>
        </div>
      `).join('') || '<p class="goal-summary">No items this month.</p>'}
    </section>
  `;
}

function iconForItemType(type) {
  return {
    'goal-start': '▶',
    'goal-target': '🎯',
    milestone: '◆',
    task: '☐',
    subtask: '◦'
  }[type] || '•';
}

function wireGoalCards() {
  document.querySelectorAll('.goal-card').forEach((card) => {
    card.addEventListener('click', () => {
      const goal = state.goals.find((g) => g.id === card.dataset.goalId);
      if (goal) openDetail(goal);
    });
  });
}

function openDetail(goal) {
  const maps = getMaps();
  const panel = $('#detail-panel');
  const backdrop = $('#panel-backdrop');
  const users = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => maps.users[id]?.name)
    .filter(Boolean)
    .join(', ');
  const bases = (goal.bases || []).map((id) => maps.bases[id]).filter(Boolean);
  const resources = state.resources.filter((resource) => (resource.relatedGoals || []).includes(goal.id));
  const decisions = state.decisions.filter((decision) => (decision.relatedGoals || []).includes(goal.id));

  $('#detail-content').innerHTML = `
    <h2 class="detail-title">${goal.emoji || ''} ${escapeHtml(goal.title)}</h2>
    <p>${escapeHtml(goal.summary || '')}</p>
    <div class="chips">
      <span class="chip">${escapeHtml(goal.domain)}</span>
      <span class="chip">${escapeHtml(goal.category || '')}</span>
      <span class="chip">${escapeHtml(goal.status)}</span>
      <span class="chip">${escapeHtml(goal.priority)}</span>
    </div>

    <div class="detail-meta">
      <div><span>Start date</span>${escapeHtml(goal.startDate || '—')}</div>
      <div><span>Target date</span>${escapeHtml(goal.targetDate || '—')}</div>
      <div><span>Users</span>${escapeHtml(users || '—')}</div>
      <div><span>Period</span>${escapeHtml(goal.periodLabel || '—')}</div>
    </div>

    <h3>Related bases</h3>
    <div class="chips">
      ${bases.map((base) => `<span class="chip">${base.emoji} ${escapeHtml(base.name)}</span>`).join('') || '<span class="chip">No bases</span>'}
    </div>

    <h3>Milestones</h3>
    <ul class="milestone-list">
      ${(goal.milestones || []).map((m) => `<li><strong>${escapeHtml(m.title)}</strong><br><small>${escapeHtml(m.status)} · target ${escapeHtml(m.targetDate || '—')}</small><p>${escapeHtml(m.summary || '')}</p></li>`).join('') || '<li>No milestones yet.</li>'}
    </ul>

    <h3>Tasks</h3>
    <ul class="task-list">
      ${(goal.tasks || []).map((t) => `<li><strong>${escapeHtml(t.title)}</strong><br><small>${escapeHtml(t.status)} · target ${escapeHtml(t.targetDate || '—')}</small></li>`).join('') || '<li>No tasks yet.</li>'}
    </ul>

    <h3>Linked resources</h3>
    <ul class="task-list">
      ${resources.map((r) => `<li><strong>${escapeHtml(r.title)}</strong><br><small>${escapeHtml(r.resourceType)} · ${escapeHtml(r.status)}</small><p>${escapeHtml(r.summary || '')}</p></li>`).join('') || '<li>No resources linked yet.</li>'}
    </ul>

    <h3>Decisions</h3>
    <ul class="task-list">
      ${decisions.map((d) => `<li><strong>${escapeHtml(d.title)}</strong><br><small>${escapeHtml(d.date)}</small><p>${escapeHtml(d.summary || '')}</p></li>`).join('') || '<li>No decisions linked yet.</li>'}
    </ul>

    <h3>Notes</h3>
    <p>${escapeHtml(goal.notes || 'No notes yet.')}</p>
  `;

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
}

function closeDetail() {
  $('#detail-panel').classList.remove('open');
  $('#detail-panel').setAttribute('aria-hidden', 'true');
  $('#panel-backdrop').hidden = true;
}

function renderBases(root) {
  const goals = filteredGoals();
  const maps = getMaps();

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Bases</h2>
        <p>See how each civilization base is covered by the roadmap.</p>
      </div>
    </div>
    <div class="card-grid">
      ${(state.config.bases || []).map((base) => {
        const related = goals.filter((goal) => (goal.bases || []).includes(base.id));
        return `
          <article class="base-card">
            <h3>${base.emoji} ${escapeHtml(base.name)}</h3>
            <p class="goal-summary">${escapeHtml(base.description)}</p>
            <span class="chip">${related.length} goals</span>
            <ul class="task-list">
              ${related.slice(0, 5).map((goal) => `<li>${goal.emoji || ''} ${escapeHtml(goal.periodLabel)} · ${escapeHtml(goal.title)}</li>`).join('') || '<li>No goals yet.</li>'}
            </ul>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderDashboard(root) {
  const goals = filteredGoals();
  const baseCounts = Object.fromEntries((state.config.bases || []).map((base) => [base.id, 0]));
  const userCounts = Object.fromEntries((state.config.users || []).map((user) => [user.id, 0]));
  const domainCounts = {};

  goals.forEach((goal) => {
    (goal.bases || []).forEach((id) => { baseCounts[id] = (baseCounts[id] || 0) + 1; });
    (goal.ownerIds || []).forEach((id) => { userCounts[id] = (userCounts[id] || 0) + 1; });
    domainCounts[goal.domain] = (domainCounts[goal.domain] || 0) + 1;
  });

  const overdueMilestones = getOverdueMilestones(goals);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Dashboard</h2>
        <p>Coverage, neglected areas and execution signals.</p>
      </div>
    </div>
    <div class="card-grid">
      <article class="stat-card"><h3>${goals.length}</h3><p>Total goals</p></article>
      <article class="stat-card"><h3>${state.ideas.length}</h3><p>Inbox ideas</p></article>
      <article class="stat-card"><h3>${state.resources.length}</h3><p>Resources</p></article>
      <article class="stat-card"><h3>${overdueMilestones.length}</h3><p>Overdue milestones</p></article>
    </div>
    <h3>Goals by base</h3>
    <div class="card-grid">
      ${(state.config.bases || []).map((base) => `<article class="stat-card"><h3>${base.emoji} ${baseCounts[base.id] || 0}</h3><p>${escapeHtml(base.name)}</p></article>`).join('')}
    </div>
    <h3>Goals by domain</h3>
    <div class="card-grid">
      ${Object.entries(domainCounts).map(([domain, count]) => `<article class="stat-card"><h3>${count}</h3><p>${escapeHtml(domain)}</p></article>`).join('')}
    </div>
  `;
}

function getOverdueMilestones(goals) {
  const today = new Date().toISOString().slice(0, 10);
  return goals.flatMap((goal) => (goal.milestones || []).map((m) => ({ ...m, goal })))
    .filter((m) => m.targetDate && m.targetDate < today && !m.completedDate && m.status !== 'completed');
}

function renderKnowledge(root) {
  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Knowledge Log</h2>
        <p>Books, notes, suppliers, products, papers, courses and useful references.</p>
      </div>
    </div>
    <div class="card-grid">
      ${state.resources.map((resource) => `
        <article class="resource-card">
          <h3>${resource.resourceType === 'book' ? '📘' : '📎'} ${escapeHtml(resource.title)}</h3>
          <p class="goal-summary">${escapeHtml(resource.summary || '')}</p>
          <div class="chips">
            <span class="chip">${escapeHtml(resource.resourceType)}</span>
            <span class="chip">${escapeHtml(resource.status)}</span>
          </div>
        </article>
      `).join('') || '<div class="empty-state">No resources yet.</div>'}
    </div>
  `;
}

function renderIdeas(root) {
  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Ideas Inbox</h2>
        <p>Unclassified ideas before deciding whether they become goals, milestones, tasks or resources.</p>
      </div>
    </div>
    <div class="card-grid">
      ${state.ideas.map((idea) => `
        <article class="idea-card">
          <h3>${idea.emoji || '💡'} ${escapeHtml(idea.title)}</h3>
          <p class="goal-summary">${escapeHtml(idea.summary || '')}</p>
          <div class="chips">
            <span class="chip">${escapeHtml(idea.status)}</span>
            <span class="chip">${escapeHtml(idea.decisionStatus || 'needs-review')}</span>
            <span class="chip">${escapeHtml(idea.suggestedDomain || '')}</span>
          </div>
        </article>
      `).join('') || '<div class="empty-state">No ideas yet.</div>'}
    </div>
  `;
}

async function init() {
  await loadData();
  setupFilters();
  setupNavigation();
  render();
}

init();
