const Category = require("../models/Category");

// Default categories to be created if none exist
const defaultCategories = [
    {
        name: "Entertainment",
        icon: "🎬",
        color: "#e74c3c"
    },
    {
        name: "Music",
        icon: "🎵",
        color: "#3498db"
    },
    {
        name: "Gaming",
        icon: "🎮",
        color: "#2ecc71"
    },
    {
        name: "Productivity",
        icon: "💼",
        color: "#f1c40f"
    },
    {
        name: "Cloud Storage",
        icon: "☁️",
        color: "#9b59b6"
    },
    {
        name: "Software",
        icon: "💻",
        color: "#34495e"
    },
    {
        name: "Health & Fitness",
        icon: "💪",
        color: "#e67e22"
    },
    {
        name: "Education",
        icon: "📚",
        color: "#16a085"
    },
    {
        name: "News & Media",
        icon: "📰",
        color: "#c0392b"
    },
    {
        name: "Others",
        icon: "📦",
        color: "#95a5a6"
    }
];

async function getAllCategories(req, res) {
  try {
    let categories = await Category.find({});
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      console.log('No categories found. Creating default categories...');
      categories = await Category.insertMany(defaultCategories);
      console.log('Default categories created:', categories.length);
    }
    
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Error in getAllCategories:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function addCategory(req, res) {
  try {
    const { name, icon, color } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: name.trim() 
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        message: "Category with this name already exists" 
      });
    }
    
    const category = new Category({ 
      name: name.trim(), 
      icon: icon || "📦", 
      color: color || "#6c757d" 
    });
    
    await category.save();
    
    return res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (err) {
    console.error('Error in addCategory:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllCategories,
  addCategory,
};