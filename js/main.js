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
  let conversationHistory = [];

  const CHAT_STORAGE_KEY = 'lp_chat';
  const CHAT_TTL = 30 * 60 * 1000; // 30 minutes

  function saveChat() {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      ts: Date.now(),
      history: conversationHistory,
    }));
  }

  function loadChat() {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > CHAT_TTL) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        return null;
      }
      return data.history;
    } catch {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }
  }

  function restoreMessages(history) {
    chatMessages.innerHTML = '';
    for (const msg of history) {
      if (msg.role === 'assistant') {
        addBotMessage(msg.content, true);
      } else if (msg.role === 'user') {
        addUserMessage(msg.content, true);
      }
    }
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    chatFab.classList.toggle('active', chatOpen);
    chatPanel.classList.toggle('open', chatOpen);

    // Lock body scroll on mobile when chat is open
    if (chatOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset any keyboard-adjusted sizing
      chatPanel.style.height = '';
      chatPanel.style.bottom = '';
    }

    if (chatOpen && !chatInitialized) {
      chatInitialized = true;
      chatInput.focus();

      // Try to restore previous session
      const saved = loadChat();
      if (saved && saved.length > 0) {
        conversationHistory = saved;
        restoreMessages(saved);
      } else {
        // Fresh session — get AI greeting
        showTyping();
        sendToAPI([{ role: 'user', content: '[Customer just opened the chat widget on lancepettay.me. Greet them warmly in 1-2 short sentences. Mention that you are an AI assistant and that the conversation will be shared with Lance so he can prepare. Keep it natural, not robotic.]' }])
          .then((reply) => {
            hideTyping();
            addBotMessage(reply);
            conversationHistory = [{ role: 'assistant', content: reply }];
            saveChat();
          });
      }
    } else if (chatOpen) {
      chatInput.focus();
    }
  }

  function openChat() {
    if (!chatOpen) toggleChat();
  }

  function closeChat() {
    if (chatOpen) toggleChat();
  }

  // Handle mobile keyboard resize — keep chat panel in visible area
  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      if (!chatOpen || window.innerWidth > 768) return;
      const vvh = window.visualViewport.height;
      chatPanel.style.height = (vvh * 0.6) + 'px';
      chatPanel.style.bottom = (window.innerHeight - vvh - window.visualViewport.offsetTop) + 'px';
    });

    window.visualViewport.addEventListener('scroll', () => {
      if (!chatOpen || window.innerWidth > 768) return;
      chatPanel.style.bottom = (window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop) + 'px';
    });
  }

  chatFab.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', closeChat);

  // Swipe down to close chat on mobile
  const dragHandle = document.querySelector('.chat-drag-handle');
  if (dragHandle) {
    dragHandle.addEventListener('click', closeChat);

    let touchStartY = 0;
    let touchCurrentY = 0;
    let isDragging = false;

    chatPanel.addEventListener('touchstart', (e) => {
      // Only start drag from the header area (top 60px)
      const rect = chatPanel.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      if (touchY > 60) return;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
      chatPanel.style.transition = 'none';
    }, { passive: true });

    chatPanel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      touchCurrentY = e.touches[0].clientY;
      const diff = touchCurrentY - touchStartY;
      if (diff > 0) {
        chatPanel.style.transform = `translateY(${diff}px)`;
      }
    }, { passive: true });

    chatPanel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      chatPanel.style.transition = '';
      const diff = touchCurrentY - touchStartY;
      if (diff > 80) {
        closeChat();
      }
      chatPanel.style.transform = '';
      touchStartY = 0;
      touchCurrentY = 0;
    });
  }

  // Lock body scroll when chat open on mobile
  function updateBodyScroll() {
    if (chatOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Patch toggleChat to manage body scroll
  const origToggle = toggleChat;

  // All "open-chat" buttons
  document.querySelectorAll('.open-chat').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openChat();
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatOpen) closeChat();
  });

  function addBotMessage(text, skipAnim) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-bot';
    if (skipAnim) msg.style.animation = 'none';
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addUserMessage(text, skipAnim) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-user';
    if (skipAnim) msg.style.animation = 'none';
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

  /* ========================================
     Booking Modal
     ======================================== */
  const bookOverlay = document.getElementById('bookOverlay');
  const bookClose = document.getElementById('bookClose');
  const bookDates = document.getElementById('bookDates');
  const bookSlots = document.getElementById('bookSlots');
  const bookLoading = document.getElementById('bookLoading');
  const bookForm = document.getElementById('bookForm');
  const bookDone = document.getElementById('bookDone');

  const steps = [
    document.getElementById('bookStep1'),
    document.getElementById('bookStep2'),
    document.getElementById('bookStep3'),
    document.getElementById('bookStep4'),
  ];

  let selectedDate = null;
  let selectedSlot = null;

  function showStep(n) {
    steps.forEach((s, i) => (s.style.display = i === n ? 'block' : 'none'));
  }

  function openBooking() {
    bookOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showStep(0);
    buildDateGrid();
  }

  function closeBooking() {
    bookOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open/close booking
  document.querySelectorAll('.open-book').forEach((btn) =>
    btn.addEventListener('click', (e) => { e.preventDefault(); openBooking(); })
  );
  bookClose.addEventListener('click', closeBooking);
  bookOverlay.addEventListener('click', (e) => { if (e.target === bookOverlay) closeBooking(); });
  document.getElementById('bookBack1').addEventListener('click', () => showStep(0));
  document.getElementById('bookBack2').addEventListener('click', () => showStep(1));
  bookDone.addEventListener('click', closeBooking);

  // Build next 9 weekdays
  function buildDateGrid() {
    bookDates.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    let count = 0;
    let d = new Date(today);
    d.setDate(d.getDate() + 1); // Start tomorrow

    while (count < 9) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        // Use local date parts to avoid UTC date shift
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const label = `${days[dow]}, ${months[d.getMonth()]} ${d.getDate()}`;
        const btn = document.createElement('button');
        btn.className = 'book-date-btn';
        btn.innerHTML = `<span class="day-name">${days[dow]}</span><span class="day-num">${months[d.getMonth()]} ${d.getDate()}</span>`;
        btn.addEventListener('click', () => selectDate(dateStr, label));
        bookDates.appendChild(btn);
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  async function selectDate(dateStr, label) {
    selectedDate = dateStr;
    document.getElementById('bookDateLabel').textContent = label;
    showStep(1);
    bookSlots.innerHTML = '';
    bookLoading.style.display = 'block';

    try {
      const res = await fetch(`/api/slots?date=${dateStr}`);
      const data = await res.json();
      bookLoading.style.display = 'none';

      if (!data.slots || data.slots.length === 0) {
        bookSlots.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:0.85rem;">No available slots this day. Try another date.</p>';
        return;
      }

      data.slots.forEach((slot) => {
        const btn = document.createElement('button');
        btn.className = 'book-slot-btn';
        btn.textContent = slot.time;
        btn.addEventListener('click', () => selectSlot(slot, label));
        bookSlots.appendChild(btn);
      });
    } catch {
      bookLoading.style.display = 'none';
      bookSlots.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:0.85rem;">Could not load times. Try again or call (316) 350-6609.</p>';
    }
  }

  function selectSlot(slot, dateLabel) {
    selectedSlot = slot;
    document.getElementById('bookTimeLabel').textContent = `${dateLabel} at ${slot.time}`;
    showStep(2);
  }

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const notes = document.getElementById('bookNotes').value.trim();

    if (!name || !email) return;

    const submitBtn = bookForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, slot: selectedSlot.start, notes }),
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById('bookConfirmText').textContent =
          `${selectedSlot.time} is locked in. Check your email for the calendar invite — you can respond or reschedule from there.`;
        showStep(3);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      alert('Connection error. Call Lance at (316) 350-6609.');
    }
  });

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
    saveChat();
    chatInput.disabled = false;
    chatInput.focus();
  });
});
