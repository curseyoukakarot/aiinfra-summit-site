/* Site customizations layered on top of the Webflow export.
   Currently: the Programming section's agenda slideshow
   (drag-to-scroll + click-to-zoom). No dependencies. */
(function () {
  var slider = document.querySelector('[data-evo="slider"]');
  if (!slider) return;

  /* --- drag to scroll (pointer events cover mouse + touch) --- */
  var down = false;
  var moved = 0;
  var startX = 0;
  var startLeft = 0;

  slider.addEventListener('pointerdown', function (e) {
    down = true;
    moved = 0;
    startX = e.clientX;
    startLeft = slider.scrollLeft;
    slider.classList.add('is-dragging');
  });

  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 5) slider.scrollLeft = startLeft - dx;
  });

  window.addEventListener('pointerup', function () {
    down = false;
    slider.classList.remove('is-dragging');
  });

  /* wheel: vertical scrolls become horizontal inside the slider */
  slider.addEventListener(
    'wheel',
    function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        slider.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    { passive: false }
  );

  /* --- click / keyboard to zoom --- */
  var zoom = document.createElement('div');
  zoom.className = 'c-evo__zoom';
  zoom.innerHTML = '<button class="c-evo__zoom__close" aria-label="Close">[ Close ]</button>';
  var closeBtn = zoom.firstChild;
  var zoomCard = null;
  document.body.appendChild(zoom);

  function openZoom(slide) {
    if (zoomCard) zoom.removeChild(zoomCard);
    zoomCard = slide.cloneNode(true);
    zoomCard.removeAttribute('tabindex');
    zoomCard.removeAttribute('role');
    zoom.appendChild(zoomCard);
    zoom.classList.add('is-active');
    closeBtn.focus();
  }

  function closeZoom() {
    zoom.classList.remove('is-active');
  }

  slider.querySelectorAll('[data-evo="slide"]').forEach(function (slide) {
    slide.addEventListener('click', function () {
      if (moved > 5) return; /* it was a drag, not a click */
      openZoom(slide);
    });
    slide.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openZoom(slide);
      }
    });
  });

  zoom.addEventListener('click', function (e) {
    if (e.target === zoom || e.target === closeBtn) closeZoom();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeZoom();
  });
})();
