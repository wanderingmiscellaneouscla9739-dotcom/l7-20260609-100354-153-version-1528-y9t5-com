(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNavigation() {
        var button = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('.hero-dot', slider);
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function initCardFiltering() {
        var searchInputs = selectAll('.card-search-input');
        var chips = selectAll('.filter-chip');
        var activeFilter = 'all';

        function currentQuery() {
            var input = document.querySelector('.card-search-input');
            return input ? input.value.trim().toLowerCase() : '';
        }

        function apply() {
            var query = currentQuery();
            var cards = selectAll('.movie-card, .rank-row');
            var visibleCount = 0;
            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var year = card.getAttribute('data-year') || '';
                var textMatch = !query || search.indexOf(query) !== -1;
                var filterMatch = activeFilter === 'all' || search.indexOf(activeFilter.toLowerCase()) !== -1 || year === activeFilter;
                var visible = textMatch && filterMatch;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
            selectAll('.filter-empty').forEach(function (empty) {
                empty.hidden = visibleCount !== 0;
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', apply);
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });

        var globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q');
            if (keyword) {
                globalSearch.value = keyword;
                apply();
            }
        }
    }

    window.initializeMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hlsInstance = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
        prepare();
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initCardFiltering();
    });
})();
