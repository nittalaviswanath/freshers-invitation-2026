/**
 * FRESHERS 2026 - INTERACTIVE EXPERIENCE CONTROLLER
 * Handles passcode authentication, 3D letter opening transition,
 * scroll snapping, particle ambiance, countdown, and style guide modal.
 */

/* ==========================================================================
   0. GUEST REGISTRY & PASSKEY CONTROLLER
   ========================================================================== */
const GUEST_REGISTRY = {
  // Official Guest Roster (Students & Special Guests)
  "REVI": { name: "Juan Emmanuel" },
  "REVII": { name: "Likhita" },
  "REVIII": { name: "Visista Soufalya" },
  "REVIV": { name: "Aakash Reddy" },
  "REVV": { name: "Sreenidhi" },
  "REVVI": { name: "Veekshith" },
  "REVVII": { name: "Venky" },
  "REVVIII": { name: "Saharsh" },
  "REVIX": { name: "Aardhya Kadiri" },
  "REVX": { name: "Abhijeet Raj" },
  "REVXI": { name: "Ernest Paul" },
  "REVXII": { name: "Gandi Charan Tej" },
  "REVXIII": { name: "Akhil Nadukula" },
  "REVXIV": { name: "Siddharth Reddy" },
  "REVXV": { name: "Sindhu Pulipati" },
  "REVXVI": { name: "Aiheka" },
  "REVXVII": { name: "Nagesh" },
  "REVXVIII": { name: "Rahul Cheruku" },
  "REVXIX": { name: "Sai Sohan" },
  "REVXX": { name: "Nirvigna Sajja" },
  "REVXXI": { name: "Aditi Bera" },
  "REVXXII": { name: "Abhi Reddy", tagline: "invites SPC" },

  // Faculty Roster
  "REVXXIII": { name: "Dr. V. Sowmya Devi" },
  "REVXXIV": { name: "Nanda Kishore", tagline: "invites CICC" },
  "REVXXV": { name: "Dr. N.P Seeja" },
  "REVXXVI": { name: "Mr. M. Raju" },
  "REVXXVII": { name: "Mrs. N. Sowjanya" },
  "REVXXVIII": { name: "Mr. P. Mallikarjun" },
  "REVXXIX": { name: "Mr. S. Venkatesh" },
  "REVXXX": { name: "Mr. P. Rajesh" },
  "REVXXXI": { name: "Mr. Aboosalih" },
  "REVXXXII": { name: "Mr. M. Lenin Babu" },
  "REVXXXIII": { name: "Dr. B. Vijay Bhasker" },
  "REVXXXIV": { name: "Mr. Kranthi Kumar" },
  "REVXXXV": { name: "Mr. G. Ramesh" },
  "REVXXXVI": { name: "Mrs. Ruknimi" },
  "REVXXXVII": { name: "Mrs. Ramya Sree" },
  "REVXXXVIII": { name: "Mr. Praveen Athota" },
  "REVXXXIX": { name: "Mr. Sohini" },
  "REVXL": { name: "Dr. B. Shashihar Reddy" },
  "REVXLI": { name: "Mr. M. Priyatham Raju" },
  "REVXLII": { name: "Mr. Md. Hussain" },
  "REVXLIII": { name: "Dr. Seeja N.P" },
  "REVXLIV": { name: "Ms. Gayatri Shivani" },
  "REVXLV": { name: "Mr. P. Anvesh" },

  // Master & Fallback Passcodes
  "000": { name: "Viswanath" },
  "2026": { name: "Viswanath" },
  "REVERIE": { name: "Class of 2026" }
};

document.addEventListener('DOMContentLoaded', () => {
  initPasskeySystem();
  initScrollController();
  initCountdownTimer();
  initAmbientParticles();
  initAudioSynthesizer();
  initConfetti();
});

let isEnvelopeUnsealed = false;

