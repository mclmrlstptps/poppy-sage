// account.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// Template functions
export function myRecipesTemplate(recipes) {
  return `
    <ul class="recipes-list">
      ${recipes.map(recipe => `
        <li class="recipe-item">
          <h3>${recipe.title}</h3>
          <p>${recipe.description || 'No description available'}</p>
          <div class="recipe-actions">
            <button class="view-recipe" data-id="${recipe.id}">View Recipe</button>
            <button class="delete-recipe" data-id="${recipe.id}">Delete</button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

export function shoppingListTemplate(items) {
  return `
    <ul class="shopping-items">
      ${items.map(item => `
        <li class="shopping-item">
          <input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''}>
          <label for="item-${item.id}">${item.name} - ${item.quantity}</label>
          <button class="delete-item" data-id="${item.id}">Remove</button>
        </li>
      `).join('')}
    </ul>
  `;
}

export function shoppingListFormTemplate() {
  return `
    <form class="add-shopping-item">
      <h3>Add Item</h3>
      <div class="form-group">
        <input type="text" id="new-item-name" placeholder="Item Name" required>
        <input type="text" id="new-item-quantity" placeholder="Quantity" required>
        <button type="submit">Add to List</button>
      </div>
    </form>
  `;
}

export function recipeSelectorTemplate(day, recipes) {
  return `
    <div class="modal-content">
      <h3>Select Recipe for ${day.charAt(0).toUpperCase() + day.slice(1)}</h3>
      <div class="recipe-list">
        ${recipes.map(recipe => `
          <div class="recipe-option">
            <h4>${recipe.title}</h4>
            <p>${recipe.description || 'No description available'}</p>
            <button class="select-recipe" data-recipe-id="${recipe.id}" data-day="${day}">Select</button>
          </div>
        `).join('')}
      </div>
      <button class="close-modal">Cancel</button>
    </div>
  `;
}

// Export utility functions that can be used by other modules
export function createShoppingList(ingredients) {
  return ingredients.map(ingredient => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    name: ingredient.name,
    quantity: `${ingredient.quantity} ${ingredient.unit || ''}`.trim(),
    checked: false
  }));
}

export function combineIngredients(ingredients) {
  const ingredientMap = new Map();
  
  ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    
    if (ingredientMap.has(name)) {
      const existing = ingredientMap.get(name);
      
      // If units match, combine quantities
      if (existing.unit === ingredient.unit) {
        existing.quantity += parseFloat(ingredient.quantity);
      } else {
        // Units don't match, keep separate
        const newName = `${name} (${ingredient.source || 'additional'})`;
        ingredientMap.set(newName, {
          quantity: parseFloat(ingredient.quantity),
          unit: ingredient.unit
        });
      }
    } else {
      // New ingredient
      ingredientMap.set(name, {
        quantity: parseFloat(ingredient.quantity),
        unit: ingredient.unit
      });
    }
  });
  
  return Array.from(ingredientMap).map(([name, details]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity: details.quantity,
    unit: details.unit
  }));
}

export default class AccountManager {
  constructor() {
    this.userData = {};
    this.recipeAPI = null;
    this.basePath = this.determineBasePath();
    console.log("AccountManager initialized with basePath:", this.basePath);
    this.loadUserData();
  }

  determineBasePath() {
    // Get the current path
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);
    
