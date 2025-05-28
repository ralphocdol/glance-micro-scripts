
(() => {
  const glanceSearch = `
    // Search Widget goes here
  `;

  // Other page search may or may not work due to limitations, and is slow
  const otherPagesSlug = [
    // 'page-1',
    // 'page-2',
  ];

  const glimpseKey = 's'; // Can not override the Glance's default key 's' to focus.

  const parseGlanceSearch = new DOMParser();
  const doc = parseGlanceSearch.parseFromString(glanceSearch, 'text/html');
  const search = doc.body.firstElementChild;

  if (!search) return;

  const glimpse = document.createElement('div');
  glimpse.id = 'glimpse';
  glimpse.innerHTML = `
    <div class="glimpse-wrapper">
      <div class="glimpse-search widget widget-type-search"></div>
      <div class="glimpse-result"></div>
    </div>
  `;
  document.body.appendChild(glimpse);

  const bodyOverflowState = document.body.style.overflow;
  const glimpseSearch = document.querySelector('#glimpse .glimpse-search');
  [...search.childNodes].forEach(child => glimpseSearch.appendChild(child.cloneNode(true)));
  if (!glanceSearch) {
    search.remove();
    setupSearchBoxes();
  }

  const closeBtnElement = document.createElement('span');
  closeBtnElement.className = 'close';
  closeBtnElement.textContent = '\u00D7';
  closeBtnElement.addEventListener('click', e => closeGlimpse());
  glimpseSearch.querySelector('.widget-header').appendChild(closeBtnElement);

  const searchInput = glimpse.querySelector('.search-input');
  const glimpseResult = glimpse.querySelector('.glimpse-result');
  const glanceContent = document.querySelector('#page-content');

  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  
  const handleInput = debounce((e) => {

    glimpseResult.innerHTML = '';
    const textValue = (e.target.value || '').trim().toLowerCase();
    if (textValue.length < 1) return;
    searchScrape(glanceContent);

    otherPagesSlug.forEach(p => otherPageScrape(p));

    function otherPageScrape(src) { 
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `/${src}`;
      document.body.appendChild(iframe);
      iframe.onload = async () => {
        const doc = iframe.contentDocument;
        while (!doc.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));
        searchScrape(doc.querySelector('#page-content'))
        iframe.remove();
      }
    }
    
    function searchScrape(contentElement) {
      const pageColumns = contentElement.querySelectorAll('.page-columns');
      pageColumns.forEach(column => {
        column.querySelectorAll('.widget-type-reddit, .widget-type-rss, .glimpsable, .widget-type-monitor, .widget-type-docker-containers, .widget-type-videos, .widget-type-bookmarks')
          .forEach(widget => {
            createFilteredWidget({
              widget,
              textValue,
              listSelector: 'ul.list',
              itemSelector: 'li',
            });

            createFilteredWidget({
              widget,
              textValue,
              listSelector: 'ul.list-with-separator',
              itemSelector: '.monitor-site, .docker-container',
            });

            createFilteredWidget({
              widget,
              textValue,
              listSelector: '.cards-horizontal',
              itemSelector: '.card',
            });
          });

        column.querySelectorAll('.glimpsable-custom')
          .forEach(widget => {
            createFilteredWidget({
              widget,
              textValue,
              listSelector: '[glimpse-list]',
            });
            createFilteredWidget({
              widget,
              textValue,
              listSelector: '[glimpse-list]',
              itemSelector: '[glimpse-item]',
            });
          });
      });
    }
  }, 300);

  searchInput.addEventListener('input', handleInput);

  document.addEventListener('keydown', event => {
    if (event.key === glimpseKey && document.activeElement !== searchInput) {
      event.preventDefault();
      spawnGlimpse();
    }
    if (event.key === 'Escape') closeGlimpse();
  });

  $include: spawn.js

  function closeGlimpse() {
    if (!glimpse.classList.contains('show')) return;
    glimpse.style.visibility = 'hidden';
    glimpse.classList.remove('show');
    document.body.style.overflow = bodyOverflowState;
    searchInput.blur();
  }

  function createFilteredWidget({ widget, textValue, listSelector, itemSelector }) {
    const headerSource = widget.querySelector('.widget-header > h2')?.innerText;
    const widgetContent = widget.querySelector('.widget-content');
    const widgetContentClone = sanitizeWidgetContent(widgetContent);
    const ulLists = widgetContentClone.querySelectorAll(listSelector);
    if (!ulLists.length) return;

    const resultSearch = [];

    ulLists.forEach(ul => {
      const items = itemSelector ? ul.querySelectorAll(`:scope > ${itemSelector}`) : [ul];
      const matches = [...items].filter(el => {
        return [
          (el?.innerText || '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .includes(textValue),
        ].some(Boolean);
      });
      resultSearch.push(...matches);
    });
    
    if (resultSearch.length === 0) return;

    const newWidget = document.createElement('div');
    newWidget.className = 'widget';
    newWidget.innerHTML = `<div class="widget-header"><h2 class="uppercase"></h2></div>`;

    const header = newWidget.querySelector('h2');
    if (!headerSource) {
      const groupId = widgetContent.closest('.widget-group-content')?.getAttribute('aria-labelledby');
      header.innerText = groupId ? document.getElementById(groupId)?.innerText ?? '' : '';
    } else {
      header.innerText = headerSource;
    }

    widgetContentClone.innerHTML = '';
    newWidget.appendChild(widgetContentClone);

    const ulClone = ulLists[0].cloneNode(true);
    ulClone.innerHTML = '';
    ulClone.removeAttribute('data-collapse-after');
    ulClone.classList.add('container-expanded');
    newWidget.querySelector('.widget-content').appendChild(ulClone);

    resultSearch.forEach((el, i) => {
      const clone = el.cloneNode(true);
      clone.classList.add('collapsible-item');
      clone.style.setProperty('animation-delay', `${i * 20}ms`);
      clone.querySelectorAll('img').forEach(img => img.removeAttribute('loading'));
      ulClone.appendChild(clone);
    });

    glimpseResult.appendChild(newWidget);
  }


  function sanitizeWidgetContent(element) {
    const newElement = element.cloneNode(true);
    newElement.querySelectorAll('div[data-popover-type]').forEach(e => {
      const fragment = document.createDocumentFragment();
      Array.from(e.children).forEach(child => {
        if (!child.hasAttribute('data-popover-html')) fragment.appendChild(child);
      });
      e.replaceWith(fragment);
    });
    newElement.querySelectorAll('[custom-modal]').forEach(e => {
      const fragment = document.createDocumentFragment();
      Array.from(e.children).forEach(child => {
        if (!child.hasAttribute('modal-header') && !child.hasAttribute('modal-body') && !child.hasAttribute('modal-footer')) {
          fragment.appendChild(child)
        }
      });
      e.replaceWith(fragment);
    });
    return newElement;
  }
})();