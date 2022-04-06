const axios = require("axios").default;
exports.meals = async () => {
  return await axios
    .get("https://www.themealdb.com/api/json/v1/1/categories.php")
    .then((response) => {
      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        return { error: "Connection Error" };
      }
    })
    .catch((err) => {
      return { error: "Connection Error" };
    });
};
const mealsIngrediants = async (mealid) => {
  return await axios
    .get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealid}`)
    .then((response) => {
      if (response.status === 200 || response.status === 201) {
        let ingrediants = [];
        for (let i = 1; i <= 20; i++) {
          if (
            response.data.meals[0][`strIngredient${i}`] !== null &&
            response.data.meals[0][`strIngredient${i}`] !== ""
          ) {
            ingrediants.push(response.data.meals[0][`strIngredient${i}`]);
          } else {
            return ingrediants;
          }
        }
        return ingrediants;
      } else {
        return { error: "Connection Error" };
      }
    })
    .catch((err) => {
      return { error: "Connection Error" };
    });
};
exports.mealsIngrediants = mealsIngrediants;
exports.searchMealsByCatagory = async (mealscatagory) => {
  return await axios
    .get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealscatagory}`
    )
    .then(async (response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return { error: "Connection Error" };
      }
    })
    .catch((err) => {
      console.log(err);
      return { error: "Connection Error" };
    });
};
exports.getVerityCuisines = async () => {
  return await axios
    .get("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        return res.data.meals;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};
exports.getMealsForCuisines = async (cuisinename) => {
  return await axios
    .get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisinename}`)
    .then((res) => {
      if (res.status == 200) {
        return res.data.meals;
      } else {
        return false;
      }
    })
    .catch((err) => false);
};
exports.getMealByName = async (mealname) => {
  return await axios
    .get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealname}`)
    .then((res) => {
      if (res.status === 200 && res.data.meals) {
        return res.data.meals;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};
exports.getMealById = async (mealid) => {
  return await axios
    .get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealid}`)
    .then((res) => {
      if (res.status == 200 && res.data.meals) {
        return res.data.meals[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      return null;
    });
};
