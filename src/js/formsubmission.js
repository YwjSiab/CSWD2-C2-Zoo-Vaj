// formsubmission.js
// This module handles form submissions for the NTC Zoo application.
// It includes functions to sanitize user input, process the booking form,
// process the membership form, and attach the relevant event listeners.
import { displayError, displaySuccess } from "./UiFeedback.js";

// -------------------------------
// PHONE VALIDATION HELPERS
// -------------------------------
export const normalizePhone = (s) => s.replace(/[^\d]/g, "");

export const isValidUSPhone = (raw) => {
  const d = normalizePhone(raw);

  // Must be 10 digits or 11 digits starting with 1
  let core = d;
  if (d.length === 11 && d.startsWith("1")) {
    core = d.slice(1);
  } else if (d.length !== 10) {
    return false;
  }

  // NANP rules:
  const area = core.slice(0, 3);
  const exchange = core.slice(3, 6);

  // Area code cannot start with 0 or 1
  if (/^[01]/.test(area)) return false;

  // Exchange cannot start with 0 or 1
  if (/^[01]/.test(exchange)) return false;

  // Reject illegal or nonsense patterns
  if (/^([0-9])\1+$/.test(core)) return false;     // 0000000000, 1111111111
  if (core === "1234567890" || core === "1234567891") return false;

  return true;
};

export const formatUSPhone = (raw) => {
  const d = normalizePhone(raw);
  const core = d.length === 11 ? d.slice(1) : d;
  if (core.length !== 10) return raw;
  return `(${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6)}`;
};

// field-level inline feedback
const setFieldMsg = (input, text, ok = false) => {
  const msg = input.closest(".field")?.querySelector(".msg");
  if (msg) msg.textContent = text;
  input.classList.toggle("is-valid", ok);
  input.classList.toggle("is-invalid", !ok);
};

/**
 * Function to initialize the membership form (without handling submission)
 */
export const initializeMembershipForm = () => {
    console.log("Initializing membership form...");
    const form = document.getElementById("membershipForm");
    if (!form) {
      console.error("Membership form not found.");
      return;
    }
    // Reset the form fields on page load or apply any default values.
    form.reset();
  };

