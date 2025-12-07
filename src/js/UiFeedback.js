// UIFeedback.js

/**
 * Displays an error message in the error container.
 * Prevents duplicate messages by clearing old entries.
 * @param {string} message - The error message to display.
 */
export function displayError(message) {
    try {
      const errorContainer = document.getElementById("errorContainer");
      if (!errorContainer) {
        console.error("Error container not found in the DOM.");
        return;
      }
      // Remove old error messages safely
      while (errorContainer.firstChild) {
        errorContainer.removeChild(errorContainer.firstChild);
      }
      // Prevent duplicate error messages
      const existingErrors = Array.from(errorContainer.children).map(el => el.textContent);
      if (existingErrors.includes(`${message}`)) {
        return; // Don't add duplicate messages
      }
      // Append new error message
      const errorElement = document.createElement("p");
      errorElement.textContent = `${message}`;
      errorContainer.appendChild(errorElement);
    } catch (err) {
      console.error("Error displaying error message:", err.message);
    }
  }
  
  /**
   * Displays a success message in the success container.
   * Clears any old success messages before displaying the new one.
   * @param {string} message - The success message to display.
   */
  export function displaySuccess(message) {
    try {
      const successContainer = document.getElementById("successContainer");
      if (!successContainer) {
        console.error("Success container not found in the DOM.");
        return;
      }
      // Remove old success messages safely
      while (successContainer.firstChild) {
        successContainer.removeChild(successContainer.firstChild);
      }
      // Append new success message
      const successElement = document.createElement("p");
      successElement.style.color = "blue";
      successElement.textContent = `${message}`;
      successContainer.appendChild(successElement);
    } catch (err) {
      console.error("Error displaying success message:", err.message);
    }
  }
  