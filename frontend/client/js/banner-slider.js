// frontend/client/js/banner-slider.js

// Banner Slider JavaScript
const bannerSlider = {
    currentSlide: 0,
    slides: null,
    dots: null,
    autoPlayInterval: null,

    init() {
        this.slides = document.querySelectorAll('.banner-slide');
        this.dots = document.querySelectorAll('.banner-dot');
        this.startAutoPlay();
    },

    goToSlide(index) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        // Update current slide
        this.currentSlide = index;

        // Add active class to new slide and dot
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');

        // Reset autoplay
        this.resetAutoPlay();
    },

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    },

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prev);
    },

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // 3 seconds
    },

    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.startAutoPlay();
    }
};

// Initialize banner slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    bannerSlider.init();
});
