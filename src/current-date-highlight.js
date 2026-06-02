function getCurrentDateParts() {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    monthKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  };
}

function highlightCurrentYearAndMonth() {
  const { year, monthKey } = getCurrentDateParts();

  document.querySelectorAll('.year-column').forEach((column) => {
    const button = column.querySelector('.year-button');
    const period = button?.dataset.period || button?.textContent || '';
    const years = period.match(/\d{4}/g) || [];
    column.classList.toggle('current-year', years.includes(year));
  });

  document.querySelectorAll('.month-card').forEach((card) => {
    const title = card.querySelector('h3')?.textContent || '';
    const match = title.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
    if (!match) {
      card.classList.remove('current-month');
      return;
    }

    const monthMap = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const key = `${match[2]}-${monthMap[match[1]]}`;
    card.classList.toggle('current-month', key === monthKey);
  });
}

const currentDateObserver = new MutationObserver(() => highlightCurrentYearAndMonth());
currentDateObserver.observe(document.body, { childList: true, subtree: true });
highlightCurrentYearAndMonth();
