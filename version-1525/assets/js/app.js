(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var dotsRoot = root.querySelector("[data-hero-dots]");
    var current = 0;
    var timer = null;

    function setActive(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      if (dotsRoot) {
        Array.prototype.slice.call(dotsRoot.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setActive(current + 1);
      }, 5200);
    }

    if (dotsRoot) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第 " + (index + 1) + " 张焦点图");
        dot.addEventListener("click", function () {
          setActive(index);
          restart();
        });
        dotsRoot.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setActive(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setActive(current + 1);
        restart();
      });
    }

    setActive(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var search = panel.querySelector("[data-filter-search]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var reset = panel.querySelector("[data-filter-reset]");
      var count = panel.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && search) {
        search.value = query;
      }

      function applyFilter() {
        var keyword = normalize(search && search.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year,
            card.textContent
          ].join(" "));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            matched = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            matched = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            matched = false;
          }

          card.classList.toggle("hidden-by-filter", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) search.value = "";
          if (type) type.value = "";
          if (region) region.value = "";
          if (year) year.value = "";
          applyFilter();
        });
      }

      applyFilter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var start = player.querySelector("[data-player-start]");
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function playVideo() {
        var source = video.dataset.src;

        if (!source) {
          return;
        }

        player.classList.add("is-playing");

        if (video.dataset.ready === "true") {
          video.play().catch(function () {});
          return;
        }

        video.dataset.ready = "true";

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              video.src = source;
              video.play().catch(function () {});
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (start) {
        start.addEventListener("click", playVideo);
      }

      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        playVideo();
      });
    });
  }

  ready(function () {
    initMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });
})();
