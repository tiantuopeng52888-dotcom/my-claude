/* ============================================================
   Nova Brand Website — script.js
   ============================================================ */

'use strict';

/* ---------- Supabase 配置（与 admin.html 保持一致） ---------- */
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';

/* ---------- CMS: 从 Supabase 读取内容并应用到页面 ---------- */
(async function applyCMSContent() {
  let c = null;

  // 优先从 Supabase 读取
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?id=eq.1&select=content`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await res.json();
    if (rows?.[0]?.content && Object.keys(rows[0].content).length > 0) {
      c = rows[0].content;
      localStorage.setItem('nova_cms', JSON.stringify(c)); // 更新本地缓存
    }
  } catch { /* 网络异常，降级到 localStorage */ }

  // 降级：读 localStorage 缓存
  if (!c) {
    const saved = localStorage.getItem('nova_cms');
    if (!saved) return;
    try { c = JSON.parse(saved); } catch { return; }
  }

  try {
    const q  = s => document.querySelector(s);
    const qa = s => document.querySelectorAll(s);

    // Nav
    if (c.nav) {
      qa('.logo-text').forEach(el => { if (c.nav.logo) el.textContent = c.nav.logo; });
      qa('.logo-mark').forEach(el => { if (c.nav.logoMark) el.textContent = c.nav.logoMark; });
    }

    // Hero
    if (c.hero) {
      const h = c.hero;
      if (h.badge    && q('.hero__badge'))       q('.hero__badge').textContent = h.badge;
      if (h.headline1 && q('.headline-line1'))   q('.headline-line1').textContent = h.headline1;
      if (h.headline2 && q('.gradient-text'))    q('.gradient-text').textContent = h.headline2;
      if (h.sub       && q('.hero__sub'))        q('.hero__sub').textContent = h.sub;
      if (h.cta1) { const b = q('.btn--primary.btn--lg'); if (b) b.textContent = h.cta1; }
      if (h.cta2) { const b = q('.btn--ghost.btn--lg');   if (b) b.textContent = h.cta2; }

      const nums  = qa('.stat__num');
      const syms  = qa('.stat__sym');
      const labels = qa('.stat__label');
      [[h.stat1Num, h.stat1Sym, h.stat1Label],
       [h.stat2Num, h.stat2Sym, h.stat2Label],
       [h.stat3Num, h.stat3Sym, h.stat3Label]].forEach(([n, s, l], i) => {
        if (nums[i]   && n !== undefined) { nums[i].dataset.target = n; nums[i].textContent = '0'; }
        if (syms[i]   && s)              syms[i].textContent  = s;
        if (labels[i] && l)              labels[i].textContent = l;
      });
    }

    // About
    if (c.about) {
      const a = c.about;
      if (a.cardTitle && q('.about__card--main h3')) q('.about__card--main h3').textContent = a.cardTitle;
      if (a.cardText  && q('.about__card--main p'))  q('.about__card--main p').textContent  = a.cardText;
      if (a.years     && q('.accent-num'))            q('.accent-num').textContent           = a.years;
      if (a.title1    && q('.about__text .section-title')) {
        const t = q('.about__text .section-title');
        const u = t.querySelector('.underline-accent');
        t.childNodes[0].textContent = a.title1;
        if (u && a.title2) u.textContent = a.title2;
      }
      const bodies = qa('.about__text .section-body');
      if (bodies[0] && a.body1) bodies[0].textContent = a.body1;
      if (bodies[1] && a.body2) bodies[1].textContent = a.body2;
    }

    // Services (re-render grid)
    if (c.services && c.services.length) {
      const grid = q('.services__grid');
      if (grid) {
        grid.innerHTML = c.services.map((s, i) => `
          <div class="service-card" data-index="0${i+1}">
            <div class="service-card__icon">${s.icon || '◈'}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <a href="#" class="service-link">了解详情 →</a>
          </div>`).join('');
      }
    }

    // Work items
    if (c.work && c.work.length) {
      qa('.work-item').forEach((el, i) => {
        if (!c.work[i]) return;
        const w = c.work[i];
        const tag   = el.querySelector('.work-tag');
        const title = el.querySelector('h3');
        const desc  = el.querySelector('p');
        if (tag)   tag.textContent   = w.tag;
        if (title) title.textContent = w.title;
        if (desc)  desc.textContent  = w.desc;
      });
    }

    // Testimonials (re-render)
    if (c.testimonials && c.testimonials.length) {
      const grid = q('.testimonials__grid');
      if (grid) {
        const cards = qa('.testimonial-card');
        c.testimonials.forEach((t, i) => {
          if (!cards[i]) return;
          const txt    = cards[i].querySelector('.testimonial-text');
          const author = cards[i].querySelector('strong');
          const role   = cards[i].querySelector('.testimonial-author span');
          const avatar = cards[i].querySelector('.author-avatar');
          if (txt)    txt.textContent    = t.text;
          if (author) author.textContent = t.author;
          if (role)   role.textContent   = t.role;
          if (avatar) avatar.textContent = t.initial;
        });
      }
    }

    // CTA
    if (c.cta) {
      if (c.cta.title && q('.cta-content h2')) q('.cta-content h2').textContent = c.cta.title;
      if (c.cta.sub   && q('.cta-content p'))  q('.cta-content p').textContent  = c.cta.sub;
      if (c.cta.btn   && q('.btn--white.btn--lg')) q('.btn--white.btn--lg').textContent = c.cta.btn;
    }

    // Contact
    if (c.contact) {
      if (c.contact.title && q('.contact__info .section-title'))
        q('.contact__info .section-title').textContent = c.contact.title;
      if (c.contact.sub && q('.contact__info .section-body'))
        q('.contact__info .section-body').textContent = c.contact.sub;
      const details = qa('.contact-detail span:last-child');
      if (details[0] && c.contact.email)   details[0].textContent = c.contact.email;
      if (details[1] && c.contact.phone)   details[1].textContent = c.contact.phone;
      if (details[2] && c.contact.address) details[2].textContent = c.contact.address;
    }

    // Footer
    if (c.footer) {
      if (c.footer.tagline && q('.footer__brand p'))
        q('.footer__brand p').innerHTML = c.footer.tagline;
      if ((c.footer.year || c.footer.company) && q('.footer__bottom span'))
        q('.footer__bottom span').textContent =
          `© ${c.footer.year || '2026'} ${c.footer.company || 'Nova Brand'}. 保留所有权利。`;
    }

  } catch { /* silent fail */ }
})();

/* ---------- Nav: add .scrolled class on scroll ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---------- Animated counter ---------- */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

/* ---------- Intersection Observer: reveal + counters ---------- */
const revealEls = document.querySelectorAll('.reveal');
const statNums  = document.querySelectorAll('.stat__num[data-target]');
let countersStarted = false;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// Hero stats counter — trigger when stats row enters viewport
const statsRow = document.querySelector('.hero__stats');
if (statsRow) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => {
        animateCounter(el, parseInt(el.dataset.target, 10));
      });
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(statsRow);
}

/* ---------- Add reveal class to key sections on load ---------- */
document.querySelectorAll(
  '.service-card, .work-item, .testimonial-card, .process-step, .about__card'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${i * 60}ms`;
  observer.observe(el);
});

/* ---------- Contact form ---------- */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '发送中...';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      form.reset();
      btn.textContent = '发送消息 →';
      btn.disabled = false;
      formSuccess.style.display = 'block';
      setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
    }, 1200);
  });
}

/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---------- Parallax effect on hero orbs (subtle) ---------- */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.hero__orb').forEach((orb, i) => {
    const speed = (i + 1) * 0.15;
    orb.style.transform = `translateY(${y * speed}px)`;
  });
}, { passive: true });
