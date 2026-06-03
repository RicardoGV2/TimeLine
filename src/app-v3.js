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
const $ = (selector) => document.querySelector(selector);

const state = {
  config: { users: [], domains: [], bases: [], statuses: [], priorities: [] },
  goals: [],
  ideas: [],
  resources: [],
  decisions: [],
  reviews: [],
  view: 'timeline',
  selectedPeriod: null,
  filters: {
    user: 'all',
    domains: [],
    base: 'all',
    status: 'all',
    priority: 'all',
    search: ''
  }
};

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
  state.config = await loadJson(DATA_FILES.config, state.config);
  const goalSets = await Promise.all(DATA_FILES.goals.map((path) => loadJson(path, [])));
  state.goals = goalSets.flat().sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  state.ideas = await loadJson(DATA_FILES.ideas, []);
  state.resources = await loadJson(DATA_FILES.resources, []);
  state.decisions = await loadJson(DATA_FILES.decisions, []);
  state.reviews = await loadJson(DATA_FILES.reviews, []);
  state.filters.domains = allDomainIds();
}

function byId(items = []) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function maps() {
  return {
    users: byId(state.config.users),
    domains: byId(state.config.domains),
    bases: byId(state.config.bases)
  };
}

function allDomainIds() {
  return (state.config.domains || []).map((domain) => domain.id);
}

function isDomainSelected(domainId) {
  return state.filters.domains.includes(domainId);
}

function setAllDomainsSelected() {
  state.filters.domains = allDomainIds();
  syncDomainSelect();
}

function toggleDomain(domainId) {
  const selected = new Set(state.filters.domains);
  if (selected.has(domainId)) selected.delete(domainId);
  else selected.add(domainId);
  state.filters.domains = Array.from(selected);
  syncDomainSelect();
}

function captureScrollState() {
  return {
    timeline: document.querySelector('.timeline-scroll')?.scrollLeft ?? null,
    month: document.querySelector('.month-scroll')?.scrollLeft ?? null,
    windowX: window.scrollX,
    windowY: window.scrollY
  };
}

function restoreScrollState(scrollState) {
  requestAnimationFrame(() => {
    const timeline = document.querySelector('.timeline-scroll');
    const month = document.querySelector('.month-scroll');
    if (timeline && scrollState.timeline !== null) timeline.scrollLeft = scrollState.timeline;
    if (month && scrollState.month !== null) month.scrollLeft = scrollState.month;
    window.scrollTo(scrollState.windowX, scrollState.windowY);
  });
}

function renderWithScrollPreserved() {
  const scrollState = captureScrollState();
  render();
  restoreScrollState(scrollState);
}

function populateSelect(selectId, items, mapper) {
  const select = $(selectId);
  if (!select) return;
  const current = select.value || 'all';
  select.innerHTML = '<option value="all">All</option>' + (items || []).map(mapper).join('');
  select.value = [...select.options].some((option) => option.value === current) ? current : 'all';
}

function populateDomainSelect() {
  const select = $('#filter-domain');
  if (!select) return;
  select.multiple = true;
  select.size = 1;
  select.title = 'Use the domain sidebar to select one or multiple domains';
  select.innerHTML = (state.config.domains || [])
    .map((domain) => `<option value="${domain.id}">${domain.emoji} ${escapeHtml(domain.name)}</option>`)
    .join('');
  syncDomainSelect();
}

function syncDomainSelect() {
  const select = $('#filter-domain');
  if (!select) return;
  Array.from(select.options).forEach((option) => {
    option.selected = isDomainSelected(option.value);
  });
}

