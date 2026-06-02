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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const state = {
  config: null,
  goals: [],
  ideas: [],
  resources: [],
  decisions: [],
  reviews: [],
  view: 'timeline',
  selectedPeriod: null,
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
  return Object.fromEntries((items || []).map((item) => [item.id, item]));
}

function maps() {
  return {
    users: byId(state.config.users),
    domains: byId(state.config.domains),
    bases: byId(state.config.bases)
  };
}

function populateSelect(selectId, items, mapper) {
  const select = $(selectId);
  if (!select) return;
  const current = select.value || 'all';
  select.innerHTML = '<option value="all">All</option>' + (items || []).map(mapper).join('');
  select.value = [...select.options].some((option) => option.value === current) ? current : 'all';
}

function setupFilters() {
  populateSelect('#filter-user', state.config.users, (u) => `<option value="${u.id}">${u.emoji} ${escapeHtml(u.name)}</option>`);
  populateSelect('#filter-domain', state.config.domains, (d) => `<option value="${d.id}">${d.emoji} ${escapeHtml(d.name)}</option>`);
  populateSelect('#filter-base', state.config.bases, (b) => `<option value="${b.id}">${b.emoji} ${escapeHtml(b.name)}</option>`);
  populateSelect('#filter-status', state.config.statuses, (s) => `<option value="${s}">${escapeHtml(s)}</option>`);
  populateSelect('#filter-priority', state.config.priorities, (p) => `<option value="${p}">${escapeHtml(p)}</option>`);

  [
    ['#filter-user', 'user'],
    ['#filter-domain', 'domain'],
    ['#filter-base', 'base'],
    ['#filter-status', 'status'],
    ['#filter-priority', 'priority']
  ].forEach(([selector, key]) => {
    const element = $(selector);
    element?.addEventListener('change', () => {
      state.filters[key] = element.value;
      render();
    });
  });

  $('#filter-search')?.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });
}

function setupNavigation() {
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.view = button.dataset.view;
      state.selectedPeriod = null;
      render();
    });
  });

  $('#close-detail')?.addEventListener('click', closeDetail);
  $('#panel-backdrop')?.addEventListener('click', closeDetail);
}

function goalMatches(goal) {
  const f = state.filters;
  const text = [goal.title, goal.summary, goal.notes, goal.category, goal.domain, ...(goal.tags || [])]
    .join(' ')
    .toLowerCase();

  if (f.user !== 'all') {
    const people = new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])]);
    if (!people.has(f.user)) return false;
  }
  if (f.domain !== 'all' && goal.domain !== f.domain) return false;
  if (f.base !== 'all' && !(goal.bases || []).includes(f.base)) return false;
  if (f.status !== 'all' && goal.status !== f.status) return false;
  if (f.priority !== 'all' && goal.priority !== f.priority) return false;
  if (f.search && !text.includes(f.search)) return false;
  return true;
}

function filteredGoals() {
  return state.goals.filter(goalMatches);
}

function render() {
  renderDomainSidebar();
  const root = $('#view-root');
  if (!root) return;

  if (state.view === 'timeline') renderTimeline(root);
  if (state.view === 'bases') renderBases(root);
  if (state.view === 'dashboard') renderDashboard(root);
  if (state.view === 'knowledge') renderKnowledge(root);
  if (state.view === 'ideas') renderIdeas(root);
}

function renderDomainSidebar() {
  const list = $('#domain-list');
  if (!list) return;

  list.innerHTML = (state.config.domains || []).map((domain) => {
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
      const select = $('#filter-domain');
      if (select) select.value = state.filters.domain;
      render();
    });
  });
}

function renderTimeline(root) {
  if (state.selectedPeriod) {
    renderExpandedPeriod(root, state.selectedPeriod);
    return;
  }

  const goals = filteredGoals();
  const periods = [...new Set(goals.map((goal) => goal.periodLabel))].sort(sortPeriods);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Timeline</h2>
        <p>Global roadmap by strategic periods. Click a period to expand into monthly execution.</p>
      </div>
      <span class="chip">${goals.length} goals</span>
    </div>
    <div class="timeline-scroll">
      <div class="timeline-grid">
        ${periods.map((period) => renderPeriodColumn(period, goals.filter((goal) => goal.periodLabel === period))).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.year-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPeriod = button.dataset.period;
      render();
    });
  });
  wireGoalCards();
}

