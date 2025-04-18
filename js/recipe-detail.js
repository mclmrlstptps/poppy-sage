import RecipeAPI from './api.mjs';
import { getLocalStorage, setLocalStorage } from './utils.mjs';

// Initialize the Recipe API
const recipeApi = new RecipeAPI();

// DOM elements
let loadingSpinner;
let recipeContent;
let errorMessage;
let backToSearch;
let saveRecipeBtn;
let addToMealPlanBtn;

// Recipe elements
let recipeTitle;
let recipeCookTime;
let recipeServings;
let recipeSource;
let recipeImage;
let recipeSummary;
let ingredientsList;
let instructionsContent;

// Function to initialize the page
function init() {
    console.log("Recipe detail page initialized");

    // Get DOM elements
    loadingSpinner = document.getElementById('loadingSpinner');
    recipeContent = document.getElementById('recipeContent');
    errorMessage = document.getElementById('errorMessage');
    backToSearch = document.getElementById('backToSearch');
    saveRecipeBtn = document.getElementById('saveRecipeBtn');
    addToMealPlanBtn = document.getElementById('addToMealPlan');

    // Recipe elements
    recipeTitle = document.getElementById('recipeTitle');
    recipeCookTime = document.getElementById('recipeCookTime');
    recipeServings = document.getElementById('recipeServings');
    recipeSource = document.getElementById('recipeSource');
    recipeImage = document.getElementById('recipeImage');
    recipeSummary = document.getElementById('recipeSummary');
    ingredientsList = document.getElementById('ingredientsList');
    instructionsContent = document.getElementById('instructionsContent');

    // Debug DOM elements
    console.log({
        loadingSpinner: !!loadingSpinner,
        recipeContent: !!recipeContent,
        errorMessage: !!errorMessage,
        recipeTitle: !!recipeTitle,
        recipeImage: !!recipeImage
    });

    // Get recipe ID and source from URL
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const source = params.get('source');

    console.log("Recipe ID:", recipeId);
    console.log("Recipe source:", source);

    // If we have both parameters, load the recipe
    if (recipeId && source) {
        loadRecipe(recipeId, source);
    } else {
        // Show error if parameters are missing
        showError("Missing recipe information. Please go back to search.");
    }

    // Set up event listeners
    if (backToSearch) {
        backToSearch.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'search.html';
        });
    }

    if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', saveRecipe);
    }

    if (addToMealPlanBtn) {
        addToMealPlanBtn.addEventListener('click', addToMealPlan);
    }
}

// Function to load a recipe
async function loadRecipe(id, source) {
    console.log("Loading recipe:", id, "from source:", source);

    // Show loading spinner
    showLoading();

    try {
        // Get recipe details
        const recipe = await recipeApi.getRecipeById(id, source);
        console.log("Recipe data:", recipe);

        if (!recipe) {
            showError("Recipe not found. It may have been removed or is temporarily unavailable.");
            return;
        }

        // Display the recipe
        displayRecipe(recipe);
    } catch (error) {
        console.error("Error loading recipe:", error);
        showError("Error loading recipe. Please try again later.");
    }
}

// Function to format cooking time
function formatCookingTime(minutes) {
    if (!minutes) return 'Time not specified';

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}

