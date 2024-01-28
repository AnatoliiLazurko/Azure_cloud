const express = require('express');

const AuthController = require('../controllers/Auth/AuthController');
const { userVerification } = require('../Middlewares/AuthMiddleware');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/signup', AuthController.createUser);

router.get('/user-info', userVerification, AuthController.getUserById);

module.exports = router;