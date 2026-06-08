(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.getElementById("mobile-toggle");
    var drawer = document.getElementById("mobile-drawer");
    if (!toggle || !drawer) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("mobile-open");
    });
  }

  function setupHero() {
    var root = document.getElementById("hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")));
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 6500);
  }

  function setupHomeFilters() {
    var grid = document.getElementById("home-card-grid");
    if (!grid) {
      return;
    }
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card='movie']"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var term = button.getAttribute("data-filter-button");
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ");
          var visible = !term || haystack.indexOf(term) !== -1;
          card.classList.toggle("is-hidden", !visible);
        });
      });
    });
  }

  function setupSearch() {
    var input = document.getElementById("site-search");
    var typeSelect = document.getElementById("search-type");
    var yearSelect = document.getElementById("search-year");
    var results = document.getElementById("search-results");
    var data = window.MovieIndex || [];
    if (!input || !results || !data.length) {
      return;
    }
    function render() {
      var keyword = input.value.trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      if (!keyword && !type && !year) {
        results.classList.remove("active");
        results.innerHTML = "";
        return;
      }
      var matched = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(" ").toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !type || movie.type.indexOf(type) !== -1 || movie.genre.indexOf(type) !== -1;
        var okYear = !year || movie.year === year;
        return okKeyword && okType && okYear;
      }).slice(0, 80);
      if (!matched.length) {
        results.innerHTML = '<div class="empty-result">未找到相关影片</div>';
        results.classList.add("active");
        return;
      }
      results.innerHTML = matched.map(function (movie) {
        return [
          '<a class="search-result-card" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
          '<span>',
          '<strong>' + escapeHtml(movie.title) + '</strong>',
          '<em>' + escapeHtml(movie.year + " · " + movie.genre) + '</em>',
          '</span>',
          '</a>'
        ].join("");
      }).join("");
      results.classList.add("active");
    }
    input.addEventListener("input", render);
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", render);
    }
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".search-shell")) {
        results.classList.remove("active");
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  window.initMoviePlayer = function (videoId, coverId, hlsUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var started = false;
    if (!video || !cover || !hlsUrl) {
      return;
    }
    function start() {
      if (started) {
        if (video.paused) {
          video.play().catch(function () {});
        }
        return;
      }
      started = true;
      cover.classList.add("is-hidden");
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        var player = new window.Hls({
          maxBufferLength: 40,
          maxMaxBufferLength: 90,
          enableWorker: true
        });
        player.loadSource(hlsUrl);
        player.attachMedia(video);
        player.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        player.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              player.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              player.recoverMediaError();
            } else {
              player.destroy();
            }
          }
        });
      } else {
        video.src = hlsUrl;
        video.play().catch(function () {});
      }
    }
    cover.addEventListener("click", start);
    Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger='" + coverId + "']")).forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    });
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupHomeFilters();
    setupSearch();
  });
})();
