/* ══════════════════════════════════════════════════
   DAMIAN MATTHEEUW — script.js
   Stack: GSAP + ScrollTrigger + ScrollSmoother +
          SplitText + ScrambleText + DrawSVG + MorphSVG +
          Flip + MotionPath + Observer + Inertia + Physics2D +
          CustomEase + CustomBounce + CustomWiggle + EasePack
══════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;

  /* Register every plugin we'll use */
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Flip,
    MotionPathPlugin,
    Observer,
    InertiaPlugin,
    Physics2DPlugin,
    CustomEase,
    CustomBounce,
    CustomWiggle,
    TextPlugin
  );

  /* ── CUSTOM EASES ─────────────────────────────── */
  CustomEase.create('bloom',  'M0,0 C0.04,0 0.1,0.08 0.18,0.26 0.38,0.82 0.58,1 1,1');
  CustomEase.create('wipe',   'M0,0 C0.16,0 0.24,0.14 0.36,0.52 0.56,0.96 0.72,1 1,1');
  CustomEase.create('snappy', 'M0,0 C0.2,0 0.05,1 1,1');
  CustomBounce.create('softBounce', { strength: 0.55, squash: 1.4, squashID: 'softBounce-squash' });
  CustomWiggle.create('hoverWiggle', { wiggles: 6, type: 'easeOut' });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ════════════════════════════════════════════════
     SCROLLSMOOTHER
  ════════════════════════════════════════════════ */
  let smoother = null;
  if (!reduceMotion && document.getElementById('smooth-wrapper')) {
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth:  1.2,
      effects: true,
      smoothTouch: 0.1,
      normalizeScroll: true,
    });
  }

  /* Anchor links — use ScrollSmoother.scrollTo */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target && smoother) {
        e.preventDefault();
        smoother.scrollTo(target, true, 'top top+=20');
      }
    });
  });

  /* ════════════════════════════════════════════════
     LOADER
  ════════════════════════════════════════════════ */
  (function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    if (smoother) smoother.paused(true);

    const counter = loader.querySelector('[data-counter]');
    const obj = { val: 0 };

    gsap.timeline({
      onComplete() {
        gsap.to(loader, {
          yPercent: -100, duration: 1.0, ease: 'wipe',
          onComplete() {
            loader.remove();
            if (smoother) smoother.paused(false);
            ScrollTrigger.refresh();
            startHero();
          },
        });
      },
    })
    .to(obj, {
      val: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => { if (counter) counter.textContent = Math.round(obj.val); },
    })
    .to('.loader-mark', {
      scrambleText: { text: 'DM', chars: 'upperAndLowerCase', speed: 0.8 },
      duration: 1.2,
    }, 0);
  })();

  /* ════════════════════════════════════════════════
     SCRAMBLE-ON-HOVER
  ════════════════════════════════════════════════ */
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    /* If element has child <span data-scramble> targets, skip the parent */
    if (el.children.length > 0 && [...el.children].some(c => c.hasAttribute('data-scramble'))) return;

    const original = el.textContent;
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        duration: 0.7,
        scrambleText: {
          text: original,
          chars: 'upperCase',
          revealDelay: 0.1,
          speed: 0.6,
          tweenLength: false,
        },
      });
    });
  });

  /* ════════════════════════════════════════════════
     EYEBROWS — slide in
  ════════════════════════════════════════════════ */
  document.querySelectorAll('[data-reveal-eyebrow]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  /* ════════════════════════════════════════════════
     FLOW FIELD
  ════════════════════════════════════════════════ */
  (function initFlowField() {
    if (reduceMotion) return;
    const canvas = document.getElementById('flow');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    let W, H, dpr;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr;  canvas.height = H * dpr;
      canvas.style.width = W + 'px';  canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#f0ead6';
      ctx.fillRect(0, 0, W, H);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function flow(x, y, t) {
      const eps = 0.5;
      const fn = (px, py) =>
        Math.sin(px * 0.0018 + t * 0.6) * Math.cos(py * 0.0014 - t * 0.5) +
        Math.cos(px * 0.0011 - py * 0.0019 + t * 0.7) * 0.7 +
        Math.sin(px * 0.0007 + py * 0.0023 - t * 0.4) * 0.5;
      return {
        vx:  (fn(x, y + eps) - fn(x, y)) / eps,
        vy: -(fn(x + eps, y) - fn(x, y)) / eps,
      };
    }

    const COUNT = window.innerWidth < 700 ? 450 : 850;
    const particles = new Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      particles[i] = {
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        life: Math.random() * 400,
        pop: Math.random() < 0.14,
      };
    }

    const mouse = { x: -1000, y: -1000, active: false, influence: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.active = true; mouse.influence = 1;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
    window.addEventListener('blur',       () => { mouse.active = false; });

    let t = 0, running = true;
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });

    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      ctx.fillStyle = 'rgba(240, 234, 214, 0.055)';
      ctx.fillRect(0, 0, W, H);
      t += 0.0028;
      if (!mouse.active && mouse.influence > 0) {
        mouse.influence *= 0.985;
        if (mouse.influence < 0.005) mouse.influence = 0;
      }
      ctx.lineCap = 'round';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        const f = flow(p.x, p.y, t);
        p.vx += f.vx * 0.55;  p.vy += f.vy * 0.55;
        if (mouse.influence > 0.02) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const distSq = dx*dx + dy*dy;
          if (distSq < 40000 && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const strength = (1 - dist / 200) * mouse.influence * 4.0;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }
        }
        p.vx *= 0.92; p.vy *= 0.92;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 2.8) { const k = 2.8 / sp; p.vx *= k; p.vy *= k; }
        if (sp < 0.15) { p.vx += (Math.random()-0.5)*0.4; p.vy += (Math.random()-0.5)*0.4; }
        const ox = p.x, oy = p.y;
        p.x += p.vx; p.y += p.vy;
        let wrapped = false;
        if (p.x < -10) { p.x = W + 10; wrapped = true; }
        else if (p.x > W + 10) { p.x = -10; wrapped = true; }
        if (p.y < -10) { p.y = H + 10; wrapped = true; }
        else if (p.y > H + 10) { p.y = -10; wrapped = true; }
        p.life++;
        if (p.life > 1200) {
          p.x = Math.random() * W; p.y = Math.random() * H;
          p.vx = 0; p.vy = 0; p.life = 0;
          continue;
        }
        if (wrapped) continue;
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.pop ? 'rgba(157, 217, 64, 0.42)' : 'rgba(26, 18, 14, 0.18)';
        ctx.stroke();
      }
    }
    tick();
  })();

  /* ════════════════════════════════════════════════
     CURSOR — squash + stretch + section-aware color
  ════════════════════════════════════════════════ */
  (function initCursor() {
    if (innerWidth < 600) return;
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    const xDot  = gsap.quickTo(dot,  'x', { duration: 0.08, ease: 'power2.out' });
    const yDot  = gsap.quickTo(dot,  'y', { duration: 0.08, ease: 'power2.out' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power2.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power2.out' });

    let lastX = 0, lastY = 0, lastT = 0;
    window.addEventListener('mousemove', (e) => {
      xDot(e.clientX);  yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
      const now = performance.now();
      const dt  = Math.max(1, now - lastT);
      const vx  = (e.clientX - lastX) / dt;
      const vy  = (e.clientY - lastY) / dt;
      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx);
      const stretch = Math.min(speed * 8, 40);
      gsap.to(ring, {
        rotate: angle * 180 / Math.PI,
        scaleX: 1 + stretch * 0.012,
        scaleY: 1 - stretch * 0.005,
        duration: 0.18, ease: 'power2.out',
      });
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    }, { passive: true });

    document.querySelectorAll('[data-cursor="crosshair"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-crosshair'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-crosshair'));
    });
    document.querySelectorAll('[data-cursor="text"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
    });
    document.querySelectorAll('#reel, #footer').forEach((sec) => {
      sec.addEventListener('mouseenter', () => document.body.classList.add('cursor-dark'));
      sec.addEventListener('mouseleave', () => document.body.classList.remove('cursor-dark'));
    });

    document.addEventListener('mousedown', () => {
      gsap.to(ring, { scale: 0.7, duration: 0.12, ease: 'power2.out' });
    });
    document.addEventListener('mouseup', () => {
      gsap.to(ring, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)' });
    });
  })();

  /* ════════════════════════════════════════════════
     HERO INTRO TIMELINE
  ════════════════════════════════════════════════ */
  function startHero() {
    /* SplitText for brand */
    const brandSplit = new SplitText('.brand span', { type: 'chars' });

    const tl = gsap.timeline({ defaults: { ease: 'bloom' } });

    tl
      .from(brandSplit.chars, {
        yPercent: 120, opacity: 0,
        duration: 0.85, stagger: 0.025, ease: 'power3.out',
      })
      .from('.brand-mark', {
        opacity: 0, scale: 0.6, rotate: -25,
        duration: 0.6, ease: 'back.out(1.6)',
      }, '-=0.6')
      .from('.cta-pill', {
        opacity: 0, y: -10, scale: 0.92,
        duration: 0.55, ease: 'back.out(1.6)',
      }, '-=0.45')
      .from('.cta-square', {
        opacity: 0, scale: 0.9, duration: 0.4, ease: 'power3.out',
      }, '-=0.35')
      /* Veil wipe off the portrait */
      .to('.stage-veil', {
        scaleY: 0, duration: 1.2, ease: 'wipe',
      }, '-=0.55')
      .from('.stage-portrait img', {
        scale: 1.18, duration: 1.6, ease: 'power3.out',
      }, '-=1.2')
      .from('.next-card', {
        opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
      }, '-=1.0')
      /* Draw the SVG path inside the next-card icon */
      .from('#card-path', {
        drawSVG: '0%',
        duration: 1.2, ease: 'power2.inOut',
      }, '-=0.6')
      .from('#card-tick', {
        drawSVG: '0%',
        duration: 0.5, ease: 'power2.out',
      }, '-=0.3')
      .from('.status', {
        opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
      }, '-=1.1');

    /* Mouse tilt portrait */
    if (innerWidth > 900) {
      const portrait = document.querySelector('.stage-portrait');
      const stage    = document.querySelector('.stage');
      if (portrait && stage) {
        let mx = 0, my = 0, cx = 0, cy = 0;
        stage.addEventListener('mousemove', (e) => {
          const r = stage.getBoundingClientRect();
          mx = ((e.clientX - r.left) / r.width  - 0.5) * 14;
          my = ((e.clientY - r.top)  / r.height - 0.5) * 12;
        });
        stage.addEventListener('mouseleave', () => { mx = 0; my = 0; });
        (function loop() {
          requestAnimationFrame(loop);
          cx += (mx - cx) * 0.06;
          cy += (my - cy) * 0.06;
          portrait.style.transform =
            `perspective(1100px) rotateX(${-cy * 0.35}deg) rotateY(${cx * 0.35}deg) translate(${cx}px, ${cy}px)`;
        })();
      }
    }

    /* Wiggle the brand-mark on hover */
    const mark = document.querySelector('.brand-mark');
    if (mark) {
      mark.addEventListener('mouseenter', () => {
        gsap.fromTo(mark, { rotate: 0 },
          { rotate: 18, duration: 0.6, ease: 'hoverWiggle' });
      });
    }
  }

  /* ════════════════════════════════════════════════
     HEADLINE — SplitText line/char reveal
  ════════════════════════════════════════════════ */
  document.querySelectorAll('[data-split-line]').forEach((line) => {
    const split = new SplitText(line, { type: 'chars,words' });
    gsap.set(line, { perspective: 400 });
    gsap.from(split.chars, {
      yPercent: 120,
      opacity:  0,
      duration: 1.0,
      ease:     'wipe',
      stagger:  0.025,
      scrollTrigger: { trigger: line, start: 'top 80%', once: true },
    });
  });

  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const split = new SplitText(el, { type: 'words,lines', linesClass: 'split-line' });
    gsap.from(split.words, {
      opacity: 0, y: 24, duration: 0.7,
      stagger: 0.04, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    const split = new SplitText(el, { type: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, {
      yPercent: 110, opacity: 0,
      duration: 0.9, stagger: 0.08, ease: 'wipe',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  /* ════════════════════════════════════════════════
     SECTION TITLES (without data-split-line)
  ════════════════════════════════════════════════ */
  gsap.utils.toArray('.section-title').forEach((el) => {
    if (el.closest('[data-split-line]')) return;
    if (el.querySelector('[data-split-line]')) return;
    const split = new SplitText(el, { type: 'words,lines', linesClass: 'split-line' });
    gsap.from(split.words, {
      yPercent: 110, opacity: 0,
      duration: 0.9, stagger: 0.05, ease: 'wipe',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });

  /* ════════════════════════════════════════════════
     WORK — pinned cinema cascade
  ════════════════════════════════════════════════ */
  (function initWork() {
    const work  = document.getElementById('work');
    const stage = document.querySelector('.work-stage');
    if (!work || !stage) return;

    /* Mobile fallback */
    if (window.innerWidth < 1100) {
      gsap.utils.toArray('.work-pin').forEach((pin, i) => {
        gsap.from(pin, {
          opacity: 0, y: 50, duration: 0.9,
          ease: 'power3.out', delay: i * 0.05,
          scrollTrigger: { trigger: pin, start: 'top 88%', once: true },
        });
      });
      const titleSplit = new SplitText('.work-title', { type: 'chars' });
      gsap.from(titleSplit.chars, {
        yPercent: 110, opacity: 0,
        duration: 0.9, stagger: 0.04, ease: 'wipe',
        scrollTrigger: { trigger: '.work-title', start: 'top 80%', once: true },
      });
      return;
    }

    /* Desktop: pinned scrub timeline */
    const titleSplit = new SplitText('.work-title', { type: 'chars' });
    gsap.set(titleSplit.chars, { yPercent: 110, opacity: 0 });
    gsap.set('.pin-tl', { xPercent: -200, autoAlpha: 0, rotate: -2 });
    gsap.set('.pin-tr', { xPercent:  200, autoAlpha: 0, rotate:  2 });
    gsap.set('.pin-bl', { xPercent: -200, autoAlpha: 0, rotate: -2 });
    gsap.set('.pin-br', { xPercent:  200, autoAlpha: 0, rotate:  2 });

    const tl = gsap.timeline({
      defaults: { ease: 'wipe' },
      scrollTrigger: {
        trigger: '#work',
        start:   'top top',
        end:     '+=320%',
        pin:     '.work-stage',
        scrub:   0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl
      .to(titleSplit.chars, {
        yPercent: 0, opacity: 1,
        stagger: 0.05, duration: 1,
      }, 0)
      .to('.pin-tl', { xPercent: 0, autoAlpha: 1, rotate: 0, duration: 1.3 }, 0.8)
      .to('.pin-tr', { xPercent: 0, autoAlpha: 1, rotate: 0, duration: 1.3 }, 1.7)
      .to('.pin-bl', { xPercent: 0, autoAlpha: 1, rotate: 0, duration: 1.3 }, 2.6)
      .to('.pin-br', { xPercent: 0, autoAlpha: 1, rotate: 0, duration: 1.3 }, 3.5)
      .to('.work-title', { scale: 1.08, opacity: 0.55, duration: 1.2 }, 4.5);
  })();

  /* ════════════════════════════════════════════════
     REEL — clip wipe + marquee + button bounce
  ════════════════════════════════════════════════ */
  gsap.from('.reel-frame', {
    clipPath: 'inset(0% 50% 0% 50%)',
    duration: 1.4, ease: 'wipe',
    scrollTrigger: { trigger: '.reel-frame', start: 'top 75%', once: true },
  });
  gsap.from('.reel-play', {
    scale: 0, autoAlpha: 0,
    duration: 1.0,
    ease: 'softBounce',
    delay: 0.4,
    scrollTrigger: { trigger: '.reel-frame', start: 'top 75%', once: true },
  });
  /* Continuous reel marquee */
  gsap.to('.reel-marquee span', {
    xPercent: -100,
    repeat: -1,
    duration: 22,
    ease: 'none',
  });

  /* ════════════════════════════════════════════════
     ABOUT — veil wipe + photo parallax + amber rule
  ════════════════════════════════════════════════ */
  gsap.to('.about-veil', {
    scaleY: 0, duration: 1.2, ease: 'wipe',
    scrollTrigger: { trigger: '.about-photo', start: 'top 80%', once: true },
  });
  gsap.to('.js-parallax', {
    yPercent: -10, ease: 'none',
    scrollTrigger: {
      trigger: '.about-photo', start: 'top bottom', end: 'bottom top', scrub: true,
    },
  });
  gsap.to('.about-rule', {
    width: '100%', duration: 1.2, ease: 'wipe',
    scrollTrigger: { trigger: '.about-rule', start: 'top 88%', once: true },
  });
  gsap.from('#about .cta-link', {
    opacity: 0, y: 18, scale: 0.9,
    duration: 0.7, ease: 'softBounce',
    scrollTrigger: { trigger: '#about .cta-link', start: 'top 90%', once: true },
  });

  /* ════════════════════════════════════════════════
     STATS — counters + entry
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.count').forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const obj    = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); },
        });
      },
    });
  });
  gsap.utils.toArray('.stat').forEach((stat, i) => {
    gsap.from(stat, {
      opacity: 0, y: 26, duration: 0.85, ease: 'power3.out',
      delay: i * 0.1,
      scrollTrigger: { trigger: '#stats', start: 'top 78%', once: true },
    });
  });

  /* ════════════════════════════════════════════════
     CONTACT
  ════════════════════════════════════════════════ */
  gsap.from('.contact-sub', {
    opacity: 0, y: 20, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
  });
  gsap.from('.contact-email', {
    opacity: 0, y: 18, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 65%', once: true },
  });

  /* ════════════════════════════════════════════════
     MAGNETIC HOVER
  ════════════════════════════════════════════════ */
  if (innerWidth > 900) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        gsap.to(el, {
          x: (e.clientX - cx) * 0.28,
          y: (e.clientY - cy) * 0.28,
          duration: 0.5, ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ════════════════════════════════════════════════
     WORK PIN — hover lift with shine
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.work-pin').forEach((pin) => {
    const img = pin.querySelector('.pin-img');
    pin.addEventListener('mouseenter', () => {
      gsap.to(pin, { y: -10, duration: 0.5, ease: 'power3.out' });
      gsap.to(img, { rotate: gsap.utils.random(-1, 1, 0.5), duration: 0.5, ease: 'power3.out' });
    });
    pin.addEventListener('mouseleave', () => {
      gsap.to(pin, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      gsap.to(img, { rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });

  /* ════════════════════════════════════════════════
     REEL PLAY TOGGLE
  ════════════════════════════════════════════════ */
  (function initReel() {
    const btn   = document.getElementById('reel-play');
    const video = document.getElementById('reel-video');
    if (!btn || !video) return;
    btn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        gsap.to(btn, {
          opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.out',
          onComplete: () => { btn.style.pointerEvents = 'none'; },
        });
      } else {
        video.pause();
        btn.style.pointerEvents = 'auto';
        gsap.to(btn, { opacity: 1, scale: 1, duration: 0.4, ease: 'softBounce' });
      }
    });
  })();

  /* ════════════════════════════════════════════════
     OBSERVER — wheel-velocity nudge for hero portrait
     (a tiny detail — fast scroll bumps the portrait)
  ════════════════════════════════════════════════ */
  if (!reduceMotion && innerWidth > 900) {
    const portrait = document.querySelector('.stage-portrait');
    if (portrait) {
      Observer.create({
        target: window,
        type: 'wheel,touch',
        onChangeY: (self) => {
          const v = gsap.utils.clamp(-12, 12, self.deltaY * 0.04);
          gsap.to(portrait, {
            skewY: v * 0.4, y: v,
            duration: 0.4, ease: 'power3.out',
            overwrite: 'auto',
          });
          gsap.to(portrait, {
            skewY: 0, y: 0,
            duration: 0.9, ease: 'elastic.out(1, 0.5)',
            delay: 0.4, overwrite: 'auto',
          });
        },
      });
    }
  }

  /* Refresh ScrollTrigger after fonts load */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

})();
