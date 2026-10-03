// ===== SNS Enterprise — Shared JS =====

document.addEventListener("DOMContentLoaded", function () {
  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav.main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- Cookie consent banner ---- */
  var banner = document.getElementById("cookie-banner");
  var accept = document.getElementById("cookie-accept");
  var decline = document.getElementById("cookie-decline");
  var CONSENT_KEY = "sns_cookie_consent"; // "accepted" | "declined"

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  if (banner) {
    if (!getConsent()) {
      banner.classList.add("show");
    }
    if (accept) {
      accept.addEventListener("click", function () {
        setConsent("accepted");
        banner.classList.remove("show");
        // Analytics scripts should check getConsent() === "accepted"
        // before loading — see /js/main.js loadAnalyticsIfConsented()
        loadAnalyticsIfConsented();
      });
    }
    if (decline) {
      decline.addEventListener("click", function () {
        setConsent("declined");
        banner.classList.remove("show");
      });
    }
  }

  function loadAnalyticsIfConsented() {
    if (getConsent() !== "accepted") return;
    // Plug your analytics snippet here (see the guide for setup).
    // Example:
    // var s = document.createElement("script");
    // s.src = "https://plausible.io/js/script.js";
    // s.setAttribute("data-domain", "snsenterprise.com");
    // document.head.appendChild(s);
  }
  loadAnalyticsIfConsented();

  /* ---- Accessible form validation + honeypot spam protection ---- */
  var forms = document.querySelectorAll("form[data-validate]");
  forms.forEach(function (form) {
    var status = form.querySelector("#form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;

      // Honeypot: if filled, silently treat as spam (bots fill every field)
      var hp = form.querySelector(".hp-field input");
      if (hp && hp.value.trim() !== "") {
        if (status) {
          status.textContent = "Thanks! Your message has been sent.";
          status.className = "success";
        }
        form.reset();
        return; // silently drop, no real submission
      }

      form.querySelectorAll("[required]").forEach(function (field) {
        var wrapper = field.closest(".field");
        var errorEl = wrapper ? wrapper.querySelector(".error-text") : null;
        var isValid = field.checkValidity() && field.value.trim() !== "";

        if (field.type === "email" && field.value.trim() !== "") {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = isValid && emailPattern.test(field.value.trim());
        }

        if (!isValid) {
          valid = false;
          if (wrapper) wrapper.classList.add("invalid");
          field.setAttribute("aria-invalid", "true");
          if (!firstInvalid) firstInvalid = field;
        } else {
          if (wrapper) wrapper.classList.remove("invalid");
          field.removeAttribute("aria-invalid");
        }
      });

      if (!valid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
          status.className = "failure";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Form is valid and passed the honeypot check.
      // Replace this block with a real submission (see the database/
      // form-handling guide) — e.g. fetch() to Formspree/Supabase/your API.
      if (status) {
        status.textContent = "Thanks! Your order request has been received. We'll contact you shortly.";
        status.className = "success";
      }
      form.reset();
    });

    // Live re-validation as the user types/corrects a field
    form.querySelectorAll("[required]").forEach(function (field) {
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("invalid") && field.checkValidity() && field.value.trim() !== "") {
          wrapper.classList.remove("invalid");
          field.removeAttribute("aria-invalid");
        }
      });
    });
  });
});
