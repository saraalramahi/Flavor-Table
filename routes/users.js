"use strict";

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {pool} = require("../server"); // لو pool موجود بالserver.js

// Protected route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, username, email FROM users WHERE id=$1", [req.user.id]);
    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "user not found" });
    res.json({ message: "User Deleted", recipe: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database delete error" });
  }
});
module.exports = router;