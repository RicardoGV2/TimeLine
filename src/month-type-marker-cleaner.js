const TYPE_MARKERS = ['▶', '🎯', '◆', '☐', '◦', '•'];

function cleanMonthTypeMarkers() {
  document.querySelectorAll('.month-item strong').forEach((strong) => {
    if (strong.dataset.typeMarkerCleaned === 'true') return;

    for (const node of Array.from(strong.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE) continue;

      let text = node.textContent || '';
      let changed = false;

      for (const marker of TYPE_MARKERS) {
        const trimmedStart = text.trimStart();
        if (trimmedStart.startsWith(marker)) {
          const leadingSpace = text.match(/^\s*/)?.[0] || '';
          text = leadingSpace + trimmedStart.slice(marker.length).trimStart();
          changed = true;
          break;
        }
      }

      if (changed) {
        node.textContent = text;
        strong.dataset.typeMarkerCleaned = 'true';
        break;
      }
    }
  });
}

const typeMarkerObserver = new MutationObserver(() => cleanMonthTypeMarkers());
typeMarkerObserver.observe(document.body, { childList: true, subtree: true });
cleanMonthTypeMarkers();
