(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  function initImageFallbacks() {
    queryAll('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.closest('.poster-link, .compact-card, .category-preview a, .hero-slide, .detail-hero');
        image.classList.add('is-missing');
        if (parent) {
          parent.classList.add('has-missing-image');
          parent.setAttribute('data-fallback-title', image.getAttribute('data-fallback-title') || image.getAttribute('alt') || '影片封面');
        }
      });
    });
  }

  function initFiltering() {
    queryAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var count = scope.querySelector('[data-filter-count]');
      var cards = queryAll('[data-card]', scope);

      if (!input || !cards.length) {
        return;
      }

      function update() {
        var keyword = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search') || card.textContent);
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
      }

      input.addEventListener('input', update);
      update();

      queryAll('[data-quick-filter]', scope).forEach(function (button) {
        button.addEventListener('click', function () {
          input.value = button.getAttribute('data-quick-filter') || '';
          update();
          input.focus();
        });
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
        update();
      }
    });
  }

  function initSorting() {
    queryAll('[data-sort-select]').forEach(function (select) {
      var scope = select.closest('[data-filter-scope]') || document;
      var container = scope.querySelector('[data-sort-container]');

      if (!container) {
        return;
      }

      var original = queryAll('[data-card]', container);

      select.addEventListener('change', function () {
        var value = select.value;
        var sorted = original.slice();

        if (value === 'year-desc') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
        }

        if (value === 'score-desc') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
          });
        }

        if (value === 'title-asc') {
          sorted.sort(function (a, b) {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          });
        }

        if (value === 'default') {
          sorted = original.slice();
        }

        sorted.forEach(function (card) {
          container.appendChild(card);
        });
      });
    });
  }

  function initPlayer() {
    var video = document.querySelector('video[data-m3u8]');

    if (!video) {
      return;
    }

    var url = video.getAttribute('data-m3u8');
    var shell = video.closest('.player-card');
    var loaded = false;
    var hlsInstance = null;

    function loadSource() {
      if (loaded || !url) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }

      loaded = true;
    }

    function playVideo() {
      loadSource();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    queryAll('[data-play-video]').forEach(function (button) {
      button.addEventListener('click', playVideo);
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
      loadSource();
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    loadSource();

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initImageFallbacks();
    initFiltering();
    initSorting();
    initPlayer();
  });
}());
