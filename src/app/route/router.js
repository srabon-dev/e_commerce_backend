const express = require('express');
const router = express.Router();

const authRouter = require('../modules/auth/auth.router');
const userRouter = require('../modules/user/user.router');

const moduleRouter = [
    {
        path: '/auth',
        name: authRouter,
    },
    {
        path: '/user',
        name: userRouter,
    }
];

moduleRouter.forEach((singleRouter=>router.use(singleRouter.path, singleRouter.name)));
module.exports = router;