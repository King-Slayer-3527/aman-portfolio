// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav nav');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// Animate skill bars and counters when the Coding Journey section scrolls into view
const journey = document.getElementById('github');
let played = false;

function playJourney() {
  if (played) return;
  played = true;

  document.querySelectorAll('.track i').forEach(bar => {
    bar.style.width = bar.dataset.width + '%';
  });

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const duration = 1200;
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * p) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}

new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { playJourney(); obs.disconnect(); }
}, { threshold: 0.3 }).observe(journey);


/* =====================================================
   ENHANCEMENTS: animations
   ===================================================== */
document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) Scroll progress bar + sticky nav shrink
const progress = document.createElement('div');
progress.className = 'progress';
document.body.prepend(progress);
const navBar = document.querySelector('.nav');
function onScroll() {
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  navBar.classList.toggle('scrolled', h.scrollTop > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 2) Typing effect in the hero headline (edit the list to change the words)
const roles = [
  'B.Tech Computer Science Student',
  'Software Developer',
  'Data Analytics Enthusiast',
  'Cybersecurity Learner'
];
const accentEl = document.querySelector('.hero h1 .accent');
accentEl.innerHTML = '<span class="typed-text"></span><span class="cursor"></span>';
const typedEl = accentEl.querySelector('.typed-text');
if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  let r = 0, c = 0, deleting = false;
  (function type() {
    const word = roles[r];
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 35 : 80;
    if (!deleting && c === word.length) { deleting = true; delay = 1800; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 400; }
    else { c += deleting ? -1 : 1; }
    setTimeout(type, delay);
  })();
}

// 3) Scroll reveal with a small stagger between siblings
const revealSel = '.eyebrow, section h2, section > .muted, .card, .cert-list li, .facts li, .stats div, .two-col > div:first-child, .bar';
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll(revealSel).forEach(el => {
  if (el.closest('.hero')) return;
  const i = [...el.parentElement.children].indexOf(el);
  el.style.setProperty('--d', Math.min(i * 0.08, 0.5) + 's');
  el.classList.add('reveal');
  revealObs.observe(el);
});

// 4) Mouse-follow spotlight on cards
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const b = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    card.style.setProperty('--my', (e.clientY - b.top) + 'px');
  });
});

// 5) Highlight the current section in the nav
const navAnchors = [...document.querySelectorAll('.nav nav a')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

// Back-to-top button appears after scrolling
const toTop = document.querySelector('.to-top');
window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600), { passive: true });


/* =====================================================
   FINAL POLISH: scripts
   ===================================================== */

// 1) Split the nav name into letters so each one can animate
const logoEl = document.querySelector('.logo');
[...logoEl.childNodes].forEach(node => {
  if (node.nodeType === 3 && node.textContent.trim()) {
    const text = node.textContent.trim();
    const wrap = document.createElement('span');
    wrap.className = 'logo-text';
    wrap.setAttribute('aria-label', text);
    [...text].forEach((c, i) => {
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.setAttribute('aria-hidden', 'true');
      ch.textContent = c === ' ' ? '\u00A0' : c;
      ch.style.setProperty('--i', i);
      wrap.appendChild(ch);
    });
    node.replaceWith(wrap);
  }
});

// 2) Intro loader (hides when the page is loaded; starts the hero/name animations)
const rootEl = document.documentElement;
if (reduceMotion) {
  rootEl.classList.add('ready');
} else {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = '<div class="loader-inner"></div>';
  const mark = document.querySelector('.logo-mark');
  if (mark) loader.firstChild.appendChild(mark.cloneNode(true));
  loader.firstChild.insertAdjacentHTML('beforeend', '<div class="loader-bar"><i></i></div>');
  document.body.appendChild(loader);
  const started = performance.now();
  let finished = false;
  const finish = () => {
    if (finished) return; finished = true;
    const wait = Math.max(0, 1200 - (performance.now() - started));
    setTimeout(() => {
      loader.classList.add('hide');
      rootEl.classList.add('ready');
      setTimeout(() => loader.remove(), 900);
    }, wait);
  };
  if (document.readyState === 'complete') finish(); else window.addEventListener('load', finish);
  setTimeout(finish, 3000); // safety net
}

// 3) Cursor glow + photo tilt + magnetic buttons (mouse devices only)
if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); });
  document.addEventListener('mouseleave', () => glow.classList.remove('on'));
  (function loop() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(loop);
  })();

  const heroEl = document.querySelector('.hero');
  const portrait = document.querySelector('.portrait');

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const b = btn.getBoundingClientRect();
      btn.style.setProperty('--tx', ((e.clientX - b.left - b.width / 2) * 0.18).toFixed(1) + 'px');
      btn.style.setProperty('--ty', ((e.clientY - b.top - b.height / 2) * 0.25).toFixed(1) + 'px');
    });
    btn.addEventListener('mouseleave', () => { btn.style.setProperty('--tx', '0px'); btn.style.setProperty('--ty', '0px'); });
  });
}

// 4) Saturn-style rings: skill tags orbit around the photo (edit rings / tags here)
//    r = ring size relative to the photo, t = seconds per full turn, dir = 'normal' or 'reverse'
//    Both rings use the same speed and direction and the outer ring is offset by half a step,
//    so the tags always keep a clear gap from each other. Keep 5 + 5 tags to keep that spacing.
const orbitRings = [
  { r: 0.74, t: 55, dir: 'normal', offset: 0,  tags: ['Python', 'C++', 'SQL', 'C#', 'C'] },
  { r: 1.02, t: 55, dir: 'normal', offset: 36, tags: ['Linux', 'Git', 'Cyber', 'Power BI', 'DSA'] }
];
const portraitEl = document.querySelector('.portrait');
orbitRings.forEach(ring => {
  const orbit = document.createElement('div');
  orbit.className = 'orbit';
  orbit.setAttribute('aria-hidden', 'true');
  orbit.style.setProperty('--r', `calc(var(--D) * ${ring.r})`);
  orbit.style.setProperty('--t', ring.t + 's');
  orbit.style.setProperty('--dir', ring.dir);
  ring.tags.forEach((label, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.setProperty('--a', (ring.offset + i * 360 / ring.tags.length) + 'deg');
    slot.innerHTML = '<span class="tag"><i></i>' + label + '</span>';
    orbit.appendChild(slot);
  });
  portraitEl.appendChild(orbit);
});
