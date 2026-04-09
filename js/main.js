/* ========================================
   Lance Pettay — Portfolio JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Respect reduced motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Scroll Reveal --- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add('visible');
    } else {
      revealObserver.observe(el);
    }
  });

  /* --- Navbar Scroll --- */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function updateNav() {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* --- Mobile Menu --- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* --- Scroll Progress Bar --- */
  const progressBar = document.querySelector('.scroll-progress');

  function updateProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });

  /* --- Mouse Glow --- */
  const mouseGlow = document.querySelector('.mouse-glow');

  if (mouseGlow && window.innerWidth > 768 && !prefersReducedMotion) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      mouseGlow.classList.remove('active');
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      mouseGlow.style.left = glowX + 'px';
      mouseGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }

  /* --- Card Glow Follow --- */
  document.querySelectorAll('.service-card').forEach((card) => {
    const glow = card.querySelector('.card-glow');
    if (!glow || prefersReducedMotion) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
    });
  });

  /* --- Typing Effect --- */
  const typingTarget = document.getElementById('typingTarget');

  if (typingTarget && !prefersReducedMotion) {
    const phrases = [
      'technology that just works.',
      'websites that bring in customers.',
      'support that never sleeps.',
      'protection you can count on.',
      'automation that saves hours.',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    // Add cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    typingTarget.parentNode.insertBefore(cursor, typingTarget.nextSibling);

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isPaused) {
        isPaused = false;
        isDeleting = true;
        setTimeout(type, 50);
        return;
      }

      if (!isDeleting) {
        charIndex++;
        typingTarget.textContent = currentPhrase.substring(0, charIndex);

        if (charIndex === currentPhrase.length) {
          isPaused = true;
          setTimeout(type, 2500); // Pause at full phrase
          return;
        }
        setTimeout(type, 60 + Math.random() * 40);
      } else {
        charIndex--;
        typingTarget.textContent = currentPhrase.substring(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 30);
      }
    }

    // Start typing after a brief delay
    setTimeout(type, 1500);
  }

  /* --- Counter Animation --- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-number').forEach((el) => {
    counterObserver.observe(el);
  });

  function animateCounter(el, target) {
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* --- Parallax Orbs on Scroll --- */
  if (!prefersReducedMotion && window.innerWidth > 768) {
    const orbs = document.querySelectorAll('.orb');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = 0.03 + i * 0.015;
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  /* ========================================
     Chat Widget
     ======================================== */
  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const chatTyping = document.getElementById('chatTyping');

  let chatOpen = false;
  let chatInitialized = false;
  let chatConsented = false;
  // Conversation history for Claude API
  let conversationHistory = [];

  const chatWelcome = document.getElementById('chatWelcome');
  const chatStart = document.getElementById('chatStart');

  function toggleChat() {
    chatOpen = !chatOpen;
    chatFab.classList.toggle('active', chatOpen);
    chatPanel.classList.toggle('open', chatOpen);
  }

  // Consent → start chat
  chatStart.addEventListener('click', () => {
    chatConsented = true;
    chatWelcome.style.display = 'none';
    chatMessages.style.display = 'flex';
    chatInput.focus();

    if (!chatInitialized) {
      chatInitialized = true;
      showTyping();
      sendToAPI([{ role: 'user', content: '[Customer just opened the chat widget on lancepettay.me and accepted the AI assistant disclosure. Send a brief, warm greeting — one sentence max. Do not list services.]' }])
        .then((reply) => {
          hideTyping();
          addBotMessage(reply);
          conversationHistory = [{ role: 'assistant', content: reply }];
        });
    }
  });

  chatFab.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', toggleChat);

  // All "open-chat" buttons
  document.querySelectorAll('.open-chat').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!chatOpen) toggleChat();
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatOpen) toggleChat();
  });

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-bot';
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-user';
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    chatTyping.classList.add('visible');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    chatTyping.classList.remove('visible');
  }

  // --- Claude API chat ---
  async function sendToAPI(messages) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      return data.reply || "I'm having trouble right now — call Lance at (316) 350-6609.";
    } catch {
      return "Connection issue — call or text Lance directly at (316) 350-6609.";
    }
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    chatInput.value = '';
    chatInput.disabled = true;

    conversationHistory.push({ role: 'user', content: text });

    showTyping();
    const reply = await sendToAPI(conversationHistory);
    hideTyping();

    conversationHistory.push({ role: 'assistant', content: reply });
    addBotMessage(reply);
    chatInput.disabled = false;
    chatInput.focus();
  });
});
