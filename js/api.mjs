import { getLocalStorage, setLocalStorage } from './utils.mjs';


const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CATEGORY_CACHE_KEY = 'recipe_categories';
const FEATURED_CACHE_KEY = 'featured_recipe';
function isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp) return false;
    const now = new Date().getTime();
    return (now - cacheData.timestamp) < CACHE_DURATION;
  }


// Formatting Spoonacular Recipes
function formatSpoonacularRecipe(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg`,
      summary: recipe.summary,
      instructions: recipe.instructions,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      source: 'spoonacular',
      ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ({
        name: ing.original,
        amount: ing.amount,
        unit: ing.unit
      })) : []
    };
  }

// Formatting MealDB Recipes
function formatMealDbRecipe(recipe) {
    // Extract ingredients (MealDB has ingredients1-20)
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient,
          amount: measure || '',
          unit: ''
        });
      }
    }
    
    return {
      id: recipe.idMeal,
      title: recipe.strMeal,
      image: recipe.strMealThumb,
      summary: recipe.strTags ? `Tags: ${recipe.strTags}` : '',
      instructions: recipe.strInstructions,
      readyInMinutes: 30, // MealDB doesn't provide this info
      servings: 4, // MealDB doesn't provide this info
      source: 'mealdb',
      ingredients
    };
  }
class RecipeAPI {
  constructor() {
    // Load environment variables from window.ENV
    // These should be populated by env.mjs
    this.spoonacularApiKey = '';
    this.spoonacularBaseUrl = 'https://api.spoonacular.com';
    this.mealDbApiKey = '1'; // The free API key for MealDB
    this.mealDbBaseUrl = 'https://www.themealdb.com/api/json/v1';
    
    this.loadEnvVariables();
  }
  
  loadEnvVariables() {
    // This assumes env.mjs populates window.ENV
    if (typeof window !== 'undefined' && window.ENV) {
      this.spoonacularApiKey = window.ENV.SPOONACULAR_API_KEY || '';
      this.spoonacularBaseUrl = window.ENV.API_BASE_URL || 'https://api.spoonacular.com';
      this.mealDbApiKey = window.ENV.MEALDB_API_KEY || '1';
      this.mealDbBaseUrl = window.ENV.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1';
    }
    
    // Log status (for debugging)
    console.log('API Configuration loaded:', {
      spoonacular: !!this.spoonacularApiKey,
      mealDb: !!this.mealDbApiKey
    });
  }

  // Fetch data from Spoonacular API
  async fetchFromSpoonacular(endpoint, params = {}) {
    if (!this.spoonacularApiKey) {
      console.error('Spoonacular API key not found');
      return null;
    }
    
    // Add API key to parameters
    params.apiKey = this.spoonacularApiKey;
    
    // Build URL with parameters
    const url = new URL(`${this.spoonacularBaseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Spoonacular:', error);
      return null;
    }
  }

  // Fetch data from MealDB API
  async fetchFromMealDB(endpoint, params = {}) {
    // Build URL with API key
    const url = new URL(`${this.mealDbBaseUrl}/${this.mealDbApiKey}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`MealDB API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from MealDB:', error);
      return null;
    }
  }

  // Get recipes for each category
  async getCategoryRecipes() {
    // Check cache first
    const cachedData = getLocalStorage(CATEGORY_CACHE_KEY);
    if (isCacheValid(cachedData)) {
      return cachedData.data;
    }
    
    // Define the categories and search terms
    const categories = {
      'dinner': 'main course',
      'desserts': 'dessert',
      'gluten-free': 'gluten free',
      'breads': 'bread'
    };
    
    const result = {};
    
    // Try Spoonacular API first for each category
    if (this.spoonacularApiKey) {
      for (const [category, searchTerm] of Object.entries(categories)) {
        try {
          const response = await this.fetchFromSpoonacular('/recipes/random', {
            tags: searchTerm,
            number: 1
          });
          
          if (response && response.recipes && response.recipes.length > 0) {
            result[category] = formatSpoonacularRecipe(response.recipes[0]);
            continue; // Skip to next category if successful
          }
        } catch (error) {
          console.error(`Error fetching ${category} from Spoonacular:`, error);
        }
        
        // Fallback to MealDB if Spoonacular fails
        try {
          let endpoint = '';
          
          // Map category to relevant MealDB endpoint
          switch (category) {
            case 'dinner':
              endpoint = '/filter.php?c=Main';
              break;
            case 'desserts':
              endpoint = '/filter.php?c=Dessert';
              break;
            case 'gluten-free':
              endpoint = '/filter.php?c=Side'; // Not exact but close
              break;
            case 'breads':
              endpoint = '/filter.php?c=Breakfast'; // Not exact but might contain bread
              break;
          }
          
          if (endpoint) {
            const response = await this.fetchFromMealDB(endpoint);
            
            if (response && response.meals && response.meals.length > 0) {
              // Get full recipe details
              const randomIndex = Math.floor(Math.random() * response.meals.length);
              const mealId = response.meals[randomIndex].idMeal;
              
              const recipeResponse = await this.fetchFromMealDB(`/lookup.php?i=${mealId}`);
              
              if (recipeResponse && recipeResponse.meals && recipeResponse.meals.length > 0) {
                result[category] = formatMealDbRecipe(recipeResponse.meals[0]);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${category} from MealDB:`, error);
        }
      }
    } else {
      // If no Spoonacular API key, use MealDB exclusively
      try {
        // Get categories from MealDB
        const response = await this.fetchFromMealDB('/categories.php');
        
        if (response && response.categories) {
          for (const [category, searchTerm] of Object.entries(categories)) {
            // Find a relevant category
            let endpoint = '';
            switch (category) {
              case 'dinner':
                endpoint = '/filter.php?c=Main';
                break;
              case 'desserts':
                endpoint = '/filter.php?c=Dessert';
                break;
              case 'gluten-free':
                endpoint = '/filter.php?c=Side'; // Not exact but close
                break;
              case 'breads':
                endpoint = '/filter.php?c=Breakfast'; // Not exact but might contain bread
                break;
            }
            
            if (endpoint) {
              const categoryResponse = await this.fetchFromMealDB(endpoint);
              
              if (categoryResponse && categoryResponse.meals && categoryResponse.meals.length > 0) {
                // Get full recipe details
                const randomIndex = Math.floor(Math.random() * categoryResponse.meals.length);
                const mealId = categoryResponse.meals[randomIndex].idMeal;
                
                const recipeResponse = await this.fetchFromMealDB(`/lookup.php?i=${mealId}`);
                
                if (recipeResponse && recipeResponse.meals && recipeResponse.meals.length > 0) {
                  result[category] = formatMealDbRecipe(recipeResponse.meals[0]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories from MealDB:', error);
      }
    }
    
    // Cache the results
    setLocalStorage(CATEGORY_CACHE_KEY, {
      timestamp: new Date().getTime(),
      data: result
    });
    
    return result;
  }

  // Get a featured recipe
  async getFeaturedRecipe() {
    // Check cache first
    const cachedData = getLocalStorage(FEATURED_CACHE_KEY);
    if (isCacheValid(cachedData)) {
      return cachedData.data;
    }
    
    let featured = null;
    
    // Try Spoonacular first
    if (this.spoonacularApiKey) {
      try {
        const response = await this.fetchFromSpoonacular('/recipes/random', {
          number: 1
        });
        
        if (response && response.recipes && response.recipes.length > 0) {
          featured = formatSpoonacularRecipe(response.recipes[0]);
        }
      } catch (error) {
        console.error('Error fetching featured recipe from Spoonacular:', error);
      }
    }
    
    // Fallback to MealDB
    if (!featured) {
      try {
        const response = await this.fetchFromMealDB('/random.php');
        
        if (response && response.meals && response.meals.length > 0) {
          featured = formatMealDbRecipe(response.meals[0]);
        }
      } catch (error) {
        console.error('Error fetching featured recipe from MealDB:', error);
      }
    }
    
    // Cache the result
    if (featured) {
      setLocalStorage(FEATURED_CACHE_KEY, {
        timestamp: new Date().getTime(),
        data: featured
      });
    }
    
    return featured;
  }

  // Get recipe details
  async getRecipeDetails(id, source) {
    if (source === 'spoonacular') {
      try {
        const response = await this.fetchFromSpoonacular(`/recipes/${id}/information`);
        return response ? formatSpoonacularRecipe(response) : null;
      } catch (error) {
        console.error(`Error fetching recipe ${id} from Spoonacular:`, error);
        return null;
      }
    } else if (source === 'mealdb') {
      try {
        const response = await this.fetchFromMealDB(`/lookup.php?i=${id}`);
        return (response && response.meals && response.meals.length > 0) 
          ? formatMealDbRecipe(response.meals[0]) 
          : null;
      } catch (error) {
        console.error(`Error fetching recipe ${id} from MealDB:`, error);
        return null;
      }
    }
    
    return null;
  }

  // Search recipes
  async searchRecipes(query, filters = {}) {
    let results = [];
    
    // Try Spoonacular first
    if (this.spoonacularApiKey) {
      try {
        const params = {
          query,
          number: 10,
          ...filters
        };
        
        const response = await this.fetchFromSpoonacular('/recipes/complexSearch', params);
        
        if (response && response.results) {
          results = await Promise.all(response.results.map(async result => {
            // Get full recipe details
            const details = await this.getRecipeDetails(result.id, 'spoonacular');
            return details || formatSpoonacularRecipe(result);
          }));
        }
      } catch (error) {
        console.error('Error searching recipes from Spoonacular:', error);
      }
    }
    
    // Supplement with MealDB if needed
    if (results.length < 5) {
      try {
        const response = await this.fetchFromMealDB(`/search.php?s=${query}`);
        
        if (response && response.meals) {
          const mealDbResults = response.meals.map(meal => formatMealDbRecipe(meal));
          results = [...results, ...mealDbResults].slice(0, 10);
        }
      } catch (error) {
        console.error('Error searching recipes from MealDB:', error);
      }
    }
    
    return results;
  }
}

export default RecipeAPI;