function initPasskeySystem() {
  const passInput = document.getElementById('passkey-input');
  if (!passInput) return;

  // Handle input events (visual styling & clear error)
  passInput.addEventListener('input', () => {
    const val = passInput.value.trim().toUpperCase();
    if (val.length > 0) {
      passInput.classList.add('has-value');
      passInput.classList.remove('empty');
    } else {
      passInput.classList.remove('has-value');
      passInput.classList.add('empty');
    }

    // Clear previous error message while user is typing
    const feedback = document.getElementById('passkey-feedback');
    if (feedback && feedback.classList.contains('error')) {
      feedback.textContent = '';
      feedback.className = 'passkey-feedback';
    }
  });

  // Handle Enter key
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyAndUnseal();
    }
  });

  // Initial focus
  passInput.classList.add('empty');
  setTimeout(() => passInput.focus(), 300);

  // Check URL parameters or saved session for direct link or passcode
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = (urlParams.get('code') || urlParams.get('pass') || '').trim().toUpperCase();
  const nameParam = urlParams.get('name') || urlParams.get('guest');
  const savedCode = sessionStorage.getItem('reverie_unsealed');

  if (codeParam && GUEST_REGISTRY[codeParam]) {
    const guest = GUEST_REGISTRY[codeParam];
    isEnvelopeUnsealed = true;
    updateRecipient(guest);
    const portal = document.getElementById('envelope-portal');
    if (portal) {
      portal.classList.add('portal-unsealed');
      portal.style.display = 'none';
      document.body.classList.add('invitation-revealed');
    }
  } else if (savedCode && GUEST_REGISTRY[savedCode]) {
    const guest = GUEST_REGISTRY[savedCode];
    isEnvelopeUnsealed = true;
    updateRecipient(guest);
    const portal = document.getElementById('envelope-portal');
    if (portal) {
      portal.classList.add('portal-unsealed');
      portal.style.display = 'none';
      document.body.classList.add('invitation-revealed');
    }
  } else if (nameParam) {
    updateRecipient(nameParam);
  } else {
    // Initial sync based on default HTML content
    syncTaglineFromDOM();
  }

  // Setup observer on guest-name-display to auto-update tagline whenever name changes
  const guestDisplay = document.getElementById('guest-name-display');
  if (guestDisplay && window.MutationObserver) {
    const observer = new MutationObserver(() => {
      syncTaglineFromDOM();
    });
    observer.observe(guestDisplay, { childList: true, characterData: true, subtree: true });
  }
}

function syncTaglineFromDOM() {
  const guestDisplay = document.getElementById('guest-name-display');
  if (guestDisplay) {
    const currentName = (guestDisplay.textContent || '').trim().toLowerCase();
    if (currentName.includes('abhi reddy')) {
      applyTaglineText('invites SPC');
    } else if (currentName.includes('nanda kishore')) {
      applyTaglineText('invites CICC');
    }
  }
}

function applyTaglineText(text) {
  const taglineDisplay = document.getElementById('hero-tagline-display');
  if (taglineDisplay) {
    taglineDisplay.textContent = text;
  }
  document.querySelectorAll('.hero-tagline').forEach(el => {
    el.textContent = text;
  });
}

function updateRecipient(guestOrName) {
  const guestDisplay = document.getElementById('guest-name-display');

  let name = "";
  let tagline = "A Day of Radiance, Glamour & New Beginnings";

  if (typeof guestOrName === 'string') {
    name = guestOrName;
    const lower = name.trim().toLowerCase();
    if (lower.includes('abhi reddy')) {
      tagline = 'invites SPC';
    } else if (lower.includes('nanda kishore')) {
      tagline = 'invites CICC';
    }
  } else if (guestOrName && typeof guestOrName === 'object') {
    name = guestOrName.name || '';
    const lower = name.trim().toLowerCase();
    if (guestOrName.tagline) {
      tagline = guestOrName.tagline;
    } else if (lower.includes('abhi reddy')) {
      tagline = 'invites SPC';
    } else if (lower.includes('nanda kishore')) {
      tagline = 'invites CICC';
    }
  }

  if (guestDisplay && name) {
    guestDisplay.textContent = name;
  }
  applyTaglineText(tagline);
}