function sortPeriods(a, b) {
  const firstYear = (value) => Number(String(value).match(/\d{4}/)?.[0] || 9999);
  return firstYear(a) - firstYear(b);
}

function renderPeriodColumn(period, goals) {
  return `
    <section class="year-column">
      <button class="year-button" data-period="${escapeHtml(period)}">${escapeHtml(period)}</button>
      ${goals.map(renderGoalCard).join('') || '<div class="empty-state">No goals</div>'}
    </section>
  `;
}

function renderGoalCard(goal) {
  const m = maps();
  const baseChips = (goal.bases || []).slice(0, 2).map((id) => {
    const base = m.bases[id];
    return `<span class="chip" title="${escapeHtml(base?.name || id)}">${base?.emoji || ''} ${escapeHtml(base?.name || id)}</span>`;
  }).join('');

  const userBubbles = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => m.users[id])
    .filter(Boolean)
    .map((user) => `<span class="user-bubble" style="background:${user.color}" title="${escapeHtml(user.name)}">${escapeHtml(user.emoji)}</span>`)
    .join('');

  const milestones = goal.milestones || [];
  const completed = milestones.filter((item) => item.completedDate || item.status === 'completed').length;

  return `
    <article class="goal-card" data-goal-id="${goal.id}">
      <h3 class="goal-title">${goal.emoji || ''} ${escapeHtml(goal.title)}</h3>
      <p class="goal-summary">${escapeHtml(goal.summary || '')}</p>
      <div class="chips">
        <span class="chip">${escapeHtml(goal.status)}</span>
        <span class="chip">${escapeHtml(goal.priority)}</span>
        ${baseChips}
      </div>
      <div class="user-bubbles">${userBubbles}</div>
      ${milestones.length ? `<p class="goal-summary">Milestones: ${completed}/${milestones.length}</p>` : ''}
    </article>
  `;
}

function renderExpandedPeriod(root, period) {
  const goals = filteredGoals().filter((goal) => goal.periodLabel === period || goalOverlapsPeriod(goal, period));
  const months = buildMonthsForPeriod(period, goals);
  const itemsByMonth = buildMonthlyItems(goals, months);

  root.innerHTML = `
    <div class="year-expanded">
      <div class="view-header">
        <div>
          <h2>${escapeHtml(period)}</h2>
          <p>Monthly execution view. Multi-year periods show every month across the full range.</p>
        </div>
        <button class="nav-button" id="back-to-global">← Global timeline</button>
      </div>
      <div class="month-scroll">
        <div class="month-grid">
          ${months.map((month) => renderMonthColumn(month, itemsByMonth[month.key] || [])).join('')}
        </div>
      </div>
    </div>
  `;

  $('#back-to-global')?.addEventListener('click', () => {
    state.selectedPeriod = null;
    render();
  });

  document.querySelectorAll('.month-item').forEach((item) => {
    item.addEventListener('click', () => {
      const goal = state.goals.find((candidate) => candidate.id === item.dataset.goalId);
      if (goal) openDetail(goal);
    });
  });
}

