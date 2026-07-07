/* ============================================================
   ✏️  EDIT THIS SECTION — everything you need to personalise
   ============================================================ */
const CONFIG = {
  girlfriendName: "Kaviniy", // shown on the cover screen
  personalMessage:
    "I've really loved every moment we've spent together lately, and I " +
    "wanted to do something a bit more creative for your birthday this " +
    "year. So I built you this...",

  // Leave restaurant blank if you want it to stay a surprise until dinner —
  // it will simply say "my little secret" on the ticket.
  restaurantName: "", // e.g. "Bella Notte"
  restaurantAddress: "", // e.g. "12 High Street, Perth"
  pickupNote: "I'll pick you up ❤️",

  // --- Getting her answers -----------------------------------------
  // Option A: Discord webhook (Server Settings → Integrations → Webhooks)
  discordWebhookUrl: "", // e.g. "https://discord.com/api/webhooks/..."
  // Option B: Google Sheets via Apps Script (see README.md for setup)
  sheetsWebAppUrl: "", // e.g. "https://script.google.com/macros/s/.../exec"

  confettiColors: ["#ff6fa8", "#b24bf3", "#ff9a56", "#ffd166", "#ffffff"],
};

/* ============================================================
   STATE
   ============================================================ */
const state = {
  cuisine: null,
  date: null,
  time: null,
  dressCode: null,
  seating: null,
};

const QUESTION_ORDER = ["cuisine", "date", "time", "dress", "seating"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   SCREEN NAVIGATION
   ============================================================ */
function currentScreenEl() {
  return $(".screen.active");
}

function goTo(name) {
  const next = $(`.screen[data-screen="${name}"]`);
  const current = currentScreenEl();
  if (!next || next === current) return;

  if (current) {
    current.classList.remove("active");
    current.classList.add("exiting");
    setTimeout(() => current.classList.remove("exiting"), 650);
  }
  // Force reflow so the transition retriggers even if already positioned
  void next.offsetWidth;
  next.classList.add("active");

  updateProgress(name);

  if (name === "reveal") {
    setTimeout(populateReveal, 250);
  }
}

function updateProgress(name) {
  const bar = $("#progress");
  const idx = QUESTION_ORDER.indexOf(name);
  if (idx === -1) {
    bar.classList.remove("visible");
    return;
  }
  bar.classList.add("visible");
  const pct = ((idx + 1) / QUESTION_ORDER.length) * 100;
  $("#progress-fill").style.width = pct + "%";
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-next]");
  if (btn && !btn.disabled) goTo(btn.dataset.next);
});

/* ============================================================
   TYPEWRITER
   ============================================================ */
function typewrite(el, text, speed = 42) {
  if (reduceMotion) {
    el.textContent = text;
    return;
  }
  el.textContent = "";
  let i = 0;
  const tick = () => {
    el.textContent += text.charAt(i);
    i++;
    if (i < text.length) setTimeout(tick, speed);
  };
  tick();
}

/* ============================================================
   FLOATING HEARTS
   ============================================================ */
function spawnHearts() {
  if (reduceMotion) return;
  const wrap = $("#hearts");
  const glyphs = ["❤️", "💕", "💗", "✨"];
  for (let i = 0; i < 16; i++) {
    const span = document.createElement("span");
    span.className = "heart";
    span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const left = Math.random() * 100;
    const size = 14 + Math.random() * 18;
    const dur = 10 + Math.random() * 10;
    const delay = Math.random() * 14;
    const drift = Math.random() * 80 - 40 + "px";
    span.style.left = left + "vw";
    span.style.setProperty("--size", size + "px");
    span.style.setProperty("--dur", dur + "s");
    span.style.setProperty("--delay", delay + "s");
    span.style.setProperty("--x", drift);
    span.style.setProperty("--op", (0.4 + Math.random() * 0.4).toFixed(2));
    wrap.appendChild(span);
  }
}

/* ============================================================
   QUESTION CARD / PILL SELECTION
   ============================================================ */
function setupSelectable(selector, stateKey) {
  $$(selector).forEach((group) => {
    const key = group.dataset.question || stateKey;
    const screen = group.closest(".screen");
    const continueBtn = $("button[data-next]", screen);
    $$("button", group).forEach((opt) => {
      opt.addEventListener("click", () => {
        $$("button", group).forEach((b) => b.classList.remove("selected"));
        opt.classList.add("selected");
        state[key] = opt.dataset.value;
        if (continueBtn) continueBtn.disabled = false;
      });
    });
  });
}

