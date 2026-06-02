const GOAL_FILES_FOR_ICONS = [
  'data/goals/business.json',
  'data/goals/personal.json',
  'data/goals/work.json',
  'data/goals/longevity.json',
  'data/goals/research.json',
  'data/goals/repos.json'
];

const goalIconMap = new Map();

async function loadGoalIcons() {
  const files = await Promise.all(
    GOAL_FILES_FOR_ICONS.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    })
  );

  files.flat().forEach((goal) => {
    if (goal?.id) goalIconMap.set(goal.id, goal.emoji || '•');
  });

  enhanceMonthItems();
}

function enhanceMonthItems() {
  document.querySelectorAll('.month-item').forEach((item) => {
    if (item.dataset.iconEnhanced === 'true') return;
    const goalId = item.dataset.goalId;
    const icon = goalIconMap.get(goalId);
    const strong = item.querySelector('strong');
    if (!icon || !strong) return;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'month-goal-icon';
    iconSpan.textContent = icon;
    strong.prepend(iconSpan, ' ');
    item.dataset.iconEnhanced = 'true';
  });
}

const observer = new MutationObserver(() => enhanceMonthItems());
observer.observe(document.body, { childList: true, subtree: true });

loadGoalIcons();
