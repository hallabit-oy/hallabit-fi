(() => {
  const button = document.getElementById('mnav-btn');
  const nav = document.getElementById('mnav-lista');
  if (!button || !nav) return;

  const groups = [...nav.querySelectorAll('details')];
  button.hidden = false;

  function closeMenu() {
    button.setAttribute('aria-expanded', 'false');
    groups.forEach(group => { group.open = false; });
  }

  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') closeMenu();
    else button.setAttribute('aria-expanded', 'true');
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target) && !button.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!nav.contains(event.target) && event.target !== button) closeMenu();
    else groups.forEach(group => { if (!group.contains(event.target)) group.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const group = groups.find(item => item.open);
    if (group) {
      group.open = false;
      group.querySelector('summary').focus();
    } else if (button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });
  window.matchMedia('(max-width: 920px)').addEventListener('change', closeMenu);
})();
