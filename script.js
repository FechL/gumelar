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

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    formStatus.textContent = "Permintaan berhasil disiapkan. Tim kami akan segera menghubungi Anda.";
  });
}
