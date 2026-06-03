function getDomainSelect() {
  return document.querySelector('#filter-domain');
}

function showOnlyDomain(domainId) {
  const select = getDomainSelect();
  if (!select || !domainId) return;

  Array.from(select.options).forEach((option) => {
    option.selected = option.value === domainId;
  });

  select.dispatchEvent(new Event('change', { bubbles: true }));

  if (window.innerWidth <= 760) {
    document.body.classList.remove('sidebar-open');
  }
}

function injectOnlyButtons() {
  document.querySelectorAll('.domain-item').forEach((item) => {
    if (item.querySelector('.domain-only-button')) return;

    const domainId = item.dataset.domain;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'domain-only-button';
    button.textContent = 'Only';
    button.setAttribute('aria-label', `Show only ${domainId}`);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showOnlyDomain(domainId);
    });

    const dot = item.querySelector('.domain-dot');
    if (dot) item.insertBefore(button, dot);
    else item.append(button);
  });
}

let longPressTimer = null;
let suppressNextDomainClick = false;

function setupLongPressOnlyShortcut() {
  document.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('.domain-item');
    if (!item || event.target.closest('.domain-only-button')) return;

    const domainId = item.dataset.domain;
    longPressTimer = window.setTimeout(() => {
      suppressNextDomainClick = true;
      item.classList.add('domain-long-press-feedback');
      showOnlyDomain(domainId);
      window.setTimeout(() => item.classList.remove('domain-long-press-feedback'), 300);
    }, 650);
  }, { capture: true });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (longPressTimer) window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }, { capture: true });
  });

  document.addEventListener('click', (event) => {
    if (!suppressNextDomainClick) return;
    const item = event.target.closest('.domain-item');
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNextDomainClick = false;
  }, { capture: true });
}

const onlyDomainObserver = new MutationObserver(() => injectOnlyButtons());
onlyDomainObserver.observe(document.body, { childList: true, subtree: true });

injectOnlyButtons();
setupLongPressOnlyShortcut();
