// main.mjs
import RecipeAPI from './api.mjs';
import { getLocalStorage, setLocalStorage } from './utils.mjs';
import AccountManager from './account.mjs';

// Load environment variables from .env file (if needed)
// import './env.mjs';

// Create Meal type card for home page
function createMealTypeCard(categoryName, imageSrc, altText, recipeId = null, source = null) {
  const categoryDiv = document.querySelector(`.${categoryName}`) || document.createElement('div');
  categoryDiv.className = categoryName;
  
  // Create or update the image
  let img = categoryDiv.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    categoryDiv.appendChild(img);
  }
  
  img.src = imageSrc;
  img.alt = altText;
  
  // Add recipe data if available
  if (recipeId && source) {
    categoryDiv.dataset.recipeId = recipeId;
    categoryDiv.dataset.source = source;
    categoryDiv.style.cursor = 'pointer';
    categoryDiv.title = altText;
  }
  
  // Create or update the heading
  const h2 = categoryDiv.querySelector('h2');
  if (!h2) {
    const heading = document.createElement('h2');
    categoryDiv.appendChild(heading);
    
    // Format the category name for display (e.g., "gluten-free" becomes "Gluten-Free")
    const formattedCategoryName = categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
    
    heading.textContent = formattedCategoryName;
  } else {
    // Format the category name for display (e.g., "gluten-free" becomes "Gluten-Free")
    const formattedCategoryName = categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
      
    h2.textContent = formattedCategoryName;
  }
  
  return categoryDiv;
}

// Create the featured recipe
function createFeaturedRecipeSection(recipe) {
  const registerDiv = document.querySelector('.register') || document.createElement('div');
  registerDiv.className = 'register';

  let img = registerDiv.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    registerDiv.appendChild(img);
  }

  img.src = recipe.image || '/public/images/cookbook.png';
  img.alt = 'Featured recipe';

  const label = document.createElement('p');
  label.textContent = `Featured Recipe: ${recipe.title}`;
  label.className = 'featured-recipe-label';

  // Update button text based on login status
  const userData = getLocalStorage('userData');
  
  let button = registerDiv.querySelector('button');
  if (!button) {
    button = document.createElement('button');
    button.type = 'submit';
    
    // Set button text and action based on login status
    if (userData && userData.username) {
      button.textContent = 'View My Account';
      button.onclick = () => location.href = '/src/accounts/account.html';
    } else {
      button.textContent = 'Create My Account';
      button.onclick = () => location.href = '/src/accounts/create-account.html';
    }

    registerDiv.appendChild(button);
  } else {
    // Update existing button
    if (userData && userData.username) {
      button.textContent = 'View My Account';
      button.onclick = () => location.href = '/src/accounts/account.html'; // Fixed path
    } else {
      button.textContent = 'Create My Account';
      button.onclick = () => location.href = '/src/accounts/create-account.html'; // Fixed path
    }
  }

  // Add label before button if it doesn't exist
  if (!registerDiv.querySelector('.featured-recipe-label')) {
    registerDiv.insertBefore(label, button);
  }

  return registerDiv;
}

// Click event for meal cards
function handleMealTypeClick(event) {
  const categoryDiv = event.currentTarget;
  const recipeId = categoryDiv.dataset.recipeId;
  const source = categoryDiv.dataset.source;
  
  if (recipeId && source) {
    // Navigate to recipe detail page
    window.location.href = `/src/recipes/recipe.html?id=${recipeId}&source=${source}`;
  } else {
    // Navigate to category page if no specific recipe
    const category = categoryDiv.className;
    window.location.href = `/src/recipes/recipes.html?category=${category}`;
  }
}

// Function to load recipes for a specific category
async function loadRecipesByCategory(category, app) {
  try {
    // Show loading state
    document.querySelector('main').innerHTML = '<div class="loading">Loading recipes...</div>';
    
    // Fetch recipes from API
    const recipes = await app.recipeAPI.getRecipesByCategory(category);
    
    if (recipes && recipes.length > 0) {
      displayRecipes(recipes, category, app);
    } else {
      document.querySelector('main').innerHTML = '<div class="no-results">No recipes found for this category.</div>';
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    document.querySelector('main').innerHTML = '<div class="error">There was an error loading the recipes. Please try again later.</div>';
  }
}

// Function to display recipes
function displayRecipes(recipes, category, app) {
  // Create container for recipes
  const container = document.createElement('div');
  container.className = 'recipes-container';
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.textContent = 'Back to Categories';
  backButton.addEventListener('click', () => {
    // Redirect to home page
    window.location.href = '/';
  });
  
  // Add heading
  const heading = document.createElement('h1');
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
    
  heading.textContent = `${formattedCategory} Recipes`;
  
  // Create recipe cards
  const recipeGrid = document.createElement('div');
  recipeGrid.className = 'recipe-grid';
  
  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    
    // Add recipe image
    const image = document.createElement('img');
    image.src = recipe.image;
    image.alt = recipe.title;
    
    // Add recipe title
    const title = document.createElement('h2');
    title.textContent = recipe.title;
    
    // Add view recipe button
    const viewButton = document.createElement('button');
    viewButton.textContent = 'View Recipe';
    viewButton.addEventListener('click', () => {
      // Navigate to recipe detail page
      window.location.href = `/src/recipes/recipe.html?id=${recipe.id}&source=${recipe.source}`;
    });
    
    // Append elements to recipe card
    recipeCard.appendChild(image);
    recipeCard.appendChild(title);
    recipeCard.appendChild(viewButton);
    
    // Append recipe card to grid
    recipeGrid.appendChild(recipeCard);
  });
  
  // Assemble the page
  container.appendChild(backButton);
  container.appendChild(heading);
  container.appendChild(recipeGrid);
  
  // Replace the main content with our new content
  document.querySelector('main').innerHTML = '';
  document.querySelector('main').appendChild(container);
}

