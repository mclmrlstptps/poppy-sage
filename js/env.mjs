function loadEnvironmentVariables() {
    window.ENV = {
        SPOONACULAR_API_KEY: "", // Add your key here
        API_BASE_URL: "https://api.spoonacular.com",
        MEALDB_API_KEY: "1", // Free API key
        MEALDB_BASE_URL: "https://www.themealdb.com/api/json/v1"
    };
    console.log("Environment variables loaded");
  
  return Promise.resolve();
}
loadEnvironmentVariables();

// Export the load function for external use
export const load = loadEnvironmentVariables;

export default { load: loadEnvironmentVariables };