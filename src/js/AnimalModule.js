// AnimalModule.js
// This module defines the Animal class with private fields and advanced methods,
// as well as a closure-based feeding tracker for demonstration purposes.

/**
 * Class representing an Animal.
 */
export class Animal {
    #healthStatus; // Private field for health status
  
    /**
     * Creates a new animal.
     * @param {number} id - The unique identifier for the animal.
     * @param {string} name - The name of the animal.
     * @param {string} species - The species of the animal.
     */
    constructor(id, name, species) {
      this.id = id;
      this.name = name;
      this.species = species;
      this.#healthStatus = 'Healthy';
    }
  
    /**
     * Gets the animal's health status.
     * @returns {string} The health status.
     */
    get status() {
      return this.#healthStatus;
    }
  
    /**
     * Sets the animal's health status.
     * @param {string} newStatus - The new health status ("Healthy" or "Sick").
     * @throws Will throw an error if the status is not "Healthy" or "Sick".
     */
    set status(newStatus) {
      if (["Healthy", "Sick"].includes(newStatus)) {
        this.#healthStatus = newStatus;
      } else {
        throw new Error("Invalid health status");
      }
    }
  
    /**
     * Feeds the animal.
     */
    feed() {
      console.log(`${this.name} has been fed.`);
    }
  }
  
  /**
   * Creates a feeding tracker using a closure.
   * This tracker counts how many times animals have been fed.
   * @returns {Object} An object with feedAnimal and getCount methods.
   */
  export const createFeedingTracker = () => {
    let feedCount = 0;
    return {
      /**
       * Feeds an animal and increments the feed counter.
       * @param {Animal} animal - The Animal instance to feed.
       */
      feedAnimal: (animal) => {
        feedCount++;
        animal.feed();
        console.log(`Feed count: ${feedCount}`);
      },
      /**
       * Gets the current feed count.
       * @returns {number} The feed count.
       */
      getCount: () => feedCount
    };
  };
  