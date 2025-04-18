// Import necessary modules
import RecipeAPI from './api.mjs';
import { getLocalStorage, setLocalStorage } from './utils.mjs';

// Constants
const SEARCH_CACHE_KEY = 'recipe_search_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds

// Initialize the Recipe API
const recipeApi = new RecipeAPI();

// DOM elements
let searchInput;
let searchButton;
let resultsContainer;

// Function to initialize header search - ensure this is defined
function initHeaderSearch() {
    console.log("Initializing header search");
    // Header search implementation would go here
    // This is just a stub since the original code calls this function
}

// Function to check if cached search results are still valid
function isSearchCacheValid(cachedItem) {
    if (!cachedItem) return false;

    try {
        const data = JSON.parse(cachedItem);
        const now = new Date().getTime();
        return data && data.timestamp && (now - data.timestamp < CACHE_TTL);
    } catch (error) {
        console.error("Error parsing cache:", error);
        return false;
    }
}

// Initialize the page
function init() {
    console.log("Search page initialized");

    // Initialize header search functionality on every page
    initHeaderSearch();

    // Check if we're on the search page
    if (window.location.pathname.includes('search.html')) {
        // Get DOM elements - using direct getElementById for more reliability
        searchInput = document.getElementById("ingredient");
        searchButton = document.getElementById("searchButton");
        resultsContainer = document.getElementById("searchResults");

        console.log("Search input found:", !!searchInput);
        console.log("Search button found:", !!searchButton);
        console.log("Results container found:", !!resultsContainer);

        // Create results container if it doesn't exist
        if (!resultsContainer) {
            console.log("Creating results container");
            resultsContainer = document.createElement('div');
            resultsContainer.id = "searchResults";
            resultsContainer.className = "search-results";
            document.querySelector('main').appendChild(resultsContainer);
        }

        // Add event listener to button
        if (searchButton) {
            console.log("Adding click event listener to button");
            searchButton.addEventListener("click", function () {
                console.log("Button clicked, ingredient value:", searchInput.value);
                fetchRecipesByIngredient(searchInput.value);
            });
        }

        // Add event listener for Enter key
        if (searchInput) {
            console.log("Adding keypress event listener to input");
            searchInput.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    console.log("Enter key pressed, ingredient value:", searchInput.value);
                    fetchRecipesByIngredient(searchInput.value);
                    event.preventDefault();
                }
            });
        }

        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const ingredientParam = urlParams.get('ingredient');

        // If we have an ingredient parameter, search for it
        if (ingredientParam) {
            console.log("Found ingredient parameter:", ingredientParam);
            // Set the input value
            if (searchInput) {
                searchInput.value = ingredientParam;
            }
            // Perform the search
            fetchRecipesByIngredient(ingredientParam);
        }
    }
}

// Function to fetch recipes by ingredient
async function fetchRecipesByIngredient(ingredient) {
    console.log("fetchRecipesByIngredient called with:", ingredient);

    // If no ingredient is provided, get it from the input field
    if (!ingredient) {
        if (searchInput) {
            ingredient = searchInput.value;
        }
    }

    if (!ingredient || ingredient.trim() === '') {
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p class="error">Please enter an ingredient to search for.</p>';
        }
        return;
    }

    // Show loading state
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p class="loading">Searching for recipes...</p>';
    }

    // Check cache first
    const cacheKey = `${SEARCH_CACHE_KEY}_${ingredient.toLowerCase().trim()}`;
    const cachedResults = getLocalStorage(cacheKey);

    if (isSearchCacheValid(cachedResults)) {
        displayResults(JSON.parse(cachedResults).data);
        return;
    }

    try {
        // Search using the RecipeAPI
        console.log("Calling recipeApi.searchRecipes with ingredient:", ingredient);
        const results = await recipeApi.searchRecipes(ingredient);
        console.log("Search results:", results);

        // Cache the results
        setLocalStorage(cacheKey, JSON.stringify({
            timestamp: new Date().getTime(),
            data: results
        }));

        // Display the results
        displayResults(results);
    } catch (error) {
        console.error("Error searching for recipes:", error);
        if (resultsContainer) {
            resultsContainer.innerHTML = `<p class="error">Error searching for recipes with ${ingredient}. Please try again.</p>`;
        }
    }
}

// Function to display the results
function displayResults(recipes) {
    console.log("Displaying results:", recipes);

    // Make sure we have a container
    if (!resultsContainer) {
        console.error("Results container not found");
        return;
    }

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Check if we have results
    if (!recipes || recipes.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No recipes found with that ingredient. Try something else!</p>';
        return;
    }

    // Create a grid container for the results
    const gridContainer = document.createElement('div');
    gridContainer.className = 'recipe-grid';

    // Add each recipe to the grid
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        gridContainer.appendChild(card);
    });

    // Add the grid to the page
    resultsContainer.appendChild(gridContainer);
}

// Function to create a recipe card element
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    // Create a link to the recipe detail page
    const link = document.createElement('a');

    // Set the link to point to recipe-detail.html with ID and source as query parameters
    link.href = `recipe-detail.html?id=${recipe.id}&source=${recipe.source}`;

    // Add recipe image
    const img = document.createElement('img');
    img.src = recipe.image || '/public/images/recipe-placeholder.jpg';
    img.alt = recipe.title;
    img.className = 'recipe-image';
    link.appendChild(img);

    // Add recipe title
    const title = document.createElement('h3');
    title.textContent = recipe.title;
    title.className = 'recipe-title';
    link.appendChild(title);

    // Add source badge
    const sourceBadge = document.createElement('span');
    sourceBadge.className = `source-badge ${recipe.source}`;
    sourceBadge.textContent = recipe.source === 'spoonacular' ? 'Spoonacular' : 'MealDB';
    link.appendChild(sourceBadge);

    // Add the link to the card
    card.appendChild(link);

    return card;
}

// Make fetchRecipesByIngredient available globally
window.fetchRecipesByIngredient = fetchRecipesByIngredient;

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Export the functions for potential use in other modules
export {
    fetchRecipesByIngredient,
    displayResults,
    createRecipeCard
};