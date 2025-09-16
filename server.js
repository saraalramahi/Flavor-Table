
"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const axios = require("axios");

const app = express();

// -------- Middleware --------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// -------- PostgreSQL Pool --------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// تصدير الـ pool للراوترات
module.exports.pool = pool;

// -------- Home Route --------
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// -------- Spoonacular API routes --------
app.get("/recipes/random", async (req, res) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/random`, {
      params: { apiKey: process.env.API_KEY, number: 1 },
    });

    const recipe = response.data.recipes[0];
    res.json({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      ingredients: recipe.extendedIngredients.map((ing) => ing.original),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random recipe" });
  }
});

app.get("/recipes/search", async (req, res) => {
  const { ingredients } = req.query;
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
      params: { apiKey: process.env.API_KEY, ingredients, number: 10 },
    });

    const data = response.data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients.map((i) => i.name),
      missedIngredients: recipe.missedIngredients.map((i) => i.name),
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// -------- PostgreSQL CRUD routes --------
// Get all recipes
app.get("/api/recipes/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error fetching recipes" });
  }
});

// Add recipe
app.post("/api/recipes", async (req, res) => {
  const { title, image, instructions = "", ingredients = [], readyin = null } = req.body;
  try {
    const q = `INSERT INTO recipes (title, image, instructions, ingredients, readyin)
               VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING *`;
    const values = [title, image, instructions, JSON.stringify(ingredients), readyin];
    const result = await pool.query(q, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// Update recipe
app.put("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, image, instructions = "", ingredients = [], readyin = null } = req.body;
  try {
    const q = `UPDATE recipes
               SET title=$1, image=$2, instructions=$3, ingredients=$4::jsonb, readyin=$5
               WHERE id=$6
               RETURNING *`;
    const values = [title, image, instructions, JSON.stringify(ingredients), readyin, id];
    const result = await pool.query(q, values);
    if (result.rows.length === 0) return res.status(404).json({ error: "Recipe not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database update error" });
  }
});

// Delete recipe
app.delete("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM recipes WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Recipe not found" });
    res.json({ message: "Deleted", recipe: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database delete error" });
  }
});

// -------- Import Routes --------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// -------- Start server --------
// const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));

