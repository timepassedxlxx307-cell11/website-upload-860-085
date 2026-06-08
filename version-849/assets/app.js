(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var next = carousel.querySelector('[data-hero-next]');
        var prev = carousel.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        restart();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-input]').forEach(function (input) {
            input.addEventListener('input', function () {
                applyFilter(input.getAttribute('data-filter-input'));
            });
        });

        document.querySelectorAll('[data-clear-search]').forEach(function (button) {
            button.addEventListener('click', function () {
                var input = document.getElementById(button.getAttribute('data-clear-search'));
                if (input) {
                    input.value = '';
                    applyFilter(input.getAttribute('data-filter-input'));
                }
            });
        });

        document.querySelectorAll('[data-chip-scope]').forEach(function (scope) {
            scope.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
                chip.addEventListener('click', function () {
                    scope.querySelectorAll('[data-filter-chip]').forEach(function (item) {
                        item.classList.remove('active');
                    });
                    chip.classList.add('active');
                    applyFilter(scope.getAttribute('data-chip-scope'));
                });
            });
        });
    }

    function applyFilter(areaId) {
        var area = document.getElementById(areaId);
        if (!area) {
            return;
        }
        var input = document.querySelector('[data-filter-input="' + areaId + '"]');
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var activeChip = document.querySelector('[data-chip-scope="' + areaId + '"] [data-filter-chip].active');
        var typeFilter = activeChip ? activeChip.getAttribute('data-filter-chip') : 'all';
        area.querySelectorAll('[data-card]').forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesType = typeFilter === 'all' || haystack.indexOf(typeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(matchesKeyword && matchesType));
        });
    }

    function initPlayers() {
        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var launch = shell.querySelector('.player-launch');
            if (!video || !launch) {
                return;
            }
            var started = false;

            function getUrl() {
                var source = video.querySelector('source');
                return source ? source.getAttribute('src') : video.currentSrc || video.src;
            }

            function playVideo() {
                var url = getUrl();
                if (!url) {
                    return;
                }
                shell.classList.add('playing');
                if (!started) {
                    started = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                hls.destroy();
                                video.src = url;
                            }
                        });
                    } else {
                        video.src = url;
                    }
                }
                video.play().catch(function () {});
            }

            launch.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('playing');
            });
        });
    }
})();
