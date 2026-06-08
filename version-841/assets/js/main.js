(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    activate(0);
    start();
  });

  var searchInput = document.querySelector('[data-search-input]');
  var filterRow = document.querySelector('[data-filter-row]');
  var activeFilter = '';

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var cards = document.querySelectorAll('[data-movie-card]');

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchedQuery && matchedFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (filterRow) {
    filterRow.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter-value]');
      if (!button) {
        return;
      }
      activeFilter = button.getAttribute('data-filter-value') || '';
      filterRow.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  }
})();
