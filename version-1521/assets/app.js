(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(query, category) {
        var keyword = normalize(query);
        var selectedCategory = normalize(category || 'all');
        all('.movie-card').forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-genre')
            ].join(' '));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            var categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            card.toggleAttribute('hidden', !(keywordMatch && categoryMatch));
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        all('[data-card-search]').forEach(function (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (query) {
                input.value = query;
                filterCards(query, document.querySelector('.filter-button.active') && document.querySelector('.filter-button.active').getAttribute('data-filter'));
            }
            input.addEventListener('input', function () {
                var active = document.querySelector('.filter-button.active');
                filterCards(input.value, active && active.getAttribute('data-filter'));
            });
        });

        all('[data-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                all('[data-filter]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                var input = document.querySelector('[data-card-search]');
                filterCards(input && input.value, button.getAttribute('data-filter'));
            });
        });

        var slides = all('[data-hero-slide]');
        var backgrounds = all('[data-hero-bg]');
        var dots = all('[data-hero-dot]');
        var index = 0;
        var timer;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            backgrounds.forEach(function (bg, current) {
                bg.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                showSlide(current);
                startHero();
            });
        });

        if (slides.length) {
            showSlide(0);
            startHero();
        }
    });
})();
