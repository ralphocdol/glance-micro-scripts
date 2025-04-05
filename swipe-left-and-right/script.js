const SWIPE_WRAP_AROUND = false;

const EXCLUDED_CLASS = [
    'carousel-container',
    'mobile-navigation-page-links',
]
const EXCLUDED_TAGS = [
    'iframe'
]

let touchstartX, touchstartY;
let touchendX, touchendY;
let touchstartT, touchendT;

document.addEventListener('touchstart', (event) => {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
    touchstartT = new Date();
}, false);

document.addEventListener('touchend', (event) => {
    let targetElement = event.target;
    while (targetElement && !EXCLUDED_TAGS.some(t => targetElement.tagName.toLowerCase().includes(t)) && !EXCLUDED_CLASS.some(c => targetElement.classList.contains(c))) {
        targetElement = targetElement.parentElement;
    }
    if (targetElement) return;

    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    touchendT = new Date();
    let touchTime = touchendT - touchstartT;

    const swipeThresholdX = 50; //Min horizontal
    const swipeThresholdY = 50; //Max vertical 
    const swipeThresholdT = 800; //Max time

    let touchX = Math.abs(touchendX - touchstartX);
    let touchY = Math.abs(touchendY - touchstartY);

    if (touchX > touchY * 2 && touchX > swipeThresholdX && touchY < swipeThresholdY && touchTime < swipeThresholdT) {
        let pos = document.querySelector('input[name="column"]:checked').value;
        let maxCol = document.getElementsByName('column').length - 1;
        if (touchendX < touchstartX) {
            pos++
            if (!SWIPE_WRAP_AROUND && pos > maxCol) return;
            pos = pos > maxCol ? 0 : pos;
        } else {
            pos--
            if (!SWIPE_WRAP_AROUND && pos < 0) return;
            pos = pos < 0 ? maxCol : pos;
        }
        document.querySelector('input[name="column"][value="' + pos + '"]').click();
    }
}, false);