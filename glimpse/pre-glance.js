
(() => {
  const glanceSearch = `
    // Search Widget goes here
  `;
  const searchEngineEndpoint = ``;
  const searchSuggestEndpoint = ``;
  // Other page search may or may not work due to limitations, and can be slow
  const pagesSlug = [
    // 'home-page',
    // 'page-1',
    // 'page-2',
  ];
  const cleanupOtherPages = true; // Warning: setting this to false is like having (# of pagesSlug) tabs opened all at once
  const glimpseKey = '';
  const waitForGlance = true;

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

  const mainPagePath = Array.from(document.querySelectorAll('.nav a')).map(a => a.getAttribute('href'))?.[0];
  const windowPathname = window.location.pathname;
  const currentPathList = windowPathname.split('/').filter(p => p !== '');

  const glimpse = document.createElement('div');
  glimpse.id = 'glimpse';
  glimpse.className = 'widget-exclude-swipe';
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
  searchSuggestContainer.className = 'widget-content glimpse-suggest';
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
  const iframeBySlug = {};

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
    const query = (e.target.value || '').trim().toLowerCase();
    if (query.length < 1) {
      loadingAnimationElement.remove();
      return;
    }

    glimpseWrapper.appendChild(loadingAnimationElement);
    try {
      await searchScrape({ contentElement: glanceContent, query, callId });
      await Promise.allSettled([
        showSearchSuggestion({ query, signal }),
        ...pagesSlug.map(slug => otherPageScrape({ slug, query, callId }))
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
    const activeElement = document.activeElement;

    // If Glance's search input is focused then prevent spawn
    if (activeElement.classList.contains('search-input') && activeElement.closest('.widget-type-search') && !activeElement.closest('#glimpse')) {
      return;
    }

    if (glimpseKey && event.key === glimpseKey && activeElement !== searchInput) {
      event.preventDefault();
      if ((waitForGlance && document.body.classList.contains('page-columns-transitioned')) || !waitForGlance) spawnGlimpse();
    }

    if (event.key === 'Escape') closeGlimpse();
  });

  $include: spawn.js

  function closeGlimpse() {
    if (!glimpse.classList.contains('show')) return;
    cleanupAllIframes();
    glimpse.style.display = 'none';
    glimpse.classList.remove('show', 'fade-in');
    document.body.style.overflow = bodyOverflowState;
    searchInput.blur();
  }

  async function searchScrape({ contentElement, query, callId }) {
    const columns = contentElement?.querySelectorAll('.page-columns');
    if (!columns) return;
    for (const column of contentElement?.querySelectorAll('.page-columns')) {
      if (callId !== lastCallId) return;
      const widgetClasses = [
        '.widget-type-reddit',
        '.widget-type-rss',
        '.widget-type-monitor',
        '.widget-type-docker-containers',
        '.widget-type-videos',
        '.widget-type-bookmarks',
      ].map(c => `${c}:not(.glimpsable-hidden)`)
      .concat('.glimpsable')
      .join(', ');
      const widgets = column.querySelectorAll(widgetClasses);
      for (const widget of widgets) {
        await Promise.allSettled([
          createWidgetResult({ widget, query, callId, listSelector: 'ul.list', itemSelector: ':scope > li' }),
          createWidgetResult({ widget, query, callId, listSelector: 'ul.list-with-separator', itemSelector: ':scope > .monitor-site, .docker-container' }),
          createWidgetResult({ widget, query, callId, listSelector: '.cards-horizontal', itemSelector: ':scope > .card' }),
        ]);
      }
      for (const widget of column.querySelectorAll('.glimpsable-custom')) {
        await createWidgetResult({ widget, query, callId, listSelector: '[glimpse-list]' })
      }
      for (const widget of column.querySelectorAll('.glimpsable-custom-list')) {
        await createWidgetResult({ widget, query, callId, listSelector: '[glimpse-list]', itemSelector: '[glimpse-item]' })
      }
    }
  }

  async function otherPageScrape({ slug, query, callId }) {
    return new Promise(async (resolve) => {
      if (callId !== lastCallId) return resolve();

      const targetPathname = `/${slug}`;
      if (windowPathname === '/' && mainPagePath === targetPathname) return resolve();
      if (targetPathname === '/' + currentPathList[currentPathList.length - 1]) return resolve();

      const existingIframe = iframeBySlug[slug];
      if (existingIframe) {
        const doc = existingIframe.contentDocument;
        if (!doc || !doc.body) return resolve();

        await searchScrape({ contentElement: doc.querySelector('#page-content'), query, callId });
        return resolve();
      }

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = targetPathname;
      glimpse.appendChild(iframe);
      iframeBySlug[slug] = iframe;

      iframe.onerror = () => {
        delete iframeBySlug[slug];
        resolve();
      };

      iframe.onload = async () => {
        const doc = iframe.contentDocument;
        const docIs404 = doc.title.includes('404') || !doc.querySelector('#page-content');
        if (docIs404) {
          delete iframeBySlug[slug];
          return resolve();
        }

        while (!doc.body.classList.contains('page-columns-transitioned')) {
          await new Promise(r => setTimeout(r, 50));
          if (!iframeBySlug[slug]) break;
        }

        await searchScrape({ contentElement: doc.querySelector('#page-content'), query, callId });
        resolve();
      };
    });
  }

  function cleanupAllIframes() {
    if (!cleanupOtherPages) return;
    pagesSlug.forEach(slug => {
      const iframe = iframeBySlug[slug];
      if (!iframe) return;
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      delete iframeBySlug[slug];
    });
  }

  async function showSearchSuggestion({ query, signal }) {
    if (!searchSuggestEndpoint) return;

    searchSuggestListContainer.style.display = 'flex';
    const loadingAnimationClone = loadingAnimationElement.cloneNode(true);
    loadingAnimationClone.style.flex = 1;
    searchSuggestListContainer.appendChild(loadingAnimationClone);

    const getSuggestion = await fetch(searchSuggestEndpoint + encodeURIComponent(query), { signal });
    const result = await getSuggestion.json();
    if (!result?.[1].length) {
      searchSuggestListContainer.innerHTML = 'No suggestion...';
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
    searchSuggestListContainer.replaceChildren(newWidget);
  }

  async function createWidgetResult({ widget, query, callId, listSelector, itemSelector }) {
    return new Promise((resolve) => {
      const headerSource = widget.querySelector('.widget-header > h2')?.innerText;
      const widgetContent = widget.querySelector('.widget-content');
      const widgetContentClone = sanitizeWidgetContent(widgetContent);
      const ulLists = widgetContentClone.querySelectorAll(listSelector);
      if (!ulLists.length) return resolve();

      const resultSearch = [...ulLists].flatMap(ul => {
        const items = itemSelector ? ul.querySelectorAll(itemSelector) : [ul];
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