const GOAL_DATA_FILES_FOR_DETAIL_NAV = [
  'data/goals/business.json',
  'data/goals/personal.json',
  'data/goals/work.json',
  'data/goals/longevity.json',
  'data/goals/research.json',
  'data/goals/repos.json'
];

let detailNavGoals = [];
let selectedDetailItemId = null;

async function loadDetailNavGoals() {
  const goalSets = await Promise.all(
    GOAL_DATA_FILES_FOR_DETAIL_NAV.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    })
  );
  detailNavGoals = goalSets.flat();
  enhanceDetailLists();
}

function getGoalFromOpenDetail() {
  const titleText = document.querySelector('#detail-content .detail-title')?.textContent || '';
  const normalizedTitle = titleText.replace(/^\S+\s+/, '').trim();
  return detailNavGoals.find((goal) => normalizedTitle.endsWith(goal.title) || normalizedTitle.includes(goal.title));
}

function collectGoalItems(goal) {
  const items = [];

  (goal.milestones || []).forEach((milestone) => {
    items.push({
      id: milestone.id,
      type: 'milestone',
      title: milestone.title,
      targetDate: milestone.targetDate,
      goalId: goal.id
    });

    (milestone.tasks || []).forEach((task) => {
      items.push({
        id: task.id,
        type: 'task',
        title: task.title,
        targetDate: task.targetDate,
        goalId: goal.id,
        parentMilestoneId: milestone.id
      });
    });
  });

  (goal.tasks || []).forEach((task) => {
    items.push({
      id: task.id,
      type: 'task',
      title: task.title,
      targetDate: task.targetDate,
      goalId: goal.id,
      parentMilestoneId: task.parentMilestoneId || null
    });
  });

  return items;
}

function enhanceDetailLists() {
  const detail = document.querySelector('#detail-content');
  if (!detail || detail.dataset.detailNavigationEnhanced === 'true') return;

  const goal = getGoalFromOpenDetail();
  if (!goal) return;

  const goalItems = collectGoalItems(goal);

  detail.querySelectorAll('.milestone-list li, .task-list li').forEach((li) => {
    const strongText = li.querySelector('strong')?.textContent?.trim();
    if (!strongText || li.textContent.includes('No milestones') || li.textContent.includes('No tasks')) return;

    const item = goalItems.find((candidate) => candidate.title === strongText);
    if (!item) return;

    li.dataset.detailItemId = item.id;
    li.dataset.goalId = item.goalId;
    li.dataset.targetDate = item.targetDate || '';
    li.dataset.itemType = item.type;
    li.tabIndex = 0;
    li.title = 'Click to select. Double-click to open this item in the timeline.';

    if (!li.querySelector('.detail-item-hint')) {
      const hint = document.createElement('span');
      hint.className = 'detail-item-hint';
      hint.textContent = 'Click to select · double-click to open in timeline';
      li.appendChild(hint);
    }

    li.addEventListener('click', () => selectDetailItem(li));
    li.addEventListener('dblclick', () => navigateToDetailItem(li));
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') navigateToDetailItem(li);
    });
  });

  enhanceMilestoneNestedTasks(detail, goal);
  detail.dataset.detailNavigationEnhanced = 'true';
}

function enhanceMilestoneNestedTasks(detail, goal) {
  const milestoneItems = detail.querySelectorAll('.milestone-list li[data-detail-item-id]');

  milestoneItems.forEach((li) => {
    const milestoneId = li.dataset.detailItemId;
    const milestone = (goal.milestones || []).find((candidate) => candidate.id === milestoneId);
    const nestedTasks = milestone?.tasks || [];
    if (!nestedTasks.length || li.querySelector('.detail-nested-tasks')) return;

    const container = document.createElement('div');
    container.className = 'detail-nested-tasks';
    container.innerHTML = nestedTasks.map((task) => `
      <div class="detail-nested-task" data-detail-item-id="${task.id}" data-goal-id="${goal.id}" data-target-date="${task.targetDate || ''}" data-item-type="task" tabindex="0">
        <strong>${escapeLocal(task.title)}</strong><br>
        <small>${escapeLocal(task.status || 'planned')} · target ${escapeLocal(task.targetDate || '—')}</small>
        <span class="detail-item-hint">Click to select · double-click to open in timeline</span>
      </div>
    `).join('');
    li.appendChild(container);
  });

  detail.querySelectorAll('.detail-nested-task').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      selectDetailItem(item);
    });
    item.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      navigateToDetailItem(item);
    });
  });
}

function escapeLocal(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selectDetailItem(element) {
  document.querySelectorAll('.detail-item-selected').forEach((item) => item.classList.remove('detail-item-selected'));
  element.classList.add('detail-item-selected');
  selectedDetailItemId = element.dataset.detailItemId || null;
}

function navigateToDetailItem(element) {
  selectDetailItem(element);
  const date = element.dataset.targetDate;
  const goalId = element.dataset.goalId;
  if (!date || !goalId) return;

  const year = date.slice(0, 4);
  const monthKey = date.slice(0, 7);

  closeDetailPanelForNavigation();
  openYearIfNeeded(year);

  setTimeout(() => {
    scrollToMonthItem(goalId, monthKey, element.textContent || '');
  }, 180);
}

function closeDetailPanelForNavigation() {
  document.querySelector('#detail-panel')?.classList.remove('open');
  document.querySelector('#detail-panel')?.setAttribute('aria-hidden', 'true');
  const backdrop = document.querySelector('#panel-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function openYearIfNeeded(year) {
  const heading = document.querySelector('.year-expanded h2')?.textContent?.trim();
  if (heading === year) return;

  const backButton = document.querySelector('#back-to-global');
  if (backButton) backButton.click();

  setTimeout(() => {
    const yearButton = Array.from(document.querySelectorAll('.year-button'))
      .find((button) => button.dataset.period === year || button.textContent.trim() === year);
    yearButton?.click();
  }, 40);
}

function scrollToMonthItem(goalId, monthKey, text) {
  const candidates = Array.from(document.querySelectorAll(`.month-item[data-goal-id="${CSS.escape(goalId)}"]`));
  const match = candidates.find((item) => {
    const small = item.querySelector('small')?.textContent || '';
    return small.includes(monthKey);
  }) || candidates[0];

  if (!match) return;

  document.querySelectorAll('.detail-navigation-target').forEach((item) => item.classList.remove('detail-navigation-target'));
  match.classList.add('detail-navigation-target');
  match.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });

  setTimeout(() => match.classList.remove('detail-navigation-target'), 2600);
}

const detailNavObserver = new MutationObserver(() => enhanceDetailLists());
detailNavObserver.observe(document.body, { childList: true, subtree: true });

loadDetailNavGoals();
