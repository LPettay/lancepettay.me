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
  // Conversation context tracking
  let lastTopic = null;    // what service they're asking about
  let lastIntent = null;   // what we asked them
  let turnCount = 0;

  function toggleChat() {
    chatOpen = !chatOpen;
    chatFab.classList.toggle('active', chatOpen);
    chatPanel.classList.toggle('open', chatOpen);

    if (chatOpen) {
      chatInput.focus();
      if (!chatInitialized) {
        chatInitialized = true;
        setTimeout(() => {
          addBotMessage("Hey! What can I help you with?");
        }, 500);
      }
    }
  }

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

  // --- Conversation engine ---
  // Detects topics, tracks context across turns, responds naturally.

  const TOPICS = {
    website:    /website|web\s*site|web\s*page|landing\s*page|online\s*presence|need a site|new site|redesign|our site/i,
    support:    /support|call\s*center|answering|phone|calls|missed\s*call|receptionist|after\s*hours|customer\s*service|help\s*desk|ticket|chat\s*bot|live\s*chat/i,
    security:   /security|hack|breach|protect|virus|malware|phishing|cyber|password|data\s*leak|ransomware|firewall|vpn/i,
    automation: /automat|repetitive|manual|spreadsheet|workflow|efficiency|streamline|time.*(waste|save|spend)|data\s*entry|boring\s*stuff/i,
    marketing:  /market|seo|google|search\s*engine|social\s*media|advertis|facebook|instagram|tiktok|found\s*online|more\s*customers|leads|traffic|brand/i,
    pricing:    /how\s*much|price|cost|pricing|afford|budget|expensive|cheap|rate|quote|estimate|charge|fee/i,
    contact:    /talk.*(human|person|lance|someone|real)|call\s*(you|lance)|reach|contact\s*(you|lance|him)|speak|schedule|appointment|consult|meet/i,
    about:      /who.*(are\s*you|is\s*lance)|about\s*(you|lance|your\s*company)|background|experience|qualif|credentials/i,
  };

  // Industry knowledge for follow-ups
  const INDUSTRY_RESPONSES = {
    website: {
      manufacturing:  "Manufacturing — nice. We'd build you a site that showcases your capabilities, makes it easy for procurement teams to request quotes, and shows up when people search for your type of work. Do you currently have a site, or starting fresh?",
      restaurant:     "Restaurants live and die by their online presence. We'd get you a site with your menu, online ordering, reservations, and all the Google stuff so people actually find you. Got an existing site or starting from scratch?",
      retail:         "For retail, the big wins are online ordering, inventory display, and showing up in local searches. We can build something that looks great on phones — since that's where most of your customers are. Are you looking to sell online too?",
      medical:        "Medical and healthcare sites have special requirements — HIPAA compliance, patient portals, appointment booking. We handle all of that. What type of practice are you?",
      construction:   "Construction companies need a site that shows off past work and makes it dead simple to request a quote. Photo galleries, project portfolios, and a contact form that actually works. Do you have project photos we could use?",
      legal:          "Law firms need to project trust and competence. We'd build something clean and professional with practice area pages, attorney bios, and easy contact options. What kind of law?",
      default:        "Got it. Tell me a little more about your business — what do you do and who are your customers? That way I can give you a better sense of what would work best for you.",
    },
    support: {
      default: "So right now, how are you handling customer inquiries? Phone, email, both? And roughly how many do you get per day? Just trying to understand the volume so I can suggest the right setup.",
    },
    security: {
      default: "That's smart — most businesses don't think about security until something goes wrong. What's your setup like right now? Do you have a website, handle customer data, use cloud services? Just trying to get a sense of where to start.",
    },
    automation: {
      default: "What kind of work is eating up the most time? Things like data entry, sending follow-up emails, generating reports, scheduling — all of that can usually be automated. What does a typical annoying task look like?",
    },
    marketing: {
      default: "What's your situation right now — do people find you mostly through word of mouth, or do you have some online presence already? And who's your ideal customer?",
    },
  };

  function detectTopic(text) {
    for (const [topic, regex] of Object.entries(TOPICS)) {
      if (regex.test(text)) return topic;
    }
    return null;
  }

  function detectIndustry(text) {
    const lower = text.toLowerCase();
    if (/manufactur|factory|machining|cnc|fabricat|industrial|assembly/.test(lower)) return 'manufacturing';
    if (/restaurant|food|cafe|coffee|bar|grill|kitchen|catering|bakery|pizza/.test(lower)) return 'restaurant';
    if (/retail|shop|store|boutique|ecommerce|e-commerce|sell.*online|products/.test(lower)) return 'retail';
    if (/medical|doctor|dentist|clinic|health|hospital|therapy|chiro|pharma|nurse|patient/.test(lower)) return 'medical';
    if (/construct|contractor|build|plumb|electric|hvac|roofing|remodel|handyman/.test(lower)) return 'construction';
    if (/law|legal|attorney|lawyer|firm/.test(lower)) return 'legal';
    return null;
  }

  function getResponse(input) {
    const lower = input.toLowerCase().trim();
    turnCount++;

    // --- Greetings (only match if short / standalone) ---
    if (/^(hi|hello|hey|howdy|yo|sup|good\s*(morning|afternoon|evening)|what'?s\s*up)[!?.\s]*$/i.test(lower)) {
      return "Hey! What brings you here — got a project in mind, or just exploring?";
    }

    // --- Thanks ---
    if (/^(thank|thanks|thx|appreciate|ty)[!?.\s]*$/i.test(lower) || /thanks?\s*(so\s*much|a\s*lot)/i.test(lower)) {
      return "Anytime! I'm here if anything else comes up.";
    }

    // --- Yes / affirmative (context-aware) ---
    if (/^(yes|yeah|yep|sure|absolutely|definitely|please|ok|okay|yea|ya|mhm)[!?.\s]*$/i.test(lower)) {
      if (lastTopic && INDUSTRY_RESPONSES[lastTopic]) {
        lastIntent = 'asked_detail';
        return INDUSTRY_RESPONSES[lastTopic].default;
      }
      return "Great — what would you like to know more about?";
    }

    // --- No / negative ---
    if (/^(no|nah|nope|not\s*really|i'?m\s*good)[!?.\s]*$/i.test(lower)) {
      return "No worries. If something comes to mind later, I'm always here. Or you can call or text Lance anytime at (316) 350-6609.";
    }

    // --- Detect topic ---
    const topic = detectTopic(input);

    if (topic === 'contact') {
      return "You can reach Lance directly at (316) 350-6609 — call or text, whatever's easier. He's a real person and he actually picks up.";
    }

    if (topic === 'about') {
      return "Lance has spent 10+ years building enterprise technology — cybersecurity, AI systems, large-scale platforms. The kind of stuff that can't afford to break. Now he brings that same caliber of work to businesses of every size, without the enterprise price tag.";
    }

    if (topic === 'pricing') {
      const topicContext = lastTopic || 'project';
      return `Every ${topicContext === 'website' ? 'site' : 'project'} is different, so there's no one-size-fits-all price. The best way is a quick conversation — Lance can usually give you a ballpark in the first call. Want to set something up?`;
    }

    // --- Service topics ---
    if (topic === 'website') {
      lastTopic = 'website';
      lastIntent = 'asked_industry';
      return "We build websites that actually work for your business — fast, mobile-friendly, and built to bring in customers. What kind of business are you in?";
    }

    if (topic === 'support') {
      lastTopic = 'support';
      lastIntent = 'asked_detail';
      return "We build systems that handle customer questions around the clock — phone, chat, email, all of it. Your customers get real answers fast, and you stop losing leads to voicemail. How are you handling support right now?";
    }

    if (topic === 'security') {
      lastTopic = 'security';
      lastIntent = 'asked_detail';
      return "We do security audits, set up protection, and make sure your business isn't low-hanging fruit for hackers. What's your setup look like right now — do you handle customer data, have a website, use cloud services?";
    }

    if (topic === 'automation') {
      lastTopic = 'automation';
      lastIntent = 'asked_detail';
      return "If your team is doing the same thing over and over, that's probably automatable. What kind of repetitive work is eating up the most time?";
    }

    if (topic === 'marketing') {
      lastTopic = 'marketing';
      lastIntent = 'asked_detail';
      return "Getting found by the right people is everything. We do SEO, targeted ads, and online strategy — but first, tell me: how are customers finding you right now?";
    }

    // --- Context-aware follow-ups (no topic detected, but we have context) ---
    if (lastTopic && lastIntent === 'asked_industry') {
      const industry = detectIndustry(input);
      if (industry && INDUSTRY_RESPONSES[lastTopic]?.[industry]) {
        lastIntent = 'discussed_industry';
        return INDUSTRY_RESPONSES[lastTopic][industry];
      }
      // They answered with something we don't have a specific industry for — still useful
      lastIntent = 'discussed_industry';
      return INDUSTRY_RESPONSES[lastTopic]?.default || `Interesting — we've worked with businesses like that before. What's the main thing you're hoping to solve? More customers, better efficiency, or something else?`;
    }

    if (lastTopic && lastIntent === 'asked_detail') {
      lastIntent = 'discussed_detail';
      return "That helps a lot. Honestly, the best next step is a 15-minute call with Lance — he can listen to your situation and tell you exactly what he'd recommend. No cost, no commitment. Want to do that?";
    }

    if (lastTopic && lastIntent === 'discussed_industry') {
      lastIntent = 'closing';
      return "Sounds like there's a lot we can help with. Want to hop on a quick call? Lance is great at breaking things down in plain English — (316) 350-6609, or just tell me a good time and he'll reach out to you.";
    }

    // --- General fallback — don't dump phone number, ask a question ---
    const fallbacks = [
      "Tell me a little more — what's the biggest headache in your business right now?",
      "I want to make sure I point you in the right direction. What does your business do?",
      "Interesting. Are you dealing with a specific problem, or exploring what's possible?",
    ];
    return fallbacks[turnCount % fallbacks.length];
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    chatInput.value = '';

    // Simulate response delay
    showTyping();
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      hideTyping();
      addBotMessage(getResponse(text));
    }, delay);
  });
});
