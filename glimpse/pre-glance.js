
(() => {
  const glanceSearch = `
    // Search Widget goes here
  `;

  const searchEngineEndpoint = ``;
  const searchSuggestEndpoint = ``;

  // Other page search may or may not work due to limitations, and is slow
  const otherPagesSlug = [
    // 'page-1',
    // 'page-2',
  ];

  const glimpseKey = 's'; // Can not override the Glance's default key 's' to focus.

  const loadingAnimationElement = document.createElement('div');
  loadingAnimationElement.className = 'custom-page-loading-container';
  loadingAnimationElement.innerHTML = `
    <div class="visually-hidden">Loading</div>
    <div class="loading-icon" aria-hidden="true"></div>
  `;

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

  const searchSuggestContainer = document.createElement('div');
  searchSuggestContainer.className = 'widget glimpse-suggest';
  searchSuggestContainer.innerHTML = ``;
  glimpseSearch.appendChild(searchSuggestContainer);

  const searchSuggestListContainer = glimpseSearch.querySelector('.glimpse-suggest');
  searchSuggestListContainer.style.display = 'none';

  const closeBtnElement = document.createElement('span');
  closeBtnElement.className = 'close';
  closeBtnElement.textContent = '\u00D7';
  closeBtnElement.addEventListener('click', e => closeGlimpse());
  glimpseSearch.querySelector('.widget-header').appendChild(closeBtnElement);

  const searchInput = glimpse.querySelector('.search-input');
  const glimpseWrapper = glimpse.querySelector('.glimpse-wrapper');
  const glimpseResult = glimpse.querySelector('.glimpse-result');
  const glanceContent = document.querySelector('#page-content');

  let activeIframes = [];
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  let controller;
  let lastCallId = 0;
  const handleInput = debounce(async (e) => {
    const callId = ++lastCallId;
    if (controller) controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    glimpseResult.innerHTML = '';
    searchSuggestListContainer.innerHTML = '';
    searchSuggestListContainer.style.display = 'none';
    activeIframes.forEach(f => f.remove());
    activeIframes = [];
    const query = (e.target.value || '').trim().toLowerCase();
    if (query.length < 1) {
      loadingAnimationElement.remove();
      return;
    }

    glimpseWrapper.appendChild(loadingAnimationElement);
    try {
      await Promise.allSettled([
        showSearchSuggestion({ query, signal }),
        searchScrape({ contentElement: glanceContent, query, callId }),
        ...otherPagesSlug.map(slug => otherPageScrape({ slug, query, callId }))
      ]);
      if (callId !== lastCallId) return;
      if (glimpseResult.innerHTML == '') glimpseResult.innerText = 'No widget found...';
    } catch (err) {
      if (err.name !== 'AbortError') console.error(`Glimpse Error: ${err}`);
    } finally {
      if (callId === lastCallId) loadingAnimationElement.remove();
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
    glimpse.style.display = 'none';
    glimpse.classList.remove('show', 'fade-in');
    document.body.style.overflow = bodyOverflowState;
    searchInput.blur();
  }

  async function searchScrape({ contentElement, query, callId }) {
    for (const column of contentElement.querySelectorAll('.page-columns')) {
      if (callId !== lastCallId) return;
      const widgets = column.querySelectorAll('.widget-type-reddit, .widget-type-rss, .glimpsable, .widget-type-monitor, .widget-type-docker-containers, .widget-type-videos, .widget-type-bookmarks');
      for (const widget of widgets) {
        await Promise.allSettled([
          createFilteredWidget({ widget, query, callId, listSelector: 'ul.list', itemSelector: 'li' }),
          createFilteredWidget({ widget, query, callId, listSelector: 'ul.list-with-separator', itemSelector: '.monitor-site, .docker-container' }),
          createFilteredWidget({ widget, query, callId, listSelector: '.cards-horizontal', itemSelector: '.card' }),
        ]);
      }
      for (const widget of column.querySelectorAll('.glimpsable-custom')) {
        await Promise.allSettled([
          createFilteredWidget({ widget, query, callId, listSelector: '[glimpse-list]' }),
          createFilteredWidget({ widget, query, callId, listSelector: '[glimpse-list]', itemSelector: '[glimpse-item]' }),
        ]);
      }
    }
  }

  async function otherPageScrape({ slug, query, callId }) {
    return new Promise((resolve) => {
      if (callId !== lastCallId) return resolve();
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `/${slug}`;
      glimpse.appendChild(iframe);
      activeIframes.push(iframe);

      iframe.onload = async () => {
        const doc = iframe.contentDocument;
        while (!doc.body.classList.contains('page-columns-transitioned')) {
          await new Promise(r => setTimeout(r, 50));
          if (!activeIframes.includes(iframe)) break;
        }
        await searchScrape({ contentElement: doc.querySelector('#page-content'), query, callId });
        iframe.remove();
        activeIframes = activeIframes.filter(f => f !== iframe);
        resolve();
      };
    });
  }

  async function showSearchSuggestion({ query, signal }) {
    const getSuggestion = await fetch(searchSuggestEndpoint + encodeURIComponent(query), { signal });
    const result = await getSuggestion.json();
    if (!result.length) {
      searchSuggestListContainer.innerHTML = '';
      searchSuggestListContainer.style.display = 'none';
      return;
    }
    const searchEngine = searchEngineEndpoint.replace('!QUERY!', '');
    const newWidget = document.createElement('ul');
    newWidget.innerHTML = `
      ${result[1].map(r => {
        const suggestLink = searchEngine ? searchEngine + encodeURIComponent(r) : '#';
        const target = searchEngine ? '_blank' : '';
        return `
          <li>
            <a href="${suggestLink}" target="${target}" rel="noreferrer">${r}</a>
          </li>`}).join('')
      }
    `;

    searchSuggestListContainer.style.display = 'flex';
    searchSuggestListContainer.replaceChildren(newWidget);
  }

  async function createFilteredWidget({ widget, query, callId, listSelector, itemSelector }) {
    return new Promise((resolve) => {
      const headerSource = widget.querySelector('.widget-header > h2')?.innerText;
      const widgetContent = widget.querySelector('.widget-content');
      const widgetContentClone = sanitizeWidgetContent(widgetContent);
      const ulLists = widgetContentClone.querySelectorAll(listSelector);
      if (!ulLists.length) return resolve();

      const resultSearch = [...ulLists].flatMap(ul => {
        const items = itemSelector ? ul.querySelectorAll(`:scope > ${itemSelector}`) : [ul];
        return [...items].filter(el =>
          (el?.innerText || '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .includes(query)
        );
      });
      if (!resultSearch.length) return resolve();

      const newWidget = document.createElement('div');
      newWidget.className = 'widget';
      newWidget.innerHTML = `<div class="widget-header"><h2 class="uppercase"></h2></div>`;

      const header = newWidget.querySelector('h2');
      header.innerText = headerSource
        ?? document.getElementById(widgetContent.closest('.widget-group-content')?.getAttribute('aria-labelledby'))?.innerText
        ?? '';

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

      if (callId !== lastCallId) return resolve();
      glimpseResult.appendChild(newWidget);
      resolve();
    });
  }

  function sanitizeWidgetContent(element) {
    const newElement = element.cloneNode(true);
    newElement.querySelectorAll('div[data-popover-type]').forEach(e => {
      const fragment = document.createDocumentFragment();
      [...e.children].forEach(child => {
        if (!child.hasAttribute('data-popover-html')) fragment.appendChild(child);
      });
      e.replaceWith(fragment);
    });
    newElement.querySelectorAll('[custom-modal]').forEach(e => {
      const fragment = document.createDocumentFragment();
      [...e.children].forEach(child => {
        if (!child.hasAttribute('modal-header') && !child.hasAttribute('modal-body') && !child.hasAttribute('modal-footer')) {
          fragment.appendChild(child);
        }
      });
      e.replaceWith(fragment);
    });
    return newElement;
  }
})();