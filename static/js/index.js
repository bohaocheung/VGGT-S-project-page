function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button ? button.querySelector(".copy-text") : null;

  if (!bibtexElement || !button || !copyText) {
    return;
  }

  navigator.clipboard.writeText(bibtexElement.textContent).then(() => {
    button.classList.add("copied");
    copyText.textContent = "Copied";

    window.setTimeout(() => {
      button.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 1800);
  }).catch(() => {
    copyText.textContent = "Failed";
    window.setTimeout(() => {
      copyText.textContent = "Copy";
    }, 1800);
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function resetPageToHero() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);
  document.body.classList.remove("hero-collapsed");
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    hero.classList.remove("is-collapsed");
  }
}

function setupMediaCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsWrap = carousel.querySelector("[data-carousel-dots]");

  if (!track || slides.length === 0 || !prevButton || !nextButton || !dotsWrap) {
    return;
  }

  let currentIndex = 0;
  let visibleCount = 3;
  let maxIndex = 0;
  let dots = [];

  function getGap() {
    const style = window.getComputedStyle(track);
    const gap = style.columnGap || style.gap || "0";
    return Number.parseFloat(gap) || 0;
  }

  function getSlideWidth() {
    return slides[0].getBoundingClientRect().width;
  }

  function rebuildDots() {
    dotsWrap.innerHTML = "";
    dots = Array.from({ length: Math.max(1, maxIndex + 1) }, (_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to position ${index + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = index;
        updateCarousel();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });
  }

  function updateCarousel() {
    const gap = getGap();
    const slideWidth = getSlideWidth();
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
    });
  }

  function recalcCarousel() {
    visibleCount = window.innerWidth <= 768 ? 1 : 3;
    maxIndex = Math.max(0, slides.length - visibleCount);
    currentIndex = Math.min(currentIndex, maxIndex);
    rebuildDots();
    updateCarousel();
  }

  prevButton.addEventListener("click", () => {
    currentIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
    updateCarousel();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
    updateCarousel();
  });

  window.addEventListener("resize", recalcCarousel);
  recalcCarousel();
}

function setupHeroCollapse() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const collapseThreshold = 100;
  let lockedCollapsed = false;
  let hasActivatedCollapseTracking = false;

  function updateHeroState() {
    if (hasActivatedCollapseTracking && window.scrollY > collapseThreshold) {
      lockedCollapsed = true;
    }

    const collapsed = lockedCollapsed;
    hero.classList.toggle("is-collapsed", collapsed);
    document.body.classList.toggle("hero-collapsed", collapsed);
  }

  function activateCollapseTracking() {
    hasActivatedCollapseTracking = true;
    updateHeroState();
  }

  updateHeroState();
  window.addEventListener("wheel", (event) => {
    if (event.deltaY > 0) {
      activateCollapseTracking();
    }
  }, { passive: true, once: true });

  let touchStartY = 0;
  window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0] ? event.touches[0].clientY : 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const currentY = event.touches[0] ? event.touches[0].clientY : touchStartY;
    if (touchStartY - currentY > 0) {
      activateCollapseTracking();
    }
  }, { passive: true, once: true });

  window.addEventListener("scroll", () => {
    updateHeroState();
  }, { passive: true });
}

resetPageToHero();
setupMediaCarousel();
setupHeroCollapse();
window.addEventListener("pageshow", resetPageToHero);

window.addEventListener("scroll", () => {
  const scrollButton = document.querySelector(".scroll-to-top");
  if (!scrollButton) {
    return;
  }

  if (window.scrollY > 320) {
    scrollButton.classList.add("visible");
  } else {
    scrollButton.classList.remove("visible");
  }
});
