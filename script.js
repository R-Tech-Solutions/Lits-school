// Ensure the slider auto-scrolls every 2 seconds
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
let index = 0;

function startSlider() {
    setInterval(() => {
        index = (index + 1) % slides.length;
        slider.style.transform = `translateX(-${index * 100}%)`;
    }, 3000);
}

document.addEventListener('DOMContentLoaded', startSlider);
