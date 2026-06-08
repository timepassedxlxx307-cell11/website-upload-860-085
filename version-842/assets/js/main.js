(function () {
  var root = document;

  function qs(selector, scope) {
    return (scope || root).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.nav-toggle');
    var menu = qs('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      button.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dot', carousel);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var scope = panel.closest('main') || root;
      var input = qs('.filter-search', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var list = qs('[data-filter-list]', scope);
      var empty = qs('[data-empty-result]', scope);
      if (!list) {
        return;
      }
      var cards = qsa('.movie-card', list);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input && initial) {
        input.value = initial;
      }

      function norm(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var q = norm(input ? input.value : '');
        var typeValue = norm(typeSelect ? typeSelect.value : '');
        var yearValue = norm(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = norm([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region')
          ].join(' '));
          var cardType = norm(card.getAttribute('data-type'));
          var cardYear = norm(card.getAttribute('data-year'));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  function mountPlayer(streamUrl) {
    var video = qs('#movie-player');
    var overlay = qs('#play-button');
    if (!video || !streamUrl) {
      return;
    }
    var ready = false;

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = streamUrl;
        video.load();
      }
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.MovieSite = {
    mountPlayer: mountPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
