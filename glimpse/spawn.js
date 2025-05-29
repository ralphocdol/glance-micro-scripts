function spawnGlimpse() {
  glimpse.style.display = 'flex';
  glimpse.classList.add('fade-in', 'show');
  document.body.style.overflow = 'hidden';
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  searchInput.focus();
  searchInput.select();
}