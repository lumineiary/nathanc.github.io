import justifiedLayout from "justified-layout";

const galleryShell = document.querySelector("[data-gallery-shell]");
const gallery = galleryShell?.querySelector("[data-gallery]");
const imageDataScript = galleryShell?.querySelector("[data-gallery-images]");
const loadMoreButton = galleryShell?.querySelector("[data-load-more]");
const loadMoreCount = galleryShell?.querySelector("[data-load-more-count]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const closeButton = lightbox?.querySelector(".lightbox-close");
const prevButton = lightbox?.querySelector(".lightbox-prev");
const nextButton = lightbox?.querySelector(".lightbox-next");

const batchSize = 30;
const desktopLayout = {
  boxSpacing: 10,
  targetRowHeight: 255
};
const mobileLayout = {
  boxSpacing: 8,
  targetRowHeight: 168
};
const images = imageDataScript ? JSON.parse(imageDataScript.textContent || "[]") : [];
let renderedCount = gallery?.querySelectorAll(".shot").length || 0;
let activeIndex = -1;
let resizeFrame = 0;

function numericRatio(image) {
  const ratio = Number(image?.aspectRatio);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1.5;
}

function layoutConfig(containerWidth) {
  const responsive = window.innerWidth <= 620 ? mobileLayout : desktopLayout;
  return {
    containerWidth,
    containerPadding: 0,
    boxSpacing: responsive.boxSpacing,
    targetRowHeight: responsive.targetRowHeight,
    targetRowHeightTolerance: 0.25,
    showWidows: true,
    widowLayoutStyle: "left"
  };
}

function shotTemplate(image, index) {
  const button = document.createElement("button");
  button.className = "shot";
  button.type = "button";
  button.dataset.large = image.large;
  button.dataset.index = String(index);
  button.dataset.ratio = String(numericRatio(image));
  button.style.setProperty("--ratio", button.dataset.ratio);

  const img = document.createElement("img");
  img.src = image.thumb;
  img.alt = image.alt || "Gallery image";
  img.loading = "lazy";
  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;

  button.append(img);
  button.addEventListener("click", () => openLightbox(index));
  return button;
}

function applyFallbackLayout(shots) {
  const rowHeight = window.innerWidth <= 620 ? mobileLayout.targetRowHeight : desktopLayout.targetRowHeight;
  gallery.style.removeProperty("height");
  gallery.style.removeProperty("--gallery-gap");

  for (const shot of shots) {
    const ratio = Number(shot.dataset.ratio || 1.5);
    shot.style.position = "relative";
    shot.style.left = "auto";
    shot.style.top = "auto";
    shot.style.width = `${Math.max(120, ratio * rowHeight)}px`;
    shot.style.height = `${rowHeight}px`;
  }
}

function layoutGallery() {
  if (!gallery) return;

  const shots = [...gallery.querySelectorAll(".shot")];
  if (shots.length === 0) {
    gallery.style.height = "0px";
    return;
  }

  const width = gallery.clientWidth;
  if (!width) {
    applyFallbackLayout(shots);
    return;
  }

  try {
    const layout = justifiedLayout(
      shots.map((shot) => Number(shot.dataset.ratio || 1.5)),
      layoutConfig(width)
    );

    gallery.style.height = `${layout.containerHeight}px`;
    gallery.style.setProperty("--gallery-gap", `${window.innerWidth <= 620 ? mobileLayout.boxSpacing : desktopLayout.boxSpacing}px`);

    layout.boxes.forEach((box, index) => {
      const shot = shots[index];
      if (!shot) return;
      shot.style.position = "absolute";
      shot.style.left = `${box.left}px`;
      shot.style.top = `${box.top}px`;
      shot.style.width = `${box.width}px`;
      shot.style.height = `${box.height}px`;
    });
  } catch {
    applyFallbackLayout(shots);
  }
}

function scheduleLayout() {
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = 0;
    layoutGallery();
  });
}

function syncLoadMore() {
  if (!loadMoreButton || !loadMoreCount) return;
  const remaining = Math.max(images.length - renderedCount, 0);
  loadMoreButton.hidden = remaining === 0;
  loadMoreCount.textContent = `Showing ${renderedCount} of ${images.length}`;
}

function renderNextBatch() {
  if (!gallery) return;
  const nextImages = images.slice(renderedCount, renderedCount + batchSize);
  nextImages.forEach((image, offset) => {
    gallery.append(shotTemplate(image, renderedCount + offset));
  });
  renderedCount += nextImages.length;
  layoutGallery();
  syncLoadMore();
}

function ensureImageRendered(index) {
  if (index < renderedCount) return;
  while (renderedCount <= index && renderedCount < images.length) {
    renderNextBatch();
  }
}

function setLightboxImage(index) {
  if (!lightbox || !lightboxImage || images.length === 0) return;

  activeIndex = (index + images.length) % images.length;
  ensureImageRendered(activeIndex);
  const image = images[activeIndex];
  lightboxImage.src = image.large;
  lightboxImage.alt = image.alt || "Selected gallery image";
}

function openLightbox(index) {
  if (!lightbox || !lightboxImage || images.length === 0) return;

  setLightboxImage(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  closeButton?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  activeIndex = -1;
}

function showPreviousImage() {
  if (activeIndex === -1) return;
  setLightboxImage(activeIndex - 1);
}

function showNextImage() {
  if (activeIndex === -1) return;
  setLightboxImage(activeIndex + 1);
}

gallery?.querySelectorAll(".shot").forEach((shot) => {
  const index = Number(shot.dataset.index || 0);
  const image = images[index] || {};
  shot.dataset.ratio = String(numericRatio(image));
  shot.style.setProperty("--ratio", String(numericRatio(image)));
  shot.addEventListener("click", () => openLightbox(index));
});

loadMoreButton?.addEventListener("click", renderNextBatch);
closeButton?.addEventListener("click", closeLightbox);
prevButton?.addEventListener("click", showPreviousImage);
nextButton?.addEventListener("click", showNextImage);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
  if (!lightbox?.classList.contains("is-open")) return;

  if (event.key === "ArrowLeft") showPreviousImage();
  if (event.key === "ArrowRight") showNextImage();
});

window.addEventListener("resize", scheduleLayout);
layoutGallery();
syncLoadMore();