function setupFilters() {
  populateSelect('#filter-user', state.config.users, (u) => `<option value="${u.id}">${u.emoji} ${escapeHtml(u.name)}</option>`);
  populateDomainSelect();
  populateSelect('#filter-base', state.config.bases, (b) => `<option value="${b.id}">${b.emoji} ${escapeHtml(b.name)}</option>`);
  populateSelect('#filter-status', state.config.statuses, (s) => `<option value="${s}">${escapeHtml(s)}</option>`);
  populateSelect('#filter-priority', state.config.priorities, (p) => `<option value="${p}">${escapeHtml(p)}</option>`);

  [
    ['#filter-user', 'user'],
    ['#filter-base', 'base'],
    ['#filter-status', 'status'],
    ['#filter-priority', 'priority']
  ].forEach(([selector, key]) => {
    const element = $(selector);
    element?.addEventListener('change', () => {
      state.filters[key] = element.value;
      renderWithScrollPreserved();
    });
  });

  $('#filter-domain')?.addEventListener('change', (event) => {
    state.filters.domains = Array.from(event.target.selectedOptions).map((option) => option.value);
    renderWithScrollPreserved();
  });

  $('#filter-search')?.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderWithScrollPreserved();
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

function getMilestones(goal) {
  return goal.milestones || [];
}

function getTopLevelTasks(goal) {
  return goal.tasks || [];
}

function getNestedTasks(goal) {
  return getMilestones(goal).flatMap((milestone) =>
    (milestone.tasks || []).map((task) => ({ ...task, parentMilestoneId: milestone.id, parentMilestoneTitle: milestone.title }))
  );
}

function getAllTasks(goal) {
  return [...getNestedTasks(goal), ...getTopLevelTasks(goal)];
}

function getAllGoalText(goal) {
  const milestones = getMilestones(goal).map((milestone) => milestone.title).join(' ');
  const tasks = getAllTasks(goal).map((task) => task.title).join(' ');
  return [goal.title, goal.summary, goal.notes, goal.category, goal.domain, ...(goal.tags || []), milestones, tasks]
    .join(' ')
    .toLowerCase();
}

function goalMatches(goal) {
  const f = state.filters;
  if (f.user !== 'all') {
    const people = new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])]);
    if (!people.has(f.user)) return false;
  }
  if (!state.filters.domains.includes(goal.domain)) return false;
  if (f.base !== 'all' && !(goal.bases || []).includes(f.base)) return false;
  if (f.status !== 'all' && goal.status !== f.status) return false;
  if (f.priority !== 'all' && goal.priority !== f.priority) return false;
  if (f.search && !getAllGoalText(goal).includes(f.search)) return false;
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
  syncDomainSelect();
}

