import {mealdb_API_KEY} from "../.env"
import {endpoint} from "../.env"
import {SPOON_API_BASE_URL} from "../.env"


async function fetchData() {
    try {
        const ingredient = document.getElementById("ingredient").value.toLowerCase;
        const mealdbResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
        const spoonResponse = await fetch(`https://api.spoonacular.com/recipes/findByIngredients`);

        if(!mealdbResponse.ok) || (!spoonResponse.ok) {
            throw new Error("Could not find that ingredient")
        }

        const mealData = await mealdbResponse.json();
        const spoonData = await spoonResponse.json();
        console.log(mealData);
        console.log(spoonData);
    }
    catch(error) {
        console.error(error);
    }
}