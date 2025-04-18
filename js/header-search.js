// header-search.js
import { fetchRecipesByIngredient } from './search.js';

// Function to initialize search functionality in page headers
export function initHeaderSearch() {
  console.log("Initializing header search");
  
  // Get DOM elements from header
  const headerSearchInput = document.getElementById("header-ingredient");
  const headerSearchButton = document.getElementById("header-searchButton");
  
  // Add event listener to button
  if (headerSearchButton) {
    console.log("Adding click event listener to header search button");
    headerSearchButton.addEventListener("click", function() {
      const ingredient = headerSearchInput.value;
      console.log("Header search button clicked, ingredient value:", ingredient);
      
      // If ingredient is valid, redirect to search page with query parameter
      if (ingredient && ingredient.trim() !== '') {
        window.location.href = `/search.html?ingredient=${encodeURIComponent(ingredient.trim())}`;
      }
    });
  }
  
  // Add event listener for Enter key
  if (headerSearchInput) {
    console.log("Adding keypress event listener to header search input");
    headerSearchInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        const ingredient = headerSearchInput.value;
        console.log("Enter key pressed in header search, ingredient value:", ingredient);
        
        // If ingredient is valid, redirect to search page with query parameter
        if (ingredient && ingredient.trim() !== '') {
          window.location.href = `/search.html?ingredient=${encodeURIComponent(ingredient.trim())}`;
        }
        event.preventDefault();
      }
    });
  }
}