(() => {
  const glimpse = document.getElementById('glimpse');
  if (!glimpse) return;

  const headerNav = document.querySelector('.header-container > .header');
  const headerSearchNav = createNavElement();
  headerSearchNav.className = 'glimpse-search-nav';
  const navElement = headerNav.querySelector(':scope > nav');
  navElement.parentNode.insertBefore(headerSearchNav, navElement.nextSibling);

  const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');
  const mobileSearchNav = createNavElement();
  mobileSearchNav.className = 'mobile-navigation-label';
  mobileNav.prepend(mobileSearchNav);
  
  // This removes the scroll to top, you can remove this if needed
  mobileNav.querySelector('a[href="#top"]').remove();

  const searchInput = glimpse.querySelector('.search-input');

  $include: shared.js

  function createNavElement() {
    const newElement = document.createElement('a');
    newElement.setAttribute('title', 'Launch Glimpse');
    newElement.innerHTML = `
      <svg class="search-icon" stroke="var(--color-text-highlight)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
      </svg>
    `;
    newElement.addEventListener('click', e => spawnGlimpse());
    return newElement;
  }
})();