async function displayRecipeById(recipeId, source, app) {
  try {
    // Show loading state
    document.querySelector('main').innerHTML = '<div class="loading">Loading recipe...</div>';
    
    console.log("Fetching recipe:", recipeId, source);
    
    // Fetch recipe from API
    const recipe = await app.recipeAPI.getRecipeById(recipeId, source);
    
    console.log("Recipe data:", recipe);
    
    if (recipe) {
      displayRecipeDetails(recipe, app);
    } else {
      document.querySelector('main').innerHTML = '<div class="no-results">Recipe not found.</div>';
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    document.querySelector('main').innerHTML = '<div class="error">There was an error loading the recipe. Please try again later.</div>';
  }
}

// Function to display detailed recipe information
function displayRecipeDetails(recipe, app) {
  const container = document.createElement('div');
  container.className = 'recipe-details';
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.textContent = 'Back to Recipes';
  backButton.addEventListener('click', () => {
    // Go back to previous page
    window.history.back();
  });
  
  // Add recipe image and title
  const header = document.createElement('div');
  header.className = 'recipe-header';
  
  const image = document.createElement('img');
  image.src = recipe.image;
  image.alt = recipe.title;
  
  const title = document.createElement('h1');
  title.textContent = recipe.title;
  
  header.appendChild(image);
  header.appendChild(title);
  
  // Add save recipe button if user is logged in
  const userData = getLocalStorage('userData');
  if (userData && userData.username) {
    const saveButton = document.createElement('button');
    saveButton.className = 'save-recipe';
    saveButton.textContent = 'Save to My Recipes';
    saveButton.addEventListener('click', () => {
      // Save recipe to user's saved recipes
      app.accountManager.addRecipe(recipe);
      saveButton.textContent = 'Recipe Saved!';
      saveButton.disabled = true;
    });
    
    header.appendChild(saveButton);
  }
  
  // Add recipe info
  const infoSection = document.createElement('div');
  infoSection.className = 'recipe-info';
  
  // Cooking time
  if (recipe.readyInMinutes) {
    const time = document.createElement('p');
    time.innerHTML = `<strong>Ready in:</strong> ${recipe.readyInMinutes} minutes`;
    infoSection.appendChild(time);
  }
  
  // Servings
  if (recipe.servings) {
    const servings = document.createElement('p');
    servings.innerHTML = `<strong>Servings:</strong> ${recipe.servings}`;
    infoSection.appendChild(servings);
  }
  
  // Ingredients
  const ingredientsSection = document.createElement('div');
  ingredientsSection.className = 'ingredients-section';
  
  const ingredientsTitle = document.createElement('h2');
  ingredientsTitle.textContent = 'Ingredients';
  
  const ingredientsList = document.createElement('ul');
  if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
    recipe.extendedIngredients.forEach(ingredient => {
      const item = document.createElement('li');
      item.textContent = ingredient.original || ingredient.name;
      ingredientsList.appendChild(item);
    });
  } else if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach(ingredient => {
      const item = document.createElement('li');
      item.textContent = typeof ingredient === 'string' ? ingredient : ingredient.name;
      ingredientsList.appendChild(item);
    });
  }
  
  ingredientsSection.appendChild(ingredientsTitle);
  ingredientsSection.appendChild(ingredientsList);
  
  // Instructions
  const instructionsSection = document.createElement('div');
  instructionsSection.className = 'instructions-section';
  
  const instructionsTitle = document.createElement('h2');
  instructionsTitle.textContent = 'Instructions';
  
  const instructions = document.createElement('div');
  
  // Check if instructions are available
  if (recipe.instructions) {
    // Check if instructions are HTML or plain text
    if (recipe.instructions.includes('<')) {
      instructions.innerHTML = recipe.instructions;
    } else {
      // Split by numbers or periods followed by space
      const steps = recipe.instructions.split(/\d+\.\s|\.\s/g).filter(step => step.trim() !== '');
      
      const stepsList = document.createElement('ol');
      steps.forEach(step => {
        const item = document.createElement('li');
        item.textContent = step.trim();
        stepsList.appendChild(item);
      });
      
      instructions.appendChild(stepsList);
    }
  } else if (recipe.analyzedInstructions && Array.isArray(recipe.analyzedInstructions)) {
    const stepsList = document.createElement('ol');
    
    recipe.analyzedInstructions.forEach(instructionSet => {
      if (instructionSet.steps && Array.isArray(instructionSet.steps)) {
        instructionSet.steps.forEach(step => {
          const item = document.createElement('li');
          item.textContent = step.step;
          stepsList.appendChild(item);
        });
      }
    });
    
    instructions.appendChild(stepsList);
  }
  
  instructionsSection.appendChild(instructionsTitle);
  instructionsSection.appendChild(instructions);
  
  // Assemble the page
  container.appendChild(backButton);
  container.appendChild(header);
  container.appendChild(infoSection);
  container.appendChild(ingredientsSection);
  container.appendChild(instructionsSection);
  
  // Replace the main content with our new content
  document.querySelector('main').innerHTML = '';
  document.querySelector('main').appendChild(container);
}

