/* ============================================================
   SHINSEI LINE — Homepage Animations
   shinsei-home.js
   Split-flap text, page load sequence, pulse ring
   ============================================================ */

(function () {
  'use strict';

  /* ── Split-Flap Text ─────────────────────────────────────── */

  const PHRASES = [
    'SHINSEI LINE — SS26',
    'LINE 01 / NOW AVAILABLE',
    '30 UNITS / ACCESS OPEN',
    '新生線 / THE LINE RUNS BENEATH',
    'DESTINATION / [REDACTED]',
  ];

  // Characters used during the flip scramble
  const FLIP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789—/·';

  // Characters that should never flip (spaces, punctuation we want stable)
  const SKIP_CHARS = new Set([' ']);

  function randomChar() {
    return FLIP_CHARS[Math.floor(Math.random() * FLIP_CHARS.length)];
  }

  /**
   * Render a phrase into the target element with split-flap animation.
   * Characters stagger left to right, each flipping through random glyphs
   * for a short duration before landing on the real character.
   */
  function splitFlap(el, phrase, onComplete) {
    el.textContent = '';

    // Build an array of <span> elements for each character position
    const spans = [];
    for (let i = 0; i < phrase.length; i++) {
      const span = document.createElement('span');
      span.textContent = SKIP_CHARS.has(phrase[i]) ? '\u00A0' : randomChar();
      spans.push(span);
      el.appendChild(span);
    }

    const FLIP_DURATION = 55;   // ms between each random character
    const FLIPS_PER_CHAR = 6;   // number of random chars before landing
    const STAGGER = 30;         // ms delay between each char starting

    let completed = 0;

    spans.forEach((span, i) => {
      const target = phrase[i];

      if (SKIP_CHARS.has(target)) {
        // Space — no flipping needed
        completed++;
        if (completed === spans.length && onComplete) onComplete();
        return;
      }

      let flips = 0;
      const delay = i * STAGGER;

      setTimeout(() => {
        const interval = setInterval(() => {
          flips++;
          if (flips >= FLIPS_PER_CHAR) {
            clearInterval(interval);

            // Apply [REDACTED] colour in line-01 blue
            if (phrase.includes('[REDACTED]') && target === '[') {
              // Mark entire [REDACTED] token — handled below
            }

            span.textContent = target;

            // Colour [REDACTED] blue after all chars land
            completed++;
            if (completed === spans.length) {
              styleRedacted(el, phrase);
              if (onComplete) onComplete();
            }
          } else {
            span.textContent = randomChar();
          }
        }, FLIP_DURATION);
      }, delay);
    });
  }

  /**
   * After the phrase lands, find [REDACTED] and wrap it in a coloured span.
   */
  function styleRedacted(el, phrase) {
    if (!phrase.includes('[REDACTED]')) return;
    const html = el.innerHTML;
    const parts = html.split('');
    // Rebuild from textContent approach — simpler: just re-render the colored version
    const raw = el.textContent;
    if (!raw.includes('[REDACTED]')) return;
    // Replace with coloured version directly via innerHTML (safe — no user input)
    el.innerHTML = raw.replace(
      '[REDACTED]',
      '<span style="color:#111111;font-weight:400">[REDACTED]</span>'
    );
  }

  /**
   * Cycle through PHRASES with a 4-second hold between each phrase.
   */
  function startSplitFlap(el) {
    let index = 0;

    function next() {
      splitFlap(el, PHRASES[index], () => {
        index = (index + 1) % PHRASES.length;
        setTimeout(next, 4000);
      });
    }

    next();
  }

  /* ── Page Load Sequence ──────────────────────────────────── */

  /**
   * Each map-line gets a stroke-dasharray equal to its length
   * and then draws in via CSS animation.
   */
  function measureAndDrawLines(svg) {
    const lines = svg.querySelectorAll('.map-line');
    lines.forEach((line, i) => {
      const length = line.getTotalLength ? line.getTotalLength() : 500;
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      // Stagger slightly from center outward — simple sequential stagger
      const delay = i * 40;
      setTimeout(() => {
        line.style.transition = `stroke-dashoffset 900ms ease-out`;
        line.style.strokeDashoffset = '0';
      }, delay);
    });
  }

  /**
   * Fade in map nodes sequentially.
   */
  function fadeInNodes(svg, delayStart) {
    const nodes = svg.querySelectorAll('.map-node');
    nodes.forEach((node, i) => {
      setTimeout(() => {
        node.classList.add('visible');
      }, delayStart + i * 60);
    });
  }

  /**
   * Slide in LINE 01 tag.
   */
  function revealLine01Tag(svg, delay) {
    setTimeout(() => {
      const tag = svg.querySelector('.line01-btn');
      const connector = svg.querySelector('.line01-tag-connector');
      if (tag) tag.classList.add('visible');
      if (connector) connector.classList.add('visible');
    }, delay);
  }

  /**
   * Fade in locked tags and connectors.
   */
  function revealLockedTags(svg, delay) {
    setTimeout(() => {
      svg.querySelectorAll('.map-locked-connector, .map-locked-tag, .map-tag-text').forEach(el => {
        el.classList.add('visible');
      });
    }, delay);
  }

  /**
   * Fade in coordinate annotations.
   */
  function revealAnnotations(delay) {
    setTimeout(() => {
      document.querySelectorAll('.map-annotation').forEach((el, i) => {
        el.style.transition = `opacity 400ms ease-out ${i * 80}ms`;
        el.style.opacity = '1';
      });
    }, delay);
  }

  /**
   * Fade in the hero image column.
   */
  function revealHeroImage(delay) {
    setTimeout(() => {
      const col = document.querySelector('.hero-image-col');
      if (col) col.classList.add('visible');
    }, delay);
  }

  /**
   * Fade in the overlay text on the hero image.
   */
  function revealOverlayText(delay) {
    setTimeout(() => {
      const text = document.querySelector('.hero-overlay-text');
      if (text) text.classList.add('visible');
    }, delay);
  }

  /**
   * Start the continuous pulse on the LINE 01 node after the
   * page load sequence completes.
   */
  function startNodePulse(svg, delay) {
    setTimeout(() => {
      const ring = svg.querySelector('.node-pulse-ring');
      if (ring) ring.classList.add('pulsing');
    }, delay);
  }

  /**
   * Main page load orchestrator.
   *
   * Timeline (ms):
   *   0    — begin drawing map lines
   *   400  — hero image fades in
   *   900  — lines complete → nodes begin fading in (60ms stagger each ~12 nodes = 720ms)
   *   1100 — LINE 01 tag slides in
   *   1400 — locked tags fade in
   *   1600 — annotations fade in
   *   1000 — overlay text fades up
   *   2000 — pulse ring starts
   */
  function runPageLoadSequence() {
    const svg = document.querySelector('.transit-map-svg');
    if (!svg) return;

    // Step 1: Draw SVG lines
    measureAndDrawLines(svg);

    // Step 2: Map nodes
    fadeInNodes(svg, 900);

    // Step 3: LINE 01 tag
    revealLine01Tag(svg, 1100);

    // Step 4: Locked tags
    revealLockedTags(svg, 1400);

    // Step 5: Annotations
    revealAnnotations(1600);

    // Step 6: Hero image (starts slightly earlier so both sides "arrive" together)
    revealHeroImage(400);

    // Step 7: Overlay text
    revealOverlayText(1000);

    // Step 8: Pulse ring
    startNodePulse(svg, 2000);
  }

  /* ── Hover behaviours ────────────────────────────────────── */

  /**
   * Locked nodes: on hover over the locked card region,
   * shift tag borders from #C0BDB8 to #8A8A8A.
   */
  function bindLockedNodeHover() {
    const svg = document.querySelector('.transit-map-svg');
    if (!svg) return;
    const lockedNodes = svg.querySelectorAll('.map-node--locked');
    lockedNodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        // Find adjacent locked tag — the next <rect> siblings in the SVG
        const parent = node.parentElement;
        parent.querySelectorAll('.map-locked-tag').forEach(tag => {
          tag.setAttribute('stroke', '#8A8A8A');
        });
      });
      node.addEventListener('mouseleave', () => {
        const parent = node.parentElement;
        parent.querySelectorAll('.map-locked-tag').forEach(tag => {
          tag.setAttribute('stroke', '#C0BDB8');
        });
      });
    });
  }

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
          // Update the ::before via a class swap or inline style on the element
          // We use a data attribute and update CSS via dynamic style
          hero.dataset.lineImg = img;
          updateHeroBackground(img);
        } else {
          updateHeroBackground(null);
        }
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
      node.addEventListener('click', () => selectNode(node));
    });

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

  /* ── Init ────────────────────────────────────────────────── */

  /* ── PDP scroll-driven gallery ───────────────────────────── */

  function initPDPGallery() {
    const track = document.querySelector('.pdp-gallery-track');
    const gallery = document.querySelector('.pdp-gallery');
    if (!track || !gallery) return;

    const slides = gallery.querySelectorAll('.pdp-slide');
    const nodes = gallery.querySelectorAll('.pdp-indicator-node');
    if (slides.length < 1) return;

    // Set the track height so scroll space = n images × viewport
    const headerH = 96;
    const viewH = window.innerHeight - headerH;
    track.style.height = (slides.length * window.innerHeight) + 'px';

    function goTo(index) {
      slides.forEach((s, i) => {
        s.classList.toggle('pdp-slide--active', i === index);
        s.style.position = i === index ? 'relative' : 'absolute';
      });
      nodes.forEach((n, i) => n.classList.toggle('pdp-indicator-node--active', i === index));
    }

    // Init absolute positions
    slides.forEach((s, i) => { s.style.position = i === 0 ? 'relative' : 'absolute'; });

    function onScroll() {
      const rect = track.getBoundingClientRect();
      const scrolled = -rect.top;
      const segH = window.innerHeight;
      const index = Math.min(slides.length - 1, Math.max(0, Math.floor(scrolled / segH)));
      goTo(index);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      track.style.height = (slides.length * window.innerHeight) + 'px';
    });
    onScroll();
  }

  function initCardGalleries() {
    document.querySelectorAll('.card-gallery').forEach(gallery => {
      const imgs = gallery.querySelectorAll('.card-gallery-img');
      const nodes = gallery.querySelectorAll('.card-gallery-node');
      if (imgs.length < 2) return;

      function goTo(index) {
        imgs.forEach((img, i) => {
          img.classList.toggle('card-gallery-img--active', i === index);
          img.style.position = i === index ? 'relative' : 'absolute';
        });
        nodes.forEach((n, i) => n.classList.toggle('card-gallery-node--active', i === index));
        gallery.dataset.current = index;
      }

      // Init positions
      imgs.forEach((img, i) => {
        img.style.position = i === 0 ? 'relative' : 'absolute';
      });

      // Node dot click — direct jump
      nodes.forEach(node => {
        node.addEventListener('click', e => {
          e.stopPropagation();
          goTo(parseInt(node.dataset.index));
        });
      });

      // Unified pointer drag — works from anywhere on the tile
      let startX = null;
      let startY = null;
      let moved = false;

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
        }
      });

      gallery.addEventListener('pointerup', e => {
        if (startX === null) return;
        const delta = e.clientX - startX;
        const current = parseInt(gallery.dataset.current || 0);
        const total = imgs.length;

        if (Math.abs(delta) > 30) {
          // Drag/swipe — switch image
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

  function init() {
    // Only run on the homepage
    if (!document.body.classList.contains('home-page')) return;

    // Split-flap
    const sfTarget = document.getElementById('split-flap-target');
    if (sfTarget) {
      // Small delay so the editorial statement is visible first
      setTimeout(() => startSplitFlap(sfTarget), 200);
    }

    // Page load sequence
    runPageLoadSequence();

    // Hover behaviours
    bindLockedNodeHover();

    // Line selector
    initLineSelector();

    // City clocks
    initCityClocks();

    // Card galleries
    initCardGalleries();

    // PDP scroll gallery
    initPDPGallery();

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
