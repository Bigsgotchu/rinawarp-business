/*!
 * RinaWarp UI Kit v2
 * Clean, no-import, no-framework UI helpers for static pages
 * - Mermaid (Terminal Pro) + Unicorn (Video Creator) ready
 * - Safe: no errors if elements or APIs are missing
 */

(function (window, document) {
  "use strict";

  // ----------------------------------------------------
  // Config
  // ----------------------------------------------------
  var RINA_API_BASE = window.RINA_API_BASE || "https://api.rinawarptech.com";
  var SEAT_ENDPOINT = RINA_API_BASE + "/api/license-count";
  var SEAT_REFRESH_SECONDS = 60; // refresh at most once per minute

  // ----------------------------------------------------
  // Small Helpers
  // ----------------------------------------------------
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function safeFetchJSON(url, options) {
    options = options || {};
    return fetch(url, options).then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    });
  }

  function throttle(fn, delayMs) {
    var last = 0;
    var timeout = null;
    return function () {
      var now = Date.now();
      var args = arguments;
      var remaining = delayMs - (now - last);
      if (remaining <= 0) {
        last = now;
        fn.apply(null, args);
      } else if (!timeout) {
        timeout = setTimeout(function () {
          last = Date.now();
          timeout = null;
          fn.apply(null, args);
        }, remaining);
      }
    };
  }

  // ----------------------------------------------------
  // Navigation: sticky + active state
  // (won't throw if elements missing)
  // ----------------------------------------------------
  function initNav() {
    var nav = $("header nav");
    if (!nav) return;

    var lastScroll = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || window.pageYOffset || 0;

      if (y > 40 && y > lastScroll) {
        nav.classList.add("nav-scrolled");
      } else if (y < 10) {
        nav.classList.remove("nav-scrolled");
      }

      lastScroll = y;
    });

    // Smooth scroll for internal anchors
    $all('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = link.getAttribute("href").slice(1);
        var targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ----------------------------------------------------
  // Mermaid Button Glow (for primary CTAs)
  // ----------------------------------------------------
  function initButtons() {
    $all("[data-rw-cta]").forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        btn.classList.add("rw-cta-hover");
      });
      btn.addEventListener("mouseleave", function () {
        btn.classList.remove("rw-cta-hover");
      });
    });
  }

  // ----------------------------------------------------
  // Seat Counter (Founder / Pioneer Wave)
  //
  // Expected HTML (example):
  //
  // <div data-rw-seat-container>
  //   <div class="seat-label">
  //     <span data-rw-seat-count>500</span> / 500 Founder Wave seats remaining
  //   </div>
  //   <div class="seat-bar-outer">
  //     <div class="seat-bar-inner" data-rw-seat-bar></div>
  //   </div>
  // </div>
  //
  // Optionally you can override:
  //   data-rw-seat-total="500"
  // ----------------------------------------------------
  var lastSeatFetch = 0;
  var seatThrottledFetch = null;

  function updateSeatUI(remaining, total) {
    var countEls = $all("[data-rw-seat-count]");
    var barEls = $all("[data-rw-seat-bar]");

    if (countEls.length === 0 && barEls.length === 0) return;

    var safeTotal = total > 0 ? total : remaining;
    var pct =
      safeTotal > 0
        ? Math.max(0, Math.min(100, (remaining / safeTotal) * 100))
        : 0;

    countEls.forEach(function (el) {
      try {
        el.textContent = remaining.toString();
      } catch (e) {
        // ignore
      }
    });

    barEls.forEach(function (el) {
      try {
        el.style.width = pct + "%";
      } catch (e) {
        // ignore
      }
    });
  }

  function initSeatCounter() {
    var container = $("[data-rw-seat-container]");
    if (!container) return; // no seat UI on this page

    var totalStr = container.getAttribute("data-rw-seat-total") || "500";
    var total = parseInt(totalStr, 10);
    if (isNaN(total) || total <= 0) total = 500;

    function fetchSeats() {
      var now = Date.now();
      if (now - lastSeatFetch < SEAT_REFRESH_SECONDS * 1000) {
        return;
      }
      lastSeatFetch = now;

      safeFetchJSON(SEAT_ENDPOINT)
        .then(function (data) {
          var remaining =
            typeof data.remaining === "number" ? data.remaining : total;
          updateSeatUI(remaining, total);
        })
        .catch(function () {
          // On error, do nothing visible; no console spam
        });
    }

    seatThrottledFetch = throttle(fetchSeats, SEAT_REFRESH_SECONDS * 1000);

    // Initial fetch
    fetchSeats();

    // Optional periodic refresh
    setInterval(function () {
      if (seatThrottledFetch) seatThrottledFetch();
    }, SEAT_REFRESH_SECONDS * 1000);
  }

  // ----------------------------------------------------
  // GA4 Event Helpers (safe, optional)
  // ----------------------------------------------------
  function initGA4Helpers() {
    // Attach click tracking for pricing CTA buttons
    $all("[data-rw-ga-tier]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tier = btn.getAttribute("data-rw-ga-tier") || "unknown";
        if (typeof window.gtag === "function") {
          window.gtag("event", "begin_checkout", {
            event_category: "Terminal Pro",
            event_label: tier,
          });
        }
      });
    });
  }

  // ----------------------------------------------------
  // File Tree Component
  // ----------------------------------------------------
  function initFileTree() {
    var container = $("[data-rw-file-tree]");
    if (!container) return;

    function renderNode(node) {
      var li = document.createElement("li");
      li.className = node.isDir ? "rw-dir" : "rw-file";

      var label = document.createElement("div");
      label.className = "rw-node-label";
      label.textContent = node.name;
      label.dataset.path = node.path;

      if (node.isDir) {
        var childList = document.createElement("ul");
        childList.style.display = "none";
        label.addEventListener("click", function () {
          childList.style.display =
            childList.style.display === "none" ? "block" : "none";
        });
        li.appendChild(label);
        li.appendChild(childList);
        if (node.children) {
          node.children.forEach(function (child) {
            childList.appendChild(renderNode(child));
          });
        }
      } else {
        label.addEventListener("click", function () {
          // Emit custom event for file opening
          var event = new CustomEvent("rwFileTree:fileSelected", {
            detail: { path: node.path, name: node.name },
          });
          window.dispatchEvent(event);
        });
        li.appendChild(label);
      }

      return li;
    }

    safeFetchJSON(RINA_API_BASE + "/api/files/tree")
      .then(function (data) {
        var byPath = {};
        data.items.forEach(function (item) {
          byPath[item.path] = Object.assign({}, item, {
            children: item.children || [],
          });
        });

        // build tree structure
        var rootNodes = [];
        Object.values(byPath).forEach(function (node) {
          var parentPath = node.path.split("/").slice(0, -1).join("/");
          if (!parentPath) {
            rootNodes.push(node);
          } else if (byPath[parentPath]) {
            byPath[parentPath].children.push(node);
          }
        });

        var ul = document.createElement("ul");
        ul.className = "rw-file-tree";

        rootNodes.forEach(function (n) {
          ul.appendChild(renderNode(n));
        });

        container.innerHTML = "";
        container.appendChild(ul);
      })
      .catch(function (err) {
        console.error("File tree error:", err);
        container.innerHTML =
          '<p class="rw-file-tree-error">Unable to load file tree</p>';
      });
  }

  // ----------------------------------------------------
  // Email Signup Form
  // ----------------------------------------------------
  function initEmailSignup() {
    var form = document.getElementById("email-signup-form");
    if (!form) return;

    var emailInput = document.getElementById("email-signup");
    var submitButton = form.querySelector('button[type="submit"]');

    function showMessage(message, type) {
      var messageEl =
        form.querySelector(".rw-form-message") || document.createElement("div");
      messageEl.className = "rw-form-message rw-form-" + type;
      messageEl.textContent = message;

      if (!form.contains(messageEl)) {
        form.appendChild(messageEl);
      }

      setTimeout(function () {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }

    function validateEmail(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function submitEmail(email) {
      var originalText = submitButton.textContent;
      submitButton.textContent = "Joining...";
      submitButton.disabled = true;

      // Send to backend API
      var payload = {
        email: email,
        source: "homepage-signup",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
      };

      fetch(RINA_API_BASE + "/api/email-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          showMessage(
            "🎉 You're in! Check your inbox for confirmation.",
            "success",
          );
          emailInput.value = "";
          gtag("event", "email_signup", {
            event_category: "engagement",
            event_label: "homepage",
          });
        })
        .catch(function (err) {
          console.error("Email signup error:", err);
          showMessage("Something went wrong. Please try again.", "error");
        })
        .finally(function () {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();

      if (!email) {
        showMessage("Please enter your email address.", "error");
        return;
      }

      if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
      }

      submitEmail(email);
    });
  }

  // ----------------------------------------------------
  // Dev/Owner Mode Detection
  // ----------------------------------------------------
  function initDevOwnerMode() {
    var license = window.RinaWarpLicense;
    var isOwner =
      license &&
      license.email === "karina@rinawarptech.com" &&
      license.tier === "founder";

    if (isOwner) {
      document.body.classList.add("rw-owner-mode");
    }
  }

  // ----------------------------------------------------
  // Public API
  // ----------------------------------------------------
  var RinaWarpUI = {
    init: function () {
      initNav();
      initButtons();
      initSeatCounter();
      initGA4Helpers();
      initFileTree();
      initEmailSignup();
      initDevOwnerMode();
    },
    // In case you want to manually refresh seat bar
    refreshSeats: function () {
      if (seatThrottledFetch) {
        seatThrottledFetch();
      }
    },
    // File tree public method
    refreshFileTree: function () {
      initFileTree();
    },
  };

  window.RinaWarpUI = RinaWarpUI;

  document.addEventListener("DOMContentLoaded", function () {
    RinaWarpUI.init();
  });
})(window, document);
