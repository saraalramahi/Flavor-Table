"use strict ";

// ========== Search Recipes ==========
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const ingredients = document.getElementById("ingredients").value;
    const res = await fetch(`/recipes/search?ingredients=${ingredients}`);
    const data = await res.json();

    const results = document.getElementById("results");
    results.innerHTML = "";

    data.forEach((recipe) => {
      const card = document.createElement("div");
      card.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" width="200"/>
        <p><b>Used:</b> ${recipe.usedIngredients.join(", ")}</p>
        <p><b>Missing:</b> ${recipe.missedIngredients.join(", ")}</p>
        <button onclick="saveFavorite('${recipe.title}', '${recipe.image}')">Save to Favorites</button>
      `;
      results.appendChild(card);
    });
  });
}

// ========== Random Recipe ==========
const randomBtn = document.getElementById("randomBtn");
if (randomBtn) {
  randomBtn.addEventListener("click", async () => {
    const res = await fetch("/recipes/random");
    const recipe = await res.json();

    const randomResult = document.getElementById("randomResult");
    randomResult.innerHTML = `
    <div class="recipe-card">
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" width="200"/>
      <p>${recipe.instructions || "No instructions available"}</p>
      <ul>${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}</ul>
      <button onclick="saveFavorite('${recipe.title}', '${recipe.image}')">Save to Favorites</button>
    `;
  });
}

// ========== Favorites ==========
function saveFavorite(title, image) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push({ title, image });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("Recipe saved!");
}

const favoritesList = document.getElementById("favoritesList");
if (favoritesList) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesList.innerHTML = "";
  favorites.forEach((f, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${f.title}</h3>
      <img src="${f.image}" width="200"/>
      <button onclick="removeFavorite(${index})">Remove</button>
    `;
    favoritesList.appendChild(div);
  });
}

function removeFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  location.reload();
}