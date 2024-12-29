const express = require('express');
const router = express.Router();
const { AuthController} = require('./auth.controller');
const checkLogin = require('../../middlewares/check.login');

router.post("/sign-up", AuthController.signUp).
post('/login', AuthController.login).
get('/user', checkLogin, AuthController.users);

module.exports = router;