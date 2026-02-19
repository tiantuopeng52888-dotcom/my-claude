/* ============================================================
   Nova Brand Website — script.js
   ============================================================ */

'use strict';

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
