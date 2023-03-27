const router = require("express").Router();
const cloudinary = require('cloudinary');
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const { auth } = require('../middleware/authVerify');


const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        const directoryPath = path.join(__dirname, 'uploads');
        cb(null, directoryPath);
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+ path.extname(file.originalname));
    }
});


const uploaad = multer({"storage":storage});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


// Upload Image
router.post('/', auth, uploaad.single('file'), async (req, res) =>{
    if (!req.user.isAdmin) return res.status(403).json('Not Authorized!');

    try {
        const directoryPath = path.join(__dirname, 'uploads');
        let filePath = '';
        fs.readdir(directoryPath, 'utf8', function (err,data) {
            if (err) {
                return res.status(500).json(err);
            };
            filePath = path.join(directoryPath, data[0]);
            cloudinary.v2.uploader.upload(filePath, {folder: "e-commerce-photos"}, async(err, result)=>{
                if (err) return res.status(500).json(err);
                fs.unlink(filePath, err=>{
                    if (err) console.log("UNLINK:",err);
                })
                res.json({ public_id: result.public_id, url: result.secure_url });
            })   
        });
    } catch (err) {
        return res.status(500).json(err.message);
    }
});


// Delete Image
router.delete('/e-commerce-photos/:id', auth, async (req, res) =>{
    if (!req.user.isAdmin) return res.status(403).json('Not Authorized!');
    try { 
        if (!req.params.id) return res.status(400).json('Please select an image.');
        let public_id = 'e-commerce-photos/' + req.params.id;
        cloudinary.v2.uploader.destroy(public_id, async(err, result) =>{
            if(err) throw err;
            res.json("Successfully deleted the image.");
        });
    } catch (err) {
        return res.status(500).json(err.message);
    };
});

module.exports = router;