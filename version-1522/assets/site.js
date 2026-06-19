(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getRoot() {
        return document.body.getAttribute("data-root") || "./";
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        var root = getRoot();

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";

                if (!value) {
                    event.preventDefault();
                    window.location.href = root + "search.html";
                    return;
                }

                form.setAttribute("action", root + "search.html");
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle("active", currentIndex === index);
            });

            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle("active", currentIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function filterCards(input, cards, counter, yearSelect, regionSelect) {
        var keyword = normalize(input && input.value);
        var year = yearSelect ? normalize(yearSelect.value) : "";
        var region = regionSelect ? normalize(regionSelect.value) : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var matchedRegion = !region || cardRegion === region;
            var matched = matchedKeyword && matchedYear && matchedRegion;

            card.classList.toggle("hidden-by-filter", !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = "共 " + visible + " 部影片";
        }
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");

        if (!results) {
            return;
        }

        var input = document.querySelector("[data-search-input]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var counter = document.querySelector("[data-result-count]");
        var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        function apply() {
            filterCards(input, cards, counter, yearSelect, regionSelect);
        }

        [input, yearSelect, regionSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupLocalFilters() {
        var boxes = document.querySelectorAll("[data-filter-box]");

        boxes.forEach(function (box) {
            var input = box.querySelector("[data-local-filter]");
            var list = document.querySelector("[data-filter-list]");

            if (!input || !list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            input.addEventListener("input", function () {
                filterCards(input, cards, null, null, null);
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupSearchPage();
        setupLocalFilters();
    });
})();
