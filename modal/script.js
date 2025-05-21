const modalWrapper = document.createElement('div');
modalWrapper.className = 'modal';
modalWrapper.innerHTML = `
    <div class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-header-content"></div>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        </div>
    </div>
`;
document.body.appendChild(modalWrapper);

const closeBtnElement = document.createElement('span');
closeBtnElement.className = 'close';
closeBtnElement.textContent = '\u00D7';

const modal = document.querySelector('.modal');
const modalContainer = modal.querySelector('.modal-container');
const modalHeader = modal.querySelector('.modal-header');
const modalHeaderContent = modal.querySelector('.modal-header-content');
const modalBody = modal.querySelector('.modal-body');
const modalFooter = modal.querySelector('.modal-footer');
const bodyOverflowState = document.body.style.overflow;
let closeBtn = null;

document.addEventListener('click', (e) => {
    if (e.target.closest('[data-content-type="modal"]')) {
        const triggerElement = e.target.closest('[data-content-type="modal"]');
        const headerElement = triggerElement.querySelector('[modal-header]');
        const bodyElement = triggerElement.querySelector('[modal-body]');
        const footerElement = triggerElement.querySelector('[modal-footer]');

        if (headerElement) {
            modalHeaderContent.innerHTML = headerElement.innerHTML.trim();
            modalHeaderContent.classList.add(...headerElement.classList);
        }

        modalHeader.appendChild(closeBtnElement);
        closeBtn = modal.querySelector('.close')

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