const router = require("express").Router();
const cloudinary = require("cloudinary");
const { auth } = require("../middleware/authVerify");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");

class QueryFeatures {
  constructor(databaseQuery, requestQuery) {
    this.databaseQuery = databaseQuery;
    this.requestQuery = requestQuery;
  }

  filtering() {
    const queryObject = { ...this.requestQuery };
    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObject[el]);

    if (queryObject["category"])
      queryObject["category"]["in"] = queryObject["category"]["in"].split(",");
    if (queryObject["size"])
      queryObject["size"]["in"] = queryObject["size"]["in"].split(",");
    if (queryObject["sleeve"])
      queryObject["sleeve"]["in"] = queryObject["sleeve"]["in"].split(",");
    if (queryObject["color"])
      queryObject["color"]["in"] = queryObject["color"]["in"].split(",");
    if (queryObject["title"]) {
      queryObject["title"]["$options"] = "i";
      queryObject["title"]["regex"] = queryObject["title"]["regex"].replace(
        /[.\"\'\`!*-+={}?^$()|[\]\\]/g,
        ""
      );
    }
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|in|regex)\b/g,
      (match) => "$" + match
    );
    this.databaseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.requestQuery.sort) {
      if (this.requestQuery.sort === "createdAt:1") {
        this.databaseQuery = this.databaseQuery.sort({ createdAt: 1 });
      } else {
        const sortBy = this.requestQuery.sort.split(":");
        let sortField = sortBy[0];
        let sortValue = sortBy[1] * 1;

        this.databaseQuery = this.databaseQuery.sort({
          [sortField]: sortValue,
          createdAt: -1,
        });
      }
    } else {
      this.databaseQuery = this.databaseQuery.sort({
        createdAt: -1,
        views: -1,
      });
    }
    return this;
  }

  paginating() {
    const page = this.requestQuery.page * 1 || 1;
    const limit = this.requestQuery.limit * 1 || 13;
    const skip = (page - 1) * 12;
    this.databaseQuery = this.databaseQuery.skip(skip).limit(limit);

    return this;
  }
}

// Get products
router.get("/", async (req, res) => {
  try {
    const productsQuery = new QueryFeatures(Product.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    const products = await productsQuery.databaseQuery;
    res.status(200).json({
      length: products.length,
      products: products,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add product
router.post("/", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json("Not Authorized!");
  try {
    if (!req.body.images) return res.status(400).json("Empty image field!");
    const product = await Product.findOne({ title: req.body.title });
    if (product) return res.status(400).json("Title already exists.");

    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(200).json("Successfully created the product.");
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Product not found.");
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Product
router.put("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json("Not Authorized!");
  try {
    const product = await Product.findOne({ title: req.body.title });
    if (product && product.id !== req.params.id)
      return res.status(400).json("Title already exists.");
    await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json("Successfully updated the product.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Increase product views
router.patch("/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    return res.status(200).json("Updated views.");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json("Not Authorized!");
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Product was not found.");
    const { title, images } = product;
    images.forEach(async (img) => {
      await cloudinary.v2.uploader.destroy(
        img.public_id,
        async (err, result) => {
          if (err) throw err;
        }
      );
    });
    await Product.findOneAndDelete({ title: title });
    await CartItem.deleteMany({ product: req.params.id });
    res.status(200).json("Successfully deleted the product.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
