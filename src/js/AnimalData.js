// AnimalData.js
// This module handles all operations related to animal data management,
// including fetching data via AJAX and rendering it in the DOM.
import { displayError } from "./UiFeedback.js";
import { safelyUpdateElementText } from './ZooOperations.js';
// AnimalData.js
export let animals = [];

// Predefined counts (if needed for reference)
export const elephants = 4;
export const tigers = 2;
export const pandas = 3;

export const totalAnimals = elephants + tigers + pandas;

console.log("Number of Elephants:", elephants);
console.log("Number of Tigers:", tigers);
console.log("Number of Pandas:", pandas);
console.log("Total number of animals in the zoo:", totalAnimals);

// Initialize animal data
animals.push({ id: 1, name: 'Ellie', species: 'Elephant', count: 3, gender: 'Female', status: 'Open', health: 'Healthy' });
animals.push({ id: 2, name: 'Tony', species: 'Tiger', count: 2, gender: 'Male', status: 'Closed', health: 'Sick' });
animals.push({ id: 3, name: 'Panda', species: 'Panda', count: 4, gender: 'Male', status: 'Open', health: 'Healthy' });
animals.push({ id: 4, name: 'Leo', species: 'Lion', count: 5, gender: 'Male', status: 'Open', health: 'Healthy' });

console.log("Current Zoo Animals:");
console.table(animals);

/**
 * Displays or hides a loading message in the animal container.
 * @param {boolean} isLoading - If true, shows "Loading animal data...", otherwise clears the container.
 */
