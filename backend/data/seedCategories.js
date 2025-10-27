const mongoose = require('mongoose');
const Category = require('../models/Category');

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
        name: "Others",
        icon: "📦",
        color: "#95a5a6"
    }
];

async function seedCategories() {
    try {
        // Check if there are any categories
        const count = await Category.countDocuments();
        
        if (count === 0) {
            // Insert default categories
            await Category.insertMany(defaultCategories);
            console.log('Default categories have been seeded');
        } else {
            console.log('Categories already exist, skipping seed');
        }
    } catch (error) {
        console.error('Error seeding categories:', error);
    }
}

module.exports = seedCategories;