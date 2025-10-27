const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  addCategory,
} = require("../controllers/categoryController");
const { validateToken } = require("../middleware/auth");

// GET categories should NOT require authentication
router.get("/", getAllCategories);

// POST (add category) should require authentication
router.post("/", validateToken, addCategory);

module.exports = router;