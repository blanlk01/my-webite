// ==========================================================================
// MINIMAL LUXURY PORTFOLIO SCRIPTS
// Author: Sangharsha Adhikari
// Interactions: Theme switch, typography reveal, typewriter effect,
// word-by-word scroll lighting, count-up stats, 3D tilt, magnetic buttons,
// filmstrip carousel, accordion panels, and image lightbox.
// ==========================================================================

// ---------- 1. Theme switch with memory (localStorage) ----------
const html = document.documentElement;
const themeBtn = document.getElementById("theme");

function setTheme(t) {
  html.dataset.theme = t;
  if (themeBtn) {
    themeBtn.textContent = t === "dark" ? "Light" : "Dark";
  }
  try {
    localStorage.setItem("theme", t);
  } catch (e) {
    // Fail silently if localStorage is restricted
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (e) {}

setTheme(savedTheme || "dark");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    setTheme(html.dataset.theme === "dark" ? "light" : "dark");
  });
}

// ---------- 2. Letter-by-letter headline reveal ----------
let charIndex = 0;
document.querySelectorAll("[data-split]").forEach((el) => {
  const letters = [...el.textContent.trim()];
  el.innerHTML = letters
    .map((char) => `<span class="ch" style="--i:${charIndex++}">${char}</span>`)
    .join("");
});

// ---------- 3. Typing effect for roles in a loop ----------
const roles = ["Student", "Basketballer", "Coder", "Gym-goer"];
const typed = document.getElementById("typed");
let roleIdx = 0;
let charPos = 0;
let isDeleting = false;

function typeWriter() {
  if (!typed) return;
  const currentWord = roles[roleIdx];
  typed.textContent = currentWord.slice(0, charPos);

  if (!isDeleting && charPos === currentWord.length) {
    isDeleting = true;
    return setTimeout(typeWriter, 1400); // Pause on completed word
  }

  if (isDeleting && charPos === 0) {
    isDeleting = false;
    roleIdx = (roleIdx + 1) % roles.length; // Advance to next role
  }

  charPos += isDeleting ? -1 : 1;
  const delay = isDeleting ? 45 : 90;
  setTimeout(typeWriter, delay);
}

if (typed) {
  typeWriter();
}

// ---------- 4. Scroll progress, chapter counter & story word lighting ----------
const statement = document.getElementById("statement");
if (statement) {
  const originalWords = statement.textContent.trim().split(/\s+/);
  statement.innerHTML = originalWords
    .map((word) => `<span class="w">${word}</span>`)
    .join(" ");
}

const words = statement ? statement.querySelectorAll(".w") : [];
const progressBar = document.getElementById("progress");

function onScroll() {
  // Update thin blue scroll indicator
  const totalScroll = document.body.scrollHeight - window.innerHeight;
  if (progressBar && totalScroll > 0) {
    const progressPercent = (window.scrollY / totalScroll) * 100;
    progressBar.style.width = Math.min(Math.max(progressPercent, 0), 100) + "%";
  }

  // Calculate word lighting based on story position in viewport
  if (statement && words.length > 0) {
    const rect = statement.getBoundingClientRect();
    const triggerStart = window.innerHeight * 0.85;
    const scrollSpan = rect.height + window.innerHeight * 0.35;
    const progressRatio = Math.min(
      Math.max((triggerStart - rect.top) / scrollSpan, 0),
      1
    );

    words.forEach((w, i) => {
      w.classList.toggle("lit", i < progressRatio * words.length);
    });
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Chapter counter observer ("01 / 05" to "05 / 05")
const counter = document.getElementById("counter");
const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && counter) {
        counter.textContent = `${entry.target.dataset.ch} / 05`;
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".chapter").forEach((section) => {
  chapterObserver.observe(section);
});

// ---------- 5. Count-up statistics ----------
function countUp(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  const startTime = performance.now();
  const duration = 1600;

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    // Cubic ease-out curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easeProgress);
    el.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count]").forEach((el) => {
  statsObserver.observe(el);
});

// ---------- 6. Magnetic buttons ----------
document.querySelectorAll(".mag").forEach((btn) => {
  btn.addEventListener("pointermove", (e) => {
    const rect = btn.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const offsetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
    btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  btn.addEventListener("pointerleave", () => {
    btn.style.transform = "";
  });
});

// ---------- 7. 3D Portrait tilt ----------
const portrait = document.getElementById("portrait");
if (portrait) {
  portrait.addEventListener("pointermove", (e) => {
    const rect = portrait.getBoundingClientRect();
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const rotateX = -((e.clientY - rect.top) / rect.height - 0.5) * 16;
    portrait.style.setProperty("--ry", `${rotateY}deg`);
    portrait.style.setProperty("--rx", `${rotateX}deg`);
  });

  portrait.addEventListener("pointerleave", () => {
    portrait.style.setProperty("--rx", "0deg");
    portrait.style.setProperty("--ry", "0deg");
  });
}

// ---------- 8. Filmstrip carousel: Drag, navigation, and keyboard ----------
const track = document.getElementById("track");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

if (track) {
  const getStep = () => {
    const frame = track.querySelector(".frame");
    return frame ? frame.offsetWidth + 24 : 320;
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
    });
  }

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
    }
  });

  // Pointer dragging on desktop
  let isDown = false;
  let startClientX = 0;
  let initialScrollLeft = 0;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    isDown = true;
    startClientX = e.clientX;
    initialScrollLeft = track.scrollLeft;
    track.classList.add("drag");
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const delta = e.clientX - startClientX;
    track.scrollLeft = initialScrollLeft - delta;
  });

  window.addEventListener("pointerup", () => {
    if (isDown) {
      isDown = false;
      track.classList.remove("drag");
    }
  });
}

// ---------- 9. Expanding Beyond panels ----------
const panels = document.querySelectorAll(".panel");
panels.forEach((panel) => {
  const activatePanel = () => {
    panels.forEach((p) => p.classList.remove("active"));
    panel.classList.add("active");
  };

  panel.addEventListener("mouseenter", activatePanel);
  panel.addEventListener("click", activatePanel);
  panel.addEventListener("focus", activatePanel);
});

// ---------- 10. Gallery lightbox ----------
const lightbox = document.getElementById("lightbox");
const lbFig = document.getElementById("lbFig");
const closeLbBtn = document.getElementById("closeLb");

function openLightbox(figure) {
  if (!lightbox || !lbFig) return;
  lbFig.innerHTML = figure.innerHTML;
  lightbox.hidden = false;
  if (closeLbBtn) closeLbBtn.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
}

document.querySelectorAll(".sheet figure").forEach((figure) => {
  figure.addEventListener("click", () => openLightbox(figure));
  figure.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(figure);
    }
  });
});

if (closeLbBtn) {
  closeLbBtn.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox && !lightbox.hidden) {
    closeLightbox();
  }
});