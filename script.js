/* ============================================================
   NELISIWE MAKHABANE — EDITORIAL PORTFOLIO
   Command palette · Assistant chatbot · Reveal animations
   Scroll progress · Mobile nav · Back to top
   ============================================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header state ---------- */
  const header = document.getElementById("site-header");
  const progressBar = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    if (backToTop) backToTop.classList.toggle("visible", y > 600);

    setActiveNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Active nav (scroll spy) ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));
  const spySections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActiveNav() {
    if (!spySections.length) return;
    const pos = window.scrollY + window.innerHeight * 0.35;
    let currentId = null;
    spySections.forEach(function (section) {
      if (section.offsetTop <= pos) currentId = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", currentId !== null && link.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinksWrap = document.getElementById("navLinks");

  function closeMobileNav() {
    if (!navToggle || !navLinksWrap) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    navLinksWrap.classList.remove("open");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && navLinksWrap) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinksWrap.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", isOpen);
    });
    navLinksWrap.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* ---------- Command palette ---------- */
  const palette = document.getElementById("commandPalette");
  const commandSearch = document.getElementById("commandSearch");
  const commandList = document.getElementById("commandList");
  const commandItems = commandList ? Array.prototype.slice.call(commandList.querySelectorAll(".command-item")) : [];
  let paletteOpen = false;

  function openPalette() {
    if (!palette || paletteOpen) return;
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    paletteOpen = true;
    document.body.classList.add("nav-open");
    if (commandSearch) {
      commandSearch.value = "";
      filterCommands("");
      setTimeout(function () { commandSearch.focus(); }, 30);
    }
  }

  function closePalette() {
    if (!palette || !paletteOpen) return;
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
    paletteOpen = false;
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.focus();
  }

  function filterCommands(query) {
    const q = query.trim().toLowerCase();
    commandItems.forEach(function (item) {
      const text = item.textContent.toLowerCase();
      item.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
    });
  }

  function runCommand(item) {
    const action = item.dataset.action;
    const target = item.dataset.target;
    if (action === "go" && target) {
      closePalette();
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else if (action === "link" && target) {
      window.open(target, "_blank", "noopener");
    }
  }

  if (palette && commandSearch && commandList) {
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        paletteOpen ? closePalette() : openPalette();
      }
      if (e.key === "Escape" && paletteOpen) closePalette();
    });

    palette.addEventListener("click", function (e) {
      if (e.target === palette) closePalette();
    });

    commandSearch.addEventListener("input", function () { filterCommands(commandSearch.value); });

    commandItems.forEach(function (item) {
      item.addEventListener("click", function () { runCommand(item); });
    });
  }

  /* ---------- Assistant chatbot ---------- */
  const chatToggle = document.getElementById("chatToggle");
  const chatPanel = document.getElementById("chatPanel");
  const closeChat = document.getElementById("closeChat");
  const chatBody = document.getElementById("chatBody");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getReply(raw) {
    const msg = raw.toLowerCase();

    if (/^(hi|hey|hello|howdy|good (morning|afternoon|evening))\b/.test(msg)) {
      return "Hi there! I can tell you about Nelisiwe's projects, skills, experience, education or how to get in touch. What would you like to know?";
    }
    if (msg.indexOf("project") !== -1 || msg.indexOf("work") !== -1 || msg.indexOf("build") !== -1 || msg.indexOf("portfolio") !== -1) {
      return "Nelisiwe has built several projects, including <strong>Luvli</strong> (a live productivity app), <strong>TechLift Career Pathways</strong> (live preview, still being built), <strong>Realign Studio AI</strong> (live concept + repo), the <strong>CAPACITI Online Register</strong> (team prototype), <strong>RoadReady Traffic Services</strong> and <strong>VarsityPath Navigator</strong> (group projects). Scroll to the Work section to explore them.";
    }
    if (msg.indexOf("luvli") !== -1) {
      return "Luvli is a productivity-focused product for planning and daily intention-setting — 'Make every day feel intentional.' You can try it live at <a href='https://luvli.netlify.app' target='_blank' rel='noreferrer'>luvli.netlify.app</a>.";
    }
    if (msg.indexOf("skill") !== -1 || msg.indexOf("stack") !== -1 || msg.indexOf("tech") !== -1) {
      return "Her toolkit includes HTML &amp; accessibility, CSS &amp; responsive design, JavaScript, Python &amp; SQL and Git &amp; GitHub — alongside product thinking, UX, visual design and practical AI workflows. Full details are in the Skills Lab section.";
    }
    if (msg.indexOf("experience") !== -1 || msg.indexOf("journey") !== -1 || msg.indexOf("intern") !== -1 || msg.indexOf("career") !== -1) {
      return "She is currently a Software Development Intern at CAPACITI in Salt River, Cape Town (2026 – present), after completing a Software Development Learnership with JumpstartYourCareer in Mbombela (2025 – 2026) and running her own design practice (2023 – 2025).";
    }
    if (msg.indexOf("education") !== -1 || msg.indexOf("study") !== -1 || msg.indexOf("degree") !== -1 || msg.indexOf("school") !== -1 || msg.indexOf("certificate") !== -1 || msg.indexOf("credential") !== -1) {
      return "She is studying a Diploma in Engineering Technology in Computer Engineering at CPUT (2026 – present), holds a National Senior Certificate from Sakhile Secondary School, and has seven verified certificates in AI, machine learning and Python — all with credential links in the Education section.";
    }
    if (msg.indexOf("contact") !== -1 || msg.indexOf("email") !== -1 || msg.indexOf("reach") !== -1 || msg.indexOf("connect") !== -1 || msg.indexOf("hire") !== -1 || msg.indexOf("linkedin") !== -1) {
      return "You can email her at <a href='mailto:makhabanenelisiwe96@gmail.com'>makhabanenelisiwe96@gmail.com</a>, connect on <a href='https://www.linkedin.com/in/nelisiwe-makhabane-173a933ba/' target='_blank' rel='noreferrer'>LinkedIn</a>, or view her code on <a href='https://github.com/makhabane1' target='_blank' rel='noreferrer'>GitHub</a>. She is open to roles and internships.";
    }
    if (msg.indexOf("cv") !== -1 || msg.indexOf("resume") !== -1) {
      return "Her full CV is available as a PDF — use the 'Download CV' button in the navigation bar, the hero, or the contact section.";
    }
    if (msg.indexOf("about") !== -1 || msg.indexOf("who") !== -1 || msg.indexOf("nelisiwe") !== -1) {
      return "Nelisiwe is a software developer who enjoys understanding how things work and turning ideas into reliable, user-focused digital experiences — with curiosity, attention to detail and a willingness to learn, while exploring AI as a practical tool.";
    }
    if (msg.indexOf("thank") !== -1) {
      return "You're welcome! Feel free to reach out any time — the contact section has all the details. ✦";
    }
    return "I can help with questions about Nelisiwe's projects, skills, experience, education, CV or contact details. Try one of the quick replies below, or ask something like 'Tell me about projects'.";
  }

  function addMessage(role, html) {
    if (!chatBody) return;
    const div = document.createElement("div");
    div.className = "message " + role;
    div.innerHTML = role === "user" ? escapeHtml(html) : html;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function sendChat(text) {
    const value = (text || "").trim();
    if (!value) return;
    addMessage("user", value);
    if (chatInput) chatInput.value = "";
    setTimeout(function () {
      addMessage("bot", getReply(value));
    }, prefersReducedMotion ? 0 : 450);
  }

  function toggleChat(open) {
    if (!chatPanel || !chatToggle) return;
    const shouldOpen = typeof open === "boolean" ? open : chatPanel.hidden;
    chatPanel.hidden = !shouldOpen;
    chatToggle.setAttribute("aria-expanded", String(shouldOpen));
    chatToggle.setAttribute("aria-label", shouldOpen ? "Close chatbot" : "Open chatbot");
    if (shouldOpen && chatInput) chatInput.focus();
  }

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener("click", function () { toggleChat(); });
    if (closeChat) closeChat.addEventListener("click", function () { toggleChat(false); });
    if (sendBtn) sendBtn.addEventListener("click", function () { sendChat(chatInput ? chatInput.value : ""); });
    if (chatInput) {
      chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); sendChat(chatInput.value); }
      });
    }
    document.querySelectorAll(".quick-reply").forEach(function (btn) {
      btn.addEventListener("click", function () { sendChat(btn.textContent); });
    });
  }

  /* ---------- Init ---------- */
  onScroll();
})();