export const showLoading = (isLoading) => {
    const container = document.getElementById("animalContainer");
    if (container) {
      container.textContent = isLoading ? "Loading animal data..." : "";
    }
  };
  
    /**
     * Fetches animal data from an external API using the Fetch API.
     * Includes loading states and proper error handling.
     */
    // async function fetchAnimalData() {
        // Replace with your actual API endpoint URL
       // const apiUrl = "animals.json";
       // showLoading(true);
      //  try {
      //    const response = await fetch(apiUrl, {
       //     method: "GET",
       //     mode: "cors",         // This enables CORS for the request
      //      credentials: "include" // Ensures cookies are sent if required
      //    });
       //   if (!response.ok) {
      //      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    //      }
      //    const data = await response.json();
    //      showLoading(false);
      //    animals = data;            // Save fetched data to your global array
        //  saveAnimals();             // Optional, if you want it in localStorage
        //  displayAnimals();          // ✅ This renders the toggle buttons + spans
        //} catch (error) {
         // showLoading(false);
         // console.error("Error fetching animal data:", error.message);
          // Reuse your existing displayError function defined later in the file
         // displayError("Failed to load animal data. Please try again later.");
       // }
     // }

     // fetchAnimalData();
  
  /**
   * Renders the animal data in the DOM.
   * It creates a card for each animal with its name, species, status, and health.
   * @param {Array} data - An array of animal objects.
   */
  export const displayAnimalData = (data) => {
    const container = document.getElementById("animalContainer");
    if (!container) {
      console.error("Animal container element not found.");
      return;
    }
  
    // Clear previous content safely
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  
    data.forEach((animal) => {
      const card = document.createElement("div");
      card.classList.add("animal-card");
  
      // Title: Name and Species
      const title = document.createElement("h3");
      title.textContent = `${animal.name} (${animal.species})`;
      card.appendChild(title);
  
      // Status line
      const status = document.createElement("p");
      status.textContent = `Status: ${animal.status}`;
      card.appendChild(status);
  
      // Health line
      const health = document.createElement("p");
      health.textContent = `Health: ${animal.health}`;
      card.appendChild(health);
      
      // Animal image
      const img = document.createElement("img");
      img.src = animal.image || "images/default.png";
      img.onerror = () => {
        img.src = "images/default.png";
      };
      img.alt = `${animal.name} the ${animal.species}`;
      img.classList.add("animal-image");
      card.appendChild(img);

  
      // Status line with span ID
const statusLine = document.createElement("p");
statusLine.textContent = "Status: ";
const statusSpan = document.createElement("span");
statusSpan.id = `status-${animal.id}`;
statusSpan.textContent = animal.status;
statusLine.appendChild(statusSpan);
card.appendChild(statusLine);

// Health line with span ID
const healthLine = document.createElement("p");
healthLine.textContent = "Health: ";
const healthSpan = document.createElement("span");
healthSpan.id = `health-${animal.id}`;
healthSpan.textContent = animal.health;
healthLine.appendChild(healthSpan);
card.appendChild(healthLine);
  
      // Append card to container
      container.appendChild(card);
    });
  };
  
  export const validateAnimalData = (animal) => {
    if (!animal || typeof animal !== "object") {
      throw new Error("Invalid animal data: Expected an object.");
    }
    if (!animal.id || typeof animal.id !== "number") {
      throw new Error("Animal must have a valid numeric ID.");
    }
    if (!animal.name || typeof animal.name !== "string") {
      throw new Error("Animal must have a valid name (string).");
    }
    if (!animal.species || typeof animal.species !== "string") {
      throw new Error("Animal must have a valid species (string).");
    }
    if (!["Healthy", "Sick"].includes(animal.health)) {
      throw new Error("Invalid health status. Must be 'Healthy' or 'Sick'.");
    }
    if (animals.some(a => a.id === animal.id)) {
      throw new Error(`Duplicate ID found. Animal with ID ${animal.id} already exists.`);
    }
  
    // ✅ Enhanced validation
    if (!animal.location || typeof animal.location.lat !== "number" || typeof animal.location.lng !== "number") {
      throw new Error("Animal must have valid location coordinates.");
    }
    if (!Array.isArray(animal.feedingSchedule)) {
      throw new Error("Feeding schedule must be an array of times.");
    }
    if (!Array.isArray(animal.maintenanceRecords)) {
      throw new Error("Maintenance records must be an array.");
    }
  };
  
  
  export const loadAnimals = () => {
    let storedAnimals = localStorage.getItem("animals");
    animals = storedAnimals ? JSON.parse(storedAnimals) : [];
    displayAnimals(); // Make sure displayAnimals() is also accessible/imported if needed.
  };
  
  export const saveAnimals = () => {
    localStorage.setItem("animals", JSON.stringify(animals));
  };
  
  export const addAnimal = (animal) => {
    try {
      validateAnimalData(animal);
      animals.push(animal);
      saveAnimals(); // Save to localStorage
      displayAnimals();
      console.log(`Animal added successfully: ${JSON.stringify(animal)}`);
    } catch (error) {
      console.error("Error adding animal:", error.message);
      displayError(error.message); // Ensure displayError is available in the module or imported.
    }
  };
  
  // And export your displayAnimals() function if it is part of the data operations:
  function displayAnimals() {
    try {
      const container = document.getElementById('animalContainer');
      if (!container) throw new Error('Animal container element not found.');
  
      // Efficiently clear previous elements
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
  
      animals.forEach(animal => {
        const card = document.createElement('div');
        card.classList.add('animal-card');
  
        // Safe text setting using textContent
        const nameElement = document.createElement('h3');
        nameElement.textContent = `${animal.name} (${animal.species})`;
        card.appendChild(nameElement);
  
        const statusElement = document.createElement('p');
        statusElement.textContent = "Status: ";
        const statusText = document.createElement('span');
        statusText.id = `status-${animal.id}`;
        statusText.textContent = animal.status;
        statusElement.appendChild(statusText);
        card.appendChild(statusElement);
  
        const healthElement = document.createElement('p');
        healthElement.textContent = "Health: ";
        const healthText = document.createElement('span');
        healthText.id = `health-${animal.id}`;
        healthText.textContent = animal.health;
        healthElement.appendChild(healthText);
        card.appendChild(healthElement);
        
        // Animal image
        const img = document.createElement("img");
        img.src = animal.image || "images/default.png";
        img.onerror = () => {
          img.src = "images/default.png";
        };
        img.alt = `${animal.name} the ${animal.species}`;
        img.classList.add("animal-image");
        card.appendChild(img);
  
        // Buttons for toggling status and health
        const toggleButton = document.createElement('button');
        toggleButton.textContent = "Toggle Status";
        toggleButton.onclick = () => window.toggleStatus(animal.id);
        card.appendChild(toggleButton);
  
        const updateHealthButton = document.createElement('button');
        updateHealthButton.textContent = "Update Health";
        updateHealthButton.onclick = () => window.updateHealth(animal.id);
        card.appendChild(updateHealthButton);
  
        container.appendChild(card);
      });
  
      safelyUpdateElementText("visitorCounter", `Visitors: ${localStorage.getItem("visitorCount") || 0}`);
    } catch (error) {
      console.error('Error displaying animals:', error);
      displayError(error.message); // Sprint B1 Zoo Part 2
    }
  };

  /**
 * Populates the animal selection dropdown with options based on the provided animal list.
 * Each option shows the animal's name and species.
 *
 * @param {Array} animals - An array of animal objects to populate the dropdown with.
 * Assumes each object has a `name` and `species` property.
 * Clears existing options before adding new ones.
 */
  export const populateAnimalDropdown = (animals) => {
    try {
      // Get the animal dropdown element from the DOM
      const animalDropdown = document.getElementById("animal");
      if (!animalDropdown) {
        throw new Error("Animal dropdown not found. Check your HTML.");
      }
  
      console.log("Populating animal dropdown...");
  
      // Safely clear all existing options from the dropdown
      while (animalDropdown.firstChild) {
        animalDropdown.removeChild(animalDropdown.firstChild);
      }
  
      // Create and append the default placeholder option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select an Animal --";
      animalDropdown.appendChild(defaultOption);
  
      // If no animals are available, log a warning
      if (animals.length === 0) {
        console.warn("No animals found. Dropdown will be empty.");
      } else {
        // For each animal, create an <option> element and add it to the dropdown
        animals.forEach(animal => {
          const option = document.createElement("option");
          option.value = animal.name;
          option.textContent = `${animal.name} (${animal.species})`;
          animalDropdown.appendChild(option);
        });
  
        console.log("Dropdown populated successfully.");
      }
    } catch (error) {
      console.error("Error populating animal dropdown:", error.message);
    }
  };
  export { displayAnimals };

  export function notifyAnimalStatusChange(animal) {
  if (Notification.permission === "granted") {
    new Notification(`Status Update: ${animal.name}`, {
      body: `${animal.name} the ${animal.species} is now ${animal.status}`,
      icon: "icons/icon-192.png"
    });
  }
}