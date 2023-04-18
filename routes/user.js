const router = require("express").Router();
const User = require("../models/User");
const Address = require("../models/Address");
const { auth } = require("../middleware/authVerify");
const CartItem = require("../models/CartItem");

// Get user
router.get("/info", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Update user
router.patch("/", auth, async (req, res) => {
  try {
    const { email } = req.body;
    await User.findOneAndUpdate({ _id: req.user.id }, { email });
    res.json("Update Success.");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Delete user
router.delete("/delete", auth, async (req, res) => {
  try {
    // Verify password
    const { password } = req.body;
    const user = await User.findOne({ _id: req.user.id });
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    const userPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (userPassword !== password)
      return res.status(401).json("Incorrect Password.");
    // Delete user
    await User.findOneAndDelete({ _id: req.user.id });
    await CartItem.deleteMany({ user: req.user.id });
    await Address.findOneAndDelete({ userId: req.user.id });
    res.status(201).json("Successfully deleted the user.");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get user address
router.get("/address", auth, async (req, res) => {
  try {
    const address = await Address.findOne({ userID: req.user.id });
    if (!address) return res.status(400).json("User address not found.");
    res.json(address);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Update user address
router.patch("/address", auth, async (req, res) => {
  try {
    await Address.findOneAndUpdate({ userID: req.user.id }, req.body);
    res.json("Address saved.");
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
