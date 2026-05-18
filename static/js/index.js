const PROJECT_CONFIG = window.ProjectPageConfig || {};

function getProjectConfig() {
  return PROJECT_CONFIG;
}

function getThemePalette() {
  const isDark = document.documentElement.dataset.theme === "dark";
  return {
    isDark,
    text: isDark ? "#ffffff" : "#000000",
    muted: isDark ? "#f5f5f5" : "#404040",
    line: isDark ? "rgba(255, 255, 255, 0.24)" : "rgba(0, 0, 0, 0.16)",
    grid: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.12)",
    panel: "rgba(0,0,0,0)",
    plot: "rgba(0,0,0,0)"
  };
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setupThemeToggle(themeConfig = {}) {
  const button = document.querySelector("[data-theme-toggle]");
  const storageKey = themeConfig.storageKey || "colalab-project-theme";
  const defaultMode = themeConfig.defaultMode || "system";
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function readSavedTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function writeSavedTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {}
  }

  function resolveTheme() {
    const savedTheme = readSavedTheme();
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return defaultMode === "dark" ? "dark" : defaultMode === "light" ? "light" : getSystemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (button) {
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      button.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    window.dispatchEvent(new CustomEvent("project-theme-change", { detail: { theme } }));
  }

  if (button) {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      writeSavedTheme(nextTheme);
      applyTheme(nextTheme);
    });
  }

  if (media) {
    const handleSystemThemeChange = () => {
      if (!readSavedTheme()) {
        applyTheme(resolveTheme());
      }
    };
    if (media.addEventListener) {
      media.addEventListener("change", handleSystemThemeChange);
    } else if (media.addListener) {
      media.addListener(handleSystemThemeChange);
    }
  }

  applyTheme(resolveTheme());
}

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
  document.body.classList.remove("page-nav-visible");
  document.body.classList.remove("logo-flight-active");
  document.querySelectorAll(".hero-logo-flyer").forEach((flyer) => flyer.remove());
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    hero.classList.remove("is-collapsed");
  }
}

function setupPageNavigation() {
  const progress = document.querySelector("[data-reading-progress]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateNavigationState() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

    document.body.classList.toggle("page-nav-visible", scrollTop > 120);

    if (progress) {
      progress.style.width = `${progressValue * 100}%`;
    }

    let activeId = sections[0] ? sections[0].id : "";
    sections.forEach((section) => {
      if (section.offsetTop - 140 <= scrollTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  updateNavigationState();
  window.addEventListener("scroll", updateNavigationState, { passive: true });
  window.addEventListener("resize", updateNavigationState);
}

function setupAutoplayCarousel(root, options = {}) {
  if (!root || typeof options.onAdvance !== "function") {
    return;
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const config = getProjectConfig();
  const configuredInterval = Number(root.dataset.autoplayInterval || options.interval || config.demoAutoplayInterval);
  const interval = Number.isFinite(configuredInterval) && configuredInterval > 0 ? configuredInterval : 6000;
  let timer = null;
  let pausedByUser = false;

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    if (!pausedByUser) {
      timer = window.setInterval(options.onAdvance, interval);
    }
  }

  function pause() {
    pausedByUser = true;
    stop();
  }

  function resume() {
    pausedByUser = false;
    start();
  }

  root.addEventListener("mouseenter", pause);
  root.addEventListener("mouseleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", resume);
  root.addEventListener("pointerdown", pause);
  root.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      pause();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
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
  let cloneCount = 0;
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
    dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to demo ${index + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = cloneCount + index;
        updateCarousel();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });
  }

  function rebuildClones() {
    Array.from(track.querySelectorAll("[data-carousel-clone]")).forEach((clone) => clone.remove());
    cloneCount = Math.min(visibleCount, slides.length);
    const firstRealSlide = slides[0];

    slides.slice(-cloneCount).forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-carousel-clone", "true");
      clone.removeAttribute("data-carousel-slide");
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.insertBefore(clone, firstRealSlide);
    });

    slides.slice(0, cloneCount).forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-carousel-clone", "true");
      clone.removeAttribute("data-carousel-slide");
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.appendChild(clone);
    });
  }

  function getLogicalIndex() {
    return ((currentIndex - cloneCount) % slides.length + slides.length) % slides.length;
  }

  function updateCarousel() {
    const gap = getGap();
    const slideWidth = getSlideWidth();
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === getLogicalIndex());
    });
  }

  function resetCarouselTo(index) {
    track.classList.add("is-resetting");
    currentIndex = index;
    updateCarousel();
    track.getBoundingClientRect();
    window.requestAnimationFrame(() => {
      track.classList.remove("is-resetting");
    });
  }

  function recalcCarousel() {
    const logicalIndex = getLogicalIndex();
    visibleCount = window.innerWidth <= 768 ? 1 : 3;
    rebuildClones();
    currentIndex = cloneCount + logicalIndex;
    rebuildDots();
    resetCarouselTo(currentIndex);
  }

  prevButton.addEventListener("click", () => {
    currentIndex -= 1;
    updateCarousel();
  });

  nextButton.addEventListener("click", () => {
    currentIndex += 1;
    updateCarousel();
  });

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") {
      return;
    }
    if (currentIndex < cloneCount) {
      resetCarouselTo(cloneCount + slides.length - 1);
    } else if (currentIndex >= cloneCount + slides.length) {
      resetCarouselTo(cloneCount);
    }
  });

  window.addEventListener("resize", recalcCarousel);
  recalcCarousel();
  setupAutoplayCarousel(carousel, {
    onAdvance: () => {
      currentIndex += 1;
      updateCarousel();
    }
  });
}