function handlePasskeySubmit(event) {
  if (event) event.preventDefault();
  verifyAndUnseal();
}

function verifyAndUnseal() {
  if (isEnvelopeUnsealed) return;

  const passInput = document.getElementById('passkey-input');
  const code = (passInput?.value || '').trim().toUpperCase();

  const feedback = document.getElementById('passkey-feedback');
  const card = document.getElementById('passkey-card');
  const portal = document.getElementById('envelope-portal');

  if (GUEST_REGISTRY[code]) {
    const guest = GUEST_REGISTRY[code];
    isEnvelopeUnsealed = true;

    // Update guest name & tagline in Section 1
    updateRecipient(guest);

    // Success feedback
    if (feedback) {
      feedback.textContent = `Welcome, ${guest.name} ✦`;
      feedback.className = 'passkey-feedback success';
    }

    // Play subtle chime sound if available
    try {
      playRoyalChime();
    } catch (err) {}

    // Trigger 3D Letter Opening Sequence
    if (portal) {
      portal.classList.add('unsealing-active');
      sessionStorage.setItem('reverie_unsealed', code);

      // Sparkle / Confetti burst
      if (typeof triggerConfetti === 'function') {
        triggerConfetti();
      }

      // Complete unsealing after 850ms
      setTimeout(() => {
        portal.classList.add('portal-unsealed');
        portal.style.display = 'none';
        document.body.classList.add('invitation-revealed');
      }, 850);
    }
  } else {
    // Error feedback + Card Shake
    if (feedback) {
      feedback.textContent = 'Invalid Pass Key';
      feedback.className = 'passkey-feedback error';
    }
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth; // trigger reflow
      card.classList.add('shake');
    }

    // Reset input and re-focus
    if (passInput) {
      passInput.value = '';
      passInput.classList.remove('has-value');
      passInput.classList.add('empty');
      setTimeout(() => passInput.focus(), 150);
    }
  }
}
let currentSection = 0;
const sections = document.querySelectorAll('.snap-section');
const navDots = document.querySelectorAll('.nav-dot');
const scrollContainer = document.getElementById('scroll-container');
let isScrolling = false;

function initScrollController() {
  // Dot navigation click handlers
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      goToSection(targetIndex);
    });
  });

  // IntersectionObserver to update active navigation dots on scroll
  const observerOptions = {
    root: scrollContainer,
    threshold: 0.55
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const index = id === 'section-1' ? 0 : id === 'section-2' ? 1 : 2;
        currentSection = index;
        updateActiveDot(index);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Handle URL hash on initial load
  if (window.location.hash) {
    const id = window.location.hash.replace('#', '');
    const idx = id === 'section-1' ? 0 : id === 'section-2' ? 1 : id === 'section-3' ? 2 : -1;
    if (idx !== -1) {
      setTimeout(() => {
        scrollContainer.scrollTop = sections[idx].offsetTop;
        currentSection = idx;
        updateActiveDot(idx);
      }, 50);
    }
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (document.getElementById('rsvp-modal').classList.contains('hidden') === false) {
      if (e.key === 'Escape') closeRsvpModal();
      return; // Do not scroll if modal is open
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      if (currentSection < sections.length - 1) {
        goToSection(currentSection + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentSection > 0) {
        goToSection(currentSection - 1);
      }
    }
  });

  // Optional subtle wheel snap assist
  let wheelTimeout = null;
  scrollContainer.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 30) return;
    if (isScrolling) return;

    if (e.deltaY > 50 && currentSection < sections.length - 1) {
      isScrolling = true;
      goToSection(currentSection + 1);
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => { isScrolling = false; }, 850);
    } else if (e.deltaY < -50 && currentSection > 0) {
      isScrolling = true;
      goToSection(currentSection - 1);
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => { isScrolling = false; }, 850);
    }
  }, { passive: true });
}

