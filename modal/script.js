const modalWrapper = document.createElement('div');
modalWrapper.className = 'modal';
modalWrapper.innerHTML = `
        <div class="modal-container">
          <span class="close">&times;</span>
          <div class="modal-content">
            <div class="modal-header"></div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
          </div>
        </div>
    `;
document.body.appendChild(modalWrapper);

const modal = document.querySelector('.modal');
const modalContainer = document.querySelector('.modal-container');
const modalHeader = document.querySelector('.modal-header');
const modalBody = document.querySelector('.modal-body');
const modalFooter = document.querySelector('.modal-footer');
const closeBtn = document.querySelector('.close');
const bodyOverflowState = document.body.style.overflow;

document.addEventListener('click', (e) => {
    if (e.target.closest('[data-content-type="modal"]')) {
        const triggerElement = e.target.closest('[data-content-type="modal"]');
        const headerElement = triggerElement.querySelector('[modal-header]');
        const bodyElement = triggerElement.querySelector('[modal-body]');
        const footerElement = triggerElement.querySelector('[modal-footer]');

        if (headerElement) {
            modalHeader.innerHTML = headerElement.innerHTML.trim();
            modalHeader.classList.add(...headerElement.classList);
        }

        if (bodyElement) {
            modalBody.innerHTML = bodyElement.innerHTML.trim();
            modalBody.classList.add(...bodyElement.classList);
        }

        if (footerElement) {
            modalFooter.innerHTML = footerElement.innerHTML.trim();
            modalFooter.classList.add(...footerElement.classList);
        }

        if (triggerElement.hasAttribute('dismiss-on-outside-click')) {
            modal.setAttribute('dismiss-on-outside-click', '');
        }

        if (triggerElement.hasAttribute('modal-no-background')) {
            modal.setAttribute('modal-no-background', '')
        }

        modal.className = `modal ${triggerElement.className}`;

        const width = triggerElement.getAttribute('width') || '90%';
        const height = triggerElement.getAttribute('height') || '90%';

        switch (triggerElement.getAttribute('size')) {
            case 'theater':
                modalContainer.style.width = '80%';
                modalContainer.style.height = '80%';
                break;
            case 'full':
                modalContainer.style.width = '100%';
                modalContainer.style.height = '100%';
                break;
            case 'medium':
                modalContainer.style.width = '60%';
                modalContainer.style.height = '60%';
                break;
            default:
                modalContainer.style.width = width;
                modalContainer.style.height = height;
                break;
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    }
    if (e.target === closeBtn || (modal.hasAttribute('dismiss-on-outside-click') && e.target === modal)) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show') && e.key === 'Escape') {
        closeModal();
    }
});

const closeModal = () => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    modalBody.innerHTML = '';
    document.body.style.overflow = bodyOverflowState;
}