function setupMediaPreviewModal() {
  const modal = document.querySelector("[data-media-preview-modal]");
  const content = modal ? modal.querySelector("[data-media-preview-content]") : null;
  const closeButtons = modal ? Array.from(modal.querySelectorAll("[data-media-preview-close]")) : [];
  const carousel = document.querySelector("[data-carousel]");
  const tiles = Array.from(document.querySelectorAll("[data-carousel-slide]"));
  if (!modal || !content || !carousel || tiles.length === 0) {
    return;
  }

  let lastFocusedElement = null;

  function clearPreview() {
    const media = content.querySelector("video, img");
    if (media && media.tagName === "VIDEO") {
      media.pause();
    }
    content.innerHTML = "";
  }

  function closePreview() {
    modal.hidden = true;
    document.body.classList.remove("media-preview-open");
    clearPreview();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function createPreviewMedia(tile) {
    const video = tile.querySelector("video");
    if (video) {
      const source = video.currentSrc || (video.querySelector("source") && video.querySelector("source").src) || video.src;
      if (!source) {
        return null;
      }
      const previewVideo = document.createElement("video");
      previewVideo.src = source;
      previewVideo.controls = true;
      previewVideo.autoplay = true;
      previewVideo.playsInline = true;
      previewVideo.loop = video.loop;
      previewVideo.muted = video.muted;
      previewVideo.preload = "metadata";
      return previewVideo;
    }

    const image = tile.querySelector("img");
    if (image && image.src) {
      const previewImage = document.createElement("img");
      previewImage.src = image.src;
      previewImage.alt = image.alt || "Media preview";
      return previewImage;
    }

    return null;
  }

  function openPreview(tile) {
    const media = createPreviewMedia(tile);
    if (!media) {
      return;
    }
    lastFocusedElement = document.activeElement;
    clearPreview();
    content.appendChild(media);
    modal.hidden = false;
    document.body.classList.add("media-preview-open");
    const closeButton = modal.querySelector(".media-preview-close");
    if (closeButton) {
      closeButton.focus();
    }
    if (media.tagName === "VIDEO") {
      media.play().catch(() => {});
    }
  }

  function getPreviewTile(eventTarget) {
    const tile = eventTarget.closest(".media-tile");
    if (!tile || !carousel.contains(tile)) {
      return null;
    }
    return tile;
  }

  tiles.forEach((tile, index) => {
    tile.tabIndex = 0;
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", `Preview demo ${index + 1}`);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview(tile);
      }
    });
  });

  carousel.addEventListener("click", (event) => {
    const tile = getPreviewTile(event.target);
    if (tile) {
      openPreview(tile);
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closePreview);
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.hidden && event.key === "Escape") {
      closePreview();
    }
  });
}

