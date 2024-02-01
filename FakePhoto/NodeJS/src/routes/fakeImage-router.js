const express = require('express');
const multer = require('multer');

const UploadController = require('../controllers/FakeImage/UploadController');
const { userVerification } = require('../Middlewares/AuthMiddleware');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const multerUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'back', maxCount: 1 }]);
router.post('/fake-image/upload', userVerification, multerUpload, UploadController.uploadImage);

module.exports = router;