function yearsFromPeriod(period) {
  const found = String(period).match(/\d{4}/g) || [];
  const years = found.map(Number);
  if (!years.length) return [];
  const start = Math.min(...years);
  const end = years.length > 1 ? Math.max(...years) : start;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildMonthsForPeriod(period, goals) {
  let years = yearsFromPeriod(period);
  if (!years.length) {
    years = [...new Set(goals.flatMap((goal) => [goal.startDate, goal.targetDate].filter(Boolean).map((date) => Number(date.slice(0, 4)))))].sort();
  }

  return years.flatMap((year) => MONTH_NAMES.map((name, index) => {
    const month = String(index + 1).padStart(2, '0');
    return {
      key: `${year}-${month}`,
      year,
      month,
      short: `${name} ${year}`,
      name
    };
  }));
}

function goalOverlapsPeriod(goal, period) {
  const years = yearsFromPeriod(period);
  if (!years.length) return false;
  const startYear = Number(String(goal.startDate || '').slice(0, 4));
  const targetYear = Number(String(goal.targetDate || '').slice(0, 4));
  return years.some((year) => year === startYear || year === targetYear || (startYear && targetYear && year >= startYear && year <= targetYear));
}

function buildMonthlyItems(goals, months) {
  const output = Object.fromEntries(months.map((month) => [month.key, []]));
  const allowed = new Set(months.map((month) => month.key));

  goals.forEach((goal) => {
    const addDateItem = (date, label, type) => {
      if (!date) return;
      const key = date.slice(0, 7);
      if (!allowed.has(key)) return;
      output[key].push({ date, label, type, goal });
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
      <h3>${escapeHtml(month.short)}</h3>
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
      const goal = state.goals.find((candidate) => candidate.id === card.dataset.goalId);
      if (goal) openDetail(goal);
    });
  });
}