function setupHeroCollapse() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const collapseThreshold = 100;
  let lockedCollapsed = false;
  let hasActivatedCollapseTracking = false;
  let hasAnimatedLogo = false;

  function getNavLogoFlightTarget() {
    const navInner = document.querySelector(".page-nav-inner");
    const target = document.querySelector(".page-nav-brand img");
    if (!target || !target.getBoundingClientRect) {
      return null;
    }

    const targetBox = target.getBoundingClientRect();
    if (targetBox.width > 0 && targetBox.height > 0) {
      return targetBox;
    }

    const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    const width = window.innerWidth <= 768 ? 2 * rootFontSize : 2.25 * rootFontSize;
    const navBox = navInner ? navInner.getBoundingClientRect() : { left: 0, top: 0 };
    const left = navBox.left + rootFontSize;
    const top = (window.innerWidth <= 768 ? 0.7 * rootFontSize : 0.875 * rootFontSize);
    return {
      left,
      top,
      width,
      height: width
    };
  }

  function animateHeroLogoToNav() {
    if (hasAnimatedLogo) {
      return;
    }

    const source = hero.querySelector(".hero-logo-image");
    if (!source || !source.getBoundingClientRect) {
      return;
    }

    const start = source.getBoundingClientRect();
    if (start.width <= 0 || start.height <= 0) {
      return;
    }

    hasAnimatedLogo = true;
    document.body.classList.add("logo-flight-active");
    const end = getNavLogoFlightTarget();
    if (!end) {
      document.body.classList.remove("logo-flight-active");
      return;
    }

    const flyer = new Image();
    flyer.src = source.currentSrc || source.src;
    flyer.alt = "";
    flyer.className = "hero-logo-flyer";
    flyer.style.left = `${start.left}px`;
    flyer.style.top = `${start.top}px`;
    flyer.style.width = `${start.width}px`;
    flyer.style.height = `${start.height}px`;
    document.body.appendChild(flyer);

    const dx = end.left - start.left;
    const dy = end.top - start.top;
    const scale = Math.max(0.05, end.width / start.width);

    const finish = () => {
      flyer.remove();
      document.body.classList.remove("logo-flight-active");
    };

    if (flyer.animate) {
      const animation = flyer.animate([
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, offset: 0 },
        { transform: `translate3d(${dx * 0.55}px, ${dy * 0.25 - 24}px, 0) scale(${Math.max(scale * 1.8, 0.28)})`, opacity: 0.96, offset: 0.58 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`, opacity: 0, offset: 1 }
      ], {
        duration: 760,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      });
      animation.addEventListener("finish", finish, { once: true });
      animation.addEventListener("cancel", finish, { once: true });
    } else {
      finish();
    }
  }

  function updateHeroState() {
    if (hasActivatedCollapseTracking && window.scrollY > collapseThreshold) {
      lockedCollapsed = true;
    }

    const collapsed = lockedCollapsed;
    const wasCollapsed = hero.classList.contains("is-collapsed");
    if (collapsed && !wasCollapsed) {
      animateHeroLogoToNav();
    }
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

function setupMethodDiagram() {
  const diagram = document.querySelector("[data-method-diagram]");
  if (!diagram) {
    return;
  }

  const steps = Array.from(diagram.querySelectorAll("[data-method-step]"));
  const nodes = Array.from(diagram.querySelectorAll("[data-method-node]"));
  const links = Array.from(diagram.querySelectorAll("[data-method-link]"));
  const track = diagram.querySelector("[data-method-track]");
  const viewport = diagram.querySelector(".method-steps-viewport");
  const stage = diagram.querySelector(".method-diagram-stage");

  if (steps.length === 0 || nodes.length === 0 || !track || !viewport || !stage) {
    return;
  }

  let activeIndex = 0;
  let wheelLock = false;
  const stepThemes = {
    data: {
      color: "#ef4b34",
      soft: "rgba(239, 75, 52, 0.12)",
      shadow: "rgba(239, 75, 52, 0.16)"
    },
    model: {
      color: "#35a7ff",
      soft: "rgba(53, 167, 255, 0.12)",
      shadow: "rgba(53, 167, 255, 0.16)"
    },
    deployment: {
      color: "#f59e0b",
      soft: "rgba(245, 158, 11, 0.14)",
      shadow: "rgba(245, 158, 11, 0.16)"
    },
    feedback: {
      color: "#22c55e",
      soft: "rgba(34, 197, 94, 0.12)",
      shadow: "rgba(34, 197, 94, 0.16)"
    }
  };

  function setActiveStep(index) {
    activeIndex = Math.max(0, Math.min(index, steps.length - 1));
    const activeStep = steps[activeIndex];
    const stepName = activeStep.dataset.methodStep;
    const theme = stepThemes[stepName] || stepThemes.data;

    stage.style.setProperty("--method-color", theme.color);
    stage.style.setProperty("--method-color-soft", theme.soft);
    stage.style.setProperty("--method-color-shadow", theme.shadow);

    steps.forEach((step) => {
      step.classList.toggle("is-active", step.dataset.methodStep === stepName);
    });

    nodes.forEach((node) => {
      node.classList.toggle("is-active", node.dataset.methodNode === stepName);
    });

    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.methodLink === stepName);
    });

    track.style.transform = `translateX(-${activeIndex * 100}%)`;
  }

  function moveStep(direction) {
    if (steps.length === 0) {
      return false;
    }

    const nextIndex = (activeIndex + direction + steps.length) % steps.length;
    setActiveStep(nextIndex);
    return true;
  }

  diagram.addEventListener("wheel", (event) => {
    const mainDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(mainDelta) < 8) {
      return;
    }

    const direction = mainDelta > 0 ? 1 : -1;

    if (wheelLock) {
      event.preventDefault();
      return;
    }

    const moved = moveStep(direction);
    if (moved) {
      event.preventDefault();
      wheelLock = true;
      window.setTimeout(() => {
        wheelLock = false;
      }, 520);
    }
  }, { passive: false });

  steps.forEach((step, index) => {
    step.addEventListener("click", () => {
      setActiveStep(index);
    });
  });

  setActiveStep(0);
}

function setupTsnePlot() {
  const plot = document.getElementById("tsne-plot");
  if (!plot) {
    return;
  }

  if (!window.Plotly) {
    const fallbackDots = [
      [22, 28, "#ef4b34"], [30, 36, "#ef4b34"], [18, 46, "#ef4b34"], [34, 52, "#ef4b34"],
      [62, 28, "#35a7ff"], [72, 36, "#35a7ff"], [58, 48, "#35a7ff"], [78, 54, "#35a7ff"],
      [44, 64, "#22c55e"], [52, 72, "#22c55e"], [36, 76, "#22c55e"], [58, 82, "#22c55e"],
      [68, 70, "#f59e0b"], [76, 78, "#f59e0b"], [84, 66, "#f59e0b"], [72, 58, "#f59e0b"]
    ];

    plot.classList.add("tsne-fallback");
    plot.innerHTML = fallbackDots.map(([left, top, color]) => (
      `<span class="tsne-fallback-dot" style="left:${left}%;top:${top}%;--dot-color:${color};"></span>`
    )).join("") + '<div class="tsne-fallback-label">Interactive 3D scatter uses Plotly. If the CDN is unavailable, this static cluster preview keeps the layout intact.</div>';
    return;
  }

  function makeCluster(label, color, cx, cy, cz) {
    const points = Array.from({ length: 42 }, (_, index) => {
      const angle = index * 0.74;
      const radius = 0.35 + (index % 9) * 0.045;
      return {
        x: cx + Math.cos(angle) * radius + (index % 5) * 0.035,
        y: cy + Math.sin(angle * 0.86) * radius,
        z: cz + Math.cos(angle * 1.17) * radius * 0.72
      };
    });

    return {
      name: label,
      type: "scatter3d",
      mode: "markers",
      x: points.map((point) => point.x),
      y: points.map((point) => point.y),
      z: points.map((point) => point.z),
      marker: {
        color,
        size: 4.8,
        opacity: 0.82,
        line: {
          color: "#ffffff",
          width: 0.35
        }
      }
    };
  }

  const traces = [
    makeCluster("Human demos", "#ef4b34", -1.2, 0.2, 0.4),
    makeCluster("Model rollouts", "#35a7ff", 0.8, 0.8, -0.2),
    makeCluster("Held-out tasks", "#22c55e", 0.2, -1.0, 0.5),
    makeCluster("Failure cases", "#f59e0b", 1.35, -0.45, -0.5)
  ];

  function makeLayout() {
    const palette = getThemePalette();
    return {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: palette.panel,
    plot_bgcolor: palette.plot,
    legend: {
      x: 0.02,
      y: 0.98,
      font: { color: palette.text },
      bgcolor: palette.isDark ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.78)",
      bordercolor: palette.line,
      borderwidth: 1
    },
    scene: {
      bgcolor: palette.isDark ? "rgba(15,23,42,0.82)" : "rgba(248,250,252,0.82)",
      xaxis: {
        title: { text: "t-SNE 1", font: { color: palette.text, size: 12 } },
        showgrid: true,
        gridcolor: palette.grid,
        showline: true,
        linecolor: palette.muted,
        zeroline: true,
        zerolinecolor: palette.muted,
        tickfont: { color: palette.muted, size: 10 }
      },
      yaxis: {
        title: { text: "t-SNE 2", font: { color: palette.text, size: 12 } },
        showgrid: true,
        gridcolor: palette.grid,
        showline: true,
        linecolor: palette.muted,
        zeroline: true,
        zerolinecolor: palette.muted,
        tickfont: { color: palette.muted, size: 10 }
      },
      zaxis: {
        title: { text: "t-SNE 3", font: { color: palette.text, size: 12 } },
        showgrid: true,
        gridcolor: palette.grid,
        showline: true,
        linecolor: palette.muted,
        zeroline: true,
        zerolinecolor: palette.muted,
        tickfont: { color: palette.muted, size: 10 }
      },
      aspectmode: "cube",
      camera: {
        eye: { x: 1.55, y: 1.45, z: 1.1 }
      }
    }
  };
  }

  window.Plotly.newPlot(plot, traces, makeLayout(), {
    responsive: true,
    displayModeBar: false
  });

  window.addEventListener("project-theme-change", () => {
    window.Plotly.react(plot, traces, makeLayout(), {
      responsive: true,
      displayModeBar: false
    });
  });
}

function setupMetricsDashboard(horizontalMetrics) {
  const dashboard = document.querySelector("[data-metrics-dashboard]");
  if (!dashboard) {
    return;
  }

  const chart = dashboard.querySelector("[data-metric-chart]");
  const tabs = Array.from(dashboard.querySelectorAll("[data-metric-tab]"));
  const datasets = horizontalMetrics || {
    // success: [
    //   ["Baseline 1", 42, "#64748b", "#94a3b8", "rgba(100, 116, 139, 0.13)"],
    //   ["Baseline 2", 58, "#7c3aed", "#a78bfa", "rgba(124, 58, 237, 0.12)"],
    //   ["Project Title", 82, "#ef4b34", "#f59e0b", "rgba(239, 75, 52, 0.13)"]
    // ],
    // generalization: [
    //   ["Seen tasks", 86, "#0ea5e9", "#35a7ff", "rgba(14, 165, 233, 0.13)"],
    //   ["New objects", 74, "#16a34a", "#22c55e", "rgba(34, 197, 94, 0.13)"],
    //   ["New scenes", 68, "#f97316", "#facc15", "rgba(249, 115, 22, 0.13)"]
    // ],
    // efficiency: [
    //   ["Training cost", 54, "#8b5cf6", "#d946ef", "rgba(139, 92, 246, 0.13)"],
    //   ["Fine-tune time", 71, "#06b6d4", "#2dd4bf", "rgba(6, 182, 212, 0.13)"],
    //   ["Inference FPS", 88, "#ef4b34", "#fb7185", "rgba(239, 75, 52, 0.13)"]
    // ],
    ego2exo: [
      ["ObjectRelator", 45.4, "#64748b", "#94a3b8", "rgba(100, 116, 139, 0.13)"],
      ["DOMR", 49.7, "#7c3aed", "#a78bfa", "rgba(124, 58, 237, 0.12)"],
      ["VGGT-S(ZSL)", 54.1, "#2563eb", "#60a5fa", "rgba(37, 99, 235, 0.13)"],
      ["VGGT-S(Ours)", 67.7, "#ef4b34", "#f59e0b", "rgba(239, 75, 52, 0.13)"]
    ],
    exo2ego: [
      ["ObjectRelator", 50.9, "#0ea5e9", "#35a7ff", "rgba(14, 165, 233, 0.13)"],
      ["DOMR", 55.2, "#16a34a", "#22c55e", "rgba(34, 197, 94, 0.13)"],
      ["VGGT-S(ZSL)", 58.4, "#0f766e", "#2dd4bf", "rgba(15, 118, 110, 0.13)"],
      ["VGGT-S(Ours)", 68.0, "#f97316", "#facc15", "rgba(249, 115, 22, 0.13)"]
    ],
  };

  function renderMetric(metricName) {
    const rows = datasets[metricName] || datasets.ego2exo;
    chart.innerHTML = rows.map(([label, value, from, to, soft]) => `
      <div class="metric-row" style="--metric-from: ${from}; --metric-to: ${to}; --metric-soft: ${soft};">
        <span class="metric-label">${label}</span>
        <span class="metric-bar-track">
          <span class="metric-bar" style="width: ${value}%;"></span>
        </span>
        <!-- <span class="metric-value">${value}%</span> -->            
        <span class="metric-value">${Number(value).toFixed(1)}%</span>
      </div>
    `).join("");

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.metricTab === metricName);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => renderMetric(tab.dataset.metricTab));
  });

  renderMetric("ego2exo");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupVerticalCharts(verticalCharts) {
  const panel = document.querySelector("[data-vertical-results]");
  const grid = document.querySelector("[data-vertical-charts]");
  const prev = document.querySelector("[data-vertical-prev]");
  const next = document.querySelector("[data-vertical-next]");
  const progress = document.querySelector("[data-vertical-progress]");
  const charts = Array.isArray(verticalCharts) ? verticalCharts : [];
  if (!panel || !grid || charts.length === 0) {
    if (panel) {
      panel.hidden = true;
    }
    return;
  }

  let activeIndex = 0;
  let dots = [];

  function makeChartLayout(chart) {
    const palette = getThemePalette();
    return {
      margin: { t: 14, r: 12, b: 72, l: 58 },
      paper_bgcolor: palette.panel,
      plot_bgcolor: palette.plot,
      barmode: "group",
      barcornerradius: 7,
      bargap: 0.28,
      bargroupgap: 0.12,
      hovermode: "closest",
      showlegend: true,
      legend: {
        orientation: "h",
        x: 0,
        y: -0.18,
        font: { color: palette.muted, size: 11 }
      },
      xaxis: {
        title: { text: chart.xAxisTitle || "", font: { color: palette.muted, size: 11 } },
        tickfont: { color: palette.muted, size: 11 },
        showline: false,
        zeroline: false,
        showgrid: false
      },
      yaxis: {
        title: { text: chart.yAxisTitle || chart.unit || "", font: { color: palette.muted, size: 11 } },
        tickfont: { color: palette.muted, size: 11 },
        showline: false,
        zeroline: false,
        gridcolor: palette.grid,
        rangemode: "tozero"
      },
      font: {
        color: palette.text,
        family: (getProjectConfig().contentTokens && getProjectConfig().contentTokens.fontFamily) || "Inter, sans-serif"
      }
    };
  }

  function makeChartData(chart) {
    return (chart.series || []).map((series) => {
      return {
        type: "bar",
        name: series.name,
        x: chart.categories,
        y: series.values,
        marker: {
          color: series.color,
          opacity: series.highlight ? 0.98 : 0.78,
          line: {
            color: getThemePalette().isDark ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.78)",
            width: series.highlight ? 1.2 : 0
          }
        },
        customdata: chart.categories.map((category) => [category, chart.unit || ""]),
        hovertemplate: "<b>%{fullData.name}</b><br>%{customdata[0]}: %{y}%{customdata[1]}<extra></extra>"
      };
    });
  }

  function renderFallbackChart(container, chart) {
    const maxValue = Math.max(1, ...chart.series.flatMap((series) => series.values));
    container.innerHTML = `
      <div class="vertical-fallback-chart" role="img" aria-label="${escapeHtml(chart.title)}">
        <div class="vertical-fallback-bars">
          ${chart.categories.map((category, categoryIndex) => `
            <div class="vertical-fallback-group">
              <div class="vertical-fallback-stack">
                ${chart.series.map((series) => {
                  const value = series.values[categoryIndex] || 0;
                  const height = Math.max(3, (value / maxValue) * 100);
                  return `
                    <span
                      class="vertical-fallback-bar${series.highlight ? " is-highlight" : ""}"
                      style="--bar-color:${series.color};--bar-height:${height}%;"
                      title="${escapeHtml(series.name)} / ${escapeHtml(category)}: ${escapeHtml(value)}${escapeHtml(chart.unit || "")}">
                    </span>
                  `;
                }).join("")}
              </div>
              <span class="vertical-fallback-label">${escapeHtml(category)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function createChartCard(chart, options = {}) {
    const { position = 0 } = options;
    const card = document.createElement("article");
    card.className = "vertical-chart-card";
    card.innerHTML = `
      <div class="vertical-chart-title-row">
        <h4>${escapeHtml(chart.title)}</h4>
      </div>
      <div class="vertical-chart-plot" id="vertical-chart-${escapeHtml(chart.id)}-${position}" aria-label="${escapeHtml(chart.title)}"></div>
      ${chart.caption ? `<p class="vertical-chart-caption">${escapeHtml(chart.caption)}</p>` : ""}
    `;
    return card;
  }

  function renderChartCard(card, chart) {
    const plot = card.querySelector(".vertical-chart-plot");
    if (!plot) {
      return;
    }
    if (!window.Plotly) {
      renderFallbackChart(plot, chart);
      return;
    }
    window.Plotly.newPlot(plot, makeChartData(chart), makeChartLayout(chart), {
      responsive: true,
      displayModeBar: false
    });
  }

  function renderCharts() {
    const logicalIndex = activeIndex % charts.length;
    grid.innerHTML = "";

    charts.forEach((chart, position) => {
      const card = createChartCard(chart, { position });
      grid.appendChild(card);
      renderChartCard(card, chart);
    });

    activeIndex = logicalIndex;
    rebuildProgress();
    setActiveChart(activeIndex);
  }

  function rebuildProgress() {
    if (!progress) {
      return;
    }
    progress.innerHTML = "";
    dots = charts.map((chart, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "vertical-chart-dot";
      dot.setAttribute("aria-label", `Show ${chart.title || `chart ${index + 1}`}`);
      dot.addEventListener("click", () => setActiveChart(index));
      progress.appendChild(dot);
      return dot;
    });
  }

  function setActiveChart(index) {
    const previousIndex = activeIndex;
    const nextIndex = (index + charts.length) % charts.length;
    const forwardDistance = (nextIndex - previousIndex + charts.length) % charts.length;
    const backwardDistance = (previousIndex - nextIndex + charts.length) % charts.length;
    const direction = forwardDistance === 0 ? 0 : forwardDistance <= backwardDistance ? 1 : -1;
    activeIndex = nextIndex;
    const cards = Array.from(grid.querySelectorAll(".vertical-chart-card"));
    grid.classList.toggle("is-moving-forward", direction >= 0);
    grid.classList.toggle("is-moving-backward", direction < 0);
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeIndex;
      const isPrev = cardIndex === (activeIndex - 1 + charts.length) % charts.length;
      const isNext = cardIndex === (activeIndex + 1) % charts.length;
      const wasActive = cardIndex === previousIndex;
      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-prev", isPrev);
      card.classList.toggle("is-next", isNext);
      card.classList.toggle("is-exiting", wasActive && !isActive);
      card.classList.toggle("is-hidden", !isActive && !isPrev && !isNext);
      card.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  if (prev) {
    prev.addEventListener("click", () => setActiveChart(activeIndex - 1));
  }
  if (next) {
    next.addEventListener("click", () => setActiveChart(activeIndex + 1));
  }

  renderCharts();
  window.addEventListener("project-theme-change", renderCharts);
  if (charts.length > 1) {
    setupAutoplayCarousel(panel, {
      interval: getProjectConfig().verticalChartAutoplayInterval,
      onAdvance: () => setActiveChart(activeIndex + 1)
    });
  }
}

function setupDataPieChart(dataPie) {
  const plot = document.querySelector("[data-data-pie]");
  const panel = document.querySelector("[data-data-pie-panel]");
  if (!plot || !dataPie) {
    if (panel) {
      panel.hidden = true;
    }
    return;
  }

  const labels = dataPie.labels || [];
  const values = dataPie.values || [];
  const colors = dataPie.colors || ["#ef6a5b", "#4f8cff", "#2fbf8f", "#f2b84b"];
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let activeIndex = 0;

  function render() {
    let offset = 0;
    const gap = labels.length > 1 ? 1.55 : 0;
    const segments = labels.map((label, index) => {
      const value = values[index] || 0;
      const percent = value / total * 100;
      const visible = Math.max(0, percent - gap);
      const segment = `
        <circle
          class="data-donut-segment${index === activeIndex ? " is-active" : ""}"
          pathLength="100"
          cx="130"
          cy="130"
          r="92"
          style="--slice-color:${colors[index] || "#737373"};--slice-size:${visible};stroke-dashoffset:${-offset};"
          data-pie-index="${index}">
          <title>${escapeHtml(label)}: ${escapeHtml(value)} (${Math.round(percent)}%)</title>
        </circle>
      `;
      offset += percent;
      return segment;
    }).join("");

    const activeLabel = labels[activeIndex] || labels[0] || "";
    const activeValue = values[activeIndex] || values[0] || 0;
    const activePercent = Math.round(activeValue / total * 100);

    plot.innerHTML = `
      <div class="data-donut-card">
        <div class="data-donut-wrap">
          <svg class="data-donut-svg" viewBox="0 0 260 260" role="img" aria-label="${escapeHtml(dataPie.title || "Dataset composition")}">
            <circle class="data-donut-track" cx="130" cy="130" r="92"></circle>
            ${segments}
          </svg>
          <div class="data-donut-center">
            <strong>${escapeHtml(activePercent)}%</strong>
            <span>${escapeHtml(activeLabel)}</span>
          </div>
        </div>
        <div class="data-donut-legend">
          ${labels.map((label, index) => {
            const percent = Math.round((values[index] || 0) / total * 100);
            return `
              <button class="data-donut-legend-item${index === activeIndex ? " is-active" : ""}" type="button" data-pie-index="${index}">
                <span class="data-donut-swatch" style="--slice-color:${colors[index] || "#737373"};"></span>
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(percent)}%</strong>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;

    Array.from(plot.querySelectorAll("[data-pie-index]")).forEach((item) => {
      item.addEventListener("mouseenter", () => setActivePie(Number.parseInt(item.dataset.pieIndex, 10)));
      item.addEventListener("focus", () => setActivePie(Number.parseInt(item.dataset.pieIndex, 10)));
      item.addEventListener("click", () => setActivePie(Number.parseInt(item.dataset.pieIndex, 10)));
    });
  }

  function setActivePie(index) {
    if (!Number.isFinite(index) || index < 0 || index >= labels.length || index === activeIndex) {
      return;
    }
    activeIndex = index;
    render();
  }

  render();
  window.addEventListener("project-theme-change", () => render());
}

function setupDemoGallery() {
  const gallery = document.querySelector("[data-demo-gallery]");
  if (!gallery) {
    return;
  }

  const track = gallery.querySelector("[data-demo-track]");
  const cards = Array.from(gallery.querySelectorAll("[data-demo-card]"));
  const prev = gallery.querySelector("[data-demo-prev]");
  const next = gallery.querySelector("[data-demo-next]");
  const dotsWrap = gallery.querySelector("[data-demo-dots]");

  if (!track || cards.length === 0 || !prev || !next || !dotsWrap) {
    return;
  }

  let activeIndex = 0;
  const dots = cards.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "demo-gallery-dot";
    dot.setAttribute("aria-label", `Show demo ${index + 1}`);
    dot.addEventListener("click", () => setActiveDemo(index));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function setActiveDemo(index) {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeIndex;
      const isPrev = cardIndex === (activeIndex - 1 + cards.length) % cards.length;
      const isNext = cardIndex === (activeIndex + 1) % cards.length;
      const video = card.querySelector("video");
      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-prev", isPrev);
      card.classList.toggle("is-next", isNext);
      card.classList.toggle("is-hidden", !isActive && !isPrev && !isNext);
      if (video) {
        if (isActive && !card.hasAttribute("data-demo-manual-video")) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  prev.addEventListener("click", () => setActiveDemo(activeIndex - 1));
  next.addEventListener("click", () => setActiveDemo(activeIndex + 1));
  setActiveDemo(0);
  setupAutoplayCarousel(gallery, {
    onAdvance: () => setActiveDemo(activeIndex + 1)
  });
}

function setupEnhancedTables() {
  const tables = Array.from(document.querySelectorAll(".results-table"));
  if (tables.length === 0) {
    return;
  }

  tables.forEach((table) => {
    table.classList.add("is-enhanced");
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const bodyCells = Array.from(table.querySelectorAll("tbody td"));

    bodyCells.forEach((cell) => {
      const normalized = cell.textContent.trim().replace(/[,%]/g, "");
      const value = Number.parseFloat(normalized);
      if (Number.isFinite(value)) {
        cell.dataset.value = String(value);
      }
    });

    const headerCells = Array.from(table.querySelectorAll("thead tr:last-child th"));
    headerCells.forEach((_, columnIndex) => {
      if (columnIndex === 0) {
        return;
      }
      const columnCells = rows
        .map((row) => row.cells[columnIndex])
        .filter((cell) => cell && cell.dataset.value !== undefined);
      if (columnCells.length === 0) {
        return;
      }
      const bestValue = Math.max(...columnCells.map((cell) => Number.parseFloat(cell.dataset.value)));
      columnCells.forEach((cell) => {
        if (Number.parseFloat(cell.dataset.value) === bestValue) {
          cell.classList.add("is-best");
        }
      });
    });

    function clearColumnHover() {
      Array.from(table.querySelectorAll(".is-column-hovered")).forEach((cell) => {
        cell.classList.remove("is-column-hovered");
      });
    }

    table.addEventListener("mouseover", (event) => {
      const cell = event.target.closest("th, td");
      if (!cell || !table.contains(cell)) {
        return;
      }
      clearColumnHover();
      const columnIndex = cell.cellIndex;
      if (columnIndex < 0) {
        return;
      }
      Array.from(table.rows).forEach((row) => {
        if (row.cells[columnIndex]) {
          row.cells[columnIndex].classList.add("is-column-hovered");
        }
      });
    });

    table.addEventListener("mouseleave", clearColumnHover);

    rows.forEach((row) => {
      row.addEventListener("click", () => {
        rows.forEach((otherRow) => {
          if (otherRow !== row) {
            otherRow.classList.remove("is-pinned");
          }
        });
        row.classList.toggle("is-pinned");
      });
    });
  });
}

function setupReferenceSidebar(references) {
  const mobile = document.querySelector("[data-reference-mobile]");
  const notes = Array.from(document.querySelectorAll("[data-reference-note]"));
  const refs = Array.isArray(references) ? references : [];
  if (refs.length === 0) {
    if (mobile) {
      mobile.hidden = true;
    }
    notes.forEach((note) => {
      note.hidden = true;
    });
    return;
  }

  const inlineRefs = Array.from(document.querySelectorAll(".inline-ref[data-ref]"));
  const firstInlineByRef = new Map();
  inlineRefs.forEach((link) => {
    const refId = link.dataset.ref;
    if (!firstInlineByRef.has(refId)) {
      firstInlineByRef.set(refId, link);
      link.id = link.id || `${refId}-source`;
    }
  });

  function renderReference(ref, compact = false, idSuffix = "") {
    const source = firstInlineByRef.get(ref.id);
    const sourceHref = source ? `#${source.id}` : "#";
    const itemId = compact ? `${ref.id}-mobile` : idSuffix ? `${ref.id}-${idSuffix}` : ref.id;
    return `
      <article class="reference-item" id="${escapeHtml(itemId)}" data-reference-item="${escapeHtml(ref.id)}">
        <a class="reference-back" href="${sourceHref}" data-reference-back="${escapeHtml(ref.id)}">${escapeHtml(ref.label || "")}</a>
        <div>
          <a class="reference-title" href="${escapeHtml(ref.url || "#")}" target="_blank" rel="noopener">${escapeHtml(ref.title || "Untitled reference")}</a>
          <p>${escapeHtml(ref.authors || "")}${ref.venue ? `. ${escapeHtml(ref.venue)}` : ""}${ref.year ? `, ${escapeHtml(ref.year)}` : ""}</p>
          ${compact ? "" : `<a class="reference-url" href="${escapeHtml(ref.url || "#")}" target="_blank" rel="noopener">${escapeHtml(ref.url || "")}</a>`}
        </div>
      </article>
    `;
  }

  notes.forEach((note, noteIndex) => {
    const ref = refs.find((item) => item.id === note.dataset.referenceNote);
    if (!ref) {
      note.hidden = true;
      return;
    }
    note.innerHTML = `
      <div class="reference-sidebar-card">
        <span class="reference-sidebar-kicker">Reference</span>
        ${renderReference(ref, false, `note-${noteIndex + 1}`)}
      </div>
    `;
  });

  if (mobile) {
    mobile.innerHTML = `
      <h3>References</h3>
      ${refs.map((ref) => renderReference(ref, true)).join("")}
    `;
  }

  function setActiveReference(refId) {
    Array.from(document.querySelectorAll("[data-reference-item]")).forEach((item) => {
      item.classList.toggle("is-active", item.dataset.referenceItem === refId);
    });
  }

  inlineRefs.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveReference(link.dataset.ref);
    });
  });

  Array.from(document.querySelectorAll("[data-reference-back]")).forEach((link) => {
    link.addEventListener("click", () => {
      setActiveReference(link.dataset.referenceBack);
    });
  });
}

function setupFooter(footerConfig = {}) {
  const footer = document.querySelector("[data-footer-copy]");
  if (!footer) {
    return;
  }
  const organization = footerConfig.organization || "Colalab";
  const year = footerConfig.year || new Date().getFullYear();
  footer.innerHTML = `&copy; ${year} ${escapeHtml(organization)}. All rights reserved.`;
}

window.ProjectPage = {
  refreshCharts() {
    window.dispatchEvent(new CustomEvent("project-theme-change", {
      detail: { theme: document.documentElement.dataset.theme || getSystemTheme() }
    }));
  },
  setupThemeToggle,
  setupMetricsDashboard,
  setupVerticalCharts,
  setupDataPieChart,
  setupEnhancedTables,
  setupAutoplayCarousel,
  setupMediaPreviewModal,
  setupReferenceSidebar
};

const config = getProjectConfig();
setupThemeToggle(config.theme);
resetPageToHero();
setupPageNavigation();
setupMediaCarousel();
setupMediaPreviewModal();
setupHeroCollapse();
setupMethodDiagram();
setupTsnePlot();
setupMetricsDashboard(config.horizontalMetrics);
setupVerticalCharts(config.verticalCharts);
setupDataPieChart(config.dataPie);
setupDemoGallery();
setupEnhancedTables();
setupReferenceSidebar(config.references);
setupFooter(config.footer);
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
