(function () {
  "use strict";

  function initHeaderScroll() {
    const header = document.querySelector("header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 10) {
        header.classList.add("rw-header-scrolled");
      } else {
        header.classList.remove("rw-header-scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMobileNav() {
    const toggle = document.querySelector("[data-rw-nav-toggle]");
    const nav = document.querySelector("[data-rw-nav]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("rw-nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("rw-nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initSmoothAnchors() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function highlightActiveNav() {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const navLinks = document.querySelectorAll("nav a[href]");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // Match root and simple routes
      if (href === path || (href !== "/" && path.startsWith(href))) {
        link.classList.add("rw-nav-active");
      } else {
        link.classList.remove("rw-nav-active");
      }
    });
  }

  function logLoaded() {
    // Keep your fun console log
    console.log("🎨 RinaWarp Mermaid UI Kit loaded successfully");
  }

  function initAll() {
    initHeaderScroll();
    initMobileNav();
    initSmoothAnchors();
    highlightActiveNav();
    logLoaded();
  }

  document.addEventListener("DOMContentLoaded", initAll);
})();