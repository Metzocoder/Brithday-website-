// static/js/main.js
// Full, fixed JS for Dino Birthday site
// Handles floating dinos, no button chaos, one-question-at-a-time flow,
// confetti, background music toggle, and the "dino eats No3 button" logic.

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createConfettiBurst(count = 100, duration = 3800) {
  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = rand(0, 100) + 'vw';
    conf.style.backgroundColor = ['#f472b6', '#f9a8d4', '#fde68a', '#86efac'][Math.floor(rand(0,4))];
    conf.style.animationDelay = rand(0, 2.6) + 's';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Floating dinos ----------
  (function buildFloatingDinos() {
    const dinoBg = document.getElementById('dino-bg');
    if (!dinoBg) return;
    const NUM = 8;
    for (let i = 0; i < NUM; i++) {
      const dino = document.createElement('img');
      dino.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
      dino.classList.add('floating-dino');
      dino.style.left = rand(-10, 110) + 'vw';
      dino.style.top = rand(-10, 90) + 'vh';
      dino.style.opacity = rand(0.15, 0.35).toString();
      dino.style.width = (rand(40, 90)).toFixed(0) + 'px';
      dino.style.animationDuration = rand(10, 22).toFixed(2) + 's';
      dino.style.pointerEvents = 'none';
      dinoBg.appendChild(dino);
    }
  })();

  // ---------- NO buttons & chaos ----------
  let no2Clicked = false; // track No2 click for dino logic

  function moveToRandom(el) {
    if (!el) return;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const marginX = Math.min(160, vw * 0.12);
    const marginY = Math.min(120, vh * 0.12);
    const x = rand(marginX, vw - marginX);
    const y = rand(marginY, vh - marginY);
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transition = 'transform 220ms ease, left 240ms ease, top 240ms ease';
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220 });
  }

  const no1 = document.getElementById('no1');
  const no2 = document.getElementById('no2');

  if (no1) {
    const handler = () => moveToRandom(no1);
    no1.addEventListener('mouseenter', handler);
    no1.addEventListener('focus', handler);
    no1.addEventListener('click', (e) => { e.preventDefault(); moveToRandom(no1); });
  }

  if (no2) {
    no2.addEventListener('click', () => {
      no2.classList.add('snap-away');
      document.body.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 420 });
      setTimeout(() => { if (no2 && no2.parentElement) no2.remove(); }, 780);
      no2Clicked = true; // mark for dino attack on Q3
    });
  }

  // ---------- Questions flow ----------
  const questions = Array.from(document.querySelectorAll('.question-block'));
  let current = 0;

  function showIndex(i) {
    questions.forEach((q, idx) => {
      if (idx === i) {
        q.classList.remove('hidden');
        q.classList.add('fade-in');
      } else {
        q.classList.add('hidden');
        q.classList.remove('fade-in');
      }
    });
  }

  showIndex(0);

  function next() {
    if (current < questions.length - 1) {
      current++;
      showIndex(current);

      // Check for Q3 and No2 clicked → spawn dino
      if (current === 2 && no2Clicked) {
        const no3 = document.getElementById('no3');
        if (no3) {
          const dino = document.createElement('img');
          dino.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
          dino.style.position = 'fixed';
          dino.style.width = '80px';
          const rect = no3.getBoundingClientRect();
          dino.style.top = (rect.top - 50) + 'px';
          dino.style.left = '-100px';
          dino.style.transition = 'all 1s ease-in-out';
          dino.style.zIndex = '9999';
          document.body.appendChild(dino);

          // move dino to button
          requestAnimationFrame(() => { dino.style.left = (rect.left - 20) + 'px'; });

          // chomp effect
          setTimeout(() => {
            no3.classList.add('fade-away', 'chomp-shake');
            setTimeout(() => { if (no3 && no3.parentElement) no3.remove(); }, 600);
          }, 1000);

          setTimeout(() => dino.remove(), 1600);
        }
      }

    } else {
      setTimeout(() => { window.location.href = '/birthday'; }, 600);
    }
  }

  const yesBtns = document.querySelectorAll('.yes-btn');
  yesBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 180 });
      next();
    });
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        btn.click();
      }
    });
  });

  // ---------- Confetti ----------
  if (window.location.pathname === '/birthday') {
    setTimeout(() => createConfettiBurst(110, 4200), 350);
  }

  // ---------- Background music ----------
  const music = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');
  if (music && btn) {
    let playing = false;
    btn.addEventListener('click', () => {
      if (!playing) {
        music.play().catch(() => {});
        btn.textContent = '🎵 Music Off';
      } else {
        music.pause();
        btn.textContent = '🎵 Music On';
      }
      playing = !playing;
    });
  }

});