// Function to display a recipe
function displayRecipe(recipe) {
    console.log("Displaying recipe:", recipe.title);

    // Set recipe title
    if (recipeTitle) recipeTitle.textContent = recipe.title;

    // Set recipe meta info
    if (recipeCookTime) recipeCookTime.textContent = formatCookingTime(recipe.readyInMinutes);
    if (recipeServings) recipeServings.textContent = `${recipe.servings} servings`;
    if (recipeSource) {
        recipeSource.textContent = recipe.source === 'spoonacular' ? 'Spoonacular' : 'MealDB';
        recipeSource.className = `meta-badge ${recipe.source}`;
    }

    // Set recipe image
    if (recipeImage) {
        recipeImage.src = recipe.image || '/public/images/recipe-placeholder.jpg';
        recipeImage.alt = recipe.title;
    }

    // Set recipe summary (strip HTML if present)
    if (recipeSummary) {
        recipeSummary.innerHTML = recipe.summary || 'No description available for this recipe.';
    }

    // Populate ingredients list
    if (ingredientsList) {
        ingredientsList.innerHTML = '';
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient.name;
                ingredientsList.appendChild(li);
            });
        } else {
            ingredientsList.innerHTML = '<li>Ingredients not available</li>';
        }
    }

    // Populate instructions
    if (instructionsContent) {
        if (recipe.instructions) {
            instructionsContent.innerHTML = recipe.instructions;
        } else if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
            // Handle structured instructions
            const steps = recipe.analyzedInstructions[0].steps;
            const ol = document.createElement('ol');

            steps.forEach(step => {
                const li = document.createElement('li');
                li.textContent = step.step;
                ol.appendChild(li);
            });

            instructionsContent.innerHTML = '';
            instructionsContent.appendChild(ol);
        } else {
            instructionsContent.textContent = 'Instructions not available for this recipe.';
        }
    }

    // Show the content
    showContent();
}

// Function to save a recipe to favorites
function saveRecipe() {
    console.log("Save recipe button clicked");

    // Get current recipe ID and source from URL
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const source = params.get('source');

    if (!recipeId || !source) return;

    try {
        // Get existing saved recipes from localStorage
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

        // Check if recipe is already saved
        const isAlreadySaved = savedRecipes.some(
            recipe => recipe.id === recipeId && recipe.source === source
        );

        if (isAlreadySaved) {
            alert('This recipe is already saved to your favorites!');
            return;
        }

        // Add new recipe to saved recipes
        savedRecipes.push({
            id: recipeId,
            source: source,
            title: recipeTitle.textContent,
            image: recipeImage.src,
            savedAt: new Date().toISOString()
        });

        // Save to localStorage
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

        // Update button text
        if (saveRecipeBtn) {
            saveRecipeBtn.textContent = 'Saved!';
            saveRecipeBtn.disabled = true;
        }

        // Show success message
        setTimeout(() => {
            alert('Recipe saved to favorites!');
        }, 100);
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Sorry, could not save the recipe. Please try again.');
    }
}

// Helper function to show loading spinner
function showLoading() {
    console.log("Showing loading spinner");
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (recipeContent) recipeContent.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

// Helper function to show recipe content
function showContent() {
    console.log("Showing recipe content");
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (recipeContent) recipeContent.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
}

// Helper function to show error message
function showError(message) {
    console.log("Showing error message:", message);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (recipeContent) recipeContent.style.display = 'none';
    if (errorMessage) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = message;
    } else {
        // If error element doesn't exist, create one
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('main').appendChild(errorDiv);
    }
}

// Function to add a recipe to meal plan
function addToMealPlan() {
    console.log("Add to Meal Plan button clicked");

    // Get current recipe ID and source from URL
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const source = params.get('source');

    if (!recipeId || !source) return;

    try {
        // Get existing meal plan from localStorage
        const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];

        // Check if recipe is already in meal plan
        const isAlreadyAdded = mealPlan.some(
            recipe => recipe.id === recipeId && recipe.source === source
        );

        if (isAlreadyAdded) {
            alert('This recipe is already added to your Meal Plan!');
            return;
        }

        // Add new recipe to meal plan
        mealPlan.push({
            id: recipeId,
            source: source,
            title: recipeTitle.textContent,
            image: recipeImage.src,
            ingredients: Array.from(ingredientsList.querySelectorAll('li')).map(li => li.textContent),
            instructions: instructionsContent.innerHTML,
            summary: recipeSummary.innerHTML,
            addedAt: new Date().toISOString()
        });

        // Save to localStorage
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));

        // Update button text
        if (addToMealPlanBtn) {
            addToMealPlanBtn.textContent = 'Added to Plan!';
            addToMealPlanBtn.disabled = true;
        }

        // Show success message
        setTimeout(() => {
            alert('Recipe added to Meal Plan!');
        }, 100);
    } catch (error) {
        console.error('Error adding recipe to meal plan:', error);
        alert('Sorry, could not add the recipe to meal plan. Please try again.');
    }
}





// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", init);