// Update account links based on login status
function updateAccountLinks() {
  const userData = getLocalStorage('userData');
  const accountLinks = document.querySelectorAll('.account a');
  
  accountLinks.forEach(link => {
    if (userData && userData.username) {
      // User is logged in, link to account page
      link.href = '/src/accounts/account.html';
    } else {
      // User is not logged in, link to login page
      link.href = '/src/accounts/login.html';
    }
  });
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Get stored user data
  const userData = getLocalStorage('userData');
  
  // Check if user exists and password is correct
  if (userData && userData.username === username && userData.password === password) {
    // Login successful
    alert('Login successful!');
    
    // Redirect to account page
    window.location.href = '/src/accounts/account.html';
  } else {
    // Login failed
    alert('Invalid username or password. Please try again.');
  }
}

class App {
  constructor() {
    this.recipeAPI = new RecipeAPI();
    this.accountManager = new AccountManager();
  }

  async init() {
    // Initialize account manager
    this.accountManager.setRecipeAPI(this.recipeAPI);
    await this.accountManager.init();
    
    // Update account links based on login status
    updateAccountLinks();
    
    // Check if we're on a specific page
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    
    if (pathname === '/' || pathname === '/index.html') {
      // Load recipes for the homepage
      await this.loadHomepageContent();
      
      // Set up event listeners for home page
      this.setupEventListeners();
    } else if (pathname.includes('/recipes.html')) {
      // Check for category parameter
      const category = url.searchParams.get('category');
      if (category) {
        await loadRecipesByCategory(category, this);
      }
    } else if (pathname.includes('/recipe.html')) {
      // Check for recipe ID and source parameters
      const recipeId = url.searchParams.get('id');
      const source = url.searchParams.get('source');
      console.log("Recipe page params:", recipeId, source);
      if (recipeId && source) {
        await displayRecipeById(recipeId, source, this);
      } else {
        console.error("Missing recipe parameters");
        document.querySelector('main').innerHTML = '<div class="error">Missing recipe information. Please try again.</div>';
      }
    } else if (pathname.includes('/login.html')) {
      // Setup login form
      setupLoginForm();
    }
  }

  async loadHomepageContent() {
    // Check if we're on the homepage
    if (document.querySelector('.meal-types')) {
      await this.loadCategoryImages();
      await this.loadFeaturedRecipe();
    }
  }

  async loadCategoryImages() {
    try {
      const categoryRecipes = await this.recipeAPI.getCategoryRecipes();
      
      // Update each category with an image and link
      Object.entries(categoryRecipes).forEach(([category, recipe]) => {
        if (recipe) {
          const categoryDiv = createMealTypeCard(
            category,
            recipe.image,
            recipe.title,
            recipe.id,
            recipe.source
          );
          
          // Add to the meal-types container if it's a new element
          const container = document.querySelector('.meal-types');
          if (container && !container.contains(categoryDiv)) {
            container.appendChild(categoryDiv);
          }
        }
      });
    } catch (error) {
      console.error('Error loading category images:', error);
    }
  }

  async loadFeaturedRecipe() {
    try {
      const featuredRecipe = await this.recipeAPI.getFeaturedRecipe();
      
      if (featuredRecipe) {
        const registerDiv = createFeaturedRecipeSection(featuredRecipe);
        
        // Add to the document if it's a new element
        if (!document.body.contains(registerDiv)) {
          const main = document.querySelector('main');
          if (main) {
            main.appendChild(registerDiv);
          }
        }
      }
    } catch (error) {
      console.error('Error loading featured recipe:', error);
    }
  }

  setupEventListeners() {
    // Add click events to category images
    document.querySelectorAll('.meal-types > div').forEach(categoryDiv => {
      categoryDiv.removeEventListener('click', handleMealTypeClick); // Remove existing listener to avoid duplicates
      categoryDiv.addEventListener('click', handleMealTypeClick);
    });
  }
}

// Initialize the app after DOM content is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new App();
    await app.init();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});

export default App;