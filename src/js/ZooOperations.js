// ZooOperations.js
// This module handles core zoo interactive operations, such as toggling statuses,
// updating visitor counts, displaying statistics as well as form submissions..

/**
 * Safely updates text content for a given element by ID.
 * @param {string} id - The element ID.
 * @param {string} text - The new text content.
 */
export const safelyUpdateElementText = (id, text) => {
    try {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Element with ID "${id}" not found.`);
      element.textContent = text;
    } catch (error) {
      console.warn(error.message);
    }
  };
  
  /**
   * Toggles the status of an individual animal.
   * @param {number} id - The animal's unique identifier.
   * @param {Array} animals - The current animal list.
   * @returns {Array} The updated animal list.
   */
  export const toggleAnimalStatus = (id, animals) => {
    try {
      const animal = animals.find(a => a.id === id);
      if (!animal) throw new Error(`Animal with ID ${id} not found.`);
      animal.status = (animal.status === 'Open') ? 'Closed' : 'Open';
      safelyUpdateElementText(`status-${id}`, animal.status);
      console.log(`Animal ID ${id} status toggled to: ${animal.status}`);
      return animals;
    } catch (error) {
      console.error("Error toggling animal status:", error.message);
      return animals; // Optionally you could rethrow or handle further.
    }
  };
  
  /**
   * Toggles the health status of an individual animal.
   * @param {number} id - The animal's unique identifier.
   * @param {Array} animals - The current animal list.
   * @returns {Array} The updated animal list.
   */
  export const toggleAnimalHealth = (id, animals) => {
    try {
      const animal = animals.find(a => a.id === id);
      if (!animal) throw new Error(`Animal with ID ${id} not found.`);
      animal.health = (animal.health === 'Healthy') ? 'Sick' : 'Healthy';
      safelyUpdateElementText(`health-${id}`, animal.health);
      console.log(`Animal ID ${id} health toggled to: ${animal.health}`);
      return animals;
    } catch (error) {
      console.error("Error updating animal health:", error.message);
      return animals;
    }
  };
  
  /**
   * Toggles overall zoo status and updates all animal statuses accordingly.
   * @param {string} currentZooStatus - The current zoo status ("Open" or "Closed").
   * @param {Array} animals - The list of animals.
   * @returns {Object} An object containing the updated zooStatus and animal list.
   */
  export const toggleZooStatus = (currentZooStatus, animals) => {
    try {
    const newStatus = (currentZooStatus === "Open") ? "Closed" : "Open";

    // Flip header
    const statusElement = document.getElementById("zooStatus");
    if (statusElement) statusElement.textContent = `Zoo Status: ${newStatus}`;

    // Flip data
    animals.forEach(a => { a.status = newStatus; });

    // ✅ Update legacy DOM cards (those created by displayAnimals)
    animals.forEach(({ id }) => {
      const span = document.getElementById(`status-${id}`);
      if (span) span.textContent = newStatus;
    });

    // ✅ Update web component cards in place (if they’re present)
    document.querySelectorAll("zoo-animal-card").forEach(card => {
      const id = card.data?.id;
      if (id == null) return;
      const lbl = card.shadowRoot?.getElementById(`status-${id}`);
      if (lbl) lbl.textContent = newStatus;
      const latest = animals.find(x => String(x.id) === String(id));
      if (latest) card.data = latest; // keep card’s data in sync
    });

    console.log(`Zoo status changed to: ${newStatus}`);
    return { zooStatus: newStatus, animals };
  } catch (error) {
    console.error("Error toggling zoo status:", error.message);
    return { zooStatus: currentZooStatus, animals };
  }
  };
  
  /**
   * Updates the visitor count and updates the UI.
   * @param {number} change - Change in visitor count (positive or negative).
   */
  export const updateVisitorCount = (change) => {
    try {
      let visitorCount = parseInt(localStorage.getItem("visitorCount")) || 0;
      visitorCount += change;
      if (visitorCount < 0) visitorCount = 0;
      localStorage.setItem("visitorCount", visitorCount);
      safelyUpdateElementText("visitorCounter", `Visitors: ${visitorCount}`);
      console.log(`Visitor count updated: ${visitorCount}`);
    } catch (error) {
      console.error("Error updating visitor count:", error.message);
      throw error;
    }
  };
  
  /**
   * Displays zoo statistics (total animals, open animals, closed animals, and visitor count).
   * @param {Array} animals - The list of animals.
   */
  export const displayZooStatistics = (animals) => {
    try {
      const totalAnimals = animals.length;
      const openAnimals = animals.filter(animal => animal.status === "Open").length;
      const closedAnimals = animals.filter(animal => animal.status === "Closed").length;
      const visitorCount = localStorage.getItem("visitorCount") || 0;
      console.log("Zoo Statistics:");
      console.table([
        { "Total Animals": totalAnimals },
        { "Open Animals": openAnimals },
        { "Closed Animals": closedAnimals },
        { "Visitor Count": visitorCount }
      ]);
      alert(`Zoo Statistics:\nTotal: ${totalAnimals}\nOpen: ${openAnimals}\nClosed: ${closedAnimals}\nVisitors: ${visitorCount}`);
    } catch (error) {
      console.error("Error displaying zoo statistics:", error.message);
    }
  };
  
  /**
   * (Optional) Populates the animal dropdown in the booking form.
   * @param {Array} animals - The list of animals.
   */
  export const populateAnimalDropdown = (animals) => {
    try {
      const animalDropdown = document.getElementById("animal");
      if (!animalDropdown) throw new Error("Animal dropdown not found. Check your HTML.");
      
      console.log("Populating animal dropdown...");
  
      // Clear existing options safely
      while (animalDropdown.firstChild) {
        animalDropdown.removeChild(animalDropdown.firstChild);
      }
  
      // Add default option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select an Animal --";
      animalDropdown.appendChild(defaultOption);
  
      // Add animals
      animals.forEach(animal => {
        const option = document.createElement("option");
        option.value = animal.name;
        option.textContent = `${animal.name} (${animal.species})`;
        animalDropdown.appendChild(option);
      });
  
      console.log("Dropdown populated successfully.");
    } catch (error) {
      console.error("Error populating animal dropdown:", error.message);
    }
  };
  