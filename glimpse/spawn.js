function spawnGlimpse() {
  glimpse.style.visibility = 'visible';
  glimpse.classList.add('show');
  document.body.style.overflow = 'hidden';
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  searchInput.focus();
  searchInput.select();
}