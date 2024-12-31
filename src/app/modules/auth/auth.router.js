const express = require('express');
const router = express.Router();
const { AuthController} = require('./auth.controller');
const checkLogin = require('../../middlewares/check.login');
const {USER_ROLE} = require('../../../utils/enum')

router.post("/sign-up", AuthController.signUp).
post('/active-account', AuthController.activeAccount).
post('/resend-active-otp', AuthController.resendActiveAccount).
post('/login', AuthController.login).
get('/user', checkLogin([USER_ROLE.USER, USER_ROLE.ADMIN]), AuthController.user).
put('/update', checkLogin([USER_ROLE.USER, USER_ROLE.ADMIN]), AuthController.update).
delete('/delete', checkLogin([USER_ROLE.USER]), AuthController.deleteUser);

module.exports = router;