function openDetail(goal) {
  const m = maps();
  const panel = $('#detail-panel');
  const backdrop = $('#panel-backdrop');
  const people = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => m.users[id]?.name)
    .filter(Boolean)
    .join(', ');
  const bases = (goal.bases || []).map((id) => m.bases[id]).filter(Boolean);
  const linkedResources = state.resources.filter((resource) => (resource.relatedGoals || []).includes(goal.id));
  const linkedDecisions = state.decisions.filter((decision) => (decision.relatedGoals || []).includes(goal.id));

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
      <div><span>Users</span>${escapeHtml(people || '—')}</div>
      <div><span>Period</span>${escapeHtml(goal.periodLabel || '—')}</div>
    </div>
    <h3>Related bases</h3>
    <div class="chips">${bases.map((base) => `<span class="chip">${base.emoji} ${escapeHtml(base.name)}</span>`).join('') || '<span class="chip">No bases</span>'}</div>
    <h3>Milestones</h3>
    <ul class="milestone-list">${(goal.milestones || []).map((milestone) => `<li><strong>${escapeHtml(milestone.title)}</strong><br><small>${escapeHtml(milestone.status)} · target ${escapeHtml(milestone.targetDate || '—')}</small><p>${escapeHtml(milestone.summary || '')}</p></li>`).join('') || '<li>No milestones yet.</li>'}</ul>
    <h3>Tasks</h3>
    <ul class="task-list">${(goal.tasks || []).map((task) => `<li><strong>${escapeHtml(task.title)}</strong><br><small>${escapeHtml(task.status)} · target ${escapeHtml(task.targetDate || '—')}</small></li>`).join('') || '<li>No tasks yet.</li>'}</ul>
    <h3>Linked resources</h3>
    <ul class="task-list">${linkedResources.map((resource) => `<li><strong>${escapeHtml(resource.title)}</strong><br><small>${escapeHtml(resource.resourceType)} · ${escapeHtml(resource.status)}</small><p>${escapeHtml(resource.summary || '')}</p></li>`).join('') || '<li>No resources linked yet.</li>'}</ul>
    <h3>Decisions</h3>
    <ul class="task-list">${linkedDecisions.map((decision) => `<li><strong>${escapeHtml(decision.title)}</strong><br><small>${escapeHtml(decision.date)}</small><p>${escapeHtml(decision.summary || '')}</p></li>`).join('') || '<li>No decisions linked yet.</li>'}</ul>
    <h3>Notes</h3>
    <p>${escapeHtml(goal.notes || 'No notes yet.')}</p>
  `;

  panel?.classList.add('open');
  panel?.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
}

function closeDetail() {
  $('#detail-panel')?.classList.remove('open');
  $('#detail-panel')?.setAttribute('aria-hidden', 'true');
  const backdrop = $('#panel-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function renderBases(root) {
  const goals = filteredGoals();
  root.innerHTML = `
    <div class="view-header"><div><h2>Bases</h2><p>See how each civilization base is covered by the roadmap.</p></div></div>
    <div class="card-grid">
      ${(state.config.bases || []).map((base) => {
        const related = goals.filter((goal) => (goal.bases || []).includes(base.id));
        return `<article class="base-card"><h3>${base.emoji} ${escapeHtml(base.name)}</h3><p class="goal-summary">${escapeHtml(base.description)}</p><span class="chip">${related.length} goals</span><ul class="task-list">${related.slice(0, 6).map((goal) => `<li>${goal.emoji || ''} ${escapeHtml(goal.periodLabel)} · ${escapeHtml(goal.title)}</li>`).join('') || '<li>No goals yet.</li>'}</ul></article>`;
      }).join('')}
    </div>
  `;
}

function renderDashboard(root) {
  const goals = filteredGoals();
  const baseCounts = Object.fromEntries((state.config.bases || []).map((base) => [base.id, 0]));
  const domainCounts = {};

  goals.forEach((goal) => {
    (goal.bases || []).forEach((id) => { baseCounts[id] = (baseCounts[id] || 0) + 1; });
    domainCounts[goal.domain] = (domainCounts[goal.domain] || 0) + 1;
  });

  const overdue = getOverdueMilestones(goals);

  root.innerHTML = `
    <div class="view-header"><div><h2>Dashboard</h2><p>Coverage, neglected areas and execution signals.</p></div></div>
    <div class="card-grid">
      <article class="stat-card"><h3>${goals.length}</h3><p>Total goals</p></article>
      <article class="stat-card"><h3>${state.ideas.length}</h3><p>Inbox ideas</p></article>
      <article class="stat-card"><h3>${state.resources.length}</h3><p>Resources</p></article>
      <article class="stat-card"><h3>${overdue.length}</h3><p>Overdue milestones</p></article>
    </div>
    <h3>Goals by base</h3>
    <div class="card-grid">${(state.config.bases || []).map((base) => `<article class="stat-card"><h3>${base.emoji} ${baseCounts[base.id] || 0}</h3><p>${escapeHtml(base.name)}</p></article>`).join('')}</div>
    <h3>Goals by domain</h3>
    <div class="card-grid">${Object.entries(domainCounts).map(([domain, count]) => `<article class="stat-card"><h3>${count}</h3><p>${escapeHtml(domain)}</p></article>`).join('')}</div>
  `;
}

function getOverdueMilestones(goals) {
  const today = new Date().toISOString().slice(0, 10);
  return goals.flatMap((goal) => (goal.milestones || []).map((milestone) => ({ ...milestone, goal })))
    .filter((milestone) => milestone.targetDate && milestone.targetDate < today && !milestone.completedDate && milestone.status !== 'completed');
}

function renderKnowledge(root) {
  root.innerHTML = `
    <div class="view-header"><div><h2>Knowledge Log</h2><p>Books, notes, suppliers, products, papers, courses and useful references.</p></div></div>
    <div class="card-grid">${state.resources.map((resource) => `<article class="resource-card"><h3>${resource.resourceType === 'book' ? '📘' : '📎'} ${escapeHtml(resource.title)}</h3><p class="goal-summary">${escapeHtml(resource.summary || '')}</p><div class="chips"><span class="chip">${escapeHtml(resource.resourceType)}</span><span class="chip">${escapeHtml(resource.status)}</span></div></article>`).join('') || '<div class="empty-state">No resources yet.</div>'}</div>
  `;
}

function renderIdeas(root) {
  root.innerHTML = `
    <div class="view-header"><div><h2>Ideas Inbox</h2><p>Unclassified ideas before deciding whether they become goals, milestones, tasks or resources.</p></div></div>
    <div class="card-grid">${state.ideas.map((idea) => `<article class="idea-card"><h3>${idea.emoji || '💡'} ${escapeHtml(idea.title)}</h3><p class="goal-summary">${escapeHtml(idea.summary || '')}</p><div class="chips"><span class="chip">${escapeHtml(idea.status)}</span><span class="chip">${escapeHtml(idea.decisionStatus || 'needs-review')}</span><span class="chip">${escapeHtml(idea.suggestedDomain || '')}</span></div></article>`).join('') || '<div class="empty-state">No ideas yet.</div>'}</div>
  `;
}

async function init() {
  await loadData();
  setupFilters();
  setupNavigation();
  render();
}

init();