//////////////////////////////
// Input Sanitization
//////////////////////////////
export const sanitizeInput = (input) => {
    console.log("Before Sanitization:", input);
    
    // Buffer Overflow Protection: Limit input length to 255 characters.
    const maxLength = 255;
    if (input.length > maxLength) {
      console.warn("Input truncated due to length limit");
      input = input.slice(0, maxLength);
    }
    
    // SQL Injection Detection using a regex pattern.
    const sqlPattern = /\b(SELECT|INSERT|DELETE|DROP|UPDATE|UNION|--|;|\|)/gi;
    if (sqlPattern.test(input)) {
      console.warn("SQL Injection pattern detected in input:", input);
      // Reject the input by throwing an error to prevent submission.
      throw new Error("Suspicious input detected. Please remove any SQL keywords.");
    }
    
    // Remove any HTML tags.
    const tagStripped = input.replace(/<[^>]*>?/gm, "");
    
    // Encode common dangerous characters.
    const encoded = tagStripped
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    
    console.log("After Sanitization:", encoded);
    return encoded;
  };
  
  //////////////////////////////
  // Booking Form Submission
  //////////////////////////////
  export const setupBookingForm = () => {
    const bookingForm = document.getElementById("bookingForm");
    if (!bookingForm) {
      console.error("Booking form not found. Check your HTML.");
      return;
    }
    
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent default form submission
      
      try {
        // Retrieve and sanitize input values.
        const visitorName = sanitizeInput(document.getElementById("visitorName").value.trim());
        const contact = sanitizeInput(document.getElementById("contact").value.trim());
        // Validate the phone number input.
        const contactInput = document.getElementById("contact");
        if (!isValidUSPhone(contact)) {
          setFieldMsg(contactInput, "Invalid phone number. Must be 10 digits.");
          alert("Please enter a valid phone number.");
          return;
        } else {
          setFieldMsg(contactInput, "Phone looks good!", true);
          contactInput.value = formatUSPhone(contact);
        }
        const selectedAnimal = sanitizeInput(document.getElementById("animal").value);
        const dateTime = sanitizeInput(document.getElementById("dateTime").value);
        const groupSize = parseInt(document.getElementById("groupSize").value, 10);
        
        // Validate inputs.
        if (!visitorName || !contact || !selectedAnimal || !dateTime || isNaN(groupSize) || groupSize < 1) {
          throw new Error("Please fill in all required fields with valid data.");
        }
        
        // Store booking data to localStorage.
        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        bookings.push({ visitorName, contact, selectedAnimal, dateTime, groupSize });
        localStorage.setItem("bookings", JSON.stringify(bookings));
        
        alert("Booking confirmed!");
        
        // Update the visitor count, if a global updateVisitorCount() function exists.
        if (window.updateVisitorCount) {
          window.updateVisitorCount(groupSize);
        }
        
        // Reset the booking form.
        bookingForm.reset();
        
      } catch (error) {
        console.error("Error processing booking:", error.message);
        alert(error.message);
      }
    });
  };
  
  //////////////////////////////
  // Membership Form Submission
  //////////////////////////////
  export const handleMembershipSubmission = (event) => {
    event.preventDefault();
    try {
      // Get membership form fields.
      const nameEl = document.getElementById("name");
      const emailEl = document.getElementById("email");
      const membershipTypeEl = document.getElementById("membershipType");
      const startDateEl = document.getElementById("startDate");
      const emergencyContactEl = document.getElementById("emergencyContact");
      
      // Ensure all required fields exist.
      if (!nameEl || !emailEl || !membershipTypeEl || !startDateEl || !emergencyContactEl) {
        throw new Error("Some membership form fields were not found in the DOM.");
      }
      
      // Read and sanitize the input values.
      const name = sanitizeInput(nameEl.value.trim());
      const email = sanitizeInput(emailEl.value.trim());
      const membershipType = sanitizeInput(membershipTypeEl.value);
      const startDate = sanitizeInput(startDateEl.value);
      const emergencyContact = sanitizeInput(emergencyContactEl.value.trim());
      // Validate the emergency contact input.
      const emergencyContactInput = document.getElementById("emergencyContact");
      if (!isValidUSPhone(emergencyContact)) {
        setFieldMsg(emergencyContactInput, "Please enter a valid phone number (US, 10 digits).");
        if (window.displayError) displayError("Invalid emergency contact phone.");
        return;
      } else {
        setFieldMsg(emergencyContactInput, `Phone looks good: ${formatUSPhone(emergencyContact)}`, true);
      }
      const photoDataUrl = (document.getElementById("memberPhotoDataUrl")?.value || "").trim();
      
      // Validate input values.
      if (!name || !email || !membershipType || !startDate || !emergencyContact) {
        throw new Error("Please fill in all required fields.");
      }
      
      // Save membership data to localStorage.
      const members = JSON.parse(localStorage.getItem("members")) || [];
      members.push({ name, email, membershipType, startDate, emergencyContact, photoDataUrl});
      localStorage.setItem("members", JSON.stringify(members));
      
      // Optionally use a global displaySuccess() function to show a success message.
      if (window.displaySuccess) {
        window.displaySuccess("Membership registration successful!");
      }
      
      console.log("Membership registered successfully.");
      
      // Update visitor count using a global function if available.
      if (window.updateVisitorCount) {
        window.updateVisitorCount(1);
      }
      
      // Reset the membership form.
      event.target.reset();
      const preview = document.getElementById("memberPhotoPreview");
      if (preview) { preview.src = ""; preview.style.display = "none"; }
      const hidden = document.getElementById("memberPhotoDataUrl");
      if (hidden) hidden.value = "";
      
    } catch (error) {
      console.error("Error processing membership registration:", error.message);
      // Optionally use a global displayError() function if defined.
      if (window.displayError) {
        window.displayError(error.message);
      }
    }
  };
  
  export const setupMembershipForm = () => {
    const membershipForm = document.getElementById("membershipForm");
    if (!membershipForm) {
      console.error("Membership form not found.");
      return;
    }
    membershipForm.addEventListener("submit", handleMembershipSubmission);
  };  

  // formsubmission.js
// Regex-based validation and user feedback for Add Animal form

