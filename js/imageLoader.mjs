import RecipeAPI from './api.mjs';

export default class ImageLoader {
  constructor() {
    this.recipeAPI = new RecipeAPI();
    this.imageCache = {};
  }

  async loadCategoryImages() {
    try {
      const categories = ['dinner', 'desserts', 'gluten-free', 'breads'];

      // Process all categories in parallel
      const promises = categories.map(category => this.loadSingleCategoryImage(category));
      await Promise.all(promises);

      console.log('All category images loaded successfully!');
    } catch (error) {
      console.error('Error loading category images:', error);
    }
  }

  async loadSingleCategoryImage(category) {
    try {
      const categoryElement = document.querySelector(`.${category}`);
      if (!categoryElement) return;

      const imgElement = categoryElement.querySelector('img');
      if (!imgElement) return;

      // Show loading state
      this.setLoadingState(imgElement);

      // Get a recipe for this specific category
      const recipe = await this.recipeAPI.getSpecificCategoryRecipe(category);

      if (recipe && recipe.image) {
        // Cache the image
        this.imageCache[category] = recipe;

        // Update the image element
        imgElement.src = recipe.image;
        imgElement.alt = recipe.title;

        // Make the container clickable
        categoryElement.dataset.recipeId = recipe.id;
        categoryElement.dataset.source = recipe.source;
        categoryElement.title = recipe.title; // Tooltip on hover

        // Add a hidden span with the recipe name for screen readers
        const nameSpan = document.createElement('span');
        nameSpan.className = 'sr-only';
        nameSpan.textContent = recipe.title;
        categoryElement.appendChild(nameSpan);

        console.log(`Loaded image for ${category}:`, recipe.title);
      } else {
        // If API failed, use a fallback image
        imgElement.src = `/public/images/${category}-fallback.jpg`;
        imgElement.alt = `${category.charAt(0).toUpperCase() + category.slice(1)} recipes`;
        console.warn(`Using fallback image for ${category}`);
      }
    } catch (error) {
      console.error(`Error loading image for ${category}:`, error);

      // Use fallback image on error
      const imgElement = document.querySelector(`.${category} img`);
      if (imgElement) {
        imgElement.src = `/public/images/${category}-fallback.jpg`;
        imgElement.alt = `${category.charAt(0).toUpperCase() + category.slice(1)} recipes`;
      }
    }
  }

  async loadFeaturedRecipeImage() {
    try {
      const registerDiv = document.querySelector('.register');
      if (!registerDiv) return;

      const imgElement = registerDiv.querySelector('img');
      if (!imgElement) return;

      // Show loading state
      this.setLoadingState(imgElement);

      // Get a featured recipe
      const recipe = await this.recipeAPI.getFeaturedRecipe();

      if (recipe && recipe.image) {
        // Update the image element
        imgElement.src = recipe.image;
        imgElement.alt = `Featured recipe: ${recipe.title}`;

        // Add recipe info
        let recipeInfo = registerDiv.querySelector('.featured-recipe-info');
        if (!recipeInfo) {
          recipeInfo = document.createElement('p');
          recipeInfo.className = 'featured-recipe-info';
          registerDiv.insertBefore(recipeInfo, registerDiv.querySelector('button'));
        }
        recipeInfo.textContent = `Featured Recipe: ${recipe.title}`;

        // Make the image clickable to view the recipe
        imgElement.style.cursor = 'pointer';
        imgElement.addEventListener('click', () => {
          window.location.href = `/recipe.html?id=${recipe.id}&source=${recipe.source}`;
        });

        console.log('Loaded featured recipe:', recipe.title);
      } else {
        // Use fallback image
        imgElement.src = '/public/images/featured-fallback.jpg';
        imgElement.alt = 'Featured recipes';
        console.warn('Using fallback image for featured recipe');
      }
    } catch (error) {
      console.error('Error loading featured recipe image:', error);

      // Use fallback image on error
      const imgElement = document.querySelector('.register img');
      if (imgElement) {
        imgElement.src = '/public/images/featured-fallback.jpg';
        imgElement.alt = 'Featured recipes';
      }
    }
  }

  setLoadingState(imgElement) {
    // Optional: Add a loading indicator or placeholder
    imgElement.style.opacity = '0.5';
    imgElement.alt = 'Loading...';
  }

  // Get a cached recipe by category
  getCachedRecipe(category) {
    return this.imageCache[category] || null;
  }
}