function setupDateInput() {
  const input = $("#date-input");
  const today = new Date();
  input.min = today.toISOString().split("T")[0];
  const screen = input.closest(".screen");
  const continueBtn = $("button[data-next]", screen);
  input.addEventListener("change", () => {
    if (input.value) {
      state.date = input.value;
      continueBtn.disabled = false;
    }
  });
}

/* ============================================================
   PLAYFUL "NO" BUTTON (DEFAULT STABLE VERSION)
   ============================================================ */
function setupInviteButtons() {
  const container = $("#invite-buttons");
  const noBtn = $("#no-btn");
  const yesBtn = $("#yes-btn");
  const hint = $("#invite-hint");

  const hints = [
    "It's okay, take your time 😉",
    "Are you sure about that? 🥺",
    "Hmm, I don't believe you 😏",
    "Last chance to say yes... 💕",
  ];

  let hintIndex = 0;
  const triggerRadius = 80;
  const dodgeStep = 110;
  const padding = 8;
  let offsetX = 0;
  let offsetY = 0;

  noBtn.style.transform = "translate(0px, 0px)";
  noBtn.style.transition = "transform 120ms ease-out";
  noBtn.style.zIndex = "2";

  function cycleHint() {
    hint.textContent = hints[hintIndex % hints.length];
    hintIndex++;
  }

  cycleHint();
  const hintTimer = setInterval(() => {
    if (hintIndex >= hints.length) {
      clearInterval(hintTimer);
      return;
    }
    cycleHint();
  }, 2000);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function dodgeIfNeeded(cursorX, cursorY) {
    if (reduceMotion) return;

    const cRect = container.getBoundingClientRect();
    const bRect = noBtn.getBoundingClientRect();

    const btnCenterX = bRect.left + bRect.width / 2;
    const btnCenterY = bRect.top + bRect.height / 2;

    const dx = btnCenterX - cursorX;
    const dy = btnCenterY - cursorY;
    const dist = Math.hypot(dx, dy);

    if (dist > triggerRadius) return;

    const nx = (dx || 1) / (dist || 1);
    const ny = (dy || 0.3) / (dist || 1);

    const nextX = offsetX + nx * dodgeStep + (Math.random() * 20 - 10);
    const nextY = offsetY + ny * dodgeStep + (Math.random() * 14 - 7);

    const baseLeftInContainer = bRect.left - cRect.left - offsetX;
    const baseTopInContainer = bRect.top - cRect.top - offsetY;

    const minOffsetX = padding - baseLeftInContainer;
    const maxOffsetX = cRect.width - bRect.width - padding - baseLeftInContainer;
    const minOffsetY = padding - baseTopInContainer;
    const maxOffsetY = cRect.height - bRect.height - padding - baseTopInContainer;

    offsetX = clamp(nextX, minOffsetX, maxOffsetX);
    offsetY = clamp(nextY, minOffsetY, maxOffsetY);

    noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }

  function onPointerMove(e) {
    dodgeIfNeeded(e.clientX, e.clientY);
  }

  container.addEventListener("pointermove", onPointerMove);

  const blockNo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const x = e.clientX ?? (e.touches?.[0]?.clientX ?? window.innerWidth / 2);
    const y = e.clientY ?? (e.touches?.[0]?.clientY ?? window.innerHeight / 2);
    dodgeIfNeeded(x, y);
  };

  noBtn.addEventListener("pointerdown", blockNo);
  noBtn.addEventListener("click", blockNo);
  noBtn.addEventListener("touchstart", blockNo, { passive: false });

  yesBtn.addEventListener("click", () => {
    clearInterval(hintTimer);
    container.removeEventListener("pointermove", onPointerMove);
    hint.textContent = "";
    goTo("cuisine");
  });
}

/* ============================================================
   REVEAL
   ============================================================ */
