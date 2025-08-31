"use strict";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// routes
const homeRoute = require("./routes/home");
const recipesRoute = require("./routes/recipes");

app.use("/", homeRoute);
app.use("/recipes", recipesRoute);

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});