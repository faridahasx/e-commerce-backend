const router = require('express').Router();
const { auth } = require('../middleware/authVerify');
const CartItem = require('../models/CartItem');


// Get User Cart Items
router.get("/", auth, async (req, res) => {
    try {
        const userCart = await CartItem.find({ user: req.user.id })
        .populate('product');            
        return res.status(200).json({
            items: userCart,
            length: userCart.length
        });
    } catch (err) {
        res.status(500).json(err);
    }   
});

// Create
router.post("/", auth, async (req, res) => {
    const { productID, size }=req.body;
    try {
        const newCartItem = new CartItem({
            user: req.user.id,
            product: productID,
            size: size
        });
        await newCartItem.save();
        res.status(200).json('Added new cart item.');
    } catch (err) {
        res.status(500).json(err);
    }
    
});

// Update 
router.put('/', auth, async(req,res)=>{
     try {
        const qty = Object.keys(req.body.quantity)
        const selection = Object.keys(req.body.selection)
        qty.length && qty.forEach(async element => {
            req.body.quantity[element] === 0 
            ? await CartItem.findByIdAndDelete( element, {'quantity': req.body.quantity[element]})
            :await CartItem.findByIdAndUpdate( element, {'quantity': req.body.quantity[element]})
        });

        selection.length && selection.forEach(async element => {
            await CartItem.findByIdAndUpdate( element, {'selected': req.body.selection[element]})
        });
        return res.status(200).json('Updated the cart item.'); 
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router; 