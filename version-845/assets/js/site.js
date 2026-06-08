(function() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function() {
            const opened = mobileNav.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let activeIndex = 0;
    let timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, current) {
            slide.classList.toggle("is-active", current === activeIndex);
        });
        dots.forEach(function(dot, current) {
            dot.classList.toggle("is-active", current === activeIndex);
        });
    }

    function playSlider() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function() {
            setSlide(activeIndex + 1);
        }, 5200);
    }

    function pauseSlider() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        setSlide(0);
        playSlider();
        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                pauseSlider();
                setSlide(index);
                playSlider();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                pauseSlider();
                setSlide(activeIndex - 1);
                playSlider();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                pauseSlider();
                setSlide(activeIndex + 1);
                playSlider();
            });
        }
    }

    const filters = Array.from(document.querySelectorAll(".page-search"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    function filterCards(value) {
        const keyword = value.trim().toLowerCase();
        cards.forEach(function(card) {
            const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-hidden", keyword !== "" && !text.includes(keyword));
        });
    }

    filters.forEach(function(input) {
        input.addEventListener("input", function() {
            filterCards(input.value);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && filters.length) {
        filters[0].value = query;
        filterCards(query);
    }
})();