function goToSection(index) {
  if (index < 0 || index >= sections.length) return;
  currentSection = index;
  const targetSection = sections[index];
  
  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: targetSection.offsetTop,
      behavior: 'smooth'
    });
  } else {
    targetSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  updateActiveDot(index);
}

function updateActiveDot(index) {
  navDots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/* ==========================================================================
   2. COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  const targetDate = new Date('2026-09-11T10:00:00+05:30').getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('mins').innerText = '00';
      document.getElementById('secs').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('mins').innerText = String(mins).padStart(2, '0');
    document.getElementById('secs').innerText = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   3. AMBIENT PARTICLES CANVAS (Golden Embers & Stardust)
   ========================================================================== */
function initAmbientParticles() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const particleCount = Math.min(Math.floor(window.innerWidth / 25), 60);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.3 ? '212, 175, 55' : '255, 235, 175'
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulse) * 0.005;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.1, Math.min(0.9, p.alpha))})`;
      ctx.shadowBlur = p.size * 4;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   4. WEB AUDIO SYNTHESIZER (Royal Ambient Harmony)
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let ambientInterval = null;

function initAudioSynthesizer() {
  const musicBtn = document.getElementById('music-btn');
  if (!musicBtn) return;
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  musicBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (isAudioPlaying) {
      stopAmbientMusic();
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
      musicBtn.classList.remove('active');
    } else {
      startAmbientMusic();
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      musicBtn.classList.add('active');
    }
    isAudioPlaying = !isAudioPlaying;
  });
}

function startAmbientMusic() {
  if (!audioCtx) return;

  // Gentle pentatonic royal arpeggio notes in Hz (D minor / F maj vibe)
  const chordNotes = [
    [146.83, 220.00, 293.66, 349.23, 440.00], // Dm9
    [174.61, 220.00, 261.63, 349.23, 523.25], // Fmaj7
    [130.81, 196.00, 261.63, 329.63, 392.00], // Cmaj9
    [110.00, 164.81, 220.00, 261.63, 329.63]  // Am7
  ];

  let chordIndex = 0;

  function playPadChord() {
    const chord = chordNotes[chordIndex];
    chordIndex = (chordIndex + 1) % chordNotes.length;

    chord.forEach((freq, i) => {
      setTimeout(() => {
        if (!isAudioPlaying) return;
        playSoftTone(freq, 4.5);
      }, i * 350);
    });
  }

  playPadChord();
  ambientInterval = setInterval(playPadChord, 4800);
}

function playSoftTone(freq, duration) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, audioCtx.currentTime);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
}

function stopAmbientMusic() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

/* ==========================================================================
   5. RSVP MODAL & PASS GENERATION
   ========================================================================== */
function openRsvpModal() {
  const modal = document.getElementById('rsvp-modal');
  modal.classList.remove('hidden');
  document.getElementById('rsvp-step-form').classList.add('active');
  document.getElementById('rsvp-step-pass').classList.remove('active');
  document.getElementById('guest-name').focus();
}

function closeRsvpModal() {
  const modal = document.getElementById('rsvp-modal');
  modal.classList.add('hidden');
}

function handleBackdropClick(e) {
  if (e.target.id === 'rsvp-modal') {
    closeRsvpModal();
  }
}

function openDressCodeModal() {
  const modal = document.getElementById('dress-modal');
  modal.classList.remove('hidden');
}

function closeDressModal() {
  const modal = document.getElementById('dress-modal');
  modal.classList.add('hidden');
}

function handleDressModalClick(e) {
  if (e.target.id === 'dress-modal') {
    closeDressModal();
  }
}

function handleRsvpSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('guest-name').value.trim();
  const roll = document.getElementById('guest-roll').value.trim();
  const dept = document.getElementById('guest-dept').value;

  if (!name || !roll) return;

  // Generate unique pass number
  const randomPassNum = 'FR26-' + Math.floor(1000 + Math.random() * 9000);

  // Update pass UI
  document.getElementById('pass-guest-name').innerText = name;
  document.getElementById('pass-roll-val').innerText = roll;
  document.getElementById('pass-dept-val').innerText = dept;
  document.getElementById('pass-code-val').innerText = 'PASS #' + randomPassNum;

  // Render QR Code on canvas
  renderQrCode(randomPassNum + '|' + name);

  // Switch steps
  document.getElementById('rsvp-step-form').classList.remove('active');
  document.getElementById('rsvp-step-pass').classList.add('active');

  // Trigger celebration confetti
  triggerConfetti();
}

function renderQrCode(dataString) {
  const canvas = document.getElementById('pass-qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Draw simulated QR matrix with corner finder patterns
  const gridSize = 21;
  const cellSize = Math.floor(size / gridSize);
  const offset = Math.floor((size - gridSize * cellSize) / 2);

  ctx.fillStyle = '#1c0307';

  // Corner Position Patterns (Top-Left, Top-Right, Bottom-Left)
  function drawFinderPattern(gx, gy) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          ctx.fillRect(offset + (gx + c) * cellSize, offset + (gy + r) * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);

  // Pseudo-random deterministic data pattern based on input string
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = (hash * 31 + dataString.charCodeAt(i)) & 0xFFFFFFFF;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder pattern zones
      if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;

      const val = ((hash ^ (r * 17 + c * 37)) % 100) > 48;
      if (val) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw gold center micro-crest
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(offset + 9 * cellSize, offset + 9 * cellSize, cellSize * 3, cellSize * 3);
}

function downloadPass() {
  const card = document.getElementById('digital-pass-card');
  if (!card) return;

  // Create an offscreen high-res canvas to render ticket
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = 600 * scale;
  canvas.height = 320 * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 600, 320);
  bgGrad.addColorStop(0, '#36060e');
  bgGrad.addColorStop(1, '#150205');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(0, 0, 600, 320, 16);
  ctx.fill();

  // Gold border
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d4af37';
  ctx.stroke();

  // Inner dashed border
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(10, 10, 580, 300);
  ctx.setLineDash([]);

  // Title & Code
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px Cinzel, serif';
  ctx.fillText('FRESHERS ’26 • OFFICIAL ENTRY PASS', 30, 42);

  ctx.fillStyle = '#dfba5c';
  ctx.font = '12px monospace';
  const passCode = document.getElementById('pass-code-val').innerText;
  ctx.fillText(passCode, 450, 42);

  // Line divider
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.beginPath();
  ctx.moveTo(30, 55);
  ctx.lineTo(570, 55);
  ctx.stroke();

  // Guest Details
  ctx.fillStyle = '#dfba5c';
  ctx.font = '11px Cinzel, serif';
  ctx.fillText('HONORED GUEST', 30, 85);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Playfair Display, serif';
  const name = document.getElementById('pass-guest-name').innerText;
  ctx.fillText(name, 30, 120);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '13px Montserrat, sans-serif';
  const dept = document.getElementById('pass-dept-val').innerText;
  const roll = document.getElementById('pass-roll-val').innerText;
  ctx.fillText(`Department: ${dept}`, 30, 155);
  ctx.fillText(`Student ID: ${roll}`, 30, 180);
  ctx.fillText(`Date: Friday, September 11, 2026 • 10:00 AM`, 30, 205);
  ctx.fillText(`Venue: Vaughn Seminar Hall`, 30, 230);

  // QR Code
  const qrCanvas = document.getElementById('pass-qr-canvas');
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, 440, 85, 110, 110);
    ctx.fillStyle = '#dfba5c';
    ctx.font = '10px Montserrat, sans-serif';
    ctx.fillText('SCAN AT GATES', 455, 215);
  }

  // Footer
  ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
  ctx.font = '11px Montserrat, sans-serif';
  ctx.fillText('Non-Transferable • Dress Code: Old Money Outfits', 110, 285);

  // Trigger download
  const link = document.createElement('a');
  link.download = `Freshers_2026_Pass_${name.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ==========================================================================
   6. CALENDAR EVENT GENERATOR (.ICS & GOOGLE CALENDAR)
   ========================================================================== */
function openCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) {
    modal.classList.remove('hidden');
  } else {
    downloadIcsCalendar();
  }
}

