import RecipeAPI from './api.mjs';
import { getLocalStorage } from './utils.mjs';
import AccountManager from './account.mjs';

// Load environment variables from .env file
import './env.mjs';

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

  const label = document.createElement('p');
  label.textContent = `Featured Recipe: ${recipe.title}`;
  label.className = 'featured-recipe-label';

  let button = registerDiv.querySelector('button');
  if (!button) {
    button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Create My Account';
    button.onclick = () => location.href = 'account.html';
    registerDiv.appendChild(button);
  }

  registerDiv.insertBefore(label, button);

  return registerDiv;
}

// Click even for meal cards
function handleMealTypeClick(event) {
  const categoryDiv = event.currentTarget;
  const recipeId = categoryDiv.dataset.recipeId;
  const source = categoryDiv.dataset.source;
  
  if (recipeId && source) {
    // Navigate to recipe detail page
    window.location.href = `/recipe.html?id=${recipeId}&source=${source}`;
  } else {
    // Navigate to category page if no specific recipe
    const category = categoryDiv.className;
    window.location.href = `/recipes.html?category=${category}`;
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
    
    // Load recipes for the homepage
    await this.loadHomepageContent();
    
    // Set up event listeners
    this.setupEventListeners();
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

// Environment variables utility
const env = {
  load() {
    // This would typically load from a .env file
    // For security reasons, this is just a placeholder
    // Real implementation would use a proper .env loader
    return Promise.resolve();
  }
};

// Initialize the app after DOM content is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await env.load();
  const app = new App();
  await app.init();
});

export default App;
