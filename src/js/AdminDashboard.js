// AdminDashboard.js
// Module for admin dashboard functionalities
import { Animal } from './AnimalModule.js';
/**
 * Simulates an admin login by checking credentials and storing a JWT.
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean} True if login is successful.
 */
export const simulateLogin = (username, password) => {
    const admin = {
      username: "admin",
      password: "zoo123",
      role: "admin"
    };
    if (username === admin.username && password === admin.password) {
      const token = btoa(JSON.stringify({ username: admin.username, role: admin.role }));
      sessionStorage.setItem("authToken", token);
      console.log("Admin logged in, token stored:", token);
      return true;
    } else {
      console.warn("Invalid login attempt");
      return false;
    }
  };
  
  /**
   * Retrieves the current user by decoding the stored JWT.
   * @returns {Object|null} User object if valid, otherwise null.
   */
  export const getCurrentUser = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;
    try {
      return JSON.parse(atob(token));
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
  };
  
  /**
   * Checks if the current user is an admin.
   * @returns {boolean} True if the user is an admin.
   */
  export const checkAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === "admin";
  };
  
  /**
   * Executes an action only if the current user is an admin.
   * @param {Function} action - The admin-only action to execute.
   */
  export const requireAdminAction = (action) => {
    if (checkAdmin()) {
      action();
    } else {
      console.warn("Action requires admin access.");
    }
  };
  
  /**
   * Example admin action: Adding a secret animal to the zoo.
   * This function should be called from the admin dashboard.
   * @param {Function} addAnimalCallback - Callback that adds an animal.
   */
  export const addSecretAnimal = (addAnimalCallback) => {
    requireAdminAction(() => {
      // Assuming you have an Animal class (import it if needed)
      const secretAnimal = new Animal(777, "Ghost", "Panther");
      // Use the admin action callback to add the secret animal.
      addAnimalCallback({
        id: secretAnimal.id,
        name: secretAnimal.name,
        species: secretAnimal.species,
        health: secretAnimal.status // Using getter for private health status
      });
    });
  };
  
  /**
   * Updates the admin dashboard.
   * Here you can add real-time updates using AJAX, etc.
   */
  export const updateAdminDashboard = async () => {
    try {
      // For example, refresh zoo status or visitor information via AJAX.
      console.log("Admin Dashboard: Updating real-time data...");
      // Implementation for real-time updates goes here.
    } catch (error) {
      console.error("Error updating admin dashboard:", error.message);
    }
  };
  