function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) modal.classList.add('hidden');
}

function handleCalendarModalClick(e) {
  if (e.target.id === 'calendar-modal') {
    closeCalendarModal();
  }
}

function addGoogleCalendar() {
  const title = encodeURIComponent("REVERIE '26 - Freshers Celebration");
  const details = encodeURIComponent("You are cordially invited to REVERIE '26 (Computer Science Freshers Celebration) at Vaughn Seminar Hall.\n\nAssembly at 9:30 AM, Inauguration at 10:00 AM, Cultural Events, Lunch Banquet, Investiture & DJ Celebration.\n\nLocation Map: https://maps.app.goo.gl/oA5nHXUZU8bDJyHH7");
  const location = encodeURIComponent("Vaughn Seminar Hall, Main Campus");
  const dates = "20260911T043000Z/20260911T110000Z";
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  window.open(gcalUrl, '_blank');
}

function downloadIcsCalendar() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//REVERIE 2026//Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:reverie-2026-freshers@campus',
    'SUMMARY:REVERIE \'26 - Freshers Celebration',
    'DESCRIPTION:You are cordially invited to REVERIE \'26 (Computer Science Freshers Celebration) at Vaughn Seminar Hall.\\nAssembly at 9:30 AM\\, Inauguration at 10:00 AM\\, Cultural Events\\, Lunch Banquet\\, Investiture & DJ Celebration.\\n\\nMap: https://maps.app.goo.gl/oA5nHXUZU8bDJyHH7',
    'LOCATION:Vaughn Seminar Hall\\, Main Campus',
    'URL:https://maps.app.goo.gl/oA5nHXUZU8bDJyHH7',
    'DTSTART:20260911T043000Z', // 10:00 AM IST on Sept 11, 2026
    'DTEND:20260911T110000Z',   // 04:30 PM IST on Sept 11, 2026
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'REVERIE_2026_Celebration.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function addToCalendar() {
  const title = encodeURIComponent("REVERIE '26 - Freshers Celebration");
  const details = encodeURIComponent("You are cordially invited to REVERIE '26 (Freshers Celebration) at Vaughn Seminar Hall.\n\nAssembly at 9:30 AM, Inauguration at 10:00 AM, Cultural Events, Lunch Banquet, Investiture & DJ Celebration.\n\nCampus Map: https://maps.app.goo.gl/oA5nHXUZU8bDJyHH7");
  const location = encodeURIComponent("Vaughn Seminar Hall, Main Campus");
  const dates = "20260911T043000Z/20260911T110000Z";
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=Asia/Kolkata`;
  window.open(gcalUrl, '_blank', 'noopener,noreferrer');
}

/* ==========================================================================
   7. CELEBRATION CONFETTI (Golden & Crimson Sparkles)
   ========================================================================== */
let confettiParticles = [];
let confettiAnimationId = null;

function initConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['#d4af37', '#ffd700', '#fff3be', '#800020', '#a81c33', '#ffffff'];

  confettiParticles = [];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
      decay: Math.random() * 0.01 + 0.008
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (alive) {
      confettiAnimationId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

// Global exposure for inline HTML event handlers
window.goToSection = goToSection;
window.openRsvpModal = openRsvpModal;
window.closeRsvpModal = closeRsvpModal;
window.handleBackdropClick = handleBackdropClick;
window.openDressCodeModal = openDressCodeModal;
window.closeDressModal = closeDressModal;
window.handleDressModalClick = handleDressModalClick;
window.handleRsvpSubmit = handleRsvpSubmit;
window.downloadPass = downloadPass;
window.addToCalendar = addToCalendar;
