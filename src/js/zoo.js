// zoo.js - Central initialization for Zoo Management System
import { initSecurity, verifySecureProtocol } from './Security.js';
import { initializeMembershipForm, setupBookingForm} from './formsubmission.js';
import { populateAnimalDropdown } from './AnimalData.js';
import { ensureApiAwake, fetchAnimals } from "./AnimalAPI.js";
import { toggleZooStatus, updateVisitorCount, displayZooStatistics, toggleAnimalHealth, toggleAnimalStatus } from './ZooOperations.js';
import { updateAdminDashboard } from './AdminDashboard.js';
import { displayError, displaySuccess } from './UiFeedback.js';
import { exhibits, emergencyStations } from './zooLocations.js';
import "../components/zoo-animal-card.js";
import "../components/z-hover-highlight.js";
import "../components/zoo-photo-booth.js";
import { wireAddAnimalForm } from "./formsubmission.js";

export function addAnimalToListAndRender(animal) {
  window.animals.push(animal);
  renderAnimalCards();
  populateAnimalDropdown(window.animals);
  window.displaySuccess?.(`Added ${animal.name} (${animal.species}).`);
}

const renderAnimalCards = () => {
  const container = document.getElementById("animalContainer");
  container.innerHTML = "";
  window.animals.forEach(a => {
    const el = document.createElement("zoo-animal-card");
    el.data = a;
    container.appendChild(el);
  });
};

function syncCardsWithAnimals() {
  document.querySelectorAll("zoo-animal-card").forEach(card => {
    const id = card.data?.id;
    const latest = window.animals.find(a => String(a.id) === String(id));
    if (!latest) return;
    // update the label inside the card’s shadow DOM
    const lbl = card.shadowRoot?.getElementById(`status-${id}`);
    if (lbl) lbl.textContent = latest.status;
    // keep the card’s data in sync for future clicks
    card.data = latest;
  });
}

function wireMemberCamera() {
  const booth = document.getElementById("memberCamera");
  const hidden = document.getElementById("memberPhotoDataUrl");
  const preview = document.getElementById("memberPhotoPreview");

  if (!booth || !hidden) return;

  booth.addEventListener("photo-taken", (e) => {
    const { dataUrl } = e.detail || {};
    hidden.value = dataUrl || "";
    if (preview) {
      preview.src = dataUrl || "";
      preview.style.display = dataUrl ? "block" : "none";
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ Zoo Management System Loaded');

     const statusEl = document.getElementById("zooStatus");
  if (statusEl) statusEl.textContent = "Zoo Status: Warming up…";

  try {
    (() => {
  // make the pill once
  const pill = document.createElement('span');
  pill.className = 'hover-pill';
  document.body.appendChild(pill);

  let activeEl = null;

  const positionTo = (el) => {
    const r = el.getBoundingClientRect();
    const pad = 4; 
    pill.style.width  = `${r.width}px`;
    pill.style.height = `${r.height}px`;
    pill.style.transform = `translate(${r.left + window.scrollX}px, ${r.top + window.scrollY - pad}px)`;
    pill.style.opacity = '1';
  };

  const onEnter = (e) => { activeEl = e.currentTarget; positionTo(activeEl); };
  const onLeave = () => { activeEl = null; pill.style.opacity = '0'; };
  const onReposition = () => { if (activeEl) positionTo(activeEl); };

  const statusEl   = document.getElementById('zooStatus');
  const visitorsEl = document.getElementById('visitorCounter');

  // make them keyboard-focusable for accessibility
  [statusEl, visitorsEl].forEach(el => {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focus', onEnter);
    el.addEventListener('blur', onLeave);
  });

  window.addEventListener('scroll', onReposition, { passive: true });
  window.addEventListener('resize', onReposition);
  })();

    await ensureApiAwake();               // 🔥 wake Render instance
    const data = await fetchAnimals();    // then fetch real data
    window.animals = data;
    populateAnimalDropdown(data);
    renderAnimalCards();

    const matrix = animalsToMatrix(window.animals);
    renderAnimalTable(matrix);

    if (statusEl) statusEl.textContent = "Zoo Status: Open";

    // Security verification
    if (!verifySecureProtocol()) return;

    // Initialize CSRF tokens and security for forms
    initSecurity();


    // Setup form event listeners
    initializeMembershipForm();

    wireAddAnimalForm((newAnimal) => {
  window.animals.push(newAnimal);
  renderAnimalCards();
  populateAnimalDropdown(window.animals);
  displaySuccess(`✅ ${newAnimal.name} added successfully!`);
  });
    setupBookingForm();

    // Admin dashboard real-time updates
    updateAdminDashboard();

    // Attach global functions for buttons
  window.toggleZooStatus = () => {
  const el = document.getElementById("zooStatus");
  const currentlyOpen = el.textContent.includes("Open");
  const next = currentlyOpen ? "Closed" : "Open";

  // Call your existing operation (if it returns a result, use it)
  const res = toggleZooStatus(currentlyOpen ? "Open" : "Closed", window.animals);

  if (res && res.animals) {
    // function returns { zooStatus, animals }
    window.animals = res.animals;
    el.textContent = `Zoo Status: ${res.zooStatus}`;
  } else {
    // function mutates in place — force animals to the new status
    window.animals.forEach(a => { a.status = next; });
    el.textContent = `Zoo Status: ${next}`;
  }

  // Update existing cards without rebuilding the container
  syncCardsWithAnimals();
};



    window.updateHealth = (id) => {
      toggleAnimalHealth(id, window.animals);
    };    

    window.displayZooStatistics = () => {
      displayZooStatistics(window.animals);
    };

    window.updateVisitorCount = (count) => {
      updateVisitorCount(count);
    };

    window.toggleStatus = (id) => {
  toggleAnimalStatus(id, window.animals);
  const updatedAnimal = window.animals.find(a => a.id === id);
  if (updatedAnimal) {
    import('./AnimalData.js').then(({ notifyAnimalStatusChange }) => {
      notifyAnimalStatusChange(updatedAnimal);
    });
  }
};

    // Error and success messaging
    window.displayError = displayError;
    window.displaySuccess = displaySuccess;

    console.group("📍 Geolocation Data");
    console.table(exhibits);
    console.table(emergencyStations);
    console.groupEnd();

    //if ('serviceWorker' in navigator) {
      //navigator.serviceWorker.register('/serviceworker.js')
      //.then(() => console.log("Service Worker registered"))
      //.catch((err) => console.error("SW registration failed", err));
   // }

// Only register SW in production (not on localhost)
if ('serviceWorker' in navigator && !/^(localhost|127\.0\.0\.1)/.test(location.hostname)) {
  navigator.serviceWorker.register('/serviceworker.js')
    .then(() => console.log("Service Worker registered"))
    .catch((err) => console.error("SW registration failed", err));
}

function animalsToMatrix(animalList) {
  return animalList.map(a => [
    a.name ?? "",
    a.species ?? "",
    a.status ?? "",
    a.health ?? ""
  ]);
}


function renderAnimalTable(matrix) {
    const tbody = document.querySelector("#animalTable tbody");
    tbody.innerHTML = "";

    matrix.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}



  wireMemberCamera(); 

  } catch (error) {
    console.error("Critical Error: Unable to initialize Zoo Management System.", error);
    displayError("A serious error occurred. Please reload the page.");
    if (statusEl) statusEl.textContent = "Zoo Status: Error (try refresh)";
  }
});

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("🟢 Notification permission granted");
    }
  });
}
