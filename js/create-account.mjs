// create-account.mjs - Module for handling account creation form
import { AccountManager } from './account.mjs';

class CreateAccountHandler {
  constructor() {
    this.accountManager = null;
    this.initialized = false;
  }

  async init() {
    console.log("Initializing CreateAccountHandler");
    
    // Create account manager instance
    this.accountManager = new AccountManager();
    await this.accountManager.init();
    
    // Set up form event listeners
    this.setupCreateAccountForm();
    
    this.initialized = true;
    console.log("CreateAccountHandler initialized");
  }

  setupCreateAccountForm() {
    const form = document.getElementById('create-acct-form');
    if (!form) {
      console.error("Create account form not found");
      return;
    }

    console.log("Setting up create account form");
    
    // Add event listener to form
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent page reload
      console.log("Create account form submitted");
      
      // Additional validation - ensure the form is valid before proceeding
      if (!this.accountManager.validateForm()) {
        return; // Stop if validation fails
      }
      
      try {
        // Create account
        console.log("Creating account...");
        await this.accountManager.createAccount();
        
        // The createAccount method already handles redirection
        // If we need explicit redirect:
        // this.accountManager.redirectToAccountPage();
      } catch (error) {
        console.error("Account creation error:", error);
        alert("An error occurred during account creation. Please try again.");
      }
    });
    
    // Also add event listener to the submit button in case it's outside the form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton && !form.contains(submitButton)) {
      console.log("Submit button found outside form, adding click handler");
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        console.log("Submit button clicked");
        
        // Trigger the form submission
        const submitEvent = new Event('submit', { cancelable: true });
        form.dispatchEvent(submitEvent);
      });
    }
    
    console.log("Create account form event listeners added");
  }
}

// Create and initialize handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, creating CreateAccountHandler");
  const createAccountHandler = new CreateAccountHandler();
  createAccountHandler.init()
    .catch(error => console.error("Error initializing CreateAccountHandler:", error));
});

export default CreateAccountHandler;