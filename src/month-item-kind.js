function normalizeMonthItemKinds() {
  document.querySelectorAll('.month-item').forEach((item) => {
    if (item.dataset.kindNormalized === 'true') return;

    const strong = item.querySelector('strong');
    if (!strong) return;

    const textNode = Array.from(strong.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!textNode) return;

    const raw = textNode.textContent || '';
    const trimmed = raw.trimStart();
    const leading = raw.match(/^\s*/)?.[0] || '';

    let kind = null;
    let cleaned = raw;

    if (trimmed.startsWith('Start:')) {
      kind = 'Start';
      cleaned = leading + trimmed.replace(/^Start:\s*/, '');
      item.classList.add('month-item-start');
    } else if (trimmed.startsWith('Target:')) {
      kind = 'Target';
      cleaned = leading + trimmed.replace(/^Target:\s*/, '');
      item.classList.add('month-item-target');
    }

    if (!kind) return;

    textNode.textContent = cleaned;

    const label = document.createElement('span');
    label.className = 'month-item-kind';
    label.textContent = kind;
    strong.prepend(label);

    item.dataset.kindNormalized = 'true';
  });
}

const monthKindObserver = new MutationObserver(() => normalizeMonthItemKinds());
monthKindObserver.observe(document.body, { childList: true, subtree: true });
normalizeMonthItemKinds();
