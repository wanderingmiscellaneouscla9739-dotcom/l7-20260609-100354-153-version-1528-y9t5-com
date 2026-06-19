(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      setHero(index);
    });
  });

  startHero();

  var queryInput = document.querySelector('[data-query-input]');
  var localSearchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';

  function paramsKeyword() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    var keyword = '';

    localSearchInputs.forEach(function (input) {
      if (input.value.trim()) {
        keyword = input.value.trim().toLowerCase();
      }
    });

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchesKeyword && matchesFilter));
    });
  }

  var keyword = paramsKeyword();

  if (keyword && queryInput) {
    queryInput.value = keyword;
  }

  localSearchInputs.forEach(function (input) {
    if (keyword && !input.value) {
      input.value = keyword;
    }

    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || '';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applyFilter();
    });
  });

  var clearButton = document.querySelector('[data-clear-search]');

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      localSearchInputs.forEach(function (input) {
        input.value = '';
      });
      applyFilter();
    });
  }

  applyFilter();
}());
