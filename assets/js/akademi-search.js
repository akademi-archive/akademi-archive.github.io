/* Akademi archive — filter the index in place.
   54 pieces is small enough to filter live in the DOM, so there's no index to
   fetch and no dropdown to fight: the grid itself is the result set. */
(function () {
  var grid = document.querySelector('.ak-grid');
  var input = document.getElementById('search-input');
  if (!grid || !input) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.ak-card'));
  var count = document.querySelector('.ak-count');
  var empty = document.querySelector('.ak-empty');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.ak-chip'));
  var clear = document.querySelector('.ak-clear');
  var xBtn = document.querySelector('.ak-x');
  var activeCat = '';

  cards.forEach(function (c) {
    c.dataset.haystack = (c.dataset.search || '').toLowerCase();
    c.dataset.wasLead = c.classList.contains('is-lead') ? '1' : '';
  });

  function norm(s) {
    // fold accents and curly quotes so "Ambedkar" matches "Āmbedkar", etc.
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  }

  function apply() {
    var terms = norm(input.value).split(/\s+/).filter(Boolean);
    var shown = 0;

    cards.forEach(function (card) {
      var hay = norm(card.dataset.haystack);
      var okText = terms.every(function (t) { return hay.indexOf(t) !== -1; });
      var okCat = !activeCat || card.dataset.category === activeCat;
      var show = okText && okCat;
      card.hidden = !show;
      if (show) shown++;
      // the wide lead slot only makes sense in the unfiltered view
      card.classList.toggle('is-lead', !!card.dataset.wasLead && !terms.length && !activeCat);
    });

    if (count) {
      count.textContent = (terms.length || activeCat)
        ? shown + ' of ' + cards.length
        : cards.length + ' pieces';
    }
    if (empty) empty.hidden = shown !== 0;
    if (clear) clear.hidden = !input.value && !activeCat;
    if (xBtn) xBtn.hidden = !input.value;
  }

  function reset() {
    input.value = '';
    activeCat = '';
    chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    apply();
  }

  input.addEventListener('input', apply);
  if (xBtn) xBtn.addEventListener('click', function () { reset(); input.focus(); });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.dataset.cat || '';
      activeCat = (activeCat === cat) ? '' : cat;
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.dataset.cat === activeCat && activeCat !== ''));
      });
      apply();
    });
  });

  if (clear) clear.addEventListener('click', function () { reset(); input.focus(); });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); input.focus(); input.select(); }
    if (e.key === 'Escape' && typing) { reset(); input.blur(); }
  });

  apply();
})();
