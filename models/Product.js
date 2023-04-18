const mongoose = require("mongoose");

const Product = new mongoose.Schema(
  {
    images: [Object],
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    sleeve: {
      type: String,
      required: true,
    },
    size: [String],
    color: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", Product);
