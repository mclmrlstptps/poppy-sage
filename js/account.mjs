// account.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class AccountManager {
  constructor() {
    this.userData = {};
    this.recipeAPI = null;
  }

  async init() {
    if (document.getElementById('create-acct-form')) {
      this.setupCreateAccountForm();
    }
    
    if (document.querySelector('.my-account')) {
      this.userData = getLocalStorage("userData") || this.createEmptyUserData();
      this.renderAccountDetails();
    }
  }

  // Set the recipe API service to use for fetching recipe data
  setRecipeAPI(apiService) {
    this.recipeAPI = apiService;
  }

  setupCreateAccountForm() {
    const form = document.getElementById('create-acct-form');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Add proper attributes to input fields
    const inputs = form.querySelectorAll('input');
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
        inputs[4].addEventListener('input', this.validatePassword);
      }
    }
    
    // Add event listener to form submission
    if (submitButton) {
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        if (this.validateForm()) {
          this.createAccount();
        }
      });
    }
  }

  validateForm() {
    const firstName = document.querySelector('.fname').value;
    const lastName = document.querySelector('.lname').value;
    const email = document.querySelector('.email').value;
    const username = document.querySelector('.username').value;
    const password = document.querySelector('.password').value;
    
    // Check if required fields are filled
    if (!firstName || !lastName || !email || !username || !password) {
      alert('Please fill out all required fields');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    // Validate password
    if (!this.validatePassword()) {
      return false;
    }
    
    return true;
  }

  validatePassword() {
    const password = document.querySelector('.password').value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    const requirements = document.querySelectorAll('ul li');
    
    // Update UI to show which requirements are met
    if (requirements.length >= 4) {
      requirements[0].style.color = hasUpperCase ? 'green' : 'red';
      requirements[1].style.color = hasSymbol ? 'green' : 'red';
      requirements[2].style.color = hasNumber ? 'green' : 'red';
      requirements[3].style.color = hasLowerCase ? 'green' : 'red';
    }
    
    return hasUpperCase && hasLowerCase && hasSymbol && hasNumber;
  }

  createAccount() {
    this.userData = {
      firstName: document.querySelector('.fname').value,
      lastName: document.querySelector('.lname').value,
      email: document.querySelector('.email').value,
      username: document.querySelector('.username').value,
      password: document.querySelector('.password').value,
      recipes: [],
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
    
    // Store the user data in localStorage
    setLocalStorage("userData", this.userData);
    
    // Redirect to account page on successful account creation
    alert('Account created successfully!');
    
    // Check the current path to determine the relative path to account.html
    const currentPath = window.location.pathname;
    
    // If we're in the account subdirectory already
    if (currentPath.includes('/account/')) {
      window.location.href = 'account.html';
    } 
    // If we're in the root directory
    else if (currentPath.includes('create-account.html')) {
      window.location.href = 'account/account.html';
    }
    // Default case (more generic)
    else {
      window.location.href = '/account/account.html';
    }
  }

  createEmptyUserData() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      recipes: [],
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

  renderAccountDetails() {
    this.renderMyRecipes();
    this.renderShoppingList();
    this.renderMealPlan();
    
    // Add event listeners after rendering
    this.setupEventListeners();
  }

  renderMyRecipes() {
    const recipesContainer = document.querySelector('.my-recipes');
    if (!recipesContainer) return;
    
    if (!this.userData.recipes || this.userData.recipes.length === 0) {
      recipesContainer.innerHTML += '<p>No saved recipes yet.</p>';
      return;
    }
    
    recipesContainer.insertAdjacentHTML(
      "beforeend",
      myRecipesTemplate(this.userData.recipes)
    );
  }

  renderShoppingList() {
    const shoppingListContainer = document.querySelector('.shopping-list');
    if (!shoppingListContainer) return;
    
    if (!this.userData.shoppingList || this.userData.shoppingList.length === 0) {
      shoppingListContainer.innerHTML += '<p>Your shopping list is empty.</p>';
    } else {
      shoppingListContainer.insertAdjacentHTML(
        "beforeend",
        shoppingListTemplate(this.userData.shoppingList)
      );
    }
    
    // Add form to add new items
    shoppingListContainer.insertAdjacentHTML(
      "beforeend",
      shoppingListFormTemplate()
    );
  }

  renderMealPlan() {
    const mealPlanContainer = document.querySelector('.meal-plan');
    if (!mealPlanContainer) return;
    
    // Create the days container div for the meal plan
    const daysContainer = document.createElement('div');
    daysContainer.className = 'days-container';
    
    // Days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create a day element for each day of the week
    daysOfWeek.forEach(day => {
      const dayLower = day.toLowerCase();
      const mealInfo = this.userData.mealPlan && this.userData.mealPlan[dayLower] 
        ? this.userData.mealPlan[dayLower].title 
        : 'Add Meal';
      
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      dayElement.innerHTML = `
        <div class="meal-info">${mealInfo}</div>
        <div class="day-name">${day}</div>
      `;
      
      // Add click event to day element
      dayElement.addEventListener('click', () => {
        const hasRecipe = this.userData.mealPlan && this.userData.mealPlan[dayLower];
        if (hasRecipe) {
          // Show options: Change or Remove
          this.showMealOptions(dayLower);
        } else {
          // Directly show recipe selector
          this.showRecipeSelector(dayLower);
        }
      });
      
      daysContainer.appendChild(dayElement);
    });
    
    mealPlanContainer.appendChild(daysContainer);
  }

  setupEventListeners() {
    // Recipe buttons event listeners
    document.querySelectorAll('.view-recipe').forEach(button => {
      button.addEventListener('click', (event) => {
        const recipeId = event.target.getAttribute('data-id');
        // Navigate to recipe detail page
        window.location.href = `/recipe.html?id=${recipeId}`;
      });
    });
    
    document.querySelectorAll('.delete-recipe').forEach(button => {
      button.addEventListener('click', (event) => {
        const recipeId = event.target.getAttribute('data-id');
        this.deleteRecipe(recipeId);
      });
    });
    
    // Shopping list event listeners
    const shoppingForm = document.querySelector('.add-shopping-item');
    if (shoppingForm) {
      shoppingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.addShoppingItem();
      });
    }
    
    document.querySelectorAll('.shopping-list input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
        const itemId = event.target.id.replace('item-', '');
        this.updateShoppingItem(itemId, event.target.checked);
      });
    });
    
    document.querySelectorAll('.delete-item').forEach(button => {
      button.addEventListener('click', (event) => {
        const itemId = event.target.getAttribute('data-id');
        this.deleteShoppingItem(itemId);
      });
    });
    
    // Additional buttons for clearing the shopping list and generating from all meals
    const shoppingListContainer = document.querySelector('.shopping-list');
    if (shoppingListContainer) {
      // Add these buttons if they don't exist yet
      if (!document.querySelector('.clear-list')) {
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-list';
        clearButton.textContent = 'Clear All';
        clearButton.addEventListener('click', () => this.clearShoppingList());
        shoppingListContainer.appendChild(clearButton);
      }
      
      if (!document.querySelector('.generate-list')) {
        const generateButton = document.createElement('button');
        generateButton.className = 'generate-list';
        generateButton.textContent = 'Generate From Meal Plan';
        generateButton.addEventListener('click', () => this.generateShoppingListFromMealPlan());
        shoppingListContainer.appendChild(generateButton);
      }
    }
  }

  deleteRecipe(recipeId) {
    this.userData.recipes = this.userData.recipes.filter(recipe => recipe.id !== recipeId);
    setLocalStorage("userData", this.userData);
    
    // Refresh the recipes display
    document.querySelector('.my-recipes').innerHTML = '<h2>My Recipes</h2>';
    this.renderMyRecipes();
    this.setupEventListeners();
  }

  addShoppingItem() {
    const itemName = document.getElementById('new-item-name').value;
    const itemQuantity = document.getElementById('new-item-quantity').value;
    
    if (!itemName || !itemQuantity) {
      alert('Please fill out both fields');
      return;
    }
    
    if (!this.userData.shoppingList) {
      this.userData.shoppingList = [];
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: itemQuantity,
      checked: false
    };
    
    this.userData.shoppingList.push(newItem);
    setLocalStorage("userData", this.userData);
    
    // Refresh the shopping list display
    document.querySelector('.shopping-list').innerHTML = '<h2>Shopping List</h2>';
    this.renderShoppingList();
    this.setupEventListeners();
  }

  updateShoppingItem(itemId, checked) {
    if (this.userData.shoppingList) {
      this.userData.shoppingList = this.userData.shoppingList.map(item => {
        if (item.id === itemId) {
          return { ...item, checked };
        }
        return item;
      });
      
      setLocalStorage("userData", this.userData);
    }
  }

  deleteShoppingItem(itemId) {
    if (this.userData.shoppingList) {
      this.userData.shoppingList = this.userData.shoppingList.filter(item => item.id !== itemId);
      setLocalStorage("userData", this.userData);
      
      // Refresh the shopping list display
      document.querySelector('.shopping-list').innerHTML = '<h2>Shopping List</h2>';
      this.renderShoppingList();
      this.setupEventListeners();
    }
  }

  clearShoppingList() {
    if (confirm('Are you sure you want to clear the entire shopping list?')) {
      this.userData.shoppingList = [];
      setLocalStorage("userData", this.userData);
      
      // Refresh the shopping list display
      document.querySelector('.shopping-list').innerHTML = '<h2>Shopping List</h2>';
      this.renderShoppingList();
      this.setupEventListeners();
    }
  }

  async generateShoppingListFromMealPlan() {
    if (!this.userData.mealPlan) {
      alert('No meal plan available');
      return;
    }
    
    // Clear existing shopping list if user confirms
    if (this.userData.shoppingList && this.userData.shoppingList.length > 0) {
      if (!confirm('This will replace your current shopping list. Continue?')) {
        return;
      }
      this.userData.shoppingList = [];
    }
    
    // Collect all ingredients from meals in the plan
    const days = Object.keys(this.userData.mealPlan);
    const recipePromises = [];
    
    for (const day of days) {
      const meal = this.userData.mealPlan[day];
      if (meal) {
        // If we have a recipeAPI service and the meal has an ID but no ingredients,
        // fetch the full recipe data
        if (this.recipeAPI && meal.id && (!meal.ingredients || meal.ingredients.length === 0)) {
          recipePromises.push(
            this.recipeAPI.getRecipeById(meal.id)
              .then(recipeData => {
                // Update the meal plan with complete recipe data
                this.userData.mealPlan[day] = recipeData;
                return recipeData;
              })
              .catch(error => {
                console.error(`Error fetching recipe for ${day}:`, error);
                return meal; // Return the original meal on error
              })
          );
        } else {
          recipePromises.push(Promise.resolve(meal));
        }
      }
    }
    
    // Wait for all recipe data to be fetched
    try {
      const recipes = await Promise.all(recipePromises);
      
      // Process ingredients from all recipes
      const ingredientMap = new Map(); // Use Map to consolidate duplicate ingredients
      
      recipes.forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            const name = ingredient.name.toLowerCase();
            
            if (ingredientMap.has(name)) {
              // Ingredient already in list, try to combine quantities
              const existing = ingredientMap.get(name);
              
              // If units match, combine quantities
              if (existing.unit === ingredient.unit) {
                existing.quantity += parseFloat(ingredient.quantity);
              } else {
                // Units don't match, keep separate entry with recipe name
                const newName = `${name} (${recipe.title})`;
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
        }
      });
      
      // Convert Map to shopping list items
      this.userData.shoppingList = Array.from(ingredientMap).map(([name, details]) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        quantity: `${details.quantity} ${details.unit}`,
        checked: false
      }));
      
      // Save updated user data
      setLocalStorage("userData", this.userData);
      
      // Refresh the shopping list display
      document.querySelector('.shopping-list').innerHTML = '<h2>Shopping List</h2>';
      this.renderShoppingList();
      this.setupEventListeners();
      
      alert('Shopping list generated from meal plan!');
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('There was an error generating your shopping list. Please try again.');
    }
  }

  showMealOptions(day) {
    // Create a modal for meal options
    const modal = document.createElement('div');
    modal.classList.add('meal-options-modal');
    
    const mealName = this.userData.mealPlan[day].title;
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${day.charAt(0).toUpperCase() + day.slice(1)}: ${mealName}</h3>
        <div class="meal-options">
          <button class="change-meal" data-day="${day}">Change Meal</button>
          <button class="remove-meal" data-day="${day}">Remove Meal</button>
          <button class="view-recipe-details" data-id="${this.userData.mealPlan[day].id}">View Recipe</button>
        </div>
        <button class="close-modal">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    modal.querySelector('.change-meal').addEventListener('click', () => {
      document.body.removeChild(modal);
      this.showRecipeSelector(day);
    });
    
    modal.querySelector('.remove-meal').addEventListener('click', () => {
      this.removeMeal(day);
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.view-recipe-details').addEventListener('click', () => {
      const recipeId = modal.querySelector('.view-recipe-details').getAttribute('data-id');
      window.location.href = `/recipe.html?id=${recipeId}`;
    });
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  showRecipeSelector(day) {
    if (!this.userData.recipes || this.userData.recipes.length === 0) {
      alert('You have no saved recipes. Save some recipes first!');
      return;
    }
    
    // Create a modal for recipe selection
    const modal = document.createElement('div');
    modal.classList.add('recipe-selector-modal');
    
    modal.innerHTML = recipeSelectorTemplate(day, this.userData.recipes);
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    const self = this; // Store reference to this for event handlers
    document.querySelectorAll('.select-recipe').forEach(button => {
      button.addEventListener('click', function(event) {
        const recipeId = this.getAttribute('data-recipe-id');
        const day = this.getAttribute('data-day');
        self.addMealToPlan(day, recipeId);
        document.body.removeChild(modal);
      });
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  async addMealToPlan(day, recipeId) {
    let recipe = this.userData.recipes.find(r => r.id === recipeId);
    
    if (!recipe) return;
    
    // Check if we need to fetch complete recipe data from API
    if (this.recipeAPI && (!recipe.ingredients || recipe.ingredients.length === 0)) {
      try {
        const fullRecipe = await this.recipeAPI.getRecipeById(recipeId);
        if (fullRecipe) {
          // Update the recipe in the user's saved recipes
          this.userData.recipes = this.userData.recipes.map(r => 
            r.id === recipeId ? fullRecipe : r
          );
          recipe = fullRecipe;
        }
      } catch (error) {
        console.error('Error fetching complete recipe data:', error);
        // Continue with the limited recipe data we have
      }
    }
    
    if (!this.userData.mealPlan) {
      this.userData.mealPlan = {};
    }
    
    this.userData.mealPlan[day] = recipe;
    
    // Update the shopping list with recipe ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      if (!this.userData.shoppingList) {
        this.userData.shoppingList = [];
      }
      
      // Add new ingredients to shopping list
      recipe.ingredients.forEach(ingredient => {
        // Check if the ingredient is already in the shopping list
        const existingItem = this.userData.shoppingList.find(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingItem) {
          // Try to parse quantities for combining
          try {
            const existingQty = parseFloat(existingItem.quantity);
            const newQty = parseFloat(ingredient.quantity);
            const unit = ingredient.unit || '';
            
            // Only combine if units match or no units specified
            if (!isNaN(existingQty) && !isNaN(newQty)) {
              existingItem.quantity = `${existingQty + newQty} ${unit}`.trim();
            }
          } catch (e) {
            // If parsing fails, just keep existing item
            console.warn('Could not combine quantities for', ingredient.name);
          }
        } else {
          // Add new item
          this.userData.shoppingList.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: ingredient.name,
            quantity: `${ingredient.quantity} ${ingredient.unit || ''}`.trim(),
            checked: false
          });
        }
      });
    }
    
    setLocalStorage("userData", this.userData);
    
    // Refresh the displays
    this.refreshDisplays();
  }

  removeMeal(day) {
    if (!this.userData.mealPlan) return;
    
    this.userData.mealPlan[day] = null;
    setLocalStorage("userData", this.userData);
    
    // Refresh the displays
    this.refreshDisplays();
  }

  refreshDisplays() {
    // Refresh the meal plan display
    const mealPlanContainer = document.querySelector('.meal-plan');
    if (mealPlanContainer) {
      mealPlanContainer.innerHTML = '<h2>Meal Plan</h2>';
      this.renderMealPlan();
    }
    
    // Refresh the shopping list if it exists on the page
    const shoppingListContainer = document.querySelector('.shopping-list');
    if (shoppingListContainer) {
      shoppingListContainer.innerHTML = '<h2>Shopping List</h2>';
      this.renderShoppingList();
    }
    
    // Re-attach event listeners
    this.setupEventListeners();
  }
  
  // Method to add a recipe saved from elsewhere in the app
  addRecipe(recipe) {
    if (!this.userData.recipes) {
      this.userData.recipes = [];
    }
    
    // Check if recipe already exists
    const existingIndex = this.userData.recipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      // Update existing recipe
      this.userData.recipes[existingIndex] = recipe;
    } else {
      // Add new recipe
      this.userData.recipes.push(recipe);
    }
    
    setLocalStorage("userData", this.userData);
    
    // If we're on the account page, refresh the display
    if (document.querySelector('.my-recipes')) {
      document.querySelector('.my-recipes').innerHTML = '<h2>My Recipes</h2>';
      this.renderMyRecipes();
      this.setupEventListeners();
    }
    
    return true;
  }
}

// Template functions
function myRecipesTemplate(recipes) {
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

function shoppingListTemplate(items) {
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

function shoppingListFormTemplate() {
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

function recipeSelectorTemplate(day, recipes) {
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