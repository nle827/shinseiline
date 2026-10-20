/* ============================================================
   SHINSEI LINE — Homepage Animations
   shinsei-home.js
   Hero subline, line selector, city clocks, card galleries
   ============================================================ */

(function () {
  'use strict';

  /* ── Hero subline ────────────────────────────────────────── */

  /**
   * Flip-up the hero subline segments one by one.
   * Splits on " / " and animates each part with a stagger.
   */
  function animateSubline(sublineEl, delay) {
    if (!sublineEl) return;
    const text = sublineEl.textContent.trim();
    sublineEl.textContent = '';

    [...text].forEach((char, i) => {
      const seg = document.createElement('span');
      seg.className = 'hero-subline-seg';
      seg.textContent = char === ' ' ? '\u00A0' : char;
      sublineEl.appendChild(seg);

      setTimeout(() => {
        seg.classList.add('visible');
      }, delay + i * 17);
    });
  }

  /* ── Line Selector ───────────────────────────────────────── */

  /**
   * Data for each line. Locked lines have no img/name/sub.
   * The HTML data-* attributes are the source of truth for active lines.
   */
  function initLineSelector() {
    const selector = document.querySelector('.line-selector');
    if (!selector) return;

    const nodes    = selector.querySelectorAll('.ls-node:not([disabled])');
    const hero     = document.querySelector('.home-page .hero');
    const heading  = document.querySelector('.hero-heading');
    const subline  = document.querySelector('.hero-subline');
    const trackFill = selector.querySelector('.ls-track-fill');
    const track    = selector.querySelector('.ls-track');

    // Position the track fill to the currently active node
    function updateTrackFill(activeNode) {
      if (!track || !trackFill || !activeNode) return;
      const trackRect   = track.getBoundingClientRect();
      const nodeRect    = activeNode.getBoundingClientRect();
      const nodeCenterX = nodeRect.left + nodeRect.width / 2;
      const pct = ((nodeCenterX - trackRect.left) / trackRect.width) * 100;
      trackFill.style.width = pct + '%';
    }

    // Switch the hero content to the selected node
    function selectNode(node) {
      // Update active classes
      selector.querySelectorAll('.ls-node').forEach(n => {
        n.classList.remove('ls-node--active');
        n.setAttribute('aria-selected', 'false');
        const ring = n.querySelector('.ls-node-ring');
        if (ring) ring.remove();
      });

      node.classList.add('ls-node--active');
      node.setAttribute('aria-selected', 'true');

      // Re-add pulse ring to newly active node
      if (!node.querySelector('.ls-node-ring')) {
        const ring = document.createElement('div');
        ring.className = 'ls-node-ring';
        ring.setAttribute('aria-hidden', 'true');
        const dot = node.querySelector('.ls-node-dot');
        if (dot) dot.parentNode.insertBefore(ring, dot);
        else node.insertBefore(ring, node.firstChild);
      }

      // Fill chevrons up to and including the selected node's position
      const allItems = Array.from(selector.querySelectorAll('.ls-node, .ls-chevron'));
      const selectedIdx = allItems.indexOf(node);
      allItems.forEach((el, i) => {
        if (el.classList.contains('ls-chevron')) {
          el.classList.toggle('ls-chevron--filled', i < selectedIdx);
        }
      });

      // Update hero background image
      const img = node.dataset.hero || node.dataset.img;
      if (hero) {
        if (img) {
          hero.style.setProperty('--hero-img', `url('${img}')`);
          hero.dataset.lineImg = img;
          updateHeroBackground(img);
        } else {
          updateHeroBackground(null);
        }
        // Update mobile portrait image
        const mobileImg = hero.querySelector('.hero-mobile-img');
        const mobileSrc = node.dataset.heroMobile || img;
        if (mobileImg && mobileSrc) mobileImg.src = mobileSrc;
      }

      // Update overlay text
      const name = node.dataset.name;
      const sub  = node.dataset.sub;
      if (heading) heading.textContent = name || '———';
      if (subline) {
        subline.textContent = sub || '';
        animateSubline(subline, 0);
      }

      // Animate overlay text
      const overlayText = document.querySelector('.hero-overlay-text');
      if (overlayText) {
        overlayText.classList.remove('visible');
        void overlayText.offsetWidth; // reflow to restart animation
        overlayText.classList.add('visible');
      }

      // Update track fill
      updateTrackFill(node);
    }

    // Update the hero ::before background via an injected <style> tag
    let heroStyleTag = document.getElementById('hero-bg-style');
    if (!heroStyleTag) {
      heroStyleTag = document.createElement('style');
      heroStyleTag.id = 'hero-bg-style';
      document.head.appendChild(heroStyleTag);
    }

    function updateHeroBackground(imgSrc) {
      if (imgSrc) {
        heroStyleTag.textContent = `.home-page .hero::before { background-image: url('${imgSrc}'); }`;
      } else {
        heroStyleTag.textContent = `.home-page .hero::before { background: #111; }`;
      }
    }

    // Bind click on unlocked nodes
    nodes.forEach(node => {
      node.addEventListener('click', () => {
        resetAutoPlay();
        selectNode(node);
      });
    });

    // Auto-cycle: advance to next unlocked node every 5 seconds
    const unlocked = () => Array.from(selector.querySelectorAll('.ls-node:not([disabled])'));
    let autoTimer = null;
    function scheduleAutoPlay() {
      autoTimer = setTimeout(function tick() {
        const all = unlocked();
        const idx = all.indexOf(selector.querySelector('.ls-node--active'));
        const next = all[(idx + 1) % all.length];
        selectNode(next);
        autoTimer = setTimeout(tick, 5000);
      }, 5000);
    }
    function resetAutoPlay() {
      clearTimeout(autoTimer);
      scheduleAutoPlay();
    }
    scheduleAutoPlay();

    // Hero drag / swipe to cycle images (mouse + touch via Pointer Events)
    if (hero) {
      let startX = 0;
      let startY = 0;
      let isDragging = false;

      hero.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
        hero.classList.add('dragging');
        hero.setPointerCapture(e.pointerId);
      });

      hero.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        // Cancel drag if primarily vertical (allow page scroll)
        if (Math.abs(e.clientY - startY) > Math.abs(e.clientX - startX) + 10) {
          isDragging = false;
          hero.classList.remove('dragging');
          hero.releasePointerCapture(e.pointerId);
        }
      });

      hero.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        hero.classList.remove('dragging');
        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) < 40) return; // too small, treat as click
        const allNodes = Array.from(selector.querySelectorAll('.ls-node:not([disabled])'));
        const currentActive = selector.querySelector('.ls-node--active');
        const idx = allNodes.indexOf(currentActive);
        if (deltaX < 0 && idx < allNodes.length - 1) {
          resetAutoPlay();
          selectNode(allNodes[idx + 1]); // swipe left → next
        } else if (deltaX > 0 && idx > 0) {
          resetAutoPlay();
          selectNode(allNodes[idx - 1]); // swipe right → prev
        }
      });

      hero.addEventListener('pointercancel', () => {
        isDragging = false;
        hero.classList.remove('dragging');
      });
    }

    // Set initial track fill after layout and trigger LINE 01 selection
    requestAnimationFrame(() => {
      const active = selector.querySelector('.ls-node--active');
      if (active) {
        // Trigger full selection so hero text appears immediately
        selectNode(active);
      }
    });

    // Re-calculate on resize
    window.addEventListener('resize', () => {
      const active = selector.querySelector('.ls-node--active');
      updateTrackFill(active);
    });
  }

  /* ── City Clocks ─────────────────────────────────────────── */

  function rotatePt(cx, cy, angle, px, py) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return {
      x: cos * (px - cx) - sin * (py - cy) + cx,
      y: sin * (px - cx) + cos * (py - cy) + cy,
    };
  }

  function setHand(svg, cls, angleDeg) {
    const hand = svg.querySelector(cls);
    if (!hand) return;
    // Get the fixed tip point from the SVG attribute, rotate around centre (24,24)
    const x2 = parseFloat(hand.getAttribute('x2'));
    const y2 = parseFloat(hand.getAttribute('y2'));
    const tip = rotatePt(24, 24, angleDeg, x2, y2);
    hand.setAttribute('x2', tip.x);
    hand.setAttribute('y2', tip.y);
  }

  function updateClock(clockEl, timezone) {
    const svg = clockEl.querySelector('.clock-face');
    const dateEl = clockEl.querySelector('.city-clock-date');
    if (!svg) return;

    const now = new Date();
    const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

    const h = local.getHours() % 12;
    const m = local.getMinutes();
    const s = local.getSeconds();

    const hAngle = (h / 12) * 360 + (m / 60) * 30;
    const mAngle = (m / 60) * 360 + (s / 60) * 6;
    const sAngle = (s / 60) * 360;

    // Reset hands to 12 o'clock before rotating
    const hands = svg.querySelectorAll('.clock-hand-h, .clock-hand-m, .clock-hand-s');
    hands.forEach(hand => {
      const origX2 = hand.dataset.origX2 || hand.getAttribute('x2');
      const origY2 = hand.dataset.origY2 || hand.getAttribute('y2');
      // Store original positions
      if (!hand.dataset.origX2) {
        hand.dataset.origX2 = origX2;
        hand.dataset.origY2 = origY2;
      }
      hand.setAttribute('x2', hand.dataset.origX2);
      hand.setAttribute('y2', hand.dataset.origY2);
    });

    setHand(svg, '.clock-hand-h', hAngle);
    setHand(svg, '.clock-hand-m', mAngle);
    setHand(svg, '.clock-hand-s', sAngle);

    // Date string
    if (dateEl) {
      const day = local.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' }).toUpperCase();
      const date = local.toLocaleDateString('en-US', { timeZone: timezone, month: '2-digit', day: '2-digit' });
      dateEl.textContent = `${day} ${date}`;
    }

    // Time string
    const timeEl = clockEl.querySelector('.city-clock-time');
    if (timeEl) {
      const hh = String(local.getHours()).padStart(2, '0');
      const mm = String(local.getMinutes()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}`;
    }
  }

  function initCityClocks() {
    const clocks = [
      { el: document.getElementById('clock-los'), tz: 'America/Los_Angeles' },
      { el: document.getElementById('clock-tyo'), tz: 'Asia/Tokyo' },
    ];

    function tick() {
      clocks.forEach(({ el, tz }) => { if (el) updateClock(el, tz); });
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ── Card galleries ──────────────────────────────────────── */

  function initCardGalleries() {
    document.querySelectorAll('.card-gallery').forEach(gallery => {
      const imgs = gallery.querySelectorAll('.card-gallery-img');
      const nodes = gallery.querySelectorAll('.card-gallery-node');
      if (imgs.length < 2) return;

      function goTo(index) {
        imgs.forEach((img, i) => {
          img.classList.toggle('card-gallery-img--active', i === index);
        });
        nodes.forEach((n, i) => n.classList.toggle('card-gallery-node--active', i === index));
        gallery.dataset.current = index;
      }

      // Node dot click — direct jump
      nodes.forEach(node => {
        node.addEventListener('click', e => {
          e.stopPropagation();
          goTo(parseInt(node.dataset.index));
        });
      });

      // Prevent browser native drag on the anchor/images
      gallery.addEventListener('dragstart', e => e.preventDefault());

      // Unified pointer drag — works from anywhere on the tile
      let startX = null;
      let startY = null;
      let moved = false;
      let wasSwiped = false;

      gallery.addEventListener('pointerdown', e => {
        startX = e.clientX;
        startY = e.clientY;
        moved = false;
        gallery.setPointerCapture(e.pointerId);
      });

      gallery.addEventListener('pointermove', e => {
        if (startX === null) return;
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
          moved = true;
          e.preventDefault();
        }
      });

      gallery.addEventListener('click', e => {
        if (wasSwiped) { e.preventDefault(); wasSwiped = false; }
      });

      gallery.addEventListener('pointerup', e => {
        if (startX === null) return;
        const delta = e.clientX - startX;
        const current = parseInt(gallery.dataset.current || 0);
        const total = imgs.length;

        if (Math.abs(delta) > 30) {
          // Drag/swipe — switch image
          e.preventDefault();
          wasSwiped = true;
          const next = delta < 0
            ? (current + 1) % total
            : (current - 1 + total) % total;
          goTo(next);
        } else if (!moved) {
          // Clean tap/click — navigate to product
          const link = gallery.closest('.line-card').querySelector('.line-card-cta[href]');
          if (link) window.location.href = link.href;
        }

        startX = null;
        startY = null;
        moved = false;
      });

      gallery.addEventListener('pointercancel', () => {
        startX = null; startY = null; moved = false;
      });
    });
  }

  // LINE 01 drop-window CTA — swaps the server-rendered PREVIEW/VIEW NOW
  // default for the phase-accurate label (FIRST ACCESS, DEPARTED) once JS
  // can resolve the real phase. Uses the shared helpers from
  // shinsei-global.js, which loads before this file.
  function applyDropPhaseToHomeCard() {
    const cta = document.getElementById('line-card-cta-kagemi');
    if (!cta) return;
    const data = readDropPhaseData();
    if (!data) return;
    const labels = { pre: 'PREVIEW', early: 'FIRST ACCESS', public: 'VIEW NOW', closed: 'DEPARTED' };
    const label = labels[getDropPhase(data)];
    if (label) cta.textContent = label;
  }

  function init() {
    // Only run on the homepage
    if (!document.body.classList.contains('home-page')) return;

    // Line selector
    initLineSelector();

    // City clocks
    initCityClocks();

    // Card galleries
    initCardGalleries();

    // LINE 01 drop-window CTA
    applyDropPhaseToHomeCard();

    // Subline flip-up on load
    const subline = document.querySelector('.hero-subline');
    animateSubline(subline, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
