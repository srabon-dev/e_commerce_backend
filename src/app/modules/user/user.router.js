const express = require('express');
const router = express.Router();
const { UserController} = require('./user.controller');
const checkLogin = require('../../middlewares/check.login');
const {USER_ROLE} = require('../../../utils/enum');
const { uploadFile } = require("../../middlewares/file.uploads");

router.get('/get-user', checkLogin([USER_ROLE.USER, USER_ROLE.ADMIN]), UserController.user).
put('/update-user', checkLogin([USER_ROLE.USER, USER_ROLE.ADMIN]),uploadFile(), UserController.update).
delete('/delete-user', checkLogin([USER_ROLE.USER]), UserController.deleteUser);

module.exports = router;