(function () {
    "use strict";

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupHeader() {
        var header = $("[data-header]");
        var toggle = $("[data-menu-toggle]");
        var mobileNav = $("[data-mobile-nav]");

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 20);
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }
    }

    function setupSearchForms() {
        $all("[data-site-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var panel = $("[data-filter-form]");
        var list = $("[data-filter-list]");
        if (!panel || !list) {
            return;
        }

        var input = $("[data-filter-input]", panel);
        var selects = $all("[data-filter-select]", panel);
        var cards = $all(".movie-card", list);
        var count = $("[data-filter-count]", panel);

        function apply() {
            var query = normalize(input ? input.value : "");
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute("data-filter-select")] = normalize(select.value);
            });

            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !filters.type || normalize(card.getAttribute("data-type")) === filters.type;
                var matchesRegion = !filters.region || normalize(card.getAttribute("data-region")) === filters.region;
                var matchesYear = !filters.year || normalize(card.getAttribute("data-year")) === filters.year;
                var visibleNow = matchesQuery && matchesType && matchesRegion && matchesYear;

                card.classList.toggle("hidden-by-filter", !visibleNow);
                if (visibleNow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }

            var empty = $(".no-results", list);
            if (!visible && !empty) {
                empty = document.createElement("div");
                empty.className = "no-results";
                empty.textContent = "没有找到符合条件的影片，请换个关键词或筛选条件。";
                list.appendChild(empty);
            }
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card movie-card-compact\">" +
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.file) + "\">" +
                    "<span class=\"poster-shell\">" +
                        "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + " 海报\" loading=\"lazy\">" +
                        "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
                        "<span class=\"poster-play\">▶ 播放</span>" +
                    "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                    "<h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"movie-card-tags\">" + tags + "</div>" +
                    "<div class=\"movie-card-foot\"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + Number(movie.views || 0).toLocaleString() + " 次热度</span></div>" +
                "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var page = $("[data-search-page]");
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var form = $("[data-search-form]", page);
        var input = form ? form.querySelector("input[name='q']") : null;
        var summary = $("[data-search-summary]", page);
        var results = $("[data-search-results]", page);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        function render(query) {
            var normalized = normalize(query);
            var data = window.MOVIE_SEARCH_DATA || [];
            var matches = data.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return !normalized || text.indexOf(normalized) !== -1;
            });

            if (!normalized) {
                matches = data.slice().sort(function (a, b) {
                    return Number(b.views || 0) - Number(a.views || 0);
                }).slice(0, 80);
            }

            if (summary) {
                summary.textContent = normalized ? "找到 " + matches.length + " 条与 “" + query + "” 相关的影片。" : "默认展示热度较高的 80 部影片。";
            }

            if (results) {
                results.innerHTML = matches.length ? matches.map(movieCardTemplate).join("") : "<div class=\"no-results\">没有找到相关影片，请尝试其他关键词。</div>";
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : "";
                var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                window.history.replaceState(null, "", nextUrl);
                render(query);
            });
        }

        render(initialQuery);
    }

    function setupPlayers() {
        $all("[data-player]").forEach(function (player) {
            var video = $("video", player);
            var button = $(".js-play-button", player);
            var status = $("[data-player-status]", player);
            var hlsInstance = null;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function playVideo() {
                if (!video) {
                    return;
                }

                var source = video.getAttribute("data-video-src");
                if (!source) {
                    setStatus("未找到播放源");
                    return;
                }

                if (button) {
                    button.classList.add("is-hidden");
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setStatus("正在调用浏览器原生 HLS 播放能力...");
                } else if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        backBufferLength: 60
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("片源加载完成，正在播放...");
                        video.play().catch(function () {
                            setStatus("请再次点击播放器开始播放");
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放源加载失败，请刷新后重试");
                        }
                    });
                    return;
                } else {
                    video.src = source;
                    setStatus("当前浏览器可能需要 HLS 支持，已尝试直接加载播放源");
                }

                video.play().catch(function () {
                    setStatus("请再次点击播放器开始播放");
                });
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupHeader();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
