function splitDomainLabel(rawText) {
  const text = rawText.trim();
  const firstSpace = text.indexOf(' ');
  if (firstSpace === -1) {
    return { icon: text, name: '' };
  }
  return {
    icon: text.slice(0, firstSpace).trim(),
    name: text.slice(firstSpace + 1).trim()
  };
}

function normalizeDomainLabels() {
  document.querySelectorAll('.domain-item').forEach((item) => {
    if (item.dataset.normalized === 'true') return;

    const label = item.querySelector('span:first-child');
    if (!label) return;

    const { icon, name } = splitDomainLabel(label.textContent || '');
    label.className = 'domain-label';
    label.innerHTML = `
      <span class="domain-icon" aria-hidden="true">${icon}</span>
      <span class="domain-name">${name}</span>
    `;
    item.dataset.normalized = 'true';
  });
}

const domainObserver = new MutationObserver(() => normalizeDomainLabels());
domainObserver.observe(document.body, { childList: true, subtree: true });
normalizeDomainLabels();