    // If we're in the accounts folder, go up one level
    if (currentPath.includes('/accounts/')) {
      return currentPath.substring(0, currentPath.lastIndexOf('/accounts/')) + '/accounts/';
    } 
    // If we're in the src folder, construct the path to accounts
    else if (currentPath.includes('/src/')) {
      return currentPath.substring(0, currentPath.lastIndexOf('/src/')) + '/src/accounts/';
    }
    // Default fallback path
    return '/src/accounts/';
  }

  async init() {
    console.log("AccountManager init called");
    if (document.getElementById('create-acct-form')) {
      console.log("Setting up create account form");
      this.setupCreateAccountForm();
    }
    
    if (document.querySelector('.my-account')) {
      console.log("Setting up account page");
      this.userData = getLocalStorage("userData") || this.createEmptyUserData();
      this.renderAccountDetails();
    }
    
    // Initialize logout button
    this.initLogoutButton();
  }

  // Method to initialize the logout button
  initLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      console.log("Setting up logout button");
      logoutButton.addEventListener('click', () => this.logout());
    }
  }

  // Method to handle logout
  logout() {
    console.log("Logging out user");
    // Clear user data from local storage
    setLocalStorage("userData", "");
    
    // Reset userData object
    this.userData = this.createEmptyUserData();
    
    // Redirect to home page
    window.location.href = window.location.origin + '/index.html';
  }

  loadUserData() {
    const storedData = getLocalStorage("userData");
    if (storedData) {
      try {
        this.userData = JSON.parse(storedData);
        console.log("User data loaded successfully");
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        this.userData = {};
      }
    } else {
      console.log("No user data found in local storage");
    }
  }

  saveUserData() {
    try {
      setLocalStorage("userData", JSON.stringify(this.userData));
      console.log("User data saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  }

  // Set the recipe API service to use for fetching recipe data
  setRecipeAPI(apiService) {
    this.recipeAPI = apiService;
  }

  setupCreateAccountForm() {
    const form = document.getElementById('create-acct-form');
    console.log("Form found:", form);

    if (!form) {
      console.error("Create account form not found");
      return;
    }

    // Add proper attributes to input fields
    const inputs = form.querySelectorAll('input');
    console.log("Inputs found:", inputs.length);

    if (inputs.length > 0) {
      // First name input
      if (inputs[0].classList.contains('fname')) {
        inputs[0].setAttribute('type', 'text');
        inputs[0].setAttribute('name', 'firstName');
        inputs[0].setAttribute('id', 'firstName');
        inputs[0].setAttribute('placeholder', 'First Name');
        inputs[0].setAttribute('required', 'true');
      }
      
      // Last name input
      if (inputs[1].classList.contains('lname')) {
        inputs[1].setAttribute('type', 'text');
        inputs[1].setAttribute('name', 'lastName');
        inputs[1].setAttribute('id', 'lastName');
        inputs[1].setAttribute('placeholder', 'Last Name');
        inputs[1].setAttribute('required', 'true');
      }
      
      // Email input
      if (inputs[2].classList.contains('email')) {
        inputs[2].setAttribute('type', 'email');
        inputs[2].setAttribute('name', 'email');
        inputs[2].setAttribute('id', 'email');
        inputs[2].setAttribute('placeholder', 'Email Address');
        inputs[2].setAttribute('required', 'true');
      }
      
      // Username input
      if (inputs[3].classList.contains('username')) {
        inputs[3].setAttribute('type', 'text');
        inputs[3].setAttribute('name', 'username');
        inputs[3].setAttribute('id', 'username');
        inputs[3].setAttribute('placeholder', 'Username');
        inputs[3].setAttribute('required', 'true');
      }
      
      // Password input
      if (inputs[4].classList.contains('password')) {
        inputs[4].setAttribute('type', 'password');
        inputs[4].setAttribute('name', 'password');
        inputs[4].setAttribute('id', 'password');
        inputs[4].setAttribute('placeholder', 'Password');
        inputs[4].setAttribute('required', 'true');
        inputs[4].addEventListener('input', () => this.validatePassword());
      }
    }
    
    // Add event listener to form submission
    form.addEventListener('submit', (event) => {
      console.log("Form submitted");
      event.preventDefault();
      
      if (this.validateForm()) {
        this.createAccount();
      }
    });
    
    // Also add event listener to the button directly in case it's outside the form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton && !form.contains(submitButton)) {
      console.log("Submit button found outside form, adding click handler");
      submitButton.addEventListener('click', (event) => {
        console.log("Submit button clicked");
        event.preventDefault();
        
        if (this.validateForm()) {
          this.createAccount();
        }
      });
    }
  }
  
  // Method to create empty user data
  createEmptyUserData() {
    return {
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        username: ''
      },
      savedRecipes: [],
      shoppingList: [],
      mealPlan: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      }
    };
  }
  
  // Method for rendering account details
  renderAccountDetails() {
    // Implementation would go here
    console.log("Rendering account details");
  }
  
  renderMyRecipes() {
    const myRecipesContainer = document.querySelector('.my-recipes-container');
    if (!myRecipesContainer) return;
    
    console.log("Rendering My Recipes");
    
    // Check if user has saved recipes
    if (!this.userData.savedRecipes || this.userData.savedRecipes.length === 0) {
      myRecipesContainer.innerHTML = '<p>You haven\'t saved any recipes to your collection yet.</p>';
      return;
    }
    
    // Sort recipes by newest first
    const sortedRecipes = [...this.userData.savedRecipes].sort((a, b) => {
      return new Date(b.addedAt) - new Date(a.addedAt);
    });
    
    // Create recipe cards HTML
    const recipesHTML = sortedRecipes.map(recipe => `
      <div class="recipe-card">
        <div class="recipe-card-image">
          <img src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="recipe-card-content">
          <h3>${recipe.title}</h3>
          <p>${recipe.description || 'No description available'}</p>
          <div class="recipe-card-actions">
            <a href="/src/recipe-detail.html?id=${recipe.id}&source=${recipe.source}" class="view-recipe-btn">View Recipe</a>
            <button class="remove-recipe-btn" data-id="${recipe.id}" data-source="${recipe.source}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
    
    // Add recipes to container
    myRecipesContainer.innerHTML = recipesHTML;
    
    // Add event listeners for remove buttons
    const removeButtons = myRecipesContainer.querySelectorAll('.remove-recipe-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const recipeId = e.target.dataset.id;
        const recipeSource = e.target.dataset.source;
        this.removeFromMyRecipes(recipeId, recipeSource);
      });
    });
  }
  
  // Method to remove a recipe from My Recipes
  removeFromMyRecipes(recipeId, recipeSource) {
    console.log("Removing recipe from My Recipes:", recipeId, recipeSource);
    
    if (!this.userData.savedRecipes) return;
    
    // Filter out the recipe to remove
    this.userData.savedRecipes = this.userData.savedRecipes.filter(recipe => 
      !(recipe.id === recipeId && recipe.source === recipeSource)
    );
    
    // Save updated user data
    if (this.saveUserData()) {
      console.log("Recipe removed successfully");
      // Re-render the My Recipes section
      this.renderMyRecipes();
    } else {
      console.error("Failed to save user data after removing recipe");
      alert("Error: Could not remove recipe. Please try again.");
    }
  }

  // Method for validating password
  validatePassword() {
    // Implementation would go here
    console.log("Validating password");
    return true;
  }
  
  // Method for validating the form
  validateForm() {
    // Implementation would go here
    console.log("Validating form");
    return true;
  }
  
  // Method for creating an account and redirecting to account page
  createAccount() {
    // Get form values
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const username = document.getElementById('username')?.value || '';
    const password = document.getElementById('password')?.value || '';
    
    // Create user data object
    const userData = this.createEmptyUserData();
    userData.profile = {
      firstName,
      lastName,
      email,
      username
    };
    
    // Store the user data
    this.userData = userData;
    if (this.saveUserData()) {
      console.log("Account created successfully, redirecting to account page");
      
      // Redirect to account.html
      const accountUrl = this.basePath + 'account.html';
      window.location.href = accountUrl;
    } else {
      console.error("Failed to save user data");
    }
  }
}