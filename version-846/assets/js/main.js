(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobilePanel.hidden = isOpen;
      document.body.classList.toggle('menu-open', !isOpen);
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const startTimer = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    const input = form.querySelector('[data-filter-input]');
    const list = document.querySelector('[data-filter-list]');
    const cards = list ? Array.from(list.querySelectorAll('[data-search]')) : [];

    if (!input || !cards.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    const applyFilter = function () {
      const query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden', query !== '' && !haystack.includes(query));
      });
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
})();