function renderDomainSidebar() {
  const list = $('#domain-list');
  if (!list) return;

  list.innerHTML = `
    <div class="domain-select-summary">
      <button type="button" class="domain-mini-action" data-domain-action="all">All</button>
      <span>${state.filters.domains.length}/${allDomainIds().length} selected</span>
    </div>
    ${(state.config.domains || []).map((domain) => {
      const selected = isDomainSelected(domain.id);
      return `
        <div class="domain-item ${selected ? 'selected' : 'excluded'}" data-domain="${domain.id}" title="Toggle ${escapeHtml(domain.name)}">
          <span>${domain.emoji} ${escapeHtml(domain.name)}</span>
          <span class="domain-dot" style="background:${domain.color}"></span>
        </div>
      `;
    }).join('')}
  `;

  list.querySelector('[data-domain-action="all"]')?.addEventListener('click', (event) => {
    event.stopPropagation();
    setAllDomainsSelected();
    renderWithScrollPreserved();
  });

  document.querySelectorAll('.domain-item').forEach((item) => {
    item.addEventListener('click', () => {
      toggleDomain(item.dataset.domain);
      renderWithScrollPreserved();
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
        <p>Global roadmap by year. Click a year to expand into monthly execution.</p>
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
  const milestones = getMilestones(goal);
  const completed = milestones.filter((item) => item.completedDate || item.status === 'completed').length;
  const baseChips = (goal.bases || []).slice(0, 2).map((id) => {
    const base = m.bases[id];
    return `<span class="chip" title="${escapeHtml(base?.name || id)}">${base?.emoji || ''} ${escapeHtml(base?.name || id)}</span>`;
  }).join('');
  const userBubbles = [...new Set([...(goal.ownerIds || []), ...(goal.participantIds || [])])]
    .map((id) => m.users[id])
    .filter(Boolean)
    .map((user) => `<span class="user-bubble" style="background:${user.color}" title="${escapeHtml(user.name)}">${escapeHtml(user.emoji)}</span>`)
    .join('');

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
          <p>Monthly execution view. Milestones and milestone tasks are shown in their target month.</p>
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
    return { key: `${year}-${month}`, year, month, short: `${name} ${year}`, name };
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
    const addDateItem = (date, title, type, id) => {
      if (!date) return;
      const key = date.slice(0, 7);
      if (!allowed.has(key)) return;
      output[key].push({ date, title, type, id, goal });
    };

    addDateItem(goal.startDate, goal.title, 'goal-start', `${goal.id}::start`);
    addDateItem(goal.targetDate, goal.title, 'goal-target', `${goal.id}::target`);

    getMilestones(goal).forEach((milestone) => {
      addDateItem(milestone.targetDate, milestone.title, 'milestone', milestone.id);
      (milestone.tasks || []).forEach((task) => {
        addDateItem(task.targetDate, task.title, 'task', task.id);
        (task.subtasks || []).forEach((subtask) => addDateItem(subtask.targetDate, subtask.title, 'subtask', subtask.id));
      });
    });

    getTopLevelTasks(goal).forEach((task) => {
      addDateItem(task.targetDate, task.title, 'task', task.id);
      (task.subtasks || []).forEach((subtask) => addDateItem(subtask.targetDate, subtask.title, 'subtask', subtask.id));
    });
  });

  Object.values(output).forEach((items) => items.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
  return output;
}

function renderMonthColumn(month, items) {
  return `
    <section class="month-card">
      <h3>${escapeHtml(month.short)}</h3>
      ${items.map(renderMonthItem).join('') || '<p class="goal-summary">No items this month.</p>'}
    </section>
  `;
}

function itemKindLabel(type) {
  return {
    'goal-start': 'Start',
    'goal-target': 'Target',
    milestone: 'Milestone',
    task: 'Task',
    subtask: 'Subtask'
  }[type] || 'Item';
}

function monthItemClass(type) {
  if (type === 'goal-start') return 'month-item-start';
  if (type === 'goal-target') return 'month-item-target';
  return '';
}

function renderMonthItem(item) {
  return `
    <div class="month-item ${monthItemClass(item.type)}" data-icon-enhanced="true" data-goal-id="${item.goal.id}" data-item-id="${escapeHtml(item.id || '')}" data-item-type="${escapeHtml(item.type)}" data-target-date="${escapeHtml(item.date || '')}">
      <strong><span class="month-goal-icon">${item.goal.emoji || ''}</span><span class="month-item-kind">${itemKindLabel(item.type)}</span>${escapeHtml(item.title)}</strong><br />
      <small>${escapeHtml(item.date)} · ${escapeHtml(item.goal.domain)}</small>
    </div>
  `;
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
  const topLevelTasks = getTopLevelTasks(goal);

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
    <ul class="milestone-list">${getMilestones(goal).map((milestone) => renderMilestoneDetail(goal, milestone)).join('') || '<li>No milestones yet.</li>'}</ul>
    <h3>Unassigned tasks</h3>
    <ul class="task-list">${topLevelTasks.map((task) => renderTaskDetail(goal, task)).join('') || '<li>No unassigned tasks.</li>'}</ul>
    <h3>Linked resources</h3>
    <ul class="task-list">${linkedResources.map((resource) => `<li><strong>${escapeHtml(resource.title)}</strong><br><small>${escapeHtml(resource.resourceType)} · ${escapeHtml(resource.status)}</small><p>${escapeHtml(resource.summary || '')}</p></li>`).join('') || '<li>No resources linked yet.</li>'}</ul>
    <h3>Decisions</h3>
    <ul class="task-list">${linkedDecisions.map((decision) => `<li><strong>${escapeHtml(decision.title)}</strong><br><small>${escapeHtml(decision.date)}</small><p>${escapeHtml(decision.summary || '')}</p></li>`).join('') || '<li>No decisions linked yet.</li>'}</ul>
    <h3>Notes</h3>
    <p>${escapeHtml(goal.notes || 'No notes yet.')}</p>
  `;

  wireDetailItems(goal);
  panel?.classList.add('open');
  panel?.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
}

function renderMilestoneDetail(goal, milestone) {
  const nestedTasks = milestone.tasks || [];
  return `
    <li data-detail-item-id="${milestone.id}" data-goal-id="${goal.id}" data-target-date="${escapeHtml(milestone.targetDate || '')}" data-item-type="milestone" tabindex="0">
      <strong>${escapeHtml(milestone.title)}</strong><br>
      <small>${escapeHtml(milestone.status || 'planned')} · target ${escapeHtml(milestone.targetDate || '—')}</small>
      <p>${escapeHtml(milestone.summary || '')}</p>
      ${nestedTasks.length ? `<div class="detail-nested-tasks">${nestedTasks.map((task) => renderNestedTaskDetail(goal, task)).join('')}</div>` : ''}
      <span class="detail-item-hint">Click to select · double-click to open in timeline</span>
    </li>
  `;
}

function renderNestedTaskDetail(goal, task) {
  return `
    <div class="detail-nested-task" data-detail-item-id="${task.id}" data-goal-id="${goal.id}" data-target-date="${escapeHtml(task.targetDate || '')}" data-item-type="task" tabindex="0">
      <strong>${escapeHtml(task.title)}</strong><br>
      <small>${escapeHtml(task.status || 'planned')} · target ${escapeHtml(task.targetDate || '—')}</small>
      <span class="detail-item-hint">Click to select · double-click to open in timeline</span>
    </div>
  `;
}

function renderTaskDetail(goal, task) {
  return `
    <li data-detail-item-id="${task.id}" data-goal-id="${goal.id}" data-target-date="${escapeHtml(task.targetDate || '')}" data-item-type="task" tabindex="0">
      <strong>${escapeHtml(task.title)}</strong><br>
      <small>${escapeHtml(task.status || 'planned')} · target ${escapeHtml(task.targetDate || '—')}</small>
      <span class="detail-item-hint">Click to select · double-click to open in timeline</span>
    </li>
  `;
}

function wireDetailItems(goal) {
  document.querySelectorAll('#detail-content [data-detail-item-id]').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      selectDetailItem(item);
    });
    item.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      navigateToDetailItem(item);
    });
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') navigateToDetailItem(item);
    });
  });
}

function selectDetailItem(element) {
  document.querySelectorAll('.detail-item-selected').forEach((item) => item.classList.remove('detail-item-selected'));
  element.classList.add('detail-item-selected');
}

function navigateToDetailItem(element) {
  const date = element.dataset.targetDate;
  const goalId = element.dataset.goalId;
  if (!date || !goalId) return;
  const year = date.slice(0, 4);
  const monthKey = date.slice(0, 7);

  closeDetail();
  state.view = 'timeline';
  state.selectedPeriod = year;
  render();

  setTimeout(() => {
    const candidates = Array.from(document.querySelectorAll(`.month-item[data-goal-id="${CSS.escape(goalId)}"]`));
    const itemId = element.dataset.detailItemId;
    const match = candidates.find((candidate) => candidate.dataset.itemId === itemId)
      || candidates.find((candidate) => candidate.querySelector('small')?.textContent.includes(monthKey))
      || candidates[0];
    if (!match) return;
    document.querySelectorAll('.detail-navigation-target').forEach((item) => item.classList.remove('detail-navigation-target'));
    match.classList.add('detail-navigation-target');
    match.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
    setTimeout(() => match.classList.remove('detail-navigation-target'), 2600);
  }, 80);
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
  const totalTasks = goals.reduce((sum, goal) => sum + getAllTasks(goal).length, 0);

  goals.forEach((goal) => {
    (goal.bases || []).forEach((id) => { baseCounts[id] = (baseCounts[id] || 0) + 1; });
    domainCounts[goal.domain] = (domainCounts[goal.domain] || 0) + 1;
  });

  root.innerHTML = `
    <div class="view-header"><div><h2>Dashboard</h2><p>Coverage, resources and execution signals.</p></div></div>
    <div class="card-grid">
      <article class="stat-card"><h3>${goals.length}</h3><p>Total goals</p></article>
      <article class="stat-card"><h3>${totalTasks}</h3><p>Total tasks</p></article>
      <article class="stat-card"><h3>${state.ideas.length}</h3><p>Inbox ideas</p></article>
      <article class="stat-card"><h3>${state.resources.length}</h3><p>Resources</p></article>
    </div>
    <h3>Goals by base</h3>
    <div class="card-grid">${(state.config.bases || []).map((base) => `<article class="stat-card"><h3>${base.emoji} ${baseCounts[base.id] || 0}</h3><p>${escapeHtml(base.name)}</p></article>`).join('')}</div>
    <h3>Goals by domain</h3>
    <div class="card-grid">${Object.entries(domainCounts).map(([domain, count]) => `<article class="stat-card"><h3>${count}</h3><p>${escapeHtml(domain)}</p></article>`).join('')}</div>
  `;
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
  try {
    await loadData();
    setupFilters();
    setupNavigation();
    render();
    window.TimeLineApp = { render, openDetail, closeDetail, state };
  } catch (error) {
    console.error('TimeLine failed to initialize', error);
    const root = $('#view-root');
    if (root) {
      root.innerHTML = `<div class="empty-state"><h2>TimeLine failed to load</h2><p>${escapeHtml(error.message || String(error))}</p></div>`;
    }
  }
}

init();
