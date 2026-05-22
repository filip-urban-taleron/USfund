const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progress = document.querySelector(".scroll-progress");
const counters = document.querySelectorAll("[data-count-to]");
const revealItems = document.querySelectorAll("[data-reveal]");

document.body.classList.add("motion-ready");

const formatMetric = (value) => {
  return new Intl.NumberFormat("cs-CZ").format(Math.round(value));
};

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress?.style.setProperty("--progress", `${Math.min(ratio, 1) * 100}%`);
};

const animateCounter = (element) => {
  if (element.dataset.animated === "true") return;
  element.dataset.animated = "true";

  const target = Number(element.dataset.countTo);
  const suffix = element.dataset.suffix || "";

  if (prefersReducedMotion) {
    element.textContent = `${formatMetric(target)}${suffix}`;
    return;
  }

  const start = performance.now();
  const duration = Number(element.dataset.duration || 2800);

  const tick = (time) => {
    const progressValue = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    element.textContent = `${formatMetric(target * eased)}${suffix}`;

    if (progressValue < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll("[data-count-to]").forEach(animateCounter);

      if (entry.target.matches("[data-count-to]")) {
        animateCounter(entry.target);
      }
    });
  },
  { threshold: 0.22 }
);

revealItems.forEach((item) => observer.observe(item));
counters.forEach((counter) => observer.observe(counter));

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
