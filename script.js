const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const sections = [...document.querySelectorAll("main section[id]")];
const developmentPopup = document.querySelector(".development-popup");

if (developmentPopup) {
  document.body.classList.add("popup-open");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.querySelector(".material-symbols-outlined").textContent = isOpen ? "close" : "menu";
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!siteNav || !navToggle) return;

    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".material-symbols-outlined").textContent = "menu";
  });
});

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const isVisible = filter === "all" || card.dataset.category === filter;
      card.hidden = !isVisible;
    });
  });
});

const sampleCarousel = document.querySelector("[data-sample-carousel]");

if (sampleCarousel) {
  const track = sampleCarousel.querySelector("[data-sample-track]");
  const prevButton = sampleCarousel.querySelector("[data-sample-prev]");
  const nextButton = sampleCarousel.querySelector("[data-sample-next]");
  const sampleImages = [...sampleCarousel.querySelectorAll(".sample-card img")];
  let isAnimating = false;

  const getSlideStep = () => {
    const firstCard = track ? track.querySelector(".sample-card") : null;
    if (!track || !firstCard) return 0;

    const trackStyle = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const resetTrack = () => {
    if (!track) return;

    track.style.transition = "none";
    track.style.transform = "translateX(0)";
    track.offsetHeight;
    track.style.transition = "";
    isAnimating = false;
  };

  const moveNext = () => {
    if (!track || isAnimating) return;

    const step = getSlideStep();
    const firstCard = track.firstElementChild;
    if (!firstCard || step === 0) return;

    isAnimating = true;
    track.style.transform = `translateX(-${step}px)`;

    track.addEventListener("transitionend", () => {
      track.appendChild(firstCard);
      resetTrack();
    }, { once: true });
  };

  const movePrev = () => {
    if (!track || isAnimating) return;

    const step = getSlideStep();
    const lastCard = track.lastElementChild;
    if (!lastCard || step === 0) return;

    isAnimating = true;
    track.style.transition = "none";
    track.insertBefore(lastCard, track.firstElementChild);
    track.style.transform = `translateX(-${step}px)`;
    track.offsetHeight;
    track.style.transition = "";
    track.style.transform = "translateX(0)";

    track.addEventListener("transitionend", () => {
      isAnimating = false;
    }, { once: true });
  };

  if (prevButton) {
    prevButton.addEventListener("click", movePrev);
  }

  if (nextButton) {
    nextButton.addEventListener("click", moveNext);
  }

  if (sampleImages.length > 0) {
    const lightbox = document.createElement("div");
    lightbox.className = "sample-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Preview gambar showcase");
    lightbox.innerHTML = `
      <div class="sample-lightbox-panel">
        <button class="sample-lightbox-close" type="button" aria-label="Tutup preview gambar">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
        <img class="sample-lightbox-image" alt="">
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector(".sample-lightbox-image");
    const closeButton = lightbox.querySelector(".sample-lightbox-close");

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("sample-lightbox-open");
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    };

    sampleImages.forEach((image) => {
      image.addEventListener("click", () => {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "Preview gambar showcase";
        lightbox.classList.add("is-open");
        document.body.classList.add("sample-lightbox-open");
        closeButton.focus();
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const contactSubmitButton = contactForm?.querySelector("button[type='submit']");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    formStatus.textContent = "Mengirim permintaan...";
    if (contactSubmitButton) {
      contactSubmitButton.disabled = true;
    }

    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengirim permintaan.");
        }

        contactForm.reset();
        formStatus.textContent = "Permintaan berhasil dikirim. Tim kami akan menghubungi Anda.";
      })
      .catch((error) => {
        formStatus.textContent = error.message || "Terjadi kesalahan saat mengirim permintaan.";
      })
      .finally(() => {
        if (contactSubmitButton) {
          contactSubmitButton.disabled = false;
        }
      });
  });
}
