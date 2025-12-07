// Security.js
// Module containing security-related functions such as protocol verification, CSRF protection, and rate limiting.
import { handleMembershipSubmission } from "./formsubmission.js";

// --- Configuration ---
export const MAX_REQUESTS = 5;
export const TIME_WINDOW_MS = 60000; // 60 seconds

/**
 * Verifies that the current page is loaded over HTTPS.
 * If not, logs a warning, displays an error, and attempts to redirect.
 * Certificate validation is left to the browser.
 */
// Only enforce HTTPS in non-local environments.
export const verifySecureProtocol = () => {
  const isLocalHost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]" ||
    // vite/webpack define env flags; if present, treat as dev
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV);

  if (isLocalHost) {
    console.log("Skipping HTTPS enforcement on localhost/dev.");
    return true;
  }

  if (location.protocol !== "https:") {
    console.warn("Security Warning: Insecure protocol detected. Redirecting to HTTPS…");
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
      errorContainer.textContent =
        "This site requires a secure HTTPS connection. Redirecting to secure version...";
    }
    const secureUrl = location.href.replace(/^http:/i, "https:");
    location.replace(secureUrl);
    return false;
  }

  console.log("HTTPS protocol verified. Secure connection is active.");
  return true;
};

  
  /**
   * Generates a new CSRF token using the crypto API.
   */
  export const generateCSRFToken = () => crypto.randomUUID();
  
  /**
   * Sets a new CSRF token in sessionStorage and in the hidden CSRF field (if it exists).
   */
  export const setNewCSRFToken = () => {
    const token = generateCSRFToken();
    sessionStorage.setItem("csrfToken", token);
    const hiddenTokenInput = document.getElementById("csrfToken");
    if (hiddenTokenInput) {
      hiddenTokenInput.value = token;
    }
  };
  
  /**
   * Validates the submitted CSRF token against the token stored in sessionStorage.
   * @param {string} submittedToken 
   * @returns {boolean}
   */
  export const validateCSRFToken = (submittedToken) => {
    const stored = sessionStorage.getItem("csrfToken");
    return submittedToken === stored;
  };
  
  /**
   * Retrieves submission timestamps from sessionStorage.
   * @returns {Array<number>}
   */
  export const getSubmissionTimes = () =>
    JSON.parse(sessionStorage.getItem("submissionTimes") || "[]");
  
  /**
   * Adds the current timestamp to the submission times,
   * keeping only those within the designated time window.
   * @returns {Array<number>}
   */
  export const addSubmissionTime = () => {
    const now = Date.now();
    const TIME_WINDOW_MS = 60000; // 60 seconds
    const times = getSubmissionTimes().filter(t => now - t < TIME_WINDOW_MS);
    times.push(now);
    sessionStorage.setItem("submissionTimes", JSON.stringify(times));
    return times;
  };
  
  /**
   * Checks whether the submission rate has exceeded the maximum allowed requests.
   * @returns {boolean}
   */
  export const isRateLimited = () => {
    const TIME_WINDOW_MS = 60000;
    const MAX_REQUESTS = 5;
    return getSubmissionTimes().filter(t => Date.now() - t < TIME_WINDOW_MS).length >= MAX_REQUESTS;
  };
  
  /**
   * Inserts a hidden CSRF token input field into the specified forms.
   */
  export const addCSRFInputToForms = () => {
    const forms = ["membershipForm", "bookingForm"];
    forms.forEach(id => {
      const form = document.getElementById(id);
      if (form && !form.querySelector("#csrfToken")) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "csrfToken";
        input.name = "csrfToken";
        form.appendChild(input);
      }
    });
  };
  
  /**
   * Sets up the membership form with CSRF and rate limiting checks.
   */
  export const secureMembershipForm = () => {
    const form = document.getElementById("membershipForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = [];
      const submittedToken = document.getElementById("csrfToken").value;
      
      if (!validateCSRFToken(submittedToken)) {
        console.error("Invalid or missing CSRF token.");
        results.push({ Test: "CSRF Token", Input: submittedToken, Expected: "Valid", Actual: "Invalid", Status: "FAIL" });
        console.table(results);
        return;
      }
      
      if (isRateLimited()) {
        console.error("Too many requests. Please wait.");
        results.push({ Test: "Rate Limiting", Input: getSubmissionTimes(), Expected: "<5", Actual: ">=5", Status: "FAIL" });
        console.table(results);
        return;
      }
      
      addSubmissionTime();
      results.push({ Test: "Valid Submission", Input: submittedToken, Expected: "Success", Actual: "Success", Status: "PASS" });
      console.table(results);
      
      handleMembershipSubmission(e);
      // Then, refresh the CSRF token
      setNewCSRFToken();
    });
  };
  // Initialize all security features
export const initSecurity = () => {
    addCSRFInputToForms();
    setNewCSRFToken();
    secureMembershipForm();
}