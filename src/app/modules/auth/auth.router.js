const express = require('express');
const router = express.Router();
const { AuthController} = require('./auth.controller');

router.post("/sign-up", AuthController.signUp).
post('/active-account', AuthController.activeAccount).
post('/resend-active-otp', AuthController.resendActiveAccount).
post('/login', AuthController.login).
post('/forget-password', AuthController.forgetPassword).
post('/forget-password-otp', AuthController.forgetPasswordOTP).
post('/reset-password', AuthController.resetPassword);

module.exports = router;