export const patterns = {
  // 2–30 letters, spaces, apostrophes, and hyphens
  name: /^[A-Za-z][A-Za-z' -]{1,29}$/,
  // Allowed species (adjust if you add more)
  species: /^(Elephant|Tiger|Panda|Lion)$/i,
  // Open or Closed
  status: /^(Open|Closed)$/i,
  // Health states
  health: /^(Healthy|Sick|Injured)$/i,
  // image path like images/ellie.png/.jpg/.jpeg/.webp
  image: /^images\/[a-z0-9_-]+\.(png|jpg|jpeg|webp)$/i,
  // Latitude: -90..90 with optional decimals
  lat: /^(\+|-)?(?:90(?:\.0+)?|[0-8]?\d(?:\.\d+)?)$/,
  // Longitude: -180..180 with optional decimals
  lng: /^(\+|-)?(?:180(?:\.0+)?|1[0-7]\d(?:\.\d+)?|[0-9]?\d(?:\.\d+)?)$/,
  // Validates US phone numbers (10 digits, optional +1, allows spaces/dots/dashes)
  phone: /^(\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/
};

function setFeedback(input, ok, message = "") {
  const msg = input.parentElement.querySelector(".msg");
  input.classList.toggle("is-valid", ok);
  input.classList.toggle("is-invalid", !ok);
  if (msg) {
    msg.textContent = message;
    msg.classList.toggle("ok", ok);
    msg.classList.toggle("err", !ok);
  }
}

export function validateField(id, pattern, friendlyName) {
  const el = document.getElementById(id);
  if (!el) return { ok: false, el: null, value: "" };
  const value = el.value.trim();
  const ok = pattern.test(value);
  setFeedback(el, ok, ok ? `${friendlyName} looks good.` : `Please enter a valid ${friendlyName}.`);
  return { ok, el, value };
}

/**
 * Hook the “Add Animal” form and call onAdded(newAnimal) when valid.
 * Shows inline field messages + top success/error messages.
 */
export function wireAddAnimalForm(onAdded) {
  const form = document.getElementById("addAnimalForm");
  if (!form) {
    console.warn("addAnimalForm not found");
    return;
  }

  const $ = id => form.querySelector("#" + id);
  const setMsg = (input, text, ok = false) => {
    const small = input.closest(".field")?.querySelector(".msg");
    if (small) {
      small.textContent = text || "";
      small.style.color = ok ? "green" : "red";
    }
  };

  // Simple, readable patterns for this assignment
  const reName    = /^[A-Za-z ]{3,}$/;
  const reSpecies = /^[A-Za-z ]+$/;
  const reStatus  = /^(Open|Closed)$/i;
  const reHealth  = /^(Healthy|Sick|Injured)$/i;
  const reImage   = /^images\/.+\.(png|jpe?g|gif|webp)$/i;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // grab inputs
    const name    = $("animalName");
    const species = $("animalSpecies");
    const status  = $("animalStatus");
    const health  = $("animalHealth");
    const image   = $("animalImage");
    const lat     = $("animalLat");
    const lng     = $("animalLng");

    // reset messages
    [name,species,status,health,image,lat,lng].forEach(i => setMsg(i, ""));

    // validate
    let ok = true;
    if (!reName.test(name.value.trim())) {
      ok = false; setMsg(name, "Name must be 3+ letters/spaces.");
    }
    if (!reSpecies.test(species.value.trim())) {
      ok = false; setMsg(species, "Species must be letters only.");
    }
    if (!reStatus.test(status.value.trim())) {
      ok = false; setMsg(status, 'Status must be "Open" or "Closed".');
    }
    if (!reHealth.test(health.value.trim())) {
      ok = false; setMsg(health, 'Health must be Healthy, Sick, or Injured.');
    }
    if (!reImage.test(image.value.trim())) {
      ok = false; setMsg(image, 'Image must look like "images/ellie.png".');
    }
    const latNum = Number(lat.value);
    const lngNum = Number(lng.value);
    if (!Number.isFinite(latNum) || Math.abs(latNum) > 90) {
      ok = false; setMsg(lat, "Latitude must be a number between -90 and 90.");
    }
    if (!Number.isFinite(lngNum) || Math.abs(lngNum) > 180) {
      ok = false; setMsg(lng, "Longitude must be a number between -180 and 180.");
    }

    if (!ok) {
      displayError("Please fix the highlighted fields and try again.");
      return;
    }

    // build the new animal object (shape matches your existing cards)
    const newAnimal = {
      id: Date.now(),                    // simple unique id for demo
      name:   name.value.trim(),
      species: species.value.trim(),
      status:  /open/i.test(status.value) ? "Open" : "Closed",
      health:  health.value.trim(),
      location: { lat: latNum, lng: lngNum },
      feedingSchedule: [],
      maintenanceRecords: [],
      image: image.value.trim()
    };

      console.log("Submitting NEW ANIMAL →", newAnimal);
    
    try {
      // add to page immediately
      if (typeof onAdded === "function") onAdded(newAnimal);

      // (optional) clear the form
      form.reset();
      displaySuccess(`Added ${newAnimal.name} (${newAnimal.species}) to the zoo.`);
    } catch (err) {
      console.error("Unable to add animal:", err);
      displayError("Something went wrong while adding the animal.");
    }
  });
}