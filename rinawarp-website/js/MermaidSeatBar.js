(function () {
  "use strict";

  // Use relative URL for same-domain requests to avoid CORS issues in production
  const API_URL = "/api/license-count";
  
  let requestInProgress = false;
  let lastRequestTime = 0;
  const REQUEST_THROTTLE_MS = 10000; // 10 seconds

  async function fetchLicenseCount() {
    // Prevent multiple simultaneous requests
    if (requestInProgress) {
      console.log("Seat bar request already in progress, skipping...");
      return null;
    }
    
    // Throttle requests to prevent spam
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_THROTTLE_MS) {
      console.log("Seat bar request throttled, waiting...");
      return null;
    }
    
    requestInProgress = true;
    lastRequestTime = now;
    
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const data = await res.json();
      if (!data || typeof data.remaining !== "number") {
        throw new Error("Missing or invalid 'remaining' field");
      }

      return data.remaining;
    } catch (err) {
      console.warn("Seat data unavailable:", err);
      return null;
    } finally {
      requestInProgress = false;
    }
  }

  function renderSeatBar(remaining) {
    const bar = document.querySelector("[data-seat-bar]");
    const label = document.querySelector("[data-seat-label]");

    if (!bar || !label) {
      // This page doesn't have a seat bar; nothing to do
      return;
    }

    if (remaining === null) {
      label.textContent = "Live seat counter temporarily unavailable.";
      bar.classList.add("rw-seat-error");
      return;
    }

    label.textContent = remaining + " lifetime seats left in Founder Wave";
    bar.classList.add("rw-seat-loaded");

    // Optional visual width based on remaining percentage (out of 500)
    const totalSeats = Number(bar.getAttribute("data-seat-total")) || 500;
    const used = Math.max(0, totalSeats - remaining);
    const pct = Math.max(0, Math.min(100, (used / totalSeats) * 100));
    bar.style.setProperty("--rw-seat-used", pct + "%");
  }

  async function initSeatBar() {
    const bar = document.querySelector("[data-seat-bar]");
    const label = document.querySelector("[data-seat-label]");

    if (!bar || !label) {
      // No seat bar on this page; just exit
      return;
    }

    label.textContent = "Checking remaining lifetime seats...";
    const remaining = await fetchLicenseCount();
    renderSeatBar(remaining);
  }

  document.addEventListener("DOMContentLoaded", initSeatBar);
})();