function formatDatePretty(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function parseTimeToHM(timeStr) {
  if (!timeStr || timeStr === "Surprise me") return { h: 19, m: 0 };
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { h: 19, m: 0 };
  let [, h, m, ampm] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (/PM/i.test(ampm) && h !== 12) h += 12;
  if (/AM/i.test(ampm) && h === 12) h = 0;
  return { h, m };
}

function populateReveal() {
  const details = $("#ticket-details");
  const where = CONFIG.restaurantName || "my little secret 🤫";
  details.innerHTML = `
    <div class="row"><dt>Date</dt><dd>${formatDatePretty(state.date)}</dd></div>
    <div class="row"><dt>Time</dt><dd>${state.time || "—"}</dd></div>
    <div class="row"><dt>Dress code</dt><dd>${state.dressCode || "—"}</dd></div>
    <div class="row"><dt>Where</dt><dd>${where}</dd></div>
  `;

  $("#pickup-note").textContent = CONFIG.pickupNote;

  const dirLink = $("#directions-link");
  if (CONFIG.restaurantName || CONFIG.restaurantAddress) {
    const query = encodeURIComponent(`${CONFIG.restaurantName} ${CONFIG.restaurantAddress}`.trim());
    dirLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    dirLink.style.display = "inline-flex";
  } else {
    dirLink.style.display = "none";
  }

  startCountdown();
  fireConfetti();
}

let countdownTimer = null;
function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  const { h, m } = parseTimeToHM(state.time);
  const target = state.date ? new Date(state.date + "T00:00:00") : new Date();
  target.setHours(h, m, 0, 0);

  function tick() {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      $("#cd-d").textContent = "00";
      $("#cd-h").textContent = "00";
      $("#cd-m").textContent = "00";
      $("#cd-s").textContent = "00";
      $("#countdown").previousElementSibling.textContent = "It's time! ❤️";
      clearInterval(countdownTimer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h2 = Math.floor((diff % 86400000) / 3600000);
    const m2 = Math.floor((diff % 3600000) / 60000);
    const s2 = Math.floor((diff % 60000) / 1000);
    $("#cd-d").textContent = String(d).padStart(2, "0");
    $("#cd-h").textContent = String(h2).padStart(2, "0");
    $("#cd-m").textContent = String(m2).padStart(2, "0");
    $("#cd-s").textContent = String(s2).padStart(2, "0");
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ============================================================
   CONFETTI (lightweight canvas implementation, no dependencies)
   ============================================================ */
function fireConfetti() {
  const canvas = $("#confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (reduceMotion) return;

  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    r: 5 + Math.random() * 5,
    vy: 2 + Math.random() * 3,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * 360,
    vr: -6 + Math.random() * 12,
    color: CONFIG.confettiColors[Math.floor(Math.random() * CONFIG.confettiColors.length)],
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  let frame = 0;
  const maxFrames = 260;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(draw);
}

window.addEventListener("resize", () => {
  const canvas = $("#confetti-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* ============================================================
   SENDING HER ANSWERS BACK TO YOU
   ============================================================ */
async function submitAnswers() {
  const payload = {
    accepted: true,
    ...state,
    submittedAt: new Date().toISOString(),
  };

  const jobs = [];

  if (CONFIG.discordWebhookUrl) {
    const content =
      `💌 **${CONFIG.girlfriendName} said yes!**\n` +
      `Date: ${formatDatePretty(state.date)}\n` +
      `Time: ${state.time}\n` +
      `Cuisine: ${state.cuisine}\n` +
      `Dress code: ${state.dressCode}\n` +
      `Seating: ${state.seating}`;
    jobs.push(
      fetch(CONFIG.discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }).catch((err) => console.warn("Discord webhook failed:", err))
    );
  }

  if (CONFIG.sheetsWebAppUrl) {
    jobs.push(
      fetch(CONFIG.sheetsWebAppUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn("Sheets webhook failed:", err))
    );
  }

  if (jobs.length === 0) {
    console.warn(
      "No webhook configured — her answers were not sent anywhere. " +
        "Set discordWebhookUrl or sheetsWebAppUrl in script.js before sharing this page. " +
        "Answers:",
      payload
    );
  }

  await Promise.allSettled(jobs);
}

function setupSendButton() {
  const btn = $("#send-btn");
  const status = $("#send-status");
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    status.textContent = "Sending...";
    await submitAnswers();
    status.textContent = "Saved — I can't wait 💌";
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  typewrite($("#cover-title"), `Happy Birthday ${CONFIG.girlfriendName} ❤️`);
  $("#message-text").textContent = CONFIG.personalMessage;
  spawnHearts();
  setupSelectable('[data-question="cuisine"]');
  setupSelectable('[data-question="time"]');
  setupSelectable('[data-question="dressCode"]');
  setupSelectable('[data-question="seating"]');
  setupDateInput();
  setupInviteButtons();
  setupSendButton();
}

document.addEventListener("DOMContentLoaded", init);
