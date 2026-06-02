function ensureMobileSidebarControls() {
  if (document.querySelector('.mobile-domain-toggle')) return;

  const toggle = document.createElement('button');
  toggle.className = 'mobile-domain-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open domains');
  toggle.innerHTML = '☰ <span>Domains</span>';

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';

  const sidebar = document.querySelector('.sidebar');
  const actions = document.createElement('div');
  actions.className = 'mobile-sidebar-actions';
  actions.innerHTML = '<button type="button" class="mobile-expand-sidebar">Expand</button>';

  if (sidebar) sidebar.prepend(actions);
  document.body.append(toggle, backdrop);

  toggle.addEventListener('click', () => {
    document.body.classList.add('sidebar-open');
  });

  backdrop.addEventListener('click', closeMobileSidebar);

  actions.querySelector('.mobile-expand-sidebar')?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-expanded');
    const isExpanded = document.body.classList.contains('sidebar-expanded');
    actions.querySelector('.mobile-expand-sidebar').textContent = isExpanded ? 'Icons only' : 'Expand';
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth > 760) return;
    const domainItem = event.target.closest('.domain-item');
    if (domainItem) closeMobileSidebar();
  });
}

function closeMobileSidebar() {
  document.body.classList.remove('sidebar-open');
}

function resetSidebarOnResize() {
  if (window.innerWidth > 760) {
    document.body.classList.remove('sidebar-open', 'sidebar-expanded');
  }
}

ensureMobileSidebarControls();
window.addEventListener('resize', resetSidebarOnResize);
