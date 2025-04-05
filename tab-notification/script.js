const TAB_NOTIFICATION_CLASS = 'tab-notification';
const TAB_NOTIFICATION_COUNT_ATTRIBUTE = `${TAB_NOTIFICATION_CLASS}-count`;
const TAB_NOTIFICATION_ERROR_ATTRIBUTE = `${TAB_NOTIFICATION_CLASS}-error`;

document.querySelectorAll(`.${TAB_NOTIFICATION_CLASS}`).forEach((e, i) => {
    const count = e.getAttribute(TAB_NOTIFICATION_COUNT_ATTRIBUTE);
    const isError = e.getAttribute(TAB_NOTIFICATION_ERROR_ATTRIBUTE) === "";

    if (count && +count === 0) return;
    let glanceWidgetContainer = e.closest(`.widget-group-content`);

    let glanceWidgetTabTarget, glanceWidgetTab;
    if (glanceWidgetContainer) {
        glanceWidgetTabTarget = `#${glanceWidgetContainer.getAttribute('aria-labelledby')}`;
        glanceWidgetTab = document.querySelector(glanceWidgetTabTarget);
    } else {
        glanceWidgetContainer = e.closest(`.widget`);
        glanceWidgetTab = glanceWidgetContainer.querySelector('.widget-header h2 a');
        glanceWidgetTab.classList.add(`${TAB_NOTIFICATION_CLASS}-${i}`)
        glanceWidgetTabTarget = `.${TAB_NOTIFICATION_CLASS}-${i}`;
    }

    if (!glanceWidgetTab) return;
    const tabTitle = e.getAttribute('tab-title');
    if (tabTitle) glanceWidgetTab.setAttribute('title', tabTitle);

    const style = document.createElement('style');
    style.innerHTML = `
      ${glanceWidgetTabTarget}::after {
        content: '${count}';
        display: inline-flex;
        vertical-align: top;
        margin-left: 2px;
        background-color: var(${isError ? '--color-negative' : '--color-primary'});
        color: var(--color-background);
        border-radius: var(--border-radius);
        padding: 0 3px;
        font-size: 1rem;
        white-space: nowrap;
        line-height: 1.5rem;
      }`
    document.head.